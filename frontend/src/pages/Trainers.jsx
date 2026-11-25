import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search,
  Users,
  Compass,
  Sparkles,
  Shield,
  Layers,
  Heart,
  ExternalLink,
  Copy,
  Check,
  AlertCircle
} from 'lucide-react';
import { searchTrainers } from '../services/api';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import '../styles/pages.css';

const TYPE_FILTERS = ['All', 'Fire', 'Water', 'Electric', 'Grass', 'Psychic', 'Dragon', 'Darkness'];

const SQL_SNIPPET = `-- Run this in Supabase SQL Editor to allow public trainer discovery:
GRANT SELECT ON TABLE profiles TO anon, authenticated;
GRANT SELECT ON TABLE collection_items TO anon, authenticated;
GRANT SELECT ON TABLE wishlist_items TO anon, authenticated;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Collections are viewable by everyone" ON collection_items;
CREATE POLICY "Collections are viewable by everyone" ON collection_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Wishlists are viewable by everyone" ON wishlist_items;
CREATE POLICY "Wishlists are viewable by everyone" ON wishlist_items FOR SELECT USING (true);`;

export default function Trainers() {
  const navigate = useNavigate();
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [copiedSql, setCopiedSql] = useState(false);
  const [errorStatus, setErrorStatus] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchTrainers = async () => {
      setLoading(true);
      setErrorStatus(null);
      const res = await searchTrainers(searchQuery);
      if (isMounted) {
        if (res.success) {
          setTrainers(res.data || []);
        } else {
          setErrorStatus(res.error);
          setTrainers([]);
        }
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchTrainers, 250);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  const handleCopySql = () => {
    navigator.clipboard.writeText(SQL_SNIPPET);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const filteredTrainers = trainers.filter((t) => {
    if (selectedType === 'All') return true;
    return (t.favorite_type || '').toLowerCase() === selectedType.toLowerCase();
  });

  return (
    <div className="trainers-page">
      <div className="trainers-hero-backdrop" />

      {/* Page Header */}
      <div className="trainers-header">
        <div className="hero-badge">
          <Users size={14} />
          <span>Pokémon League Trainer Registry</span>
        </div>
        <h1 className="page-title">TRAINER DIRECTORY</h1>
        <p className="page-subtitle">
          Search registered Pokémon TCG trainers, explore their binders, and discover what cards they are hunting for.
        </p>
      </div>

      {/* SQL Setup Notice (Only visible if RLS restricts anon/other users) */}
      {errorStatus && errorStatus.includes('permission denied') && (
        <div className="trainers-sql-card">
          <div className="sql-card-header">
            <AlertCircle size={20} className="sql-card-icon" />
            <div>
              <h3>Enable Public Trainer Discovery in Supabase</h3>
              <p>
                To view other registered trainers and their collections, paste this quick SQL snippet into your{' '}
                <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer">
                  Supabase SQL Editor <ExternalLink size={12} style={{ display: 'inline' }} />
                </a>:
              </p>
            </div>
          </div>
          <pre className="sql-code-block">{SQL_SNIPPET}</pre>
          <button className="sql-copy-btn" onClick={handleCopySql}>
            {copiedSql ? <Check size={14} /> : <Copy size={14} />}
            {copiedSql ? 'SQL Copied!' : 'Copy SQL Script'}
          </button>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="trainers-toolbar">
        <div className="search-bar trainers-search">
          <Search size={18} className="search-bar-icon" />
          <input
            type="text"
            className="search-bar-input"
            placeholder="Search trainers by name, @username, or Trainer ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="search-bar-clear" onClick={() => setSearchQuery('')}>
              ×
            </button>
          )}
        </div>

        {/* Favorite Type Filter Chips */}
        <div className="trainers-type-chips">
          {TYPE_FILTERS.map((type) => (
            <button
              key={type}
              className={`trainer-type-chip ${selectedType === type ? 'active' : ''}`}
              onClick={() => setSelectedType(type)}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Results Meta */}
      <div className="trainers-results-meta">
        <span>
          Showing <strong>{filteredTrainers.length}</strong> Registered Trainer{filteredTrainers.length === 1 ? '' : 's'}
        </span>
      </div>

      {/* Trainers Grid */}
      {loading ? (
        <LoadingSkeleton type="grid" />
      ) : filteredTrainers.length > 0 ? (
        <div className="trainers-grid">
          {filteredTrainers.map((trainer) => {
            const avatarUrl =
              trainer.avatar_url ||
              'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png';
            const shortId = trainer.id ? trainer.id.substring(0, 8).toUpperCase() : 'TRAINER';

            return (
              <div key={trainer.id} className="trainer-card-item">
                <div className="trainer-card-glow-bar" />

                <div className="trainer-card-top">
                  <div className="trainer-card-avatar">
                    <img src={avatarUrl} alt={trainer.username || 'Trainer'} />
                  </div>
                  <div className="trainer-card-identity">
                    <h3 className="trainer-card-name">{trainer.full_name || 'Pokémon Trainer'}</h3>
                    <span className="trainer-card-handle">@{trainer.username || 'trainer'}</span>
                    <span className="trainer-card-id-pill">ID: #{shortId}</span>
                  </div>
                </div>

                <div className="trainer-card-tags">
                  {trainer.favorite_type && (
                    <span className={`type-badge ${trainer.favorite_type.toLowerCase()}`}>
                      {trainer.favorite_type}
                    </span>
                  )}
                  {trainer.region && (
                    <span className="trainer-badge-region">
                      <Compass size={12} /> {trainer.region}
                    </span>
                  )}
                </div>

                {trainer.bio && (
                  <p className="trainer-card-bio">"{trainer.bio}"</p>
                )}

                <div className="trainer-card-footer">
                  <Link to={`/trainer/${trainer.id}`} className="trainer-inspect-btn">
                    <Sparkles size={14} /> Inspect Binder & Wishlist
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <Users size={52} className="empty-state-icon" />
          <h2 className="empty-state-title">No Trainers Found</h2>
          <p className="empty-state-message">
            {searchQuery
              ? `No registered trainers match "${searchQuery}". Try a different name or username.`
              : 'Be the first registered trainer in the Pokémon League database!'}
          </p>
          {searchQuery && (
            <button className="empty-state-action" onClick={() => { setSearchQuery(''); setSelectedType('All'); }}>
              Clear Search Filters
            </button>
          )}
        </div>
      )}

      <style>{`
        .trainers-page {
          position: relative;
          padding-top: 12px;
          padding-bottom: 56px;
        }

        .trainers-hero-backdrop {
          position: fixed;
          inset: 0;
          width: 100vw;
          height: 100vh;
          background-image:
            linear-gradient(180deg, rgba(9, 10, 15, 0.72) 0%, rgba(9, 10, 15, 0.9) 60%, rgba(9, 10, 15, 0.98) 100%),
            radial-gradient(circle at 75% 25%, rgba(0, 229, 255, 0.14) 0%, transparent 55%),
            radial-gradient(circle at 25% 65%, rgba(255, 203, 5, 0.1) 0%, transparent 50%),
            url('/images/pokemon-group.jpg');
          background-size: cover;
          background-position: center 25%;
          background-repeat: no-repeat;
          z-index: 0;
          pointer-events: none;
        }

        .trainers-header {
          position: relative;
          z-index: 1;
          margin-bottom: 24px;
        }

        /* SQL Setup helper card */
        .trainers-sql-card {
          position: relative;
          z-index: 1;
          background: rgba(22, 28, 42, 0.85);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 203, 5, 0.3);
          border-radius: var(--radius-lg);
          padding: 18px 20px;
          margin-bottom: 24px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.5);
        }
        .sql-card-header {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          margin-bottom: 12px;
        }
        .sql-card-icon {
          color: var(--color-electric-yellow);
          flex-shrink: 0;
          margin-top: 2px;
        }
        .sql-card-header h3 {
          font-family: var(--font-display);
          font-size: 1.05rem;
          color: var(--color-white);
          margin-bottom: 4px;
        }
        .sql-card-header p {
          color: var(--color-muted-gray);
          font-size: 0.85rem;
          line-height: 1.5;
        }
        .sql-card-header a {
          color: var(--color-electric-yellow);
          font-weight: 700;
          text-decoration: underline;
        }
        .sql-code-block {
          background: rgba(10, 12, 18, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: var(--radius-md);
          padding: 12px 14px;
          font-family: monospace;
          font-size: 0.78rem;
          color: #a5d6a7;
          overflow-x: auto;
          margin-bottom: 12px;
          line-height: 1.5;
        }
        .sql-copy-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: var(--color-electric-yellow);
          color: #111;
          font-family: var(--font-display);
          font-weight: 800;
          font-size: 0.85rem;
          padding: 8px 18px;
          border-radius: var(--radius-sm);
          cursor: pointer;
          border: none;
          transition: all var(--transition-fast);
        }
        .sql-copy-btn:hover {
          background: #FFE082;
          transform: translateY(-1px);
        }

        /* Toolbar */
        .trainers-toolbar {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          gap: 14px;
          margin-bottom: 20px;
        }
        .trainers-search {
          width: 100%;
        }

        .trainers-type-chips {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .trainer-type-chip {
          padding: 6px 14px;
          background: rgba(22, 26, 38, 0.75);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: var(--radius-full);
          font-family: var(--font-display);
          font-size: 0.78rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--color-muted-gray);
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .trainer-type-chip:hover {
          color: var(--color-white);
          border-color: rgba(255, 255, 255, 0.25);
        }
        .trainer-type-chip.active {
          color: #111;
          background: var(--color-electric-yellow);
          border-color: var(--color-electric-yellow);
          box-shadow: 0 0 14px rgba(255, 203, 5, 0.4);
        }

        .trainers-results-meta {
          position: relative;
          z-index: 1;
          font-size: 0.82rem;
          color: var(--color-muted-gray);
          margin-bottom: 18px;
        }
        .trainers-results-meta strong {
          color: var(--color-white);
        }

        /* Grid */
        .trainers-grid {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }
        @media (min-width: 600px) {
          .trainers-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (min-width: 960px) {
          .trainers-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        /* Trainer Card Item */
        .trainer-card-item {
          position: relative;
          background: rgba(18, 22, 34, 0.82);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: var(--radius-lg);
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          overflow: hidden;
          transition: transform var(--transition-fast), border-color var(--transition-fast), box-shadow var(--transition-fast);
        }
        .trainer-card-item:hover {
          transform: translateY(-4px);
          border-color: rgba(0, 229, 255, 0.35);
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6), 0 0 24px rgba(0, 229, 255, 0.12);
        }
        .trainer-card-glow-bar {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #00E5FF 0%, #FFCB05 50%, #FF5252 100%);
        }

        .trainer-card-top {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .trainer-card-avatar {
          width: 62px;
          height: 62px;
          border-radius: 50%;
          border: 2px solid var(--color-electric-yellow);
          box-shadow: 0 0 14px rgba(255, 203, 5, 0.3);
          overflow: hidden;
          background: #141824;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .trainer-card-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .trainer-card-identity {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .trainer-card-name {
          font-family: var(--font-display);
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--color-white);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .trainer-card-handle {
          font-size: 0.8rem;
          color: var(--color-electric-yellow);
          font-weight: 600;
        }
        .trainer-card-id-pill {
          display: inline-block;
          font-family: monospace;
          font-size: 0.72rem;
          color: var(--color-muted-gray);
          background: rgba(255, 255, 255, 0.05);
          padding: 2px 6px;
          border-radius: var(--radius-sm);
          margin-top: 3px;
          width: fit-content;
        }

        .trainer-card-tags {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }
        .trainer-badge-region {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 10px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-full);
          font-size: 0.72rem;
          font-weight: 600;
          color: var(--color-soft-white);
        }

        .trainer-card-bio {
          font-style: italic;
          font-size: 0.82rem;
          color: var(--color-muted-gray);
          line-height: 1.4;
          margin: 0;
        }

        .trainer-card-footer {
          margin-top: auto;
          padding-top: 10px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }
        .trainer-inspect-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 10px;
          background: linear-gradient(135deg, rgba(0, 229, 255, 0.12) 0%, rgba(41, 121, 255, 0.15) 100%);
          border: 1px solid rgba(0, 229, 255, 0.35);
          border-radius: var(--radius-sm);
          color: #00E5FF;
          font-family: var(--font-display);
          font-size: 0.85rem;
          font-weight: 800;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          text-decoration: none;
          transition: all var(--transition-fast);
        }
        .trainer-inspect-btn:hover {
          background: linear-gradient(135deg, #00E5FF 0%, #2979FF 100%);
          color: #111;
          box-shadow: 0 4px 18px rgba(0, 229, 255, 0.4);
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
}
