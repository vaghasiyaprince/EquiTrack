import React from 'react';
import { Search, TrendingUp, TrendingDown, Bookmark, User, LogOut, Sun, Moon } from 'lucide-react';
import { MarketIndices } from './MarketIndices';
import { StockListItem } from './StockListItem';
import { useStock } from '../context/StockContext';
import { useAuth } from '../context/AuthContext';

export const Sidebar = ({ onOpenAuth, onOpenProfile, onToggleTheme, theme, onSelectStockMobile }) => {
  const {
    displayedStocks,
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    marketIndices,
    watchlistSymbols,
  } = useStock();

  const { user, isAuthenticated, logout } = useAuth();

  return (
    <aside
      style={{
        width: 'var(--sidebar-width)',
        height: '100%',
        backgroundColor: 'var(--apple-parchment)',
        borderRight: '1px solid var(--apple-border)',
        display: 'flex',
        flexDirection: 'column',
        userSelect: 'none',
        flexShrink: 0,
      }}
    >
      {/* Top Search Input & Clean Header */}
      <div style={{ padding: '16px 16px 8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div>
            <h2 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--apple-ink)', letterSpacing: '-0.5px' }}>
              Stocks
            </h2>
            <div style={{ fontSize: '13px', color: 'var(--apple-ink-secondary)', fontWeight: 500 }}>
              NSE · BSE Markets
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={onToggleTheme}
              title="Toggle Light/Dark Theme"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'var(--apple-surface-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--apple-ink)',
                border: '1px solid var(--apple-hairline)',
              }}
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>
        </div>

        {/* Apple Pill Search Box */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'var(--apple-surface-secondary)',
            borderRadius: 'var(--radius-pill)',
            padding: '8px 12px',
            border: '1px solid var(--apple-hairline)',
          }}
        >
          <Search size={15} color="var(--apple-ink-secondary)" style={{ marginRight: '8px', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search symbols or companies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: '13px',
              color: 'var(--apple-ink)',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                fontSize: '12px',
                color: 'var(--apple-ink-secondary)',
                padding: '2px 4px',
              }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Market Indices (NIFTY 50 / SENSEX / BANK NIFTY) */}
      <MarketIndices indices={marketIndices} />

      {/* Segmented Filter Control */}
      <div
        style={{
          display: 'flex',
          padding: '8px 14px',
          gap: '4px',
          borderBottom: '1px solid var(--apple-hairline)',
        }}
      >
        <button
          onClick={() => setActiveTab('watchlist')}
          style={{
            flex: 1,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px',
            padding: '6px 8px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '12px',
            fontWeight: activeTab === 'watchlist' ? 700 : 500,
            backgroundColor: activeTab === 'watchlist' ? 'var(--apple-surface-selected)' : 'transparent',
            color: activeTab === 'watchlist' ? 'var(--apple-ink)' : 'var(--apple-ink-secondary)',
          }}
        >
          <Bookmark size={13} />
          <span>Watchlist ({watchlistSymbols.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('gainers')}
          style={{
            flex: 1,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px',
            padding: '6px 8px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '12px',
            fontWeight: activeTab === 'gainers' ? 700 : 500,
            backgroundColor: activeTab === 'gainers' ? 'var(--apple-surface-selected)' : 'transparent',
            color: activeTab === 'gainers' ? 'var(--apple-ink)' : 'var(--apple-ink-secondary)',
          }}
        >
          <TrendingUp size={13} />
          <span>Gainers</span>
        </button>

        <button
          onClick={() => setActiveTab('losers')}
          style={{
            flex: 1,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px',
            padding: '6px 8px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '12px',
            fontWeight: activeTab === 'losers' ? 700 : 500,
            backgroundColor: activeTab === 'losers' ? 'var(--apple-surface-selected)' : 'transparent',
            color: activeTab === 'losers' ? 'var(--apple-ink)' : 'var(--apple-ink-secondary)',
          }}
        >
          <TrendingDown size={13} />
          <span>Losers</span>
        </button>
      </div>

      {/* Stock Rows List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '6px 0' }}>
        {displayedStocks.length === 0 ? (
          <div
            style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: 'var(--apple-ink-secondary)',
              fontSize: '13px',
            }}
          >
            {activeTab === 'watchlist'
              ? 'No stocks in your watchlist. Add Indian stocks to monitor them!'
              : 'No matching stocks found.'}
          </div>
        ) : (
          displayedStocks.map((stock) => (
            <div key={stock.symbol} onClick={onSelectStockMobile}>
              <StockListItem stock={stock} />
            </div>
          ))
        )}
      </div>

      {/* Bottom Profile Tray */}
      <div
        style={{
          padding: '12px 16px',
          borderTop: '1px solid var(--apple-hairline)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--apple-surface-secondary)',
        }}
      >
        {isAuthenticated ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              onClick={onOpenProfile}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'var(--apple-action-blue)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <div onClick={onOpenProfile} style={{ cursor: 'pointer' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--apple-ink)' }}>
                {user?.name || 'My Account'}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--apple-ink-secondary)' }}>
                {user?.email}
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: 'var(--apple-action-blue)',
              color: '#ffffff',
              fontSize: '12px',
              fontWeight: 600,
            }}
          >
            <User size={14} />
            <span>Sign In / Register</span>
          </button>
        )}

        {isAuthenticated && (
          <button
            onClick={logout}
            title="Sign Out"
            style={{
              padding: '6px',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--apple-ink-secondary)',
            }}
          >
            <LogOut size={16} />
          </button>
        )}
      </div>
    </aside>
  );
};
