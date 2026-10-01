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

// @desc    Get dashboard overview: top gainers, top losers, suggested stocks
// @route   GET /api/dashboard
// @access  Private
const getDashboard = async (req, res) => {
  try {
    const now = Date.now();
    if (dashboardCache && now - dashboardCacheTime < CACHE_DURATION_MS) {
      return res.json(dashboardCache);
    }

    const results = [];

    for (const symbol of CURATED_SYMBOLS) {
      try {
        const data = await fetchQuoteData(symbol, 'NSE');
        if (data) results.push(enrich(data));
      } catch (err) {
        console.warn(`Dashboard: skipping ${symbol}:`, err.message);
      }
      await sleep(150);
    }

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
    return res.status(500).json({ message: 'Failed to load dashboard data', error: error.message });
  }
};

module.exports = { getDashboard };