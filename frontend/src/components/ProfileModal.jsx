import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';

export const ProfileModal = ({ isOpen, onClose, onNotification }) => {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPassword('');
      setSuccessMessage(null);
      setErrorMessage(null);
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);
    setSubmitting(true);

    try {
      if (!name.trim()) throw new Error('Name cannot be empty');
      const res = await updateProfile(name.trim(), password || undefined);
      const msg = res.message || 'Profile updated successfully';
      setSuccessMessage(msg);
      if (onNotification) onNotification({ type: 'success', message: msg });
      setPassword('');
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(20px)',
        padding: '24px',
      }}
      onClick={onClose}
    >
      <div
        className="apple-card apple-modal-in"
        style={{
          width: '100%',
          maxWidth: '460px',
          padding: '32px',
          boxShadow: 'var(--shadow-modal)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 600, color: 'var(--apple-ink)' }}>
              User Profile
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--apple-body-muted)', marginTop: '2px' }}>
              Manage your credentials and preferences
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'var(--apple-surface-pearl)',
              border: 'none',
              borderRadius: 'var(--rounded-pill)',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--apple-body-muted)',
              cursor: 'pointer',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Alerts */}
        {successMessage && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              borderRadius: 'var(--rounded-md)',
              background: 'var(--apple-green-bg)',
              color: 'var(--apple-green)',
              fontSize: '13px',
              marginBottom: '16px',
            }}
          >
            <CheckCircle2 size={16} />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              borderRadius: 'var(--rounded-md)',
              background: 'var(--apple-red-bg)',
              color: 'var(--apple-red)',
              fontSize: '13px',
              marginBottom: '16px',
            }}
          >
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Account Info (R.1.3) */}
        <div
          style={{
            background: 'var(--apple-surface-pearl)',
            borderRadius: 'var(--rounded-md)',
            padding: '14px 16px',
            marginBottom: '20px',
            border: '1px solid var(--apple-hairline)',
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--apple-body-muted)', marginBottom: '4px' }}>
            Registered Email
          </div>
          <div style={{ fontSize: '15px', color: 'var(--apple-ink)', fontWeight: 500 }}>
            {user?.email}
          </div>
        </div>

        {/* Form (R.1.4) */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--apple-body-muted)', display: 'block', marginBottom: '6px' }}>
              Full Name
            </label>
            <input
              type="text"
              className="apple-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--apple-body-muted)', display: 'block', marginBottom: '6px' }}>
              Update Password (optional)
            </label>
            <input
              type="password"
              className="apple-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave blank to keep unchanged"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              className="apple-btn-pill apple-btn-pill-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="apple-btn-pill"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
