const axios = require('axios');
const https = require('https');
const { getAngelSession } = require('../utils/angelClient');

const agent = new https.Agent({ keepAlive: false });

// @desc    Search for stocks by name or symbol
// @route   GET /api/market/search?q=tata&exchange=NSE
// @access  Private
const searchStocks = async (req, res) => {
  try {
    const { q, exchange = 'NSE' } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const smartApi = await getAngelSession();

    const response = await axios.post(
      'https://apiconnect.angelbroking.com/rest/secure/angelbroking/order/v1/searchScrip',
      {
        exchange,
        searchscrip: q.trim(),
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

    const results = response.data?.data || [];

    const formatted = results.map((r) => ({
      symbol: r.tradingsymbol,
      token: r.symboltoken,
      exchange: r.exchange,
    }));

    return res.json({ query: q, count: formatted.length, results: formatted });
  } catch (error) {
    console.error('searchStocks error:', error.response?.data || error.message);
    return res.status(500).json({
      message: 'Failed to search stocks',
      error: error.response?.data || error.message,
    });
  }
};

module.exports = { searchStocks };