import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import PokeballHatLogo from './PokeballHatLogo';
import '../styles/components.css';

const NAV_ITEMS = [
  {
    path: '/',
    label: 'Home',
    theme: 'electric',
    pokemon: 'Pikachu',
    color: '#FFCB05',
    glow: 'rgba(255, 203, 5, 0.55)',
    bg: 'rgba(255, 203, 5, 0.12)',
  },
  {
    path: '/catalog',
    label: 'Catalog',
    theme: 'fire',
    pokemon: 'Charizard',
    color: '#FF5252',
    glow: 'rgba(255, 82, 82, 0.55)',
    bg: 'rgba(255, 82, 82, 0.12)',
  },
  {
    path: '/collection',
    label: 'Collection',
    theme: 'dragon',
    pokemon: 'Rayquaza',
    color: '#00E676',
    glow: 'rgba(0, 230, 118, 0.6)',
    bg: 'rgba(0, 230, 118, 0.14)',
  },
  {
    path: '/wishlist',
    label: 'Wishlist',
    theme: 'star',
    pokemon: 'Jirachi',
    color: '#FFD700',
    glow: 'rgba(255, 215, 0, 0.55)',
    bg: 'rgba(255, 215, 0, 0.12)',
  },
  {
    path: '/about',
    label: 'About',
    theme: 'psychic',
    pokemon: 'Mew',
    color: '#00E5FF',
    glow: 'rgba(0, 229, 255, 0.55)',
    bg: 'rgba(0, 229, 255, 0.12)',
  },
];

export default function Navbar() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const avatar = profile?.avatar_url || user?.avatar_url;

  return (
    <header className="navbar">
      <Link to="/" className="navbar-brand" aria-label="Pokédeckz Home">
        <span className="brand-prefix">P</span>
        <PokeballHatLogo size={27} className="brand-pokeball-hat" />
        <span className="brand-suffix">kédeckz</span>
      </Link>

      <nav className="navbar-links">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`navbar-link pokemon-nav-item ${isActive ? 'is-active' : ''} theme-${item.theme}`}
              style={{
                '--theme-color': item.color,
                '--theme-glow': item.glow,
                '--theme-bg': item.bg,
              }}
              title={isActive ? `Exploring ${item.label} (${item.pokemon} Aura)` : item.label}
            >
              {/* Pokémon Mini Pokéball Icon */}
              <span className="pokemon-nav-beacon" aria-hidden="true">
                <svg
                  className="nav-pokeball-svg"
                  viewBox="0 0 24 24"
                  width="13"
                  height="13"
                >
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.2" fill="none" />
                  <path d="M 2 12 H 22" stroke="currentColor" strokeWidth="2.2" />
                  <circle cx="12" cy="12" r="3.2" fill="currentColor" stroke="#12151F" strokeWidth="1.8" />
                </svg>
              </span>

              <span className="pokemon-nav-label">{item.label}</span>

              {/* Glowing Elemental Underline Beam */}
              {isActive && <span className="pokemon-nav-energy-bar" />}
            </Link>
          );
        })}
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
