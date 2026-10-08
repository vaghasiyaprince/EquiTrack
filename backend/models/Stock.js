const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema(
  {
    symbol: {
      type: String,
      required: [true, 'Stock symbol is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    exchange: {
      type: String,
      default: 'NSE',
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    token: {
      type: String,
      trim: true,
    },
    isCurated: {
      type: Boolean,
      default: false,
    },
    isSuggested: {
      type: Boolean,
      default: false,
    },
    aliases: [
      {
        type: String,
        lowercase: true,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
    collection: 'stocks',
  }
);

stockSchema.index({ symbol: 1, exchange: 1 });

module.exports = mongoose.model('Stock', stockSchema);
