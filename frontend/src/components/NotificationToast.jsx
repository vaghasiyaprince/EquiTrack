import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export const NotificationToast = ({ notification, onClose }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [activeNotification, setActiveNotification] = useState(notification);

  useEffect(() => {
    if (notification) {
      setActiveNotification(notification);
      setIsClosing(false);
    } else if (activeNotification && !isClosing) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setActiveNotification(null);
        setIsClosing(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleDismiss = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setActiveNotification(null);
      setIsClosing(false);
    }, 200);
  };

  if (!activeNotification) return null;

  const isSuccess = activeNotification.type === 'success';

  return (
    <div
      className={isClosing ? 'apple-toast-out' : 'apple-toast-in'}
      style={{
        position: 'fixed',
        bottom: '28px',
        right: '28px',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 20px',
        borderRadius: 'var(--rounded-pill)',
        background: 'var(--apple-surface-card)',
        backdropFilter: 'saturate(180%) blur(20px)',
        WebkitBackdropFilter: 'saturate(180%) blur(20px)',
        border: '1px solid var(--apple-hairline)',
        boxShadow: 'var(--shadow-modal)',
        color: 'var(--apple-ink)',
        fontSize: '14px',
        fontWeight: 500,
        maxWidth: '420px',
      }}
    >
      {isSuccess ? (
        <CheckCircle2 size={18} color="#34c759" />
      ) : (
        <AlertCircle size={18} color="#ff3b30" />
      )}
      <span style={{ flex: 1 }}>{activeNotification.message}</span>
      <button
        onClick={handleDismiss}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--apple-body-muted)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          padding: '4px',
          borderRadius: 'var(--rounded-pill)',
          transition: 'color var(--transition-fast), transform var(--transition-fast)',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--apple-ink)')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--apple-body-muted)')}
        title="Dismiss"
      >
        <X size={15} />
      </button>
    </div>
  );
};
