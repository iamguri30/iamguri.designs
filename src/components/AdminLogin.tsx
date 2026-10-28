import React, { useState } from 'react';
import { loginWithGoogle, loginWithEmail, ADMIN_EMAIL_ALLOWLIST } from '../services/auth';

interface AdminLoginProps {
  onSuccess: () => void;
  onCancel: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onCancel, theme, onToggleTheme }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
      onSuccess();
    } catch (err: any) {
      console.error('Google Sign-in error:', err);
      setError(err.message || 'Failed to authenticate with Google.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await loginWithEmail(email, password);
      onSuccess();
    } catch (err: any) {
      console.error('Email login error:', err);
      setError(err.message || 'Invalid credentials or login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 bg-primary-dark d-flex align-items-center justify-content-center p-3" style={{ color: 'var(--text-primary)' }}>
      <div
        className="w-100 bg-secondary-dark border border-subtle p-4 p-md-5 shadow-lg"
        style={{ maxWidth: '480px' }}
      >
        {/* Top Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex align-items-center gap-2">
            <span className="text-accent fs-4 font-editorial">/</span>
            <span className="text-uppercase fw-bold" style={{ letterSpacing: '0.1em', fontSize: '0.85rem' }}>
              Studio Admin
            </span>
          </div>

          <div className="d-flex align-items-center gap-2">
            <button
              onClick={onToggleTheme}
              className="btn-theme-toggle"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              type="button"
            >
              <i className={`bi ${theme === 'dark' ? 'bi-sun-fill text-warning' : 'bi-moon-stars-fill'}`}></i>
            </button>
            <button
              onClick={onCancel}
              className="btn btn-sm btn-outline-editorial"
              style={{ fontSize: '0.75rem' }}
            >
              &larr; Public Site
            </button>
          </div>
        </div>

        <h2 className="font-editorial fs-3 mb-2" style={{ color: 'var(--text-primary)' }}>Restricted Access</h2>
        <p className="text-secondary-custom small mb-4">
          Authenticate with an authorized administrator account to manage portfolio projects, inquiries, and settings.
        </p>

        {error && (
          <div className="alert alert-danger rounded-0 border-0 py-2 small mb-4" role="alert">
            {error}
          </div>
        )}

        {/* Primary Recommended: One-Click Google Authentication */}
        <div className="mb-4">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="btn btn-lime w-100 py-3 text-uppercase fw-semibold d-flex align-items-center justify-content-center gap-2"
          >
            <i className="bi bi-google fs-5"></i>
            <span>Sign In with Google</span>
          </button>
          <div className="text-muted-custom text-center mt-2" style={{ fontSize: '0.75rem' }}>
            Authorized administrator: <span className="text-accent">{ADMIN_EMAIL_ALLOWLIST[0]}</span>
          </div>
        </div>

        <div className="d-flex align-items-center my-4">
          <div className="flex-grow-1 border-bottom border-subtle"></div>
          <span className="px-3 text-muted-custom text-uppercase small" style={{ fontSize: '0.7rem' }}>or email login</span>
          <div className="flex-grow-1 border-bottom border-subtle"></div>
        </div>

        {/* Email / Password Form */}
        <form onSubmit={handleEmailLogin}>
          <div className="mb-3">
            <label className="form-label text-muted-custom text-uppercase small" style={{ fontSize: '0.75rem' }}>
              Administrator Email
            </label>
            <input
              type="email"
              className="form-control form-editorial-control"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="mb-4">
            <label className="form-label text-muted-custom text-uppercase small" style={{ fontSize: '0.75rem' }}>
              Password
            </label>
            <input
              type="password"
              className="form-control form-editorial-control"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-outline-editorial w-100 py-2 text-uppercase d-flex align-items-center justify-content-center gap-2"
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            ) : (
              <span>Sign In with Credentials</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
