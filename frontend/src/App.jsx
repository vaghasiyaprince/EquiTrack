import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { StockProvider } from './context/StockContext';
import { Sidebar } from './components/Sidebar';
import { StockDetail } from './components/StockDetail';
import { AuthModal } from './components/AuthModal';
import { ProfileModal } from './components/ProfileModal';
import { SearchModal } from './components/SearchModal';

function StocksApp() {
  // Theme state: defaults to dark (classic Apple Stocks UI from sample images)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('equitrack_theme') || 'dark';
  });

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  // Mobile responsiveness state: determines whether mobile shows 'list' or 'detail' view
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [mobileView, setMobileView] = useState('list'); // 'list' | 'detail'

  // Window resize listener
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Apply theme to html root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('equitrack_theme', theme);
  }, [theme]);

  // Global keyboard shortcut: Cmd+K or Ctrl+K opens quick search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleSelectStockMobile = () => {
    if (isMobile) {
      setMobileView('detail');
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        width: '100vw',
        height: '100vh',
        backgroundColor: 'var(--apple-canvas)',
        overflow: 'hidden',
      }}
    >
      {/* On desktop: show both Sidebar and Detail side-by-side
          On mobile: toggle between Sidebar and Detail with smooth fluid transition */}
      {(!isMobile || mobileView === 'list') && (
        <div
          style={{
            width: isMobile ? '100vw' : 'var(--sidebar-width)',
            height: '100%',
            flexShrink: 0,
          }}
          className="animate-fade-in"
        >
          <Sidebar
            onOpenAuth={() => setAuthModalOpen(true)}
            onOpenProfile={() => setProfileModalOpen(true)}
            onToggleTheme={toggleTheme}
            theme={theme}
            onSelectStockMobile={handleSelectStockMobile}
          />
        </div>
      )}

      {(!isMobile || mobileView === 'detail') && (
        <main
          style={{
            flex: 1,
            height: '100%',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
          className="animate-fade-in"
        >
          <StockDetail onBackMobile={isMobile ? () => setMobileView('list') : null} />
        </main>
      )}

      {/* Modals & Overlays */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      <ProfileModal isOpen={profileModalOpen} onClose={() => setProfileModalOpen(false)} />
      <SearchModal isOpen={searchModalOpen} onClose={() => setSearchModalOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <StockProvider>
        <StocksApp />
      </StockProvider>
    </AuthProvider>
  );
}
