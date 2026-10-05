const axios = require('axios');
const https = require('https');
const { getAngelSession } = require('./angelClient');

const agent = new https.Agent({ keepAlive: false });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// In-memory cache pre-seeded with top NSE liquid tokens for instant resolution without API roundtrips
const PRE_SEEDED_TOKENS = {
  'NSE:RELIANCE-EQ': '2885',
  'NSE:TCS-EQ': '11536',
  'NSE:INFY-EQ': '1594',
  'NSE:HDFCBANK-EQ': '1333',
  'NSE:ICICIBANK-EQ': '4963',
  'NSE:SBIN-EQ': '3045',
  'NSE:TATAMOTORS-EQ': '3456',
  'NSE:TATASTEEL-EQ': '3499',
  'NSE:ITC-EQ': '1660',
  'NSE:HINDUNILVR-EQ': '1394',
  'NSE:BAJFINANCE-EQ': '317',
  'NSE:BHARTIARTL-EQ': '10604',
  'NSE:KOTAKBANK-EQ': '1922',
  'NSE:LT-EQ': '11483',
  'NSE:MARUTI-EQ': '10999',
  'NSE:WIPRO-EQ': '3787',
  'NSE:ASIANPAINT-EQ': '236',
  'NSE:AXISBANK-EQ': '5900',
  'NSE:SUNPHARMA-EQ': '3351',
  'NSE:TITAN-EQ': '3506',
};

const tokenCache = new Map(Object.entries(PRE_SEEDED_TOKENS));

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

// Find the token for a given trading symbol + exchange (e.g. "RELIANCE-EQ", "NSE") entirely via live API
const findToken = async (tradingsymbol, exchange = 'NSE') => {
  const cacheKey = `${exchange}:${tradingsymbol}`;
  if (tokenCache.has(cacheKey)) {
    return tokenCache.get(cacheKey);
  }

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
  return token;
};

module.exports = { findToken, rateLimitedSearchScrip };