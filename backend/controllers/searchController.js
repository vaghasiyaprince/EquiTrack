const { getAngelSession } = require('../utils/angelClient');
const { fetchBatchQuotesByTokens } = require('./marketController');
const { findToken, rateLimitedSearchScrip } = require('../utils/instrumentMaster');
const { getCompanyInfo } = require('../data/companyInfo');

// Default top active equities to display when search query is empty
const DEFAULT_POPULAR_SYMBOLS = [
  'RELIANCE-EQ',
  'TCS-EQ',
  'INFY-EQ',
  'HDFCBANK-EQ',
  'ICICIBANK-EQ',
  'SBIN-EQ',
  'TATAMOTORS-EQ',
  'TATASTEEL-EQ',
  'ITC-EQ',
  'BHARTIARTL-EQ',
  'BAJFINANCE-EQ',
  'LT-EQ',
];

// Curated dictionary for fast name -> symbol matching
const CURATED_COMPANIES = [
  { symbol: 'RELIANCE-EQ', name: 'Reliance Industries Ltd' },
  { symbol: 'TCS-EQ', name: 'Tata Consultancy Services' },
  { symbol: 'INFY-EQ', name: 'Infosys Ltd' },
  { symbol: 'HDFCBANK-EQ', name: 'HDFC Bank Ltd' },
  { symbol: 'ICICIBANK-EQ', name: 'ICICI Bank Ltd' },
  { symbol: 'SBIN-EQ', name: 'State Bank of India' },
  { symbol: 'TATAMOTORS-EQ', name: 'Tata Motors Ltd' },
  { symbol: 'TATASTEEL-EQ', name: 'Tata Steel Ltd' },
  { symbol: 'ITC-EQ', name: 'ITC Ltd' },
  { symbol: 'HINDUNILVR-EQ', name: 'Hindustan Unilever Ltd' },
  { symbol: 'BAJFINANCE-EQ', name: 'Bajaj Finance Ltd' },
  { symbol: 'BHARTIARTL-EQ', name: 'Bharti Airtel Ltd' },
  { symbol: 'KOTAKBANK-EQ', name: 'Kotak Mahindra Bank Ltd' },
  { symbol: 'LT-EQ', name: 'Larsen & Toubro Ltd' },
  { symbol: 'MARUTI-EQ', name: 'Maruti Suzuki India Ltd' },
  { symbol: 'WIPRO-EQ', name: 'Wipro Ltd' },
  { symbol: 'ASIANPAINT-EQ', name: 'Asian Paints Ltd' },
  { symbol: 'AXISBANK-EQ', name: 'Axis Bank Ltd' },
  { symbol: 'SUNPHARMA-EQ', name: 'Sun Pharmaceutical Industries Ltd' },
  { symbol: 'TITAN-EQ', name: 'Titan Company Ltd' },
];

// Common keyword aliases
const KEYWORD_ALIASES = {
  infosys: 'INFY-EQ',
  infy: 'INFY-EQ',
  tcs: 'TCS-EQ',
  reliance: 'RELIANCE-EQ',
  jio: 'RELIANCE-EQ',
  hdfc: 'HDFCBANK-EQ',
  icici: 'ICICIBANK-EQ',
  sbi: 'SBIN-EQ',
  'state bank': 'SBIN-EQ',
  airtel: 'BHARTIARTL-EQ',
  bharti: 'BHARTIARTL-EQ',
  lnt: 'LT-EQ',
  'l&t': 'LT-EQ',
  maruti: 'MARUTI-EQ',
  suzuki: 'MARUTI-EQ',
  bajaj: 'BAJFINANCE-EQ',
  wipro: 'WIPRO-EQ',
  hul: 'HINDUNILVR-EQ',
  unilever: 'HINDUNILVR-EQ',
};

