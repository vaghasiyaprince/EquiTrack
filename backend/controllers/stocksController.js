const { fetchQuoteData, fetchCandleData } = require('./marketController');
const { getCompanyInfo } = require('../data/companyInfo');

// Maps the frontend's duration labels to Angel One interval + lookback days
const DURATION_MAP = {
  '5m': { interval: 'ONE_MINUTE', days: 1 },
  '1d': { interval: 'FIVE_MINUTE', days: 1 },
  '1w': { interval: 'FIFTEEN_MINUTE', days: 7 },
  '1m': { interval: 'ONE_DAY', days: 30 },
};

// @desc    Get merged stock details: quote + chart + company info
// @route   GET /api/stocks/:symbol?duration=1d
// @access  Private
const getStockDetails = async (req, res) => {
  try {
    const { symbol } = req.params;
    const exchange = req.query.exchange || 'NSE';
    const duration = req.query.duration || '1d';

    const durationConfig = DURATION_MAP[duration];
    if (!durationConfig) {
      return res.status(400).json({ message: 'duration must be one of 5m, 1d, 1w, 1m' });
    }

    const quote = await fetchQuoteData(symbol, exchange);
    if (!quote) {
      return res.status(404).json({ message: `Symbol '${symbol}' not found or no data returned` });
    }

    const candles = await fetchCandleData(symbol, exchange, durationConfig.interval, durationConfig.days);
    const chartData = (candles || []).map((c) => ({
      timestamp: c.timestamp,
      price: c.close,
    }));

    const info = getCompanyInfo(quote.symbol);

    return res.json({
      symbol: quote.symbol,
      exchange: quote.exchange,
      companyName: info.name,
      description: info.description,
      currentPrice: quote.price,
      change: quote.change,
      changePercent: quote.changePercent,
      dayHigh: quote.dayHigh,
      dayLow: quote.dayLow,
      previousClose: quote.previousClose,
      chartData,
    });
  } catch (error) {
    console.error('getStockDetails error:', error.message);
    return res.status(500).json({ message: 'Failed to fetch stock details', error: error.message });
  }
};

module.exports = { getStockDetails };