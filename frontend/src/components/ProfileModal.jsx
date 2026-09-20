import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Check } from 'lucide-react';

export const ProfileModal = ({ isOpen, onClose }) => {
  const [isRendered, setIsRendered] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const { user, updateProfile, logout } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && user) {
      setIsRendered(true);
      setIsClosing(false);
      setName(user.name || '');
    } else if (isRendered) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setIsRendered(false);
        setIsClosing(false);
      }, 180);
      return () => clearTimeout(timer);
    }
  }, [isOpen, user]);

  if (!isRendered || !user) return null;

  const handleDismiss = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 180);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await updateProfile(name, user.email);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`apple-backdrop ${isClosing ? 'apple-backdrop-exit' : 'apple-backdrop-enter'}`}
      onClick={handleDismiss}
    >
      <div
        className={isClosing ? 'apple-modal-exit' : 'apple-modal-enter'}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '380px',
          backgroundColor: 'var(--apple-card-bg)',
          borderRadius: 'var(--radius-xl)',
          padding: '28px',
          boxShadow: 'var(--apple-shadow-modal)',
          border: '1px solid var(--apple-border)',
          position: 'relative',
        }}
      >
        <button
          onClick={handleDismiss}
          style={{
            position: 'absolute',
            top: '18px',
            right: '18px',
            color: 'var(--apple-ink-secondary)',
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--apple-surface-secondary)',
          }}
        >
          <X size={16} />
        </button>

        <h2
          style={{
            fontSize: '22px',
            fontWeight: 700,
            color: 'var(--apple-ink)',
            letterSpacing: '-0.3px',
            marginBottom: '4px',
          }}
        >
          User Profile
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--apple-ink-secondary)', marginBottom: '20px' }}>
          Manage your EquiTrack account details
        </p>

        {success && (
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: 'var(--apple-green-bg)',
              color: 'var(--apple-green)',
              borderRadius: 'var(--radius-md)',
              fontSize: '13px',
              fontWeight: 500,
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Check size={16} />
            <span>Profile updated successfully</span>
          </div>
        )}

        {error && (
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: 'var(--apple-red-bg)',
              color: 'var(--apple-red)',
              borderRadius: 'var(--radius-md)',
              fontSize: '13px',
              fontWeight: 500,
              marginBottom: '16px',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--apple-ink-secondary)', display: 'block', marginBottom: '4px' }}>
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--apple-surface-secondary)',
                border: '1px solid var(--apple-hairline)',
                fontSize: '14px',
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--apple-ink-secondary)', display: 'block', marginBottom: '4px' }}>
              Email Address
            </label>
            <input
              type="text"
              disabled
              value={user.email}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--apple-surface-secondary)',
                border: '1px solid var(--apple-hairline)',
                fontSize: '14px',
                opacity: 0.6,
                cursor: 'not-allowed',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '10px',
              padding: '10px 16px',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: 'var(--apple-action-blue)',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>

          <button
            type="button"
            onClick={() => {
              logout();
              handleDismiss();
            }}
            style={{
              padding: '10px 16px',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: 'transparent',
              border: '1px solid var(--apple-red)',
              color: 'var(--apple-red)',
              fontSize: '14px',
              fontWeight: 600,
              marginTop: '4px',
            }}
          >
            Sign Out
          </button>
        </form>
      </div>
    </div>
  );
};
