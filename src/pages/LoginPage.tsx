import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ApiClientError } from '../services/api';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSlowConnection, setIsSlowConnection] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const destination = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    setIsSlowConnection(false);

    // After 5s, show a "server is warming up" notice (Render free tier cold start)
    const slowTimer = setTimeout(() => setIsSlowConnection(true), 5000);

    try {
      await login(email, password);
      navigate(destination, { replace: true });
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError('Unable to connect to the server. Please try again.');
      }
    } finally {
      clearTimeout(slowTimer);
      setIsSubmitting(false);
      setIsSlowConnection(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '440px', marginTop: '2rem' }}>
      <div className="card">
        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', textAlign: 'center' }}>
          Welcome Back
        </h1>
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          Log in to manage your shortened URLs
        </p>

        {error && <div className="alert alert-danger">{error}</div>}

        {isSlowConnection && (
          <div style={{
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            color: '#1e40af',
            borderRadius: '8px',
            padding: '0.75rem 1rem',
            marginBottom: '1rem',
            fontSize: '0.875rem',
            textAlign: 'center',
          }}>
            ⏳ Server is warming up — this can take up to 30 seconds on first use. Please wait…
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing in...' : 'Log In'}
          </button>
        </form>

        <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};