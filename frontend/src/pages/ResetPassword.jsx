import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, AlertCircle, KeyRound, ShieldCheck } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../services/supabase';
import PokeballHatLogo from '../components/PokeballHatLogo';
import '../styles/auth.css';

export default function ResetPassword() {
  const { updatePassword } = useAuth();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [hasValidSession, setHasValidSession] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    // Check if user arrived via recovery link
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setHasValidSession(true);
      }
      setCheckingSession(false);
    }).catch(() => {
      setCheckingSession(false);
    });

    // Also listen for password recovery auth event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || session) {
        setHasValidSession(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please verify both fields.');
      return;
    }

    setLoading(true);
    try {
      await updatePassword(newPassword);
      setSuccess(true);
    } catch (err) {
      console.error('[PokéDeckz] Password update error:', err);
      setError(err.message || 'Failed to update password. Your recovery link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-backdrop" />

      <div className="auth-card">
        <Link to="/login" className="auth-back-link">
          <ArrowLeft size={16} /> Return to Sign In
        </Link>

        <div className="auth-logo">
          <Link to="/" className="auth-brand-logo" aria-label="Pokédeckz Home">
            <span className="brand-prefix">P</span>
            <PokeballHatLogo size={34} className="brand-pokeball-hat" />
            <span className="brand-suffix">kédeckz</span>
          </Link>
        </div>

        <h1 className="auth-title">Set New Password</h1>
        <p className="auth-subtitle">
          {success
            ? 'Your Trainer account has been secured'
            : 'Enter and confirm your new secure password'}
        </p>

        {success ? (
          <div className="auth-recovery-success">
            <div className="success-icon-badge">
              <ShieldCheck size={42} style={{ color: '#00E676' }} />
            </div>
            <h3 className="success-heading">Password Updated!</h3>
            <p className="success-message">
              Your password has been changed successfully. You can now use your new password to access your collection binder.
            </p>
            <div className="success-actions">
              <button
                type="button"
                className="auth-btn"
                onClick={() => navigate('/')}
              >
                Enter PokéDeckz
              </button>
            </div>
          </div>
        ) : checkingSession ? (
          <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--color-muted-gray)' }}>
            Verifying recovery session...
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="new-password">
                New Password
              </label>
              <input
                id="new-password"
                className="form-input"
                type="password"
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                autoComplete="new-password"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirm-password">
                Confirm New Password
              </label>
              <input
                id="confirm-password"
                className="form-input"
                type="password"
                placeholder="Repeat new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                disabled={loading}
              />
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
              {loading ? 'Updating Password...' : 'Save New Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
