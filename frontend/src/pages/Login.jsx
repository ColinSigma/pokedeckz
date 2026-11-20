import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Lock, Mail } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import PokeballHatLogo from '../components/PokeballHatLogo';
import '../styles/auth.css';

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to log in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Pokémon Arena Backdrop */}
      <div className="auth-backdrop" />

      <div className="auth-card">
        <Link to="/" className="auth-back-link">
          <ArrowLeft size={16} /> Return to Home
        </Link>

        <div className="auth-logo">
          <Link to="/" className="auth-brand-logo" aria-label="Pokédeckz Home">
            <span className="brand-prefix">P</span>
            <PokeballHatLogo size={34} className="brand-pokeball-hat" />
            <span className="brand-suffix">kédeckz</span>
          </Link>
        </div>

        <h1 className="auth-title">Welcome Back, Trainer</h1>
        <p className="auth-subtitle">Sign in to manage your collection binder & wishlist</p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Trainer Email</label>
            <input
              id="email"
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

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              className="form-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              disabled={loading}
            />
          </div>

          {error && <p className="form-error">{error}</p>}

          <button
            type="submit"
            className="auth-btn"
            disabled={loading}
          >
            {loading ? 'Entering Pokédeckz...' : 'Sign In to Binder'}
          </button>
        </form>

        <div className="auth-footer">
          Don&apos;t have an account?{' '}
          <Link to="/register">Create Free Account</Link>
        </div>
      </div>
    </div>
  );
}
