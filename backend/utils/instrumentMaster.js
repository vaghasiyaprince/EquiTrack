const axios = require('axios');
const https = require('https');
const { getAngelSession } = require('./angelClient');

const agent = new https.Agent({ keepAlive: false });

// Simple in-memory cache so we don't re-search the same symbol repeatedly
const tokenCache = new Map();

// Find the token for a given trading symbol + exchange (e.g. "RELIANCE-EQ", "NSE")
const findToken = async (tradingsymbol, exchange = 'NSE') => {
  const cacheKey = `${exchange}:${tradingsymbol}`;
  if (tokenCache.has(cacheKey)) {
    return tokenCache.get(cacheKey);
  }

  const smartApi = await getAngelSession();

  // Angel One's search API expects the bare name, not the "-EQ" suffix
  const searchName = tradingsymbol.replace(/-EQ$/i, '');

  const response = await axios.post(
    'https://apiconnect.angelbroking.com/rest/secure/angelbroking/order/v1/searchScrip',
    {
      exchange,
      searchscrip: searchName,
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

  const results = response.data?.data;
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

module.exports = { findToken };