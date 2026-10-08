const axios = require('axios');
const https = require('https');
const { getAngelSession } = require('./angelClient');
const Stock = require('../models/Stock');

const agent = new https.Agent({ keepAlive: false });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const tokenCache = new Map();

// Serial queue to throttle Angel One searchScrip calls to avoid the 3 req/sec rate limit (HTTP 403)
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL_MS = 400; // max 2.5 requests per sec, staying strictly within rate limits

const rateLimitedSearchScrip = async (smartApi, exchange, searchName) => {
  const now = Date.now();
  const timeSinceLast = now - lastRequestTime;
  if (timeSinceLast < MIN_REQUEST_INTERVAL_MS) {
    await sleep(MIN_REQUEST_INTERVAL_MS - timeSinceLast);
  }
  lastRequestTime = Date.now();

  let retries = 3;
  let delay = 1000;

  while (retries > 0) {
    try {
      const response = await axios.post(
        'https://apiconnect.angelbroking.com/rest/secure/angelbroking/order/v1/searchScrip',
        {
          exchange,
          searchscrip: searchName,
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

      return response.data?.data || [];
    } catch (error) {
      const status = error.response?.status;
      const msg = error.response?.data?.message || error.message;

      // If Angel One returns 403 rate limit or network issue, back off with delay and retry
      if (status === 403 || status === 429 || error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        console.warn(`Angel One searchScrip rate limited for '${searchName}', delaying ${delay}ms before retry...`);
        await sleep(delay);
        delay *= 2;
        retries--;
        lastRequestTime = Date.now();
      } else {
        throw error;
      }
    }
  }
  return [];
};

// Find the token for a given trading symbol + exchange (queries MongoDB, then Angel One live API)
const findToken = async (tradingsymbol, exchange = 'NSE') => {
  const cacheKey = `${exchange}:${tradingsymbol}`;
  if (tokenCache.has(cacheKey)) {
    return tokenCache.get(cacheKey);
  }

  // 1. Check MongoDB Stock collection
  try {
    const dbStock = await Stock.findOne({ symbol: tradingsymbol }).lean();
    if (dbStock && dbStock.token) {
      tokenCache.set(cacheKey, dbStock.token);
      return dbStock.token;
    }
  } catch (err) {
    // Continue to live API if DB query fails
  }

  // 2. Query Angel One live API
  const smartApi = await getAngelSession();

  // Angel One's search API expects the bare name, not the "-EQ" suffix
  const searchName = tradingsymbol.replace(/-EQ$/i, '');

  const results = await rateLimitedSearchScrip(smartApi, exchange, searchName);
  if (!results || results.length === 0) {
    return null;
  }

  // Prefer an exact match on the requested trading symbol; otherwise take the first result
  const exactMatch = results.find(
    (r) => r.tradingsymbol === tradingsymbol && r.exchange === exchange
  );
  const chosen = exactMatch || results[0];

  const token = chosen.symboltoken;
  tokenCache.set(cacheKey, token);

  // 3. Persist the token to MongoDB Stock collection
  try {
    await Stock.findOneAndUpdate(
      { symbol: tradingsymbol },
      {
        $set: {
          token,
          exchange,
          name: chosen.name || tradingsymbol.replace('-EQ', ''),
        },
      },
      { upsert: true }
    );
  } catch (err) {
    // Non-fatal
  }

  return token;
};

module.exports = { findToken, rateLimitedSearchScrip };