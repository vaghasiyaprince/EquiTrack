import React, { useState, useEffect } from 'react';
import { useStock } from '../context/StockContext';
import { Search, ArrowRight, X } from 'lucide-react';

export const SearchModal = ({ isOpen, onClose }) => {
  const [isRendered, setIsRendered] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const { allStocks, setSelectedSymbol } = useStock();
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      setIsClosing(false);
      setQuery('');
    } else if (isRendered) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setIsRendered(false);
        setIsClosing(false);
      }, 180);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isRendered) return null;

  const handleDismiss = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 180);
  };

  const filtered = query.trim()
    ? allStocks.filter(
        (s) =>
          s.symbol.toLowerCase().includes(query.toLowerCase()) ||
          s.name.toLowerCase().includes(query.toLowerCase()) ||
          s.category.toLowerCase().includes(query.toLowerCase())
      )
    : allStocks;

  return (
    <div
      className={`apple-backdrop ${isClosing ? 'apple-backdrop-exit' : 'apple-backdrop-enter'}`}
      style={{ alignItems: 'flex-start', paddingTop: '10vh' }}
      onClick={handleDismiss}
    >
      <div
        className={isClosing ? 'apple-modal-exit' : 'apple-modal-enter'}
        style={{
          width: '100%',
          maxWidth: '520px',
          backgroundColor: 'var(--apple-card-bg)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--apple-shadow-modal)',
          border: '1px solid var(--apple-border)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Bar Input */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '16px 20px',
            borderBottom: '1px solid var(--apple-border)',
          }}
        >
          <Search size={18} color="var(--apple-ink-secondary)" style={{ marginRight: '12px' }} />
          <input
            autoFocus
            type="text"
            placeholder="Search NSE/BSE companies or tickers..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              width: '100%',
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: '16px',
              color: 'var(--apple-ink)',
            }}
          />
          <button
            onClick={handleDismiss}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: 'var(--apple-ink-secondary)',
              fontSize: '12px',
            }}
          >
            <kbd
              style={{
                fontSize: '11px',
                padding: '2px 6px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--apple-surface-secondary)',
                color: 'var(--apple-ink-secondary)',
                border: '1px solid var(--apple-hairline)',
              }}
            >
              ESC
            </kbd>
          </button>
        </div>

        {/* Results List */}
        <div style={{ maxHeight: '340px', overflowY: 'auto', padding: '8px' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '28px', textAlign: 'center', color: 'var(--apple-ink-secondary)', fontSize: '13px' }}>
              No companies matching "{query}"
            </div>
          ) : (
            filtered.map((stock) => (
              <div
                key={stock.symbol}
                onClick={() => {
                  setSelectedSymbol(stock.symbol);
                  handleDismiss();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '11px 14px',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  transition: 'background-color 0.12s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--apple-surface-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--apple-ink)' }}>
                      {stock.symbol.replace('.NS', '')}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--apple-ink-secondary)' }}>
                      {stock.exchange} · {stock.category}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--apple-ink-secondary)', marginTop: '2px' }}>
                    {stock.name}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontWeight: 600, fontSize: '13px' }}>₹{stock.price.toFixed(2)}</span>
                  <ArrowRight size={14} color="var(--apple-ink-secondary)" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
