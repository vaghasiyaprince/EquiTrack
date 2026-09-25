import React, { useState, useEffect } from 'react';
import { searchStocksApi, addToWatchlistApi } from '../services/api';
import {
  Search,
  X,
  ArrowUpRight,
  Bookmark,
  Check,
} from 'lucide-react';

export const SearchView = ({
  onSelectStock,
  watchlistSymbols = new Set(),
  onWatchlistChanged,
  onNotification,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addingSymbol, setAddingSymbol] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const data = await searchStocksApi(query);
        if (isMounted) {
          setResults(data || []);
        }
      } catch (err) {
        console.warn('Search error:', err.message);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }, 200);

    return () => {
      clearTimeout(timer);
      isMounted = false;
    };
  }, [query]);

  const handleAddWatchlist = async (e, stock) => {
    e.stopPropagation();
    if (addingSymbol) return;
    setAddingSymbol(stock.symbol);

    try {
      const res = await addToWatchlistApi(stock.symbol, stock.name);
      const msg = res.message || 'Stock added successfully';
      if (onNotification) onNotification({ type: 'success', message: msg });
      if (onWatchlistChanged) onWatchlistChanged();
    } catch (err) {
      if (onNotification) onNotification({ type: 'error', message: err.message || 'Could not add to watchlist' });
    } finally {
      setAddingSymbol(null);
    }
  };

  return (
    <div className="apple-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Search Header */}
      <div>
        <h1 style={{ fontSize: '34px', fontWeight: 600, color: 'var(--apple-ink)' }}>
          Search Stocks
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--apple-body-muted)', marginTop: '4px' }}>
          Find companies and symbols listed on the National Stock Exchange (NSE)
        </p>
      </div>

      {/* Apple Pill Search Input (apple.design.md: 44px height, pill radius) */}
      <div style={{ position: 'relative', width: '100%', maxWidth: '640px' }}>
        <Search
          size={18}
          style={{
            position: 'absolute',
            left: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--apple-body-muted)',
          }}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by company or symbol (e.g. Tata, Reliance, TCS.NS)..."
          style={{
            width: '100%',
            height: '44px',
            borderRadius: 'var(--rounded-pill)',
            border: '1px solid var(--apple-hairline)',
            backgroundColor: 'var(--apple-surface-card)',
            color: 'var(--apple-ink)',
            padding: '0 40px 0 44px',
            fontSize: '15px',
            fontFamily: 'var(--font-sf-text)',
            outline: 'none',
            boxShadow: 'var(--shadow-apple)',
          }}
          autoFocus
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            style={{
              position: 'absolute',
              right: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'transparent',
              border: 'none',
              color: 'var(--apple-body-muted)',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Results List */}
      {results.length > 0 ? (
        <div className="apple-card" style={{ padding: '8px 24px' }}>
          {results.map((stock, idx) => {
            const inWatchlist = watchlistSymbols.has(stock.symbol);
            const isBullish = (stock.changePercent ?? 0) >= 0;

            return (
              <div
                key={stock.symbol}
                onClick={() => onSelectStock(stock.symbol)}
                className="apple-list-row"
                style={{
                  borderBottom: idx !== results.length - 1 ? '1px solid var(--apple-hairline)' : 'none',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '17px', fontWeight: 600, color: 'var(--apple-ink)' }}>
                      {stock.symbol}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--apple-body-muted)' }}>
                      NSE
                    </span>
                  </div>
                  <div style={{ fontSize: '14px', color: 'var(--apple-body-muted)', marginTop: '2px' }}>
                    {stock.name}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  {stock.currentPrice && (
                    <div style={{ textAlign: 'right' }}>
                      <div className="mono-num" style={{ fontSize: '16px', fontWeight: 600, color: 'var(--apple-ink)' }}>
                        ₹{stock.currentPrice.toFixed(2)}
                      </div>
                      {stock.changePercent !== undefined && (
                        <span className={isBullish ? 'apple-badge-green' : 'apple-badge-red'} style={{ marginTop: '2px' }}>
                          {isBullish ? '+' : ''}
                          {stock.changePercent.toFixed(2)}%
                        </span>
                      )}
                    </div>
                  )}

                  <button
                    onClick={(e) => handleAddWatchlist(e, stock)}
                    disabled={inWatchlist || addingSymbol === stock.symbol}
                    className={`apple-btn-pill ${inWatchlist ? 'apple-btn-pill-secondary' : ''}`}
                    style={{
                      padding: '6px 14px',
                      fontSize: '13px',
                      opacity: inWatchlist ? 0.8 : 1,
                    }}
                  >
                    {inWatchlist ? (
                      <>
                        <Check size={13} color="#34c759" />
                        <span>Saved</span>
                      </>
                    ) : (
                      <>
                        <Bookmark size={13} />
                        <span>Watchlist</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : !loading ? (
        <div className="apple-card" style={{ padding: '40px', textAlign: 'center' }}>
          <p style={{ color: 'var(--apple-body-muted)', fontSize: '15px' }}>
            No equities matching "{query}".
          </p>
        </div>
      ) : null}
    </div>
  );
};
