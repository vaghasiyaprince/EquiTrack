const axios = require('axios');
const https = require('https');
const { getAngelSession } = require('../utils/angelClient');
const { fetchQuoteByToken } = require('./marketController');
const { getCompanyInfo } = require('../data/companyInfo');

const agent = new https.Agent({ keepAlive: false });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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

    const rawResults = response.data?.data || [];

    // Keep only equity results (skip futures/options clutter), cap to a
    // reasonable number since each one triggers a live quote lookup below
    const equityResults = rawResults
      .filter((r) => r.tradingsymbol.endsWith('-EQ'))
      .slice(0, 8);

    const enriched = [];
    for (const r of equityResults) {
      try {
        const quote = await fetchQuoteByToken(r.symboltoken, r.exchange);
        const info = getCompanyInfo(r.tradingsymbol);
        enriched.push({
          symbol: r.tradingsymbol,
          exchange: r.exchange,
          name: info.name,
          currentPrice: quote ? quote.price : null,
          changePercent: quote ? quote.changePercent : null,
        });
      } catch (err) {
        console.warn(`Search: skipping quote for ${r.tradingsymbol}:`, err.message);
        const info = getCompanyInfo(r.tradingsymbol);
        enriched.push({
          symbol: r.tradingsymbol,
          exchange: r.exchange,
          name: info.name,
          currentPrice: null,
          changePercent: null,
        });
      }
      await sleep(150);
    }

    // SearchView.jsx expects a plain array, not { results: [...] }
    return res.json(enriched);
  } catch (error) {
    console.error('searchStocks error:', error.response?.data || error.message);
    return res.status(500).json({
      message: 'Failed to search stocks',
      error: error.response?.data || error.message,
    });
  }
};

module.exports = { searchStocks };