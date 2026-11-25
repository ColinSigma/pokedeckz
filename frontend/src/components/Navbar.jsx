import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, Search, X, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
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
                      <span className="trainer-dropdown-name">{t.full_name || t.username}</span>
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
        .trainer-search-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
          background: rgba(18, 22, 34, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: var(--radius-full, 9999px);
          padding: 6px 12px 6px 32px;
          transition: all 0.2s ease;
        }
        .trainer-search-input-wrap:focus-within {
          border-color: #00E5FF;
          box-shadow: 0 0 12px rgba(0, 229, 255, 0.35);
          background: rgba(18, 22, 34, 0.98);
        }
        .trainer-search-icon {
          position: absolute;
          left: 11px;
          color: var(--color-muted-gray, #94A3B8);
          pointer-events: none;
        }
        .trainer-search-input-wrap:focus-within .trainer-search-icon {
          color: #00E5FF;
        }
        .trainer-search-input {
          width: 100%;
          background: transparent;
          border: none;
          outline: none;
          font-family: inherit;
          font-size: 0.82rem;
          color: #FFFFFF;
        }
        .trainer-search-input::placeholder {
          color: rgba(148, 163, 184, 0.7);
          font-size: 0.78rem;
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
          background: rgba(14, 18, 28, 0.96);
          border: 1px solid rgba(0, 229, 255, 0.25);
          backdrop-filter: blur(16px);
          border-radius: 12px;
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.7), 0 0 16px rgba(0, 229, 255, 0.15);
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
          font-family: var(--font-display, inherit);
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: #00E5FF;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          background: rgba(0, 229, 255, 0.04);
        }

        .trainer-search-status {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 18px 14px;
          font-size: 0.8rem;
          color: var(--color-muted-gray, #94A3B8);
        }
        .trainer-spin-icon {
          animation: spin 1s linear infinite;
          color: #00E5FF;
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
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
          text-align: left;
          cursor: pointer;
          transition: background 0.15s ease;
        }
        .trainer-dropdown-item:last-child {
          border-bottom: none;
        }
        .trainer-dropdown-item:hover {
          background: rgba(0, 229, 255, 0.08);
        }

        .trainer-dropdown-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #1E293B;
          border: 1px solid rgba(0, 229, 255, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          flex-shrink: 0;
          color: #00E5FF;
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
        .trainer-dropdown-name {
          font-size: 0.84rem;
          font-weight: 700;
          color: #FFFFFF;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .trainer-dropdown-handle {
          font-size: 0.72rem;
          color: var(--color-electric-yellow, #FFCB05);
          font-weight: 600;
        }

        .trainer-dropdown-view {
          font-size: 0.72rem;
          color: #00E5FF;
          font-weight: 600;
          white-space: nowrap;
          opacity: 0.8;
        }
        .trainer-dropdown-item:hover .trainer-dropdown-view {
          opacity: 1;
        }
      `}</style>
    </header>
  );
}
