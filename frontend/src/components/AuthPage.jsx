import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { TrendingUp, Lock, Mail, User, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

export const AuthPage = ({ onSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setSubmitting(true);

    try {
      if (isRegister) {
        if (!name.trim()) throw new Error('Please enter your full name');
        if (!email.trim()) throw new Error('Please enter your email address');
        if (password.length < 6) throw new Error('Password must be at least 6 characters');

        const res = await register(name.trim(), email.trim(), password);
        setMessage(res.message || 'Registration successful');
        setTimeout(() => {
          setIsRegister(false);
          setMessage('Registration successful! Please sign in with your credentials.');
        }, 1200);
      } else {
        if (!email.trim()) throw new Error('Please enter your email address');
        if (!password) throw new Error('Please enter your password');

        await login(email.trim(), password);
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('test1@example.com');
    setPassword('password123');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        backgroundColor: 'var(--apple-canvas-parchment)',
      }}
    >
      <div
        className="apple-card apple-auth-card"
        style={{
          width: '100%',
          maxWidth: '420px',
          padding: '40px 32px',
          boxShadow: 'var(--shadow-modal)',
        }}
      >
        {/* Apple Branding */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--rounded-pill)',
              background: 'var(--apple-surface-pearl)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px',
              border: '1px solid var(--apple-hairline)',
            }}
          >
            <TrendingUp size={24} color="var(--apple-primary)" />
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 600, color: 'var(--apple-ink)' }}>
            EquiTrack
          </h1>
          <p style={{ color: 'var(--apple-body-muted)', fontSize: '14px', marginTop: '4px' }}>
            Stock Market Analysis and Tracking
          </p>
        </div>

        {/* Capsule Segment Control (apple.design.md) */}
        <div
          style={{
            display: 'flex',
            background: 'var(--apple-surface-pearl)',
            borderRadius: 'var(--rounded-pill)',
            padding: '4px',
            marginBottom: '24px',
            border: '1px solid var(--apple-hairline)',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setIsRegister(false);
              setError(null);
              setMessage(null);
            }}
            style={{
              flex: 1,
              padding: '7px',
              borderRadius: 'var(--rounded-pill)',
              border: 'none',
              background: !isRegister ? 'var(--apple-surface-card)' : 'transparent',
              color: !isRegister ? 'var(--apple-ink)' : 'var(--apple-body-muted)',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: !isRegister ? 'var(--shadow-apple)' : 'none',
              transition: 'all var(--transition-fast)',
              transform: !isRegister ? 'scale(1.01)' : 'scale(0.99)',
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegister(true);
              setError(null);
              setMessage(null);
            }}
            style={{
              flex: 1,
              padding: '7px',
              borderRadius: 'var(--rounded-pill)',
              border: 'none',
              background: isRegister ? 'var(--apple-surface-card)' : 'transparent',
              color: isRegister ? 'var(--apple-ink)' : 'var(--apple-body-muted)',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: isRegister ? 'var(--shadow-apple)' : 'none',
              transition: 'all var(--transition-fast)',
              transform: isRegister ? 'scale(1.01)' : 'scale(0.99)',
            }}
          >
            Register
          </button>
        </div>

        {/* Feedback alerts */}
        {message && (
          <div
            className="apple-tab-switch"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              borderRadius: 'var(--rounded-md)',
              background: 'var(--apple-green-bg)',
              color: 'var(--apple-green)',
              fontSize: '14px',
              marginBottom: '16px',
            }}
          >
            <CheckCircle2 size={16} />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div
            className="apple-tab-switch"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              borderRadius: 'var(--rounded-md)',
              background: 'var(--apple-red-bg)',
              color: 'var(--apple-red)',
              fontSize: '14px',
              marginBottom: '16px',
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form
          key={isRegister ? 'register' : 'login'}
          className="apple-tab-switch"
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
        >
          {isRegister && (
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--apple-body-muted)', display: 'block', marginBottom: '6px' }}>
                Full Name
              </label>
              <input
                type="text"
                className="apple-input"
                placeholder="Frenil Vaghasia"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--apple-body-muted)', display: 'block', marginBottom: '6px' }}>
              Email Address
            </label>
            <input
              type="email"
              className="apple-input"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--apple-body-muted)', display: 'block', marginBottom: '6px' }}>
              Password
            </label>
            <input
              type="password"
              className="apple-input"
              placeholder={isRegister ? 'At least 6 characters' : 'Enter password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="apple-btn-pill"
            style={{ width: '100%', padding: '11px 22px', fontSize: '15px', marginTop: '8px' }}
            disabled={submitting}
          >
            <span>{submitting ? 'Authenticating...' : isRegister ? 'Create Account' : 'Sign In'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        {!isRegister && (
          <div style={{ textAlign: 'center', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--apple-hairline)' }}>
            <span
              onClick={handleFillDemo}
              className="apple-link"
              style={{ fontSize: '13px' }}
            >
              Fill Demo Credentials (test1@example.com)
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
