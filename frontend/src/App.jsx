import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from './context/AuthContext';
import { getWatchlistApi } from './services/api';

import { Navbar } from './components/Navbar';
import { AuthPage } from './components/AuthPage';
import { DashboardView } from './components/DashboardView';
import { SearchView } from './components/SearchView';
import { WatchlistView } from './components/WatchlistView';
import { CompanyDetailsView } from './components/CompanyDetailsView';
import { ProfileModal } from './components/ProfileModal';
import { NotificationToast } from './components/NotificationToast';

export const App = () => {
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();

  // Active view: 'dashboard' | 'search' | 'watchlist' | 'details'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedStockSymbol, setSelectedStockSymbol] = useState(null);
  const [previousTab, setPreviousTab] = useState('dashboard');

  // Apple Theme: 'dark' (macOS / iOS Stocks default) or 'light' (apple.com parchment)
  const [theme, setTheme] = useState(() => localStorage.getItem('equitrack_theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('equitrack_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Watchlist state
  const [watchlist, setWatchlist] = useState([]);
  const [watchlistLoading, setWatchlistLoading] = useState(false);

  // Profile modal state
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Notification Toast state
  const [notification, setNotification] = useState(null);

  const showNotification = useCallback((notif) => {
    setNotification(notif);
    setTimeout(() => {
      setNotification((curr) => (curr === notif ? null : curr));
    }, 3500);
  }, []);

  // Fetch watchlist when authenticated
  const fetchWatchlist = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setWatchlistLoading(true);
      const data = await getWatchlistApi();
      setWatchlist(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Failed to fetch watchlist:', err.message);
    } finally {
      setWatchlistLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchWatchlist();
    }
  }, [isAuthenticated, fetchWatchlist]);

  const watchlistSymbols = new Set(watchlist.map((item) => item.symbol));

  const handleSelectStock = (symbol) => {
    setPreviousTab(activeTab === 'details' ? 'dashboard' : activeTab);
    setSelectedStockSymbol(symbol);
    setActiveTab('details');
  };

  const handleBackFromDetails = () => {
    setActiveTab(previousTab || 'dashboard');
    setSelectedStockSymbol(null);
  };

  const handleLogout = () => {
    logout();
    setActiveTab('dashboard');
    setSelectedStockSymbol(null);
    showNotification({ type: 'success', message: 'Logged out successfully' });
  };

  if (authLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--apple-canvas-parchment)',
          color: 'var(--apple-body-muted)',
          fontSize: '15px',
        }}
      >
        Loading EquiTrack...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <AuthPage onSuccess={() => setActiveTab('dashboard')} />
        <NotificationToast
          notification={notification}
          onClose={() => setNotification(null)}
        />
      </>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--apple-canvas-parchment)' }}>
      {/* Apple 2-row Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'details') setSelectedStockSymbol(null);
        }}
        user={user}
        watchlistCount={watchlist.length}
        onOpenProfile={() => setIsProfileOpen(true)}
        onLogout={handleLogout}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Canvas Area */}
      <main
        style={{
          flex: 1,
          maxWidth: '1200px',
          width: '100%',
          margin: '0 auto',
          padding: '40px 24px',
        }}
      >
        {activeTab === 'dashboard' && (
          <DashboardView
            onSelectStock={handleSelectStock}
            onNavigateSearch={() => setActiveTab('search')}
            onNavigateWatchlist={() => setActiveTab('watchlist')}
          />
        )}

        {activeTab === 'search' && (
          <SearchView
            onSelectStock={handleSelectStock}
            watchlistSymbols={watchlistSymbols}
            onWatchlistChanged={fetchWatchlist}
            onNotification={showNotification}
          />
        )}

        {activeTab === 'watchlist' && (
          <WatchlistView
            watchlist={watchlist}
            loading={watchlistLoading}
            onSelectStock={handleSelectStock}
            onNavigateSearch={() => setActiveTab('search')}
            onWatchlistChanged={fetchWatchlist}
            onNotification={showNotification}
          />
        )}

        {activeTab === 'details' && selectedStockSymbol && (
          <CompanyDetailsView
            symbol={selectedStockSymbol}
            onBack={handleBackFromDetails}
            isInWatchlist={watchlistSymbols.has(selectedStockSymbol)}
            onWatchlistChanged={fetchWatchlist}
            onNotification={showNotification}
          />
        )}
      </main>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onNotification={showNotification}
      />

      {/* Notification Toast */}
      <NotificationToast
        notification={notification}
        onClose={() => setNotification(null)}
      />
    </div>
  );
};

export default App;
