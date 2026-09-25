import React, { useState } from 'react';
import { removeFromWatchlistApi } from '../services/api';
import {
  Bookmark,
  Trash2,
  Search,
  Calendar,
} from 'lucide-react';

export const WatchlistView = ({
  watchlist = [],
  loading = false,
  onSelectStock,
  onNavigateSearch,
  onWatchlistChanged,
  onNotification,
}) => {
  const [removingSymbol, setRemovingSymbol] = useState(null);

  const handleRemove = async (e, symbol) => {
    e.stopPropagation();
    if (removingSymbol) return;
    setRemovingSymbol(symbol);

    try {
      const res = await removeFromWatchlistApi(symbol);
      const msg = res.message || 'Stock removed successfully';
      if (onNotification) onNotification({ type: 'success', message: msg });
      if (onWatchlistChanged) onWatchlistChanged();
    } catch (err) {
      if (onNotification) onNotification({ type: 'error', message: err.message || 'Failed to remove stock' });
    } finally {
      setRemovingSymbol(null);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '5rem 0', textAlign: 'center', color: 'var(--apple-body-muted)' }}>
        <p style={{ fontSize: '15px' }}>Loading your saved watchlist...</p>
      </div>
    );
  }

  return (
    <div className="apple-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '34px', fontWeight: 600, color: 'var(--apple-ink)' }}>
            My Watchlist
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--apple-body-muted)', marginTop: '4px' }}>
            Personalized collection of equities saved to your account
          </p>
        </div>

        <button onClick={onNavigateSearch} className="apple-btn-pill">
          <Search size={14} />
          <span>Add More Equities</span>
        </button>
      </div>

      {watchlist.length === 0 ? (
        <div
          className="apple-card"
          style={{
            padding: '64px 24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--rounded-pill)',
              background: 'var(--apple-surface-pearl)',
              color: 'var(--apple-body-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Bookmark size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '6px', color: 'var(--apple-ink)' }}>
              No Stocks in Watchlist
            </h3>
            <p style={{ fontSize: '15px', color: 'var(--apple-body-muted)', maxWidth: '420px', margin: '0 auto' }}>
              Add stocks from the Market Dashboard or Search tab to track them here in real time.
            </p>
          </div>
          <button onClick={onNavigateSearch} className="apple-btn-pill" style={{ marginTop: '8px' }}>
            <span>Search Market</span>
          </button>
        </div>
      ) : (
        <div className="apple-card" style={{ padding: '8px 24px' }}>
          {watchlist.map((item, idx) => {
            const isBullish = (item.changePercent ?? 0) >= 0;

            return (
              <div
                key={item.symbol}
                onClick={() => onSelectStock(item.symbol)}
                className="apple-list-row"
                style={{
                  borderBottom: idx !== watchlist.length - 1 ? '1px solid var(--apple-hairline)' : 'none',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '18px', fontWeight: 600, color: 'var(--apple-ink)' }}>
                      {item.symbol}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--apple-body-muted)' }}>
                      {item.exchange || 'NSE'}
                    </span>
                  </div>
                  <div style={{ fontSize: '14px', color: 'var(--apple-body-muted)', marginTop: '2px' }}>
                    {item.companyName}
                  </div>
                </div>

                {item.addedOn && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--apple-body-muted)' }}>
                    <Calendar size={13} />
                    <span>Added {item.addedOn}</span>
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div className="mono-num" style={{ fontSize: '17px', fontWeight: 600, color: 'var(--apple-ink)' }}>
                      ₹{(item.currentPrice || 0).toFixed(2)}
                    </div>
                    <span className={isBullish ? 'apple-badge-green' : 'apple-badge-red'} style={{ marginTop: '2px' }}>
                      {isBullish ? '+' : ''}
                      {(item.changePercent || 0).toFixed(2)}%
                    </span>
                  </div>

                  <button
                    onClick={(e) => handleRemove(e, item.symbol)}
                    disabled={removingSymbol === item.symbol}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--apple-body-muted)',
                      cursor: 'pointer',
                      padding: '8px',
                      borderRadius: 'var(--rounded-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'color var(--transition-apple)',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--apple-red)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--apple-body-muted)')}
                    title="Remove from Watchlist"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
