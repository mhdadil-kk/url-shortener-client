import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { KeyRound, RotateCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api, ApiClientError } from '../services/api';

export const VerifyOtpPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get('email') || '';

  const [email] = useState(emailParam);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(60);

  const { verifyOtp } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      await verifyOtp(email, otp.trim());
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError('Verification failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setError(null);
    setSuccess(null);

    try {
      await api.auth.resendOtp(email);
      setSuccess('A new verification code has been sent!');
      setCooldown(60);
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError('Failed to resend code. Please try again.');
      }
    }
  };

  if (!email) {
    return (
      <div className="container" style={{ maxWidth: '440px', marginTop: '3rem', textAlign: 'center' }}>
        <div className="card">
          <h2>Email Missing</h2>
          <p style={{ color: 'var(--text-muted)', margin: '1rem 0' }}>
            No email address provided for verification.
          </p>
          <Link to="/register" className="btn btn-primary">
            Back to Sign Up
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '440px', marginTop: '2rem' }}>
      <div className="card">
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'var(--primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
            }}
          >
            <KeyRound size={28} color="var(--primary)" />
          </div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Check Your Email</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            We sent a 6-digit verification code to
          </p>
          <strong style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>{email}</strong>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleVerify}>
          <div className="form-group">
            <label htmlFor="otp" style={{ textAlign: 'center', display: 'block' }}>
              6-Digit Code
            </label>
            <input
              id="otp"
              type="text"
              required
              maxLength={6}
              pattern="\d{6}"
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} // numbers only
              style={{
                fontSize: '1.75rem',
                letterSpacing: '0.45rem',
                textAlign: 'center',
                fontWeight: 700,
                padding: '0.5rem 1rem',
              }}
              disabled={isSubmitting}
              autoFocus
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.75rem' }}
            disabled={isSubmitting || otp.length !== 6}
          >
            {isSubmitting ? 'Verifying...' : 'Verify & Continue'}
          </button>
        </form>

        <div style={{ marginTop: '1.75rem', textAlign: 'center', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            Didn't receive the email?
          </p>
          <button
            type="button"
            onClick={handleResend}
            className="btn btn-outline"
            style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
            disabled={cooldown > 0}
          >
            <RotateCw size={14} />
            <span>{cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend Code'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};