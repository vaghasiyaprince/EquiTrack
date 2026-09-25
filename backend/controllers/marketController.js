const axios = require('axios');
const https = require('https');
const { getAngelSession } = require('../utils/angelClient');
const { findToken } = require('../utils/instrumentMaster');

const agent = new https.Agent({ keepAlive: false });

// @desc    Get live quote for a single stock
// @route   GET /api/market/quote/:symbol
// @access  Private
const getQuote = async (req, res) => {
  try {
    const { symbol } = req.params;
    const exchange = req.query.exchange || 'NSE';

    const token = await findToken(symbol, exchange);
    if (!token) {
      return res.status(404).json({ message: `Symbol '${symbol}' not found on ${exchange}` });
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
      return res.status(502).json({
        message: 'No data returned from Angel One',
        detail: response.data,
      });
    }

    const quote = fetched[0];

    return res.json({
      symbol: quote.tradingSymbol,
      exchange: quote.exchange,
      price: quote.ltp,
      open: quote.open,
      dayHigh: quote.high,
      dayLow: quote.low,
      previousClose: quote.close,
      change: quote.netChange,
      changePercent: quote.percentChange,
    });
  } catch (error) {
    console.error('getQuote error:', error.response?.data || error.message);
    return res.status(500).json({
      message: 'Failed to fetch quote',
      error: error.response?.data || error.message,
    });
  }
};

module.exports = { getQuote };