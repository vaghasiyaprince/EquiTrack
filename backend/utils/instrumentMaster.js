const axios = require('axios');

let instrumentCache = null;
let cacheTime = null;
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // refresh once a day

const SCRIP_MASTER_URL =
  'https://margincalculator.angelbroking.com/OpenAPI_File/files/OpenAPIScripMaster.json';

const loadInstruments = async () => {
  const now = Date.now();
  if (instrumentCache && cacheTime && now - cacheTime < CACHE_DURATION_MS) {
    return instrumentCache;
  }

  console.log('Downloading Angel One instrument master (this may take a few seconds)...');
  const { data } = await axios.get(SCRIP_MASTER_URL);
  instrumentCache = data;
  cacheTime = now;
  console.log(`Loaded ${data.length} instruments`);
  return instrumentCache;
};

// Find the token for a given trading symbol + exchange (e.g. "RELIANCE-EQ", "NSE")
const findToken = async (tradingsymbol, exchange = 'NSE') => {
  const instruments = await loadInstruments();
  const match = instruments.find(
    (i) => i.symbol === tradingsymbol && i.exch_seg === exchange
  );
  return match ? match.token : null;
};

module.exports = { loadInstruments, findToken };