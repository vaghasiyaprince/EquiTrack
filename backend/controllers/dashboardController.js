const { fetchQuoteData } = require('./marketController');
const { getCompanyInfo } = require('../data/companyInfo');
const { CURATED_SYMBOLS } = require('../data/curatedSymbols');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const SUGGESTED_SYMBOLS = ['HDFCBANK-EQ', 'LT-EQ', 'TITAN-EQ', 'WIPRO-EQ', 'AXISBANK-EQ', 'ASIANPAINT-EQ'];

// Simple in-memory cache — avoids re-fetching 20 stocks on every tab switch
let dashboardCache = null;
let dashboardCacheTime = 0;
const CACHE_DURATION_MS = 30 * 1000; // 30 seconds

const enrich = (data) => {
  if (!data) return null;
  const info = getCompanyInfo(data.symbol);
  return {
    symbol: data.symbol,
    name: info.name,
    exchange: data.exchange,
    currentPrice: data.price,
    changePercent: data.changePercent,
  };
};

const { fetchBatchQuotesByTokens } = require('./marketController');
const { findToken } = require('../utils/instrumentMaster');

// @desc    Get dashboard overview: top gainers, top losers, suggested stocks
// @route   GET /api/dashboard
// @access  Public / Private
const getDashboard = async (req, res) => {
  try {
    const now = Date.now();
    if (dashboardCache && now - dashboardCacheTime < CACHE_DURATION_MS) {
      return res.json(dashboardCache);
    }

    // Resolve curated stock tokens dynamically from live Angel One API
    // Using serial loop ensures rate limit queuing never trips HTTP 403
    const tokens = [];
    for (const symbol of CURATED_SYMBOLS) {
      try {
        const token = await findToken(symbol, 'NSE');
        if (token) tokens.push(token);
      } catch (err) {
        console.warn(`Dashboard: unable to find live token for ${symbol}:`, err.message);
      }
    }

    if (tokens.length === 0) {
      return res.json({ topGainers: [], topLosers: [], suggested: [] });
    }

    // Batch quote fetch from Angel One API in 1 call!
    const quotes = await fetchBatchQuotesByTokens(tokens, 'NSE');
    const results = quotes.map(enrich).filter(Boolean);

    const sorted = [...results].sort((a, b) => b.changePercent - a.changePercent);
    const topGainers = sorted.filter((s) => s.changePercent > 0).slice(0, 5);
    const topLosers = sorted.filter((s) => s.changePercent < 0).slice(-5).reverse();
    const suggested = results.filter((s) => SUGGESTED_SYMBOLS.includes(s.symbol));

    const payload = { topGainers, topLosers, suggested };

    dashboardCache = payload;
    dashboardCacheTime = now;

    return res.json(payload);
  } catch (error) {
    console.error('getDashboard error:', error.message);
    const isWeak =
      error.code === 'WEAK_CONNECTION' ||
      error.code === 'ETIMEDOUT' ||
      error.code === 'ECONNABORTED' ||
      (error.message && error.message.toLowerCase().includes('timeout'));

    if (isWeak) {
      return res.status(504).json({
        message: 'Weak connection: Live dashboard overview timed out. Please check your internet connection.',
        isWeakConnection: true,
      });
    }

    return res.status(error.statusCode || 500).json({
      message: error.message || 'Failed to load dashboard data from Angel One',
      error: error.message,
    });
  }
};

module.exports = { getDashboard };