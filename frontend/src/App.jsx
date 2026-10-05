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

  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedStockSymbol, setSelectedStockSymbol] = useState(null);
  const [previousTab, setPreviousTab] = useState('dashboard');

  const [theme, setTheme] = useState(() => localStorage.getItem('equitrack_theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('equitrack_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const [watchlist, setWatchlist] = useState([]);
  const [watchlistLoading, setWatchlistLoading] = useState(false);

  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const [notification, setNotification] = useState(null);

  const showNotification = useCallback((notif) => {
    setNotification(notif);
    setTimeout(() => {
      setNotification((curr) => (curr === notif ? null : curr));
    }, 3500);
  }, []);

  // isBackgroundRefresh = true means: refresh quietly, don't touch the loading spinner
  const fetchWatchlist = useCallback(async (isBackgroundRefresh = false) => {
    if (!isAuthenticated) return;
    try {
      if (!isBackgroundRefresh) setWatchlistLoading(true);
      const data = await getWatchlistApi();
      setWatchlist(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Failed to fetch watchlist:', err.message);
      if (err.isWeakConnection && showNotification) {
        showNotification({ type: 'error', message: 'Weak Connection: Live watchlist feed is taking longer than usual.' });
      }
    } finally {
      if (!isBackgroundRefresh) setWatchlistLoading(false);
    }
  }, [isAuthenticated, showNotification]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchWatchlist(false); // real loading state only on first load
      const intervalId = setInterval(() => fetchWatchlist(true), 15000);
      return () => clearInterval(intervalId);
    }
  }, [isAuthenticated, fetchWatchlist]);

  // Instantly remove an item from the screen — doesn't wait on a slow re-fetch.
  const removeWatchlistItemLocally = useCallback((symbol) => {
    setWatchlist((prev) => prev.filter((item) => item.symbol !== symbol));
  }, []);

  // Instantly add a placeholder item to the screen so it shows up right away.
  const addWatchlistItemLocally = useCallback((symbol, companyName, exchange = 'NSE') => {
    setWatchlist((prev) => {
      if (prev.some((item) => item.symbol === symbol)) return prev;
      return [{ symbol, companyName, exchange, currentPrice: null, changePercent: null, addedOn: null }, ...prev];
    });
  }, []);

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
            onWatchlistChanged={() => fetchWatchlist(true)}
            onWatchlistAddedLocal={addWatchlistItemLocally}
            onNotification={showNotification}
          />
        )}

        {activeTab === 'watchlist' && (
          <WatchlistView
            watchlist={watchlist}
            loading={watchlistLoading}
            onSelectStock={handleSelectStock}
            onNavigateSearch={() => setActiveTab('search')}
            onWatchlistChanged={() => fetchWatchlist(true)}
            onWatchlistRemovedLocal={removeWatchlistItemLocally}
            onNotification={showNotification}
          />
        )}

        {activeTab === 'details' && selectedStockSymbol && (
          <CompanyDetailsView
            symbol={selectedStockSymbol}
            onBack={handleBackFromDetails}
            isInWatchlist={watchlistSymbols.has(selectedStockSymbol)}
            onWatchlistChanged={() => fetchWatchlist(true)}
            onWatchlistAddedLocal={addWatchlistItemLocally}
            onWatchlistRemovedLocal={removeWatchlistItemLocally}
            onNotification={showNotification}
          />
        )}
      </main>

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onNotification={showNotification}
      />

      <NotificationToast
        notification={notification}
        onClose={() => setNotification(null)}
      />
    </div>
  );
};

export default App;