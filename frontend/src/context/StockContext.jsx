import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { INDIAN_STOCKS_DATA, MARKET_INDICES } from '../services/stockService';
import { useAuth } from './AuthContext';

const StockContext = createContext(null);

export const StockProvider = ({ children }) => {
  const { user } = useAuth();
  
  // Active selected stock
  const [selectedSymbol, setSelectedSymbol] = useState('RELIANCE.NS');
  
  // Watchlist symbols (defaults to popular NSE giants, or user's saved list)
  const [watchlistSymbols, setWatchlistSymbols] = useState(() => {
    const saved = localStorage.getItem('equitrack_watchlist');
    return saved ? JSON.parse(saved) : ['RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'TATAMOTORS.NS', 'INFY.NS'];
  });

  // Selected chart timeframe (1D, 1W, 1M, 1Y)
  const [timeframe, setTimeframe] = useState('1D');

  // Search query
  const [searchQuery, setSearchQuery] = useState('');

  // Sidebar filter: 'watchlist' | 'gainers' | 'losers' | 'all'
  const [activeTab, setActiveTab] = useState('watchlist');

  // Sync watchlist to localStorage
  useEffect(() => {
    localStorage.setItem('equitrack_watchlist', JSON.stringify(watchlistSymbols));
  }, [watchlistSymbols]);

  // Sync user watchlist if available
  useEffect(() => {
    if (user?.watchlist && Array.isArray(user.watchlist) && user.watchlist.length > 0) {
      setWatchlistSymbols(user.watchlist);
    }
  }, [user]);

  // Current selected stock object
  const selectedStock = useMemo(() => {
    return (
      INDIAN_STOCKS_DATA.find((s) => s.symbol === selectedSymbol) ||
      INDIAN_STOCKS_DATA[0]
    );
  }, [selectedSymbol]);

  // Filtered stocks based on tab & search
  const displayedStocks = useMemo(() => {
    let list = INDIAN_STOCKS_DATA;

    if (activeTab === 'watchlist') {
      list = INDIAN_STOCKS_DATA.filter((s) => watchlistSymbols.includes(s.symbol));
    } else if (activeTab === 'gainers') {
      list = [...INDIAN_STOCKS_DATA].sort((a, b) => b.changePercent - a.changePercent);
    } else if (activeTab === 'losers') {
      list = [...INDIAN_STOCKS_DATA].sort((a, b) => a.changePercent - b.changePercent);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return INDIAN_STOCKS_DATA.filter(
        (s) => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
      );
    }

    return list;
  }, [activeTab, watchlistSymbols, searchQuery]);

  // Toggle stock in watchlist
  const toggleWatchlist = (symbol) => {
    setWatchlistSymbols((prev) => {
      if (prev.includes(symbol)) {
        return prev.filter((s) => s !== symbol);
      } else {
        return [...prev, symbol];
      }
    });
  };

  const isInWatchlist = (symbol) => watchlistSymbols.includes(symbol);

  return (
    <StockContext.Provider
      value={{
        selectedStock,
        selectedSymbol,
        setSelectedSymbol,
        watchlistSymbols,
        toggleWatchlist,
        isInWatchlist,
        timeframe,
        setTimeframe,
        searchQuery,
        setSearchQuery,
        activeTab,
        setActiveTab,
        displayedStocks,
        marketIndices: MARKET_INDICES,
        allStocks: INDIAN_STOCKS_DATA,
      }}
    >
      {children}
    </StockContext.Provider>
  );
};

export const useStock = () => {
  const context = useContext(StockContext);
  if (!context) {
    throw new Error('useStock must be used within a StockProvider');
  }
  return context;
};
