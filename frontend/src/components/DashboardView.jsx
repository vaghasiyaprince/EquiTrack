import React, { useState, useEffect } from 'react';
import { getDashboardDataApi } from '../services/api';
import {
  TrendingUp,
  TrendingDown,
  ArrowRight,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';

export const DashboardView = ({ onSelectStock, onNavigateSearch, onNavigateWatchlist }) => {
  const [data, setData] = useState({
    topGainers: [],
    topLosers: [],
    suggested: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const loadDashboard = async () => {
      try {
        setLoading(true);
        const res = await getDashboardDataApi();
        if (isMounted) {
          setData({
            topGainers: res.topGainers || [],
            topLosers: res.topLosers || [],
            suggested: res.suggested || [],
          });
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load market data');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadDashboard();
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '5rem 0', textAlign: 'center', color: 'var(--apple-body-muted)' }}>
        <p style={{ fontSize: '15px' }}>Loading market overview...</p>
      </div>
    );
  }

  return (
    <div className="apple-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Hero Product Tile (Apple Style: Centered Headline, Tagline, Blue Pill CTA) */}
      <div
        className="apple-card"
        style={{
          textAlign: 'center',
          padding: '48px 24px',
          backgroundColor: 'var(--apple-surface-card)',
        }}
      >
        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--apple-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
          Market Intelligence
        </div>
        <h1 style={{ fontSize: '40px', fontWeight: 600, marginBottom: '8px', color: 'var(--apple-ink)' }}>
          EquiTrack. Live and Precise.
        </h1>
        <p
          style={{
            fontSize: '17px',
            color: 'var(--apple-body-muted)',
            maxWidth: '560px',
            margin: '0 auto 24px auto',
          }}
        >
          Track major Indian equities across NSE and BSE, monitor top movers, and manage your watchlist with zero distraction.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
          <button onClick={onNavigateSearch} className="apple-btn-pill">
            <span>Search Equities</span>
            <ArrowRight size={14} />
          </button>
          <button onClick={onNavigateWatchlist} className="apple-btn-pill apple-btn-pill-secondary">
            <span>View Watchlist</span>
          </button>
        </div>
      </div>

      {/* Suggested Stocks (3-Column Apple Store Grid as in apple.design.md) */}
      <div>
        <div style={{ marginBottom: '16px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--apple-ink)' }}>
            Suggested Stocks
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--apple-body-muted)', marginTop: '2px' }}>
            Recommended large-cap equities based on volume and liquidity
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '16px',
          }}
        >
          {data.suggested.map((stock) => {
            const isBullish = (stock.changePercent ?? 0) >= 0;
            return (
              <div
                key={stock.symbol}
                onClick={() => onSelectStock(stock.symbol)}
                className="apple-card apple-card-hover"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '20px 24px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--apple-body-muted)' }}>
                      {stock.exchange || 'NSE'}
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--apple-ink)', marginTop: '2px' }}>
                      {stock.symbol}
                    </div>
                    <div
                      style={{
                        fontSize: '13px',
                        color: 'var(--apple-body-muted)',
                        marginTop: '2px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '200px',
                      }}
                    >
                      {stock.name}
                    </div>
                  </div>

                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: 'var(--rounded-pill)',
                      background: 'var(--apple-surface-pearl)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--apple-body-muted)',
                    }}
                  >
                    <ArrowUpRight size={16} />
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'space-between',
                    borderTop: '1px solid var(--apple-hairline)',
                    paddingTop: '12px',
                  }}
                >
                  <div className="mono-num" style={{ fontSize: '20px', fontWeight: 600, color: 'var(--apple-ink)' }}>
                    ₹{(stock.currentPrice || 0).toFixed(2)}
                  </div>
                  <span className={isBullish ? 'apple-badge-green' : 'apple-badge-red'}>
                    {isBullish ? '+' : ''}
                    {(stock.changePercent || 0).toFixed(2)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Gainers & Top Losers (Side-by-side Apple 2-Column rhythm) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '20px',
        }}
      >
        {/* Top Gainers */}
        <div className="apple-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--apple-ink)' }}>
              Top Gainers
            </h3>
            <span style={{ fontSize: '13px', color: 'var(--apple-body-muted)' }}>Today</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {data.topGainers.map((stock, idx) => (
              <div
                key={stock.symbol}
                onClick={() => onSelectStock(stock.symbol)}
                className="apple-list-row"
                style={{
                  borderBottom: idx !== data.topGainers.length - 1 ? '1px solid var(--apple-hairline)' : 'none',
                }}
              >
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--apple-ink)' }}>
                    {stock.symbol}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--apple-body-muted)' }}>
                    {stock.name}
                  </div>
                </div>

                <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <span className="mono-num" style={{ fontSize: '15px', fontWeight: 600, color: 'var(--apple-ink)' }}>
                    ₹{(stock.currentPrice || 0).toFixed(2)}
                  </span>
                  <span className="apple-badge-green">
                    +{(stock.changePercent || 0).toFixed(2)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Losers */}
        <div className="apple-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--apple-ink)' }}>
              Top Losers
            </h3>
            <span style={{ fontSize: '13px', color: 'var(--apple-body-muted)' }}>Today</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {data.topLosers.map((stock, idx) => (
              <div
                key={stock.symbol}
                onClick={() => onSelectStock(stock.symbol)}
                className="apple-list-row"
                style={{
                  borderBottom: idx !== data.topLosers.length - 1 ? '1px solid var(--apple-hairline)' : 'none',
                }}
              >
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--apple-ink)' }}>
                    {stock.symbol}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--apple-body-muted)' }}>
                    {stock.name}
                  </div>
                </div>

                <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <span className="mono-num" style={{ fontSize: '15px', fontWeight: 600, color: 'var(--apple-ink)' }}>
                    ₹{(stock.currentPrice || 0).toFixed(2)}
                  </span>
                  <span className="apple-badge-red">
                    {(stock.changePercent || 0).toFixed(2)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
