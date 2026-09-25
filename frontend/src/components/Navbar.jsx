import React from 'react';
import {
  TrendingUp,
  LayoutDashboard,
  Search,
  Bookmark,
  User,
  LogOut,
  Sun,
  Moon,
} from 'lucide-react';

export const Navbar = ({
  activeTab,
  setActiveTab,
  user,
  watchlistCount = 0,
  onOpenProfile,
  onLogout,
  theme = 'dark',
  onToggleTheme,
}) => {
  return (
    <>
      {/* Row 1: Apple Global Nav (44px, Black as in apple.design.md) */}
      <header className="apple-global-nav">
        <div
          style={{
            maxWidth: '1200px',
            width: '100%',
            margin: '0 auto',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '12px',
          }}
        >
          {/* Brand */}
          <div
            onClick={() => setActiveTab('dashboard')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              letterSpacing: '-0.01em',
              color: '#ffffff',
            }}
          >
            <TrendingUp size={16} color="#2997ff" />
            <span>EquiTrack</span>
          </div>

          {/* Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
            <span
              onClick={() => setActiveTab('dashboard')}
              style={{
                cursor: 'pointer',
                color: activeTab === 'dashboard' ? '#ffffff' : '#86868b',
                transition: 'color var(--transition-apple)',
              }}
            >
              Dashboard
            </span>
            <span
              onClick={() => setActiveTab('search')}
              style={{
                cursor: 'pointer',
                color: activeTab === 'search' ? '#ffffff' : '#86868b',
                transition: 'color var(--transition-apple)',
              }}
            >
              Search
            </span>
            <span
              onClick={() => setActiveTab('watchlist')}
              style={{
                cursor: 'pointer',
                color: activeTab === 'watchlist' ? '#ffffff' : '#86868b',
                transition: 'color var(--transition-apple)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              Watchlist
              {watchlistCount > 0 && (
                <span
                  style={{
                    background: '#2997ff',
                    color: '#ffffff',
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '1px 6px',
                    borderRadius: '999px',
                  }}
                >
                  {watchlistCount}
                </span>
              )}
            </span>
          </div>

          {/* Right Utility Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* Theme Switcher */}
            <button
              onClick={onToggleTheme}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#86868b',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '4px',
              }}
              title="Toggle Light / Dark mode"
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            {/* Profile Button */}
            <button
              onClick={onOpenProfile}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                color: '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: 'var(--rounded-pill)',
                fontSize: '12px',
              }}
            >
              <User size={12} />
              <span>{user?.name || 'Profile'}</span>
            </button>

            {/* Logout */}
            <button
              onClick={onLogout}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#86868b',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px',
              }}
              title="Logout"
            >
              <LogOut size={13} />
            </button>
          </div>
        </div>
      </header>

      {/* Row 2: Apple Sub-Nav Frosted (52px, apple.design.md) */}
      <div className="apple-sub-nav">
        <div
          style={{
            maxWidth: '1200px',
            width: '100%',
            margin: '0 auto',
            padding: '0 24px',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '21px', fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--apple-ink)' }}>
              {activeTab === 'dashboard'
                ? 'Market Overview'
                : activeTab === 'search'
                ? 'Stock Search'
                : activeTab === 'watchlist'
                ? 'Watchlist'
                : 'Company Details'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {activeTab !== 'search' && (
              <button
                onClick={() => setActiveTab('search')}
                className="apple-btn-pill apple-btn-pill-secondary"
                style={{ padding: '6px 14px', fontSize: '13px' }}
              >
                <Search size={14} />
                <span>Search</span>
              </button>
            )}
            {activeTab !== 'watchlist' && (
              <button
                onClick={() => setActiveTab('watchlist')}
                className="apple-btn-pill"
                style={{ padding: '6px 14px', fontSize: '13px' }}
              >
                <Bookmark size={14} />
                <span>Watchlist ({watchlistCount})</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