// @desc    Search for stocks by name or symbol (live Angel One with local fallback & smart aliases)
// @route   GET /api/market/search?q=tata&exchange=NSE
// @access  Private
const searchStocks = async (req, res) => {
  try {
    const { q = '', exchange = 'NSE' } = req.query;
    const cleanQuery = q.trim();

    // 1. If query is empty, return top trending/popular NSE equities with live quotes
    if (!cleanQuery) {
      const tokenMap = new Map();
      for (const sym of DEFAULT_POPULAR_SYMBOLS) {
        try {
          const tok = await findToken(sym, exchange);
          if (tok) tokenMap.set(sym, tok);
        } catch (e) {
          // ignore individual token errors
        }
      }

      const tokens = Array.from(tokenMap.values());
      const quotes = await fetchBatchQuotesByTokens(tokens, exchange).catch(() => []);
      const quoteBySymbol = new Map();
      for (const qItem of quotes) {
        quoteBySymbol.set(qItem.symbol, qItem);
      }

      const results = DEFAULT_POPULAR_SYMBOLS.map((sym) => {
        const quote = quoteBySymbol.get(sym);
        const info = getCompanyInfo(sym);
        return {
          symbol: sym,
          exchange,
          name: info.name,
          currentPrice: quote ? quote.price : null,
          changePercent: quote ? quote.changePercent : null,
        };
      });

      return res.json(results);
    }

    const qLower = cleanQuery.toLowerCase();
    const candidates = new Map(); // key: tradingsymbol, value: { symboltoken, exchange }

    // 2. Check keyword aliases first (e.g. "infosys" -> INFY-EQ)
    if (KEYWORD_ALIASES[qLower]) {
      const aliasSymbol = KEYWORD_ALIASES[qLower];
      try {
        const tok = await findToken(aliasSymbol, exchange);
        if (tok) candidates.set(aliasSymbol, { symboltoken: tok, exchange });
      } catch (e) {}
    }

    // 3. Check curated companies list for partial matching name or symbol
    for (const c of CURATED_COMPANIES) {
      if (
        c.symbol.toLowerCase().includes(qLower) ||
        c.name.toLowerCase().includes(qLower) ||
        c.symbol.replace('-EQ', '').toLowerCase().includes(qLower)
      ) {
        if (!candidates.has(c.symbol)) {
          try {
            const tok = await findToken(c.symbol, exchange);
            if (tok) candidates.set(c.symbol, { symboltoken: tok, exchange });
          } catch (e) {}
        }
      }
    }

    // 4. Query Angel One live searchScrip using throttled queue
    try {
      const smartApi = await getAngelSession();
      // Remove '-EQ' if user entered it
      const searchScripName = cleanQuery.replace(/-EQ$/i, '');
      const liveResults = await rateLimitedSearchScrip(smartApi, exchange, searchScripName);

      if (Array.isArray(liveResults)) {
        for (const item of liveResults) {
          if (item.tradingsymbol && item.tradingsymbol.endsWith('-EQ')) {
            if (!candidates.has(item.tradingsymbol)) {
              candidates.set(item.tradingsymbol, {
                symboltoken: item.symboltoken,
                exchange: item.exchange || exchange,
              });
            }
          }
        }
      }
    } catch (angelErr) {
      console.warn('Angel One searchScrip query error:', angelErr.message);
      // Fallback continues with candidates already gathered from curated list
    }

    // If no results found at all
    if (candidates.size === 0) {
      return res.json([]);
    }

    // Limit to top 15 candidate scrips
    const limitedCandidates = Array.from(candidates.entries()).slice(0, 15);
    const tokensToFetch = limitedCandidates.map(([, data]) => data.symboltoken).filter(Boolean);

    // 5. Fetch batch live quotes from Angel One
    let quotes = [];
    try {
      quotes = await fetchBatchQuotesByTokens(tokensToFetch, exchange);
    } catch (quoteErr) {
      console.warn('searchStocks: batch quote fetch error:', quoteErr.message);
    }

    const quoteBySymbol = new Map();
    for (const qItem of quotes) {
      quoteBySymbol.set(qItem.symbol, qItem);
    }

    const results = limitedCandidates.map(([sym, data]) => {
      const quote = quoteBySymbol.get(sym);
      const info = getCompanyInfo(sym);
      return {
        symbol: sym,
        exchange: data.exchange || exchange,
        name: info.name,
        currentPrice: quote ? quote.price : null,
        changePercent: quote ? quote.changePercent : null,
      };
    });

    return res.json(results);
  } catch (error) {
    console.error('searchStocks error:', error.message);
    const isWeak =
      error.code === 'WEAK_CONNECTION' ||
      error.code === 'ETIMEDOUT' ||
      error.code === 'ECONNABORTED' ||
      (error.message && error.message.toLowerCase().includes('timeout'));

    if (isWeak) {
      return res.status(504).json({
        message: 'Weak connection: Live stock search timed out. Please check your internet connection.',
        isWeakConnection: true,
      });
    }

    return res.status(error.statusCode || 500).json({
      message: error.message || 'Failed to search live stocks on Angel One',
      error: error.message,
    });
  }
};

module.exports = { searchStocks };