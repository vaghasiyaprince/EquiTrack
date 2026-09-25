import React from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export const NotificationToast = ({ notification, onClose }) => {
  if (!notification) return null;

  const isSuccess = notification.type === 'success';

  return (
    <div
      className="apple-modal-in"
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
      <span style={{ flex: 1 }}>{notification.message}</span>
      <button
        onClick={onClose}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--apple-body-muted)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          padding: '2px',
        }}
      >
        <X size={14} />
      </button>
    </div>
  );
};
