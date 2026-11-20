import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import PokeballHatLogo from '../components/PokeballHatLogo';
import '../styles/auth.css';

export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !email.includes('@')) {
      setError('Please provide a valid Trainer email address.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email.trim());
      setSubmitted(true);
    } catch (err) {
      console.error('[PokéDeckz] Password recovery error:', err);
      setError(err.message || 'Unable to send recovery email. Please check your address and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-backdrop" />

      <div className="auth-card">
        <Link to="/login" className="auth-back-link">
          <ArrowLeft size={16} /> Back to Sign In
        </Link>

        <div className="auth-logo">
          <Link to="/" className="auth-brand-logo" aria-label="Pokédeckz Home">
            <span className="brand-prefix">P</span>
            <PokeballHatLogo size={34} className="brand-pokeball-hat" />
            <span className="brand-suffix">kédeckz</span>
          </Link>
        </div>

        <h1 className="auth-title">Recover Password</h1>
        <p className="auth-subtitle">
          {submitted
            ? 'Recovery instructions dispatched'
            : 'Enter your registered Trainer email and we’ll dispatch a secure recovery link'}
        </p>

        {submitted ? (
          <div className="auth-recovery-success">
            <div className="success-icon-badge">
              <CheckCircle2 size={40} />
            </div>
            <h3 className="success-heading">Check Your Inbox!</h3>
            <p className="success-message">
              We&apos;ve sent a password reset link to <strong>{email}</strong>.
            </p>
            <p className="success-hint">
              Click the link inside to set a new password. If you don’t see it within a couple minutes, be sure to check your spam or junk folder.
            </p>

            <div className="success-actions">
              <button
                type="button"
                className="auth-btn secondary"
                onClick={() => setSubmitted(false)}
              >
                Send Again with Different Email
              </button>
              <Link to="/login" className="auth-btn">
                Return to Sign In
              </Link>
            </div>
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="recovery-email">
                Trainer Email
              </label>
              <div className="input-with-icon">
                <input
                  id="recovery-email"
                  className="form-input"
                  type="email"
                  placeholder="trainer@pokédeckz.app"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  disabled={loading}
                />
              </div>
            </div>

            {error && (
              <div className="form-error">
                <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 2 }} />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="auth-btn"
              disabled={loading}
            >
              {loading ? 'Dispatching Recovery Link...' : 'Send Recovery Link'}
            </button>

            <div className="auth-footer">
              Remember your password?{' '}
              <Link to="/login">Sign In</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
