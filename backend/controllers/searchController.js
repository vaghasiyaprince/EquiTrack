const { getAngelSession } = require('../utils/angelClient');
const { fetchBatchQuotesByTokens } = require('./marketController');
const { findToken, rateLimitedSearchScrip } = require('../utils/instrumentMaster');
const Stock = require('../models/Stock');
const {
  getCuratedStocksFromDb,
  getStockInfoFromDb,
  seedStocksIfEmpty,
} = require('../utils/stockDbService');

// @desc    Search for stocks by name or symbol (MongoDB stock catalog + live Angel One fallback)
// @route   GET /api/market/search?q=tata&exchange=NSE
// @access  Private
const searchStocks = async (req, res) => {
  try {
    const { q = '', exchange = 'NSE' } = req.query;
    const cleanQuery = q.trim();

    await seedStocksIfEmpty();

    // 1. If query is empty, return top curated NSE equities stored in MongoDB with live quotes
    if (!cleanQuery) {
      const defaultStocks = await getCuratedStocksFromDb();
      const tokenMap = new Map();

      for (const item of defaultStocks) {
        const tok = item.token || (await findToken(item.symbol, exchange));
        if (tok) tokenMap.set(item.symbol, tok);
      }

      const tokens = Array.from(tokenMap.values());
      const quotes = await fetchBatchQuotesByTokens(tokens, exchange).catch(() => []);
      const quoteBySymbol = new Map();
      for (const qItem of quotes) {
        quoteBySymbol.set(qItem.symbol, qItem);
      }

      const results = defaultStocks.map((item) => {
        const quote = quoteBySymbol.get(item.symbol);
        return {
          symbol: item.symbol,
          exchange,
          name: item.name,
          currentPrice: quote ? quote.price : null,
          changePercent: quote ? quote.changePercent : null,
        };
      });

      return res.json(results);
    }

    const qLower = cleanQuery.toLowerCase();
    const candidates = new Map(); // key: tradingsymbol, value: { symboltoken, exchange }

    // 2. Query MongoDB for symbol, name, or keyword alias matches
    const escapedQuery = cleanQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const dbMatches = await Stock.find({
      $or: [
        { symbol: new RegExp(escapedQuery, 'i') },
        { name: new RegExp(escapedQuery, 'i') },
        { aliases: qLower },
      ],
    }).lean();

    for (const match of dbMatches) {
      let tok = match.token;
      if (!tok) {
        try {
          tok = await findToken(match.symbol, match.exchange || exchange);
        } catch (e) {}
      }
      if (tok) {
        candidates.set(match.symbol, {
          symboltoken: tok,
          exchange: match.exchange || exchange,
        });
      }
    }

    // 3. Query Angel One live searchScrip using throttled queue for any uncataloged scrips
    try {
      const smartApi = await getAngelSession();
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

              // Asynchronously save discovered scrip into MongoDB so it persists permanently
              Stock.findOneAndUpdate(
                { symbol: item.tradingsymbol },
                {
                  $setOnInsert: {
                    symbol: item.tradingsymbol,
                    name: item.name || item.tradingsymbol.replace('-EQ', ''),
                    exchange: item.exchange || exchange,
                    token: item.symboltoken,
                    description: 'Company listed on NSE.',
                    aliases: [item.tradingsymbol.replace('-EQ', '').toLowerCase()],
                  },
                },
                { upsert: true }
              ).catch(() => {});
            }
          }
        }
      }
    } catch (angelErr) {
      console.warn('Angel One searchScrip query error:', angelErr.message);
    }

    if (candidates.size === 0) {
      return res.json([]);
    }

    // Limit to top 15 candidate scrips
    const limitedCandidates = Array.from(candidates.entries()).slice(0, 15);
    const tokensToFetch = limitedCandidates.map(([, data]) => data.symboltoken).filter(Boolean);

    // 4. Fetch batch live quotes from Angel One
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

    // Retrieve company titles from MongoDB
    const candidateSymbols = limitedCandidates.map(([sym]) => sym);
    const dbDocs = await Stock.find({ symbol: { $in: candidateSymbols } }).lean();
    const docMap = new Map();
    for (const d of dbDocs) {
      docMap.set(d.symbol, d);
    }

    const results = limitedCandidates.map(([sym, data]) => {
      const quote = quoteBySymbol.get(sym);
      const stockDoc = docMap.get(sym);
      return {
        symbol: sym,
        exchange: data.exchange || exchange,
        name: stockDoc ? stockDoc.name : sym.replace('-EQ', ''),
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