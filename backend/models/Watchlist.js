const mongoose = require('mongoose');

const watchlistSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    userEmail: {
      type: String,
      lowercase: true,
      trim: true,
    },
    symbol: {
      type: String,
      required: [true, 'Stock symbol is required'],
      uppercase: true,
      trim: true,
    },
    companyName: {
      type: String,
      trim: true,
    },
    exchange: {
      type: String,
      default: 'NSE',
      uppercase: true,
      trim: true,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: 'watchlists',
  }
);

// Prevent the same user from adding the same stock symbol multiple times
watchlistSchema.index({ userId: 1, symbol: 1 }, { unique: true });

module.exports = mongoose.model('Watchlist', watchlistSchema);
