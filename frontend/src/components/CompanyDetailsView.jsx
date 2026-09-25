import React, { useState, useEffect } from 'react';
import { StockChart } from './StockChart';
import {
  getCompanyDetailsApi,
  addToWatchlistApi,
  removeFromWatchlistApi,
} from '../services/api';
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Building2,
} from 'lucide-react';

export const CompanyDetailsView = ({
  symbol,
  onBack,
  isInWatchlist = false,
  onWatchlistChanged,
  onNotification,
}) => {
  const [stock, setStock] = useState(null);
  const [duration, setDuration] = useState('1d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [watchlistActive, setWatchlistActive] = useState(isInWatchlist);
  const [updatingWatchlist, setUpdatingWatchlist] = useState(false);

  useEffect(() => {
    setWatchlistActive(isInWatchlist);
  }, [isInWatchlist]);

  useEffect(() => {
    let isMounted = true;
    const fetchDetails = async () => {
      if (!symbol) return;
      try {
        const data = await getCompanyDetailsApi(symbol, duration);
        if (isMounted) {
          setStock(data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load company details');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDetails();
    return () => {
      isMounted = false;
    };
  }, [symbol, duration]);

  const handleToggleWatchlist = async () => {
    if (!stock || updatingWatchlist) return;
    setUpdatingWatchlist(true);

    try {
      if (watchlistActive) {
        const res = await removeFromWatchlistApi(stock.symbol);
        setWatchlistActive(false);
        const msg = res.message || 'Stock removed successfully';
        if (onNotification) onNotification({ type: 'success', message: msg });
        if (onWatchlistChanged) onWatchlistChanged();
      } else {
        const res = await addToWatchlistApi(stock.symbol, stock.companyName || stock.name);
        setWatchlistActive(true);
        const msg = res.message || 'Stock added successfully';
        if (onNotification) onNotification({ type: 'success', message: msg });
        if (onWatchlistChanged) onWatchlistChanged();
      }
    } catch (err) {
      if (onNotification) onNotification({ type: 'error', message: err.message || 'Watchlist update failed' });
    } finally {
      setUpdatingWatchlist(false);
    }
  };

  const durations = [
    { label: '5m', value: '5m' },
    { label: '1D', value: '1d' },
    { label: '1W', value: '1w' },
    { label: '1M', value: '1m' },
  ];

  if (loading) {
    return (
      <div style={{ padding: '5rem 0', textAlign: 'center', color: 'var(--apple-body-muted)' }}>
        <p style={{ fontSize: '15px' }}>Loading equity profile & chart...</p>
      </div>
    );
  }

  if (error || !stock) {
    return (
      <div className="apple-card" style={{ padding: '40px', textAlign: 'center' }}>
        <p style={{ color: 'var(--apple-red)', marginBottom: '16px', fontSize: '15px' }}>
          {error || 'Unable to retrieve company information.'}
        </p>
        <button onClick={onBack} className="apple-btn-pill apple-btn-pill-secondary">
          <ArrowLeft size={14} />
          <span>Back to Market</span>
        </button>
      </div>
    );
  }

  const isBullish = (stock.changePercent ?? 0) >= 0;

  return (
    <div className="apple-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Action Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={onBack} className="apple-link">
          <ArrowLeft size={16} />
          <span>All Equities</span>
        </button>

        <button
          onClick={handleToggleWatchlist}
          disabled={updatingWatchlist}
          className={`apple-btn-pill ${watchlistActive ? 'apple-btn-pill-danger' : ''}`}
        >
          {watchlistActive ? (
            <>
              <BookmarkCheck size={14} />
              <span>Remove from Watchlist</span>
            </>
          ) : (
            <>
              <Bookmark size={14} />
              <span>Add to Watchlist</span>
            </>
          )}
        </button>
      </div>

      {/* Main Stock Card (R.3.6) */}
      <div className="apple-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '13px', color: 'var(--apple-body-muted)', fontWeight: 600 }}>
              {stock.symbol} · NSE
            </div>
            <h1 style={{ fontSize: '34px', fontWeight: 600, color: 'var(--apple-ink)', marginTop: '2px' }}>
              {stock.companyName || stock.name}
            </h1>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div className="mono-num" style={{ fontSize: '34px', fontWeight: 600, color: 'var(--apple-ink)' }}>
              ₹{(stock.currentPrice || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
              <span className={isBullish ? 'apple-badge-green' : 'apple-badge-red'}>
                {isBullish ? '+' : ''}
                {stock.change ? stock.change.toFixed(2) : '0.00'} ({isBullish ? '+' : ''}
                {stock.changePercent ? stock.changePercent.toFixed(2) : '0.00'}%)
              </span>
            </div>
          </div>
        </div>

        {/* Day High / Day Low Statistics */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px',
            marginTop: '24px',
            paddingTop: '20px',
            borderTop: '1px solid var(--apple-hairline)',
          }}
        >
          <div style={{ background: 'var(--apple-surface-pearl)', padding: '12px 16px', borderRadius: 'var(--rounded-md)' }}>
            <div style={{ fontSize: '12px', color: 'var(--apple-body-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Day High
            </div>
            <div className="mono-num" style={{ fontSize: '18px', fontWeight: 600, color: 'var(--apple-green)', marginTop: '2px' }}>
              ₹{stock.dayHigh ? stock.dayHigh.toFixed(2) : (stock.currentPrice * 1.01).toFixed(2)}
            </div>
          </div>

          <div style={{ background: 'var(--apple-surface-pearl)', padding: '12px 16px', borderRadius: 'var(--rounded-md)' }}>
            <div style={{ fontSize: '12px', color: 'var(--apple-body-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Day Low
            </div>
            <div className="mono-num" style={{ fontSize: '18px', fontWeight: 600, color: 'var(--apple-red)', marginTop: '2px' }}>
              ₹{stock.dayLow ? stock.dayLow.toFixed(2) : (stock.currentPrice * 0.99).toFixed(2)}
            </div>
          </div>

          <div style={{ background: 'var(--apple-surface-pearl)', padding: '12px 16px', borderRadius: 'var(--rounded-md)' }}>
            <div style={{ fontSize: '12px', color: 'var(--apple-body-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Exchange
            </div>
            <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--apple-ink)', marginTop: '2px' }}>
              NSE India (National)
            </div>
          </div>
        </div>
      </div>

      {/* Stock Chart Card (R.3.4 & R.3.5) */}
      <div className="apple-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--apple-ink)' }}>
              Price Performance
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--apple-body-muted)' }}>
              Historical movements across timeframes
            </p>
          </div>

          {/* Duration Selector (5m, 1d, 1w, 1m) */}
          <div
            style={{
              display: 'flex',
              background: 'var(--apple-surface-pearl)',
              padding: '4px',
              borderRadius: 'var(--rounded-pill)',
              border: '1px solid var(--apple-hairline)',
              gap: '2px',
            }}
          >
            {durations.map((d) => {
              const isSelected = duration === d.value;
              return (
                <button
                  key={d.value}
                  onClick={() => setDuration(d.value)}
                  style={{
                    padding: '5px 14px',
                    borderRadius: 'var(--rounded-pill)',
                    border: 'none',
                    background: isSelected ? 'var(--apple-primary)' : 'transparent',
                    color: isSelected ? '#ffffff' : 'var(--apple-body-muted)',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                    transform: isSelected ? 'scale(1.02)' : 'none',
                    boxShadow: isSelected ? '0 2px 8px rgba(0, 102, 204, 0.25)' : 'none',
                  }}
                  onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.94)')}
                  onMouseUp={(e) => (e.currentTarget.style.transform = isSelected ? 'scale(1.02)' : 'none')}
                >
                  {d.label}
                </button>
              );
            })}
          </div>
        </div>

        <StockChart
          data={stock.chartData}
          currentPrice={stock.currentPrice}
          isBullish={isBullish}
        />
      </div>

      {/* Company Description (R.3.6) */}
      <div className="apple-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Building2 size={16} color="var(--apple-primary)" />
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--apple-ink)' }}>
            Company Overview
          </h3>
        </div>
        <p style={{ fontSize: '15px', color: 'var(--apple-body)', lineHeight: 1.6 }}>
          {stock.description || 'Educational market overview provided by EquiTrack.'}
        </p>
      </div>
    </div>
  );
};
