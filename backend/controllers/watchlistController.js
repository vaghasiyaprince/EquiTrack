const Watchlist = require('../models/Watchlist');
const { STOCKS } = require('./stockController');

// @desc    Get user's watchlist
// @route   GET /api/watchlist
// @access  Private
const getWatchlist = async (req, res) => {
  try {
    const list = await Watchlist.find({ userId: req.user._id }).sort({ addedAt: -1 });

    const formatted = list.map((item) => {
      const stockInfo = STOCKS.find(
        (s) => s.symbol.toUpperCase() === item.symbol.toUpperCase()
      );

      return {
        _id: item._id,
        symbol: item.symbol,
        companyName: item.companyName || stockInfo?.name || item.symbol,
        exchange: item.exchange || 'NSE',
        addedOn: item.addedAt ? item.addedAt.toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
        currentPrice: stockInfo ? stockInfo.currentPrice : 150.0,
        change: stockInfo ? stockInfo.change : 0,
        changePercent: stockInfo ? stockInfo.changePercent : 0,
        dayHigh: stockInfo ? stockInfo.dayHigh : null,
        dayLow: stockInfo ? stockInfo.dayLow : null,
      };
    });

    return res.json(formatted);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Add stock to watchlist
// @route   POST /api/watchlist
// @access  Private
const addToWatchlist = async (req, res) => {
  try {
    const { symbol, companyName, exchange } = req.body;

    if (!symbol) {
      return res.status(400).json({ message: 'Stock symbol is required' });
    }

    const cleanSymbol = symbol.toUpperCase().trim();

    // Check if already in watchlist
    const exists = await Watchlist.findOne({
      userId: req.user._id,
      symbol: cleanSymbol,
    });

    if (exists) {
      return res.status(400).json({ message: 'Stock already in watchlist' });
    }

    const stockInfo = STOCKS.find((s) => s.symbol.toUpperCase() === cleanSymbol);

    await Watchlist.create({
      userId: req.user._id,
      userEmail: req.user.email,
      symbol: cleanSymbol,
      companyName: companyName || stockInfo?.name || cleanSymbol,
      exchange: exchange || 'NSE',
      addedAt: new Date(),
    });

    return res.status(201).json({ message: 'Stock added successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Remove stock from watchlist
// @route   DELETE /api/watchlist/:symbol
// @access  Private
const removeFromWatchlist = async (req, res) => {
  try {
    const cleanSymbol = (req.params.symbol || '').toUpperCase().trim();

    const deleted = await Watchlist.findOneAndDelete({
      userId: req.user._id,
      symbol: cleanSymbol,
    });

    if (!deleted) {
      return res.status(404).json({ message: 'Stock not found in watchlist' });
    }

    return res.json({ message: 'Stock removed successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
};
