import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, Search, X, Loader2, Sun, Moon } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import { searchTrainers } from '../services/api';
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
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchContainerRef = useRef(null);

  const avatar = profile?.avatar_url || user?.avatar_url;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search for trainers
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      const res = await searchTrainers(q);
      if (res.success) {
        setResults(res.data || []);
      } else {
        setResults([]);
      }
      setIsSearching(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (results.length > 0) {
        navigate(`/trainer/${results[0].id}`);
        setIsOpen(false);
        setSearchQuery('');
      } else if (searchQuery.trim()) {
        navigate(`/trainers?q=${encodeURIComponent(searchQuery.trim())}`);
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

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

      {/* Trainer Search Bar */}
      <div className="navbar-trainer-search" ref={searchContainerRef}>
        <div className="trainer-search-input-wrap">
          <Search size={15} className="trainer-search-icon" />
          <input
            type="text"
            className="trainer-search-input"
            placeholder="Search trainer (e.g. mee)..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => {
              if (searchQuery.trim()) setIsOpen(true);
            }}
            onKeyDown={handleKeyDown}
          />
          {searchQuery && (
            <button
              type="button"
              className="trainer-search-clear"
              onClick={() => {
                setSearchQuery('');
                setResults([]);
                setIsOpen(false);
              }}
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Live Search Dropdown */}
        {isOpen && searchQuery.trim() && (
          <div className="trainer-search-dropdown">
            <div className="trainer-dropdown-header">
              <span>TRAINER RESULTS FOR &ldquo;{searchQuery}&rdquo;</span>
            </div>

            {isSearching ? (
              <div className="trainer-search-status">
                <Loader2 size={15} className="trainer-spin-icon" />
                <span>Scanning database...</span>
              </div>
            ) : results.length > 0 ? (
              <div className="trainer-dropdown-list">
                {results.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    className="trainer-dropdown-item"
                    onClick={() => {
                      navigate(`/trainer/${t.id}`);
                      setIsOpen(false);
                      setSearchQuery('');
                    }}
                  >
                    <div className="trainer-dropdown-avatar">
                      {t.avatar_url ? (
                        <img src={t.avatar_url} alt={t.username} />
                      ) : (
                        <span>{(t.username || 'T').charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="trainer-dropdown-meta">
                      <div className="trainer-dropdown-name-row">
                        <span className="trainer-dropdown-name">{t.full_name || t.username}</span>
                        {user?.id === t.id && <span className="trainer-you-pill">YOU</span>}
                      </div>
                      <span className="trainer-dropdown-handle">@{t.username}</span>
                    </div>
                    <span className="trainer-dropdown-view">View Binder →</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="trainer-search-status">
                <span>No trainers found matching &ldquo;{searchQuery}&rdquo;</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="navbar-auth" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          type="button"
          className="theme-toggle-btn"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Theme`}
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>

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

      <style>{`
        .navbar-trainer-search {
          position: relative;
          margin: 0 12px;
          min-width: 200px;
          max-width: 280px;
          flex: 1 1 auto;
        }
        @media (max-width: 768px) {
          .navbar-trainer-search {
            min-width: 140px;
            max-width: 180px;
            margin: 0 6px;
          }
        }
        .theme-toggle-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 1px solid var(--hairline);
          background: var(--bg-surface);
          color: var(--text-primary);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .theme-toggle-btn:hover {
          border-color: var(--hairline-strong);
          background: var(--bg-surface-elevated);
          transform: translateY(-1px);
        }
        .trainer-search-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
          background: var(--bg-surface);
          border: 1px solid var(--hairline);
          border-radius: var(--radius-full, 9999px);
          padding: 6px 12px 6px 32px;
          transition: all 0.2s ease;
        }
        .trainer-search-input-wrap:focus-within {
          border-color: var(--hairline-strong);
          background: var(--bg-surface-elevated);
        }
        .trainer-search-icon {
          position: absolute;
          left: 11px;
          color: var(--text-muted);
          pointer-events: none;
        }
        .trainer-search-input-wrap:focus-within .trainer-search-icon {
          color: var(--text-primary);
        }
        .trainer-search-input {
          width: 100%;
          background: transparent;
          border: none;
          outline: none;
          font-family: var(--font-mono);
          font-size: 0.78rem;
          color: var(--text-primary);
        }
        .trainer-search-input::placeholder {
          color: var(--text-muted);
          font-size: 0.74rem;
        }
        .trainer-search-clear {
          background: transparent;
          border: none;
          color: var(--color-muted-gray, #94A3B8);
          cursor: pointer;
          display: flex;
          align-items: center;
          padding: 2px;
        }
        .trainer-search-clear:hover {
          color: #FFFFFF;
        }

        .trainer-search-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          right: 0;
          min-width: 280px;
          background: var(--bg-surface);
          border: 1px solid var(--hairline-strong);
          border-radius: 12px;
          box-shadow: var(--shadow-lg);
          z-index: 1000;
          overflow: hidden;
          animation: dropdownFade 0.15s ease-out;
        }
        @keyframes dropdownFade {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .trainer-dropdown-header {
          padding: 8px 12px;
          font-family: var(--font-mono);
          font-size: 0.68rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          color: var(--theme-accent);
          border-bottom: 1px solid var(--hairline);
          background: var(--theme-accent-soft);
        }

        .trainer-search-status {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 18px 14px;
          font-size: 0.8rem;
          color: var(--text-secondary);
        }
        .trainer-spin-icon {
          animation: spin 1s linear infinite;
          color: var(--theme-accent);
        }
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }

        .trainer-dropdown-list {
          max-height: 280px;
          overflow-y: auto;
        }

        .trainer-dropdown-item {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 10px 12px;
          background: transparent;
          border: none;
          border-bottom: 1px solid var(--hairline);
          text-align: left;
          cursor: pointer;
          transition: background 0.15s ease;
        }
        .trainer-dropdown-item:last-child {
          border-bottom: none;
        }
        .trainer-dropdown-item:hover {
          background: var(--bg-surface-elevated);
        }

        .trainer-dropdown-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--bg-surface-elevated);
          border: 1px solid var(--hairline-strong);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          flex-shrink: 0;
          color: var(--theme-accent);
          font-weight: 700;
          font-size: 0.85rem;
        }
        .trainer-dropdown-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .trainer-dropdown-meta {
          flex: 1 1 auto;
          min-width: 0;
          display: flex;
          flex-direction: column;
        }
        .trainer-dropdown-name-row {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .trainer-you-pill {
          font-family: var(--font-display, inherit);
          font-size: 0.62rem;
          font-weight: 800;
          padding: 1px 5px;
          border-radius: var(--radius-full, 9999px);
          background: #00E5FF;
          color: #0B0F19;
          letter-spacing: 0.05em;
        }
        .trainer-dropdown-name {
          font-size: 0.84rem;
          font-weight: 700;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .trainer-dropdown-handle {
          font-size: 0.72rem;
          color: var(--text-secondary);
          font-weight: 600;
        }

        .trainer-dropdown-view {
          font-size: 0.72rem;
          color: var(--theme-accent);
          font-weight: 600;
          white-space: nowrap;
          opacity: 0.85;
        }
        .trainer-dropdown-item:hover .trainer-dropdown-view {
          opacity: 1;
        }
      `}</style>
    </header>
  );
}
