const axios = require('axios');
const https = require('https');
const { getAngelSession } = require('../utils/angelClient');
const { findToken } = require('../utils/instrumentMaster');
const { CURATED_SYMBOLS } = require('../data/curatedSymbols');

const agent = new https.Agent({ keepAlive: false });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Shared helper — fetches and formats a single quote, used by the single-quote
// endpoint, gainers/losers, dashboard, and the merged stock details endpoint
// Core helper — fetches a quote when we already know the token
// (avoids a redundant token-lookup API call when the caller already has it)
// Helper to detect weak connection / network timeout
const isWeakConnectionError = (error) => {
  const code = error.code || error.response?.data?.errorcode || error.response?.data?.message;
  const msg = (error.message || '').toLowerCase();
  return (
    code === 'ECONNABORTED' ||
    code === 'ETIMEDOUT' ||
    code === 'ENOTFOUND' ||
    code === 'ECONNRESET' ||
    code === 'WEAK_CONNECTION' ||
    msg.includes('timeout') ||
    msg.includes('network') ||
    msg.includes('econnrefused')
  );
};

// Batch quote helper — fetches quotes for up to 50 tokens in a single HTTP request!
const fetchBatchQuotesByTokens = async (tokens, exchange = 'NSE') => {
  if (!tokens || tokens.length === 0) return [];
  const smartApi = await getAngelSession();

  try {
    const response = await axios.post(
      'https://apiconnect.angelbroking.com/rest/secure/angelbroking/market/v1/quote/',
      {
        mode: 'FULL',
        exchangeTokens: { [exchange]: tokens },
      },
      {
        httpsAgent: agent,
        timeout: 10000, // 10s timeout to quickly identify weak connection
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

    const fetched = response.data?.data?.fetched || [];
    return fetched.map((quote) => ({
      symbol: quote.tradingSymbol,
      exchange: quote.exchange,
      price: quote.ltp,
      open: quote.open,
      dayHigh: quote.high,
      dayLow: quote.low,
      previousClose: quote.close,
      change: quote.netChange,
      changePercent: quote.percentChange,
    }));
  } catch (error) {
    if (isWeakConnectionError(error)) {
      const netError = new Error('Weak connection: Angel One API connection timed out or is unreachable');
      netError.code = 'WEAK_CONNECTION';
      throw netError;
    }
    throw error;
  }
};

// Core helper — fetches a quote when we already know the token
const fetchQuoteByToken = async (token, exchange = 'NSE') => {
  const quotes = await fetchBatchQuotesByTokens([token], exchange);
  return quotes.length > 0 ? quotes[0] : null;
};

// Convenience wrapper — looks up the token first, then fetches the quote.
const fetchQuoteData = async (symbol, exchange = 'NSE') => {
  const token = await findToken(symbol, exchange);
  if (!token) {
    return null;
  }
  return fetchQuoteByToken(token, exchange);
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
      return res.status(404).json({ message: `Symbol '${symbol}' not found or no live data returned` });
    }

    return res.json(data);
  } catch (error) {
    console.error('getQuote error:', error.message);
    if (isWeakConnectionError(error)) {
      return res.status(504).json({
        message: 'Weak connection: Unable to reach Angel One live API. Please check your internet connection.',
        isWeakConnection: true,
      });
    }
    return res.status(error.statusCode || 500).json({
      message: error.message || 'Failed to fetch live quote from Angel One',
      error: error.response?.data || error.message,
    });
  }
};

// @desc    Get top gainers and losers from a curated list of NSE stocks
// @route   GET /api/market/gainers-losers
// @access  Private
const getGainersLosers = async (req, res) => {
  try {
    // Resolve tokens concurrently or in fast batches to drastically reduce delay
    const tokenPromises = CURATED_SYMBOLS.map((symbol) => findToken(symbol, 'NSE'));
    const tokens = (await Promise.all(tokenPromises)).filter(Boolean);

    if (tokens.length === 0) {
      return res.json({ gainers: [], losers: [] });
    }

    // Single batch request to Angel One for all stocks
    const quotes = await fetchBatchQuotesByTokens(tokens, 'NSE');

    const sorted = [...quotes].sort((a, b) => b.changePercent - a.changePercent);
    const gainers = sorted.filter((s) => s.changePercent > 0).slice(0, 5);
    const losers = sorted.filter((s) => s.changePercent < 0).slice(-5).reverse();

    return res.json({ gainers, losers });
  } catch (error) {
    console.error('getGainersLosers error:', error.message);
    if (isWeakConnectionError(error)) {
      return res.status(504).json({
        message: 'Weak connection: Live market feed delayed or timed out. Please check your connection.',
        isWeakConnection: true,
      });
    }
    return res.status(error.statusCode || 500).json({
      message: error.message || 'Failed to fetch live gainers/losers from Angel One',
      error: error.message,
    });
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

// Shared helper — fetches raw candle data for any interval/lookback,
// used by both the /candles endpoint and the merged /stocks endpoint
const fetchCandleData = async (symbol, exchange, interval, days) => {
  const token = await findToken(symbol, exchange);
  if (!token) {
    return null;
  }

  const smartApi = await getAngelSession();

  const toDate = new Date();
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - days);

  try {
    const response = await axios.post(
      'https://apiconnect.angelbroking.com/rest/secure/angelbroking/historical/v1/getCandleData',
      {
        exchange,
        symboltoken: token,
        interval,
        fromdate: formatDateForAngel(fromDate),
        todate: formatDateForAngel(toDate),
      },
      {
        httpsAgent: agent,
        timeout: 10000,
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
      return null;
    }

    return raw.map(([timestamp, open, high, low, close, volume]) => ({
      timestamp,
      open,
      high,
      low,
      close,
      volume,
    }));
  } catch (error) {
    if (isWeakConnectionError(error)) {
      const netError = new Error('Weak connection: Historical chart data request timed out');
      netError.code = 'WEAK_CONNECTION';
      throw netError;
    }
    throw error;
  }
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

    const candles = await fetchCandleData(symbol, exchange, config.interval, config.days);
    if (!candles) {
      return res.status(502).json({ message: 'No candle data returned from live market feed' });
    }

    return res.json({ symbol, period, candles });
  } catch (error) {
    console.error('getCandles error:', error.message);
    if (isWeakConnectionError(error)) {
      return res.status(504).json({
        message: 'Weak connection: Live chart data timed out. Please check your internet connection.',
        isWeakConnection: true,
      });
    }
    return res.status(error.statusCode || 500).json({
      message: error.message || 'Failed to fetch live candle data from Angel One',
      error: error.response?.data || error.message,
    });
  }
};

module.exports = {
  getQuote,
  getGainersLosers,
  getCandles,
  fetchQuoteData,
  fetchCandleData,
  fetchQuoteByToken,
  fetchBatchQuotesByTokens,
};