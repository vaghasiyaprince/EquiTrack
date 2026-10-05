const Watchlist = require('../models/Watchlist');
const { fetchQuoteData } = require('./marketController');
const { getCompanyInfo } = require('../data/companyInfo');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const { fetchBatchQuotesByTokens } = require('./marketController');
const { findToken } = require('../utils/instrumentMaster');

// @desc    Get all watchlist items for the logged-in user, enriched with live price
// @route   GET /api/watchlist
// @access  Private
const getWatchlist = async (req, res) => {
  try {
    const items = await Watchlist.find({ userId: req.user._id }).sort({ addedAt: -1 });

    if (items.length === 0) {
      return res.json([]);
    }

    // Resolve tokens for watchlist symbols
    const tokenPairs = await Promise.all(
      items.map(async (item) => {
        try {
          const token = await findToken(item.symbol, item.exchange || 'NSE');
          return { symbol: item.symbol, token };
        } catch {
          return { symbol: item.symbol, token: null };
        }
      })
    );

    const tokens = tokenPairs.map((p) => p.token).filter(Boolean);

    let quotes = [];
    try {
      if (tokens.length > 0) {
        quotes = await fetchBatchQuotesByTokens(tokens, 'NSE');
      }
    } catch (err) {
      console.warn('Watchlist: batch quote fetch error:', err.message);
    }

    const quoteMap = new Map();
    for (const q of quotes) {
      quoteMap.set(q.symbol, q);
    }

    const enriched = items.map((item) => {
      const quote = quoteMap.get(item.symbol);
      const info = getCompanyInfo(item.symbol);

      return {
        _id: item._id,
        symbol: item.symbol,
        companyName: item.companyName || info.name,
        exchange: item.exchange,
        currentPrice: quote ? quote.price : null,
        changePercent: quote ? quote.changePercent : null,
        addedOn: item.addedAt ? item.addedAt.toISOString().split('T')[0] : null,
      };
    });

    return res.json(enriched);
  } catch (error) {
    console.error('getWatchlist error:', error.message);
    const isWeak =
      error.code === 'WEAK_CONNECTION' ||
      error.code === 'ETIMEDOUT' ||
      error.code === 'ECONNABORTED' ||
      (error.message && error.message.toLowerCase().includes('timeout'));

    if (isWeak) {
      return res.status(504).json({
        message: 'Weak connection: Live watchlist price feed timed out. Please check your internet connection.',
        isWeakConnection: true,
      });
    }

    return res.status(500).json({ message: error.message });
  }
};

// @desc    Add a stock to the watchlist
// @route   POST /api/watchlist
// @access  Private
const addToWatchlist = async (req, res) => {
  try {
    const { symbol, companyName, exchange } = req.body;

    if (!symbol) {
      return res.status(400).json({ message: 'Symbol is required' });
    }

    const exists = await Watchlist.findOne({
      userId: req.user._id,
      symbol: symbol.toUpperCase(),
    });

    if (exists) {
      return res.status(409).json({ message: 'Stock already in watchlist' });
    }

    const item = await Watchlist.create({
      userId: req.user._id,
      userEmail: req.user.email,
      symbol,
      companyName,
      exchange: exchange || 'NSE',
    });

    return res.status(201).json({ message: 'Stock added successfully', item });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Remove a stock from the watchlist, by symbol
// @route   DELETE /api/watchlist/:symbol
// @access  Private
const removeFromWatchlist = async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();

    const item = await Watchlist.findOne({
      userId: req.user._id,
      symbol,
    });

    if (!item) {
      return res.status(404).json({ message: 'Watchlist item not found' });
    }

    await item.deleteOne();
    return res.json({ message: 'Stock removed successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { getWatchlist, addToWatchlist, removeFromWatchlist };