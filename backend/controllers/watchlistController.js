const Watchlist = require('../models/Watchlist');

// @desc    Get all watchlist items for the logged-in user
// @route   GET /api/watchlist
// @access  Private
const getWatchlist = async (req, res) => {
  try {
    const items = await Watchlist.find({ userId: req.user._id }).sort({ addedAt: -1 });
    return res.json(items);
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

    return res.status(201).json(item);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Remove a stock from the watchlist
// @route   DELETE /api/watchlist/:id
// @access  Private
const removeFromWatchlist = async (req, res) => {
  try {
    const item = await Watchlist.findOne({
      _id: req.params.id,
      userId: req.user._id, // ensures users can only delete their own items
    });

    if (!item) {
      return res.status(404).json({ message: 'Watchlist item not found' });
    }

    await item.deleteOne();
    return res.json({ message: 'Removed from watchlist' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { getWatchlist, addToWatchlist, removeFromWatchlist };