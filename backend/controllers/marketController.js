const axios = require('axios');
const https = require('https');
const { getAngelSession } = require('../utils/angelClient');
const { findToken } = require('../utils/instrumentMaster');

const agent = new https.Agent({ keepAlive: false });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Shared helper — fetches and formats a single quote, used by both
// the single-quote endpoint and the gainers/losers endpoint
const fetchQuoteData = async (symbol, exchange = 'NSE') => {
  const token = await findToken(symbol, exchange);
  if (!token) {
    return null;
  }

  const smartApi = await getAngelSession();

  const response = await axios.post(
    'https://apiconnect.angelbroking.com/rest/secure/angelbroking/market/v1/quote/',
    {
      mode: 'FULL',
      exchangeTokens: { [exchange]: [token] },
    },
    {
      httpsAgent: agent,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-UserType': 'USER',
        'X-SourceID': 'WEB',
        'X-ClientLocalIP': '127.0.0.1',
        'X-ClientPublicIP': '127.0.0.1',
        'X-MACAddress': '00:00:00:00:00:00',
        'X-PrivateKey': process.env.ANGEL_API_KEY,
        Authorization: `Bearer ${smartApi.access_token}`,
      },
    }
  );

  const fetched = response.data?.data?.fetched;
  if (!fetched || fetched.length === 0) {
    return null;
  }

  const quote = fetched[0];

  return {
    symbol: quote.tradingSymbol,
    exchange: quote.exchange,
    price: quote.ltp,
    open: quote.open,
    dayHigh: quote.high,
    dayLow: quote.low,
    previousClose: quote.close,
    change: quote.netChange,
    changePercent: quote.percentChange,
  };
};

// @desc    Get live quote for a single stock
// @route   GET /api/market/quote/:symbol
// @access  Private
const getQuote = async (req, res) => {
  try {
    const { symbol } = req.params;
    const exchange = req.query.exchange || 'NSE';

    const data = await fetchQuoteData(symbol, exchange);
    if (!data) {
      return res.status(404).json({ message: `Symbol '${symbol}' not found or no data returned` });
    }

    return res.json(data);
  } catch (error) {
    console.error('getQuote error:', error.response?.data || error.message);
    return res.status(500).json({
      message: 'Failed to fetch quote',
      error: error.response?.data || error.message,
    });
  }
};

// Curated list of well-known NSE stocks for gainers/losers computation
// (Angel One doesn't provide a direct equity gainers/losers endpoint)
const CURATED_SYMBOLS = [
  'RELIANCE-EQ', 'TCS-EQ', 'INFY-EQ', 'HDFCBANK-EQ', 'ICICIBANK-EQ',
  'SBIN-EQ', 'TATAMOTORS-EQ', 'TATASTEEL-EQ', 'ITC-EQ', 'HINDUNILVR-EQ',
  'BAJFINANCE-EQ', 'BHARTIARTL-EQ', 'KOTAKBANK-EQ', 'LT-EQ', 'MARUTI-EQ',
  'WIPRO-EQ', 'ASIANPAINT-EQ', 'AXISBANK-EQ', 'SUNPHARMA-EQ', 'TITAN-EQ',
];

// @desc    Get top gainers and losers from a curated list of NSE stocks
// @route   GET /api/market/gainers-losers
// @access  Private
const getGainersLosers = async (req, res) => {
  try {
    const results = [];

    // Sequential with a small delay to stay well within Angel One's rate limits
    for (const symbol of CURATED_SYMBOLS) {
      try {
        const data = await fetchQuoteData(symbol, 'NSE');
        if (data) results.push(data);
      } catch (err) {
        console.warn(`Skipping ${symbol}:`, err.message);
      }
      await sleep(150);
    }

    const sorted = [...results].sort((a, b) => b.changePercent - a.changePercent);

    const gainers = sorted.filter((s) => s.changePercent > 0).slice(0, 5);
    const losers = sorted.filter((s) => s.changePercent < 0).slice(-5).reverse();

    return res.json({ gainers, losers });
  } catch (error) {
    console.error('getGainersLosers error:', error.message);
    return res.status(500).json({ message: 'Failed to fetch gainers/losers', error: error.message });
  }
};

// Maps frontend-friendly period names to Angel One's interval + lookback days
const PERIOD_CONFIG = {
  '1D': { interval: 'FIVE_MINUTE', days: 1 },
  '1W': { interval: 'FIFTEEN_MINUTE', days: 7 },
  '1M': { interval: 'ONE_DAY', days: 30 },
  '1Y': { interval: 'ONE_DAY', days: 365 },
};

const formatDateForAngel = (date) => {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

// @desc    Get historical candle data for charting
// @route   GET /api/market/candles/:symbol?period=1D
// @access  Private
const getCandles = async (req, res) => {
  try {
    const { symbol } = req.params;
    const exchange = req.query.exchange || 'NSE';
    const period = req.query.period || '1D';

    const config = PERIOD_CONFIG[period];
    if (!config) {
      return res.status(400).json({ message: 'period must be one of 1D, 1W, 1M, 1Y' });
    }

    const token = await findToken(symbol, exchange);
    if (!token) {
      return res.status(404).json({ message: `Symbol '${symbol}' not found on ${exchange}` });
    }

    const smartApi = await getAngelSession();

    const toDate = new Date();
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - config.days);

    const response = await axios.post(
      'https://apiconnect.angelbroking.com/rest/secure/angelbroking/historical/v1/getCandleData',
      {
        exchange,
        symboltoken: token,
        interval: config.interval,
        fromdate: formatDateForAngel(fromDate),
        todate: formatDateForAngel(toDate),
      },
      {
        httpsAgent: agent,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-UserType': 'USER',
          'X-SourceID': 'WEB',
          'X-ClientLocalIP': '127.0.0.1',
          'X-ClientPublicIP': '127.0.0.1',
          'X-MACAddress': '00:00:00:00:00:00',
          'X-PrivateKey': process.env.ANGEL_API_KEY,
          Authorization: `Bearer ${smartApi.access_token}`,
        },
      }
    );

    const raw = response.data?.data;
    if (!raw || raw.length === 0) {
      return res.status(502).json({ message: 'No candle data returned', detail: response.data });
    }

    // Each candle from Angel One is: [timestamp, open, high, low, close, volume]
    const candles = raw.map(([timestamp, open, high, low, close, volume]) => ({
      timestamp,
      open,
      high,
      low,
      close,
      volume,
    }));

    return res.json({ symbol, period, candles });
  } catch (error) {
    console.error('getCandles error:', error.response?.data || error.message);
    return res.status(500).json({
      message: 'Failed to fetch candle data',
      error: error.response?.data || error.message,
    });
  }
};

module.exports = { getQuote, getGainersLosers, getCandles };