const { fetchQuoteData, fetchBatchQuotesByTokens } = require('./marketController');
const {
  getCuratedStocksFromDb,
  getSuggestedSymbolsFromDb,
} = require('../utils/stockDbService');
const { findToken } = require('../utils/instrumentMaster');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Simple in-memory cache — avoids re-fetching 20 stocks on every tab switch
let dashboardCache = null;
let dashboardCacheTime = 0;
const CACHE_DURATION_MS = 30 * 1000; // 30 seconds

// @desc    Get dashboard overview: top gainers, top losers, suggested stocks
// @route   GET /api/dashboard
// @access  Public / Private
const getDashboard = async (req, res) => {
  try {
    const now = Date.now();
    if (dashboardCache && now - dashboardCacheTime < CACHE_DURATION_MS) {
      return res.json(dashboardCache);
    }

    // Retrieve curated stocks and suggested symbols dynamically from MongoDB
    const curatedStocks = await getCuratedStocksFromDb();
    const suggestedSymbols = await getSuggestedSymbolsFromDb();

    const stockInfoMap = new Map();
    for (const s of curatedStocks) {
      stockInfoMap.set(s.symbol, s);
    }

    const tokens = [];
    for (const stock of curatedStocks) {
      try {
        const token = stock.token || (await findToken(stock.symbol, stock.exchange || 'NSE'));
        if (token) tokens.push(token);
      } catch (err) {
        console.warn(`Dashboard: unable to find live token for ${stock.symbol}:`, err.message);
      }
    }

    if (tokens.length === 0) {
      return res.json({ topGainers: [], topLosers: [], suggested: [] });
    }

    // Batch quote fetch from Angel One API in 1 call!
    const quotes = await fetchBatchQuotesByTokens(tokens, 'NSE');
    const results = quotes
      .map((q) => {
        if (!q) return null;
        const info = stockInfoMap.get(q.symbol);
        return {
          symbol: q.symbol,
          name: info ? info.name : q.symbol.replace('-EQ', ''),
          exchange: q.exchange,
          currentPrice: q.price,
          changePercent: q.changePercent,
        };
      })
      .filter(Boolean);

    const sorted = [...results].sort((a, b) => b.changePercent - a.changePercent);
    const topGainers = sorted.filter((s) => s.changePercent > 0).slice(0, 5);
    const topLosers = sorted.filter((s) => s.changePercent < 0).slice(-5).reverse();
    const suggested = results.filter((s) => suggestedSymbols.includes(s.symbol));

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