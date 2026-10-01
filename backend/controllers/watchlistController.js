const Watchlist = require('../models/Watchlist');
const { fetchQuoteData } = require('./marketController');
const { getCompanyInfo } = require('../data/companyInfo');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// @desc    Get all watchlist items for the logged-in user, enriched with live price
// @route   GET /api/watchlist
// @access  Private
const getWatchlist = async (req, res) => {
  try {
    const items = await Watchlist.find({ userId: req.user._id }).sort({ addedAt: -1 });

    const enriched = [];
    for (const item of items) {
      let currentPrice = null;
      let changePercent = null;

      try {
        const quote = await fetchQuoteData(item.symbol, item.exchange);
        if (quote) {
          currentPrice = quote.price;
          changePercent = quote.changePercent;
        }
      } catch (err) {
        console.warn(`Watchlist: could not fetch quote for ${item.symbol}:`, err.message);
      }

      const info = getCompanyInfo(item.symbol);

      enriched.push({
        _id: item._id,
        symbol: item.symbol,
        companyName: item.companyName || info.name,
        exchange: item.exchange,
        currentPrice,
        changePercent,
        addedOn: item.addedAt ? item.addedAt.toISOString().split('T')[0] : null,
      });

      await sleep(150);
    }

    return res.json(enriched);
  } catch (error) {
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