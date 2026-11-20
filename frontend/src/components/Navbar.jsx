import { Link, useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import PokeballHatLogo from './PokeballHatLogo';
import '../styles/components.css';

const navLinks = [
  { path: '/', label: 'Home' },
  { path: '/catalog', label: 'Catalog' },
  { path: '/collection', label: 'Collection' },
  { path: '/wishlist', label: 'Wishlist' },
  { path: '/about', label: 'About' },
];

export default function Navbar() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const avatar = profile?.avatar_url || user?.avatar_url;

  return (
    <header className="navbar">
      <Link to="/" className="navbar-brand" aria-label="Pokédeckz Home">
        <span className="brand-prefix">P</span>
        <PokeballHatLogo size={27} className="brand-pokeball-hat" />
        <span className="brand-suffix">kédeckz</span>
      </Link>

      <nav className="navbar-links">
        {navLinks.map(({ path, label }) => (
          <Link key={path} to={path} className="navbar-link">
            {label}
          </Link>
        ))}
      </nav>

      <div className="navbar-auth">
        {user ? (
          <button
            className="navbar-avatar"
            onClick={() => navigate('/profile')}
            aria-label="Profile"
          >
            {avatar ? (
              <img src={avatar} alt="Profile" className="avatar-img" />
            ) : (
              <User size={20} />
            )}
          </button>
        ) : (
          <button
            className="navbar-login-btn"
            onClick={() => navigate('/login')}
          >
            Login
          </button>
        )}
      </div>
    </header>
  );
}
