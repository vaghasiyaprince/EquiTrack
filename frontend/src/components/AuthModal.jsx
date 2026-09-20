import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Lock, Mail, User } from 'lucide-react';

export const AuthModal = ({ isOpen, onClose }) => {
  const [isRendered, setIsRendered] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      setIsClosing(false);
    } else if (isRendered) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setIsRendered(false);
        setIsClosing(false);
      }, 180);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isRendered) return null;

  const handleDismiss = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 180);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        if (!name.trim()) {
          throw new Error('Please enter your full name');
        }
        await register(name, email, password);
      }
      handleDismiss();
    } catch (err) {
      setError(err.message || 'Authentication failed');
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
            marginBottom: '6px',
          }}
        >
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p
          style={{
            fontSize: '13px',
            color: 'var(--apple-ink-secondary)',
            marginBottom: '20px',
          }}
        >
          {isLogin
            ? 'Sign in to access and sync your Indian stock watchlist'
            : 'Register to manage your personalized NSE/BSE watchlist'}
        </p>

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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {!isLogin && (
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--apple-ink-secondary)', display: 'block', marginBottom: '4px' }}>
                Full Name
              </label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--apple-surface-secondary)',
                  border: '1px solid var(--apple-hairline)',
                }}
              >
                <User size={15} color="var(--apple-ink-secondary)" style={{ marginRight: '8px' }} />
                <input
                  type="text"
                  placeholder="e.g. Frenil Vaghasia"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontSize: '13px' }}
                />
              </div>
            </div>
          )}

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--apple-ink-secondary)', display: 'block', marginBottom: '4px' }}>
              Email Address
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--apple-surface-secondary)',
                border: '1px solid var(--apple-hairline)',
              }}
            >
              <Mail size={15} color="var(--apple-ink-secondary)" style={{ marginRight: '8px' }} />
              <input
                type="email"
                required
                placeholder="frenil@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontSize: '13px' }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--apple-ink-secondary)', display: 'block', marginBottom: '4px' }}>
              Password
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--apple-surface-secondary)',
                border: '1px solid var(--apple-hairline)',
              }}
            >
              <Lock size={15} color="var(--apple-ink-secondary)" style={{ marginRight: '8px' }} />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontSize: '13px' }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '8px',
              padding: '10px 16px',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: 'var(--apple-action-blue)',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '12px', color: 'var(--apple-ink-secondary)' }}>
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            style={{ color: 'var(--apple-action-blue)', fontWeight: 600 }}
          >
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </div>
      </div>
    </div>
  );
};
