import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  Users,
  Compass,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { searchTrainers, isExcludedTrainer } from '../services/api';
import LoadingSkeleton from '../components/LoadingSkeleton';
import '../styles/pages.css';

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
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [copiedSql, setCopiedSql] = useState(false);
  const [errorStatus, setErrorStatus] = useState(null);

  // Sync search query changes to URL and execute search
  useEffect(() => {
    let isMounted = true;
    const trimmed = searchQuery.trim();

    if (!trimmed) {
      setTrainers([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorStatus(null);

    const timer = setTimeout(async () => {
      const res = await searchTrainers(trimmed);
      if (isMounted) {
        if (res.success) {
          // Double filter to guarantee no admin/dev accounts are displayed
          const nonAdminTrainers = (res.data || []).filter((t) => !isExcludedTrainer(t));
          setTrainers(nonAdminTrainers);
        } else {
          setErrorStatus(res.error);
          setTrainers([]);
        }
        setLoading(false);
      }
    }, 200);

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

  return (
    <div className="trainers-page">
      <div className="trainers-hero-backdrop" />

      {/* Page Header */}
      <div className="trainers-header">
        <div className="hero-badge">
          <Users size={14} />
          <span>Pokémon League Trainer Registry</span>
        </div>
        <h1 className="page-title">FIND A TRAINER</h1>
        <p className="page-subtitle">
          Search registered trainers by username to inspect their binders and hunted wishlist cards.
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

      {/* Main Search Bar */}
      <div className="trainers-toolbar">
        <div className="search-bar trainers-search">
          <Search size={18} className="search-bar-icon" />
          <input
            type="text"
            className="search-bar-input"
            placeholder="Type username to search (e.g. 'mee', 'ash', 'cynthia')..."
            value={searchQuery}
            autoFocus
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (e.target.value.trim()) {
                setSearchParams({ q: e.target.value.trim() });
              } else {
                setSearchParams({});
              }
            }}
          />
          {searchQuery && (
            <button
              className="search-bar-clear"
              onClick={() => {
                setSearchQuery('');
                setSearchParams({});
              }}
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <LoadingSkeleton type="grid" />
      ) : searchQuery.trim() === '' ? (
        /* Empty Prompt State: Instructs user to search */
        <div className="trainers-prompt-box">
          <div className="prompt-pokeball-circle">
            <Search size={36} color="#00E5FF" />
          </div>
          <h2 className="prompt-title">SEARCH TRAINER DATABASE</h2>
          <p className="prompt-desc">
            Type any letters or characters of a trainer's username above.
            For example, searching <code>&ldquo;mee&rdquo;</code> will find <strong>mee</strong>, <strong>Mee</strong>, or <strong>mEE</strong>.
          </p>
          <div className="prompt-quick-tags">
            <span className="prompt-quick-label">Try typing:</span>
            {['ash', 'cynthia', 'red', 'mee'].map((sample) => (
              <button
                key={sample}
                className="prompt-tag-btn"
                onClick={() => {
                  setSearchQuery(sample);
                  setSearchParams({ q: sample });
                }}
              >
                @{sample}
              </button>
            ))}
          </div>
        </div>
      ) : trainers.length > 0 ? (
        /* Matching Trainers Found */
        <>
          <div className="trainers-results-meta">
            <span>
              Found <strong>{trainers.length}</strong> Trainer{trainers.length === 1 ? '' : 's'} matching &ldquo;{searchQuery}&rdquo;
            </span>
          </div>

          <div className="trainers-grid">
            {trainers.map((trainer) => {
              const avatarUrl =
                trainer.avatar_url ||
                'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png';

              return (
                <div key={trainer.id} className="trainer-card-item">
                  <div className="trainer-card-glow-bar" />

                  <div className="trainer-card-top">
                    <div className="trainer-card-avatar">
                      <img src={avatarUrl} alt={trainer.username || 'Trainer'} />
                    </div>
                    <div className="trainer-card-identity">
                      <div className="trainer-card-name-row">
                        <h3 className="trainer-card-name">{trainer.full_name || 'Pokémon Trainer'}</h3>
                        {user?.id === trainer.id && <span className="trainer-you-pill">YOU</span>}
                      </div>
                      <span className="trainer-card-handle">@{trainer.username || 'trainer'}</span>
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
                    <p className="trainer-card-bio">&ldquo;{trainer.bio}&rdquo;</p>
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
        </>
      ) : (
        /* No Matching Trainers Found */
        <div className="empty-state">
          <Users size={52} className="empty-state-icon" />
          <h2 className="empty-state-title">No Trainers Found</h2>
          <p className="empty-state-message">
            No registered trainers match &ldquo;{searchQuery}&rdquo;. Try another username.
          </p>
          <button
            className="empty-state-action"
            onClick={() => {
              setSearchQuery('');
              setSearchParams({});
            }}
          >
            Clear Search
          </button>
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
            linear-gradient(180deg, rgba(8, 11, 20, 0.72) 0%, rgba(9, 12, 22, 0.9) 60%, rgba(8, 10, 18, 0.98) 100%),
            radial-gradient(circle at 75% 25%, rgba(0, 229, 255, 0.16) 0%, transparent 60%),
            radial-gradient(circle at 25% 65%, rgba(255, 203, 5, 0.12) 0%, transparent 50%),
            url('/images/cynthia-bg.jpg');
          background-size: cover;
          background-position: center 30%;
          background-repeat: no-repeat;
          z-index: 0;
          pointer-events: none;
        }

        .trainers-header {
          position: relative;
          z-index: 1;
          margin-bottom: 24px;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(0, 229, 255, 0.1);
          border: 1px solid rgba(0, 229, 255, 0.3);
          color: #00E5FF;
          padding: 4px 12px;
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin-bottom: 12px;
        }

        .trainers-toolbar {
          position: relative;
          z-index: 1;
          margin-bottom: 28px;
          max-width: 640px;
        }

        .trainers-search {
          background: rgba(18, 24, 38, 0.85);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(0, 229, 255, 0.3);
          border-radius: var(--radius-full);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4), 0 0 16px rgba(0, 229, 255, 0.1);
        }
        .trainers-search:focus-within {
          border-color: #00E5FF;
          box-shadow: 0 0 20px rgba(0, 229, 255, 0.35);
        }

        /* Interactive Search Prompt Box */
        .trainers-prompt-box {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 56px 24px;
          background: rgba(14, 18, 30, 0.7);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: var(--radius-xl);
          max-width: 620px;
          margin: 0 auto;
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.5);
        }

        .prompt-pokeball-circle {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(0, 229, 255, 0.2) 0%, rgba(0, 229, 255, 0.04) 70%);
          border: 1px solid rgba(0, 229, 255, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
          box-shadow: 0 0 24px rgba(0, 229, 255, 0.3);
        }

        .prompt-title {
          font-family: var(--font-display);
          font-size: 1.4rem;
          font-weight: 800;
          color: #FFFFFF;
          letter-spacing: 0.05em;
          margin-bottom: 12px;
        }

        .prompt-desc {
          font-size: 0.92rem;
          color: var(--color-muted-gray);
          line-height: 1.6;
          max-width: 460px;
          margin-bottom: 24px;
        }
        .prompt-desc code {
          background: rgba(0, 229, 255, 0.15);
          color: #00E5FF;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .prompt-quick-tags {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          justify-content: center;
        }
        .prompt-quick-label {
          font-size: 0.78rem;
          color: var(--color-muted-gray);
        }
        .prompt-tag-btn {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: var(--radius-full);
          padding: 4px 12px;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--color-electric-yellow);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .prompt-tag-btn:hover {
          background: rgba(255, 203, 5, 0.15);
          border-color: var(--color-electric-yellow);
          transform: translateY(-1px);
        }

        /* Results Meta */
        .trainers-results-meta {
          position: relative;
          z-index: 1;
          font-size: 0.86rem;
          color: var(--color-muted-gray);
          margin-bottom: 18px;
        }
        .trainers-results-meta strong {
          color: #00E5FF;
        }

        /* Trainers Grid */
        .trainers-grid {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
        }

        .trainer-card-item {
          position: relative;
          background: rgba(18, 22, 34, 0.82);
          backdrop-filter: blur(14px);
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: var(--radius-lg);
          padding: 18px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          overflow: hidden;
          transition: all var(--transition-normal);
        }
        .trainer-card-item:hover {
          transform: translateY(-3px);
          border-color: rgba(0, 229, 255, 0.4);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(0, 229, 255, 0.18);
        }

        .trainer-card-glow-bar {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #00E5FF 0%, #2979FF 50%, #FFCB05 100%);
        }

        .trainer-card-top {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .trainer-card-avatar {
          width: 54px;
          height: 54px;
          border-radius: 50%;
          border: 2px solid #00E5FF;
          background: #111522;
          overflow: hidden;
          flex-shrink: 0;
          box-shadow: 0 0 12px rgba(0, 229, 255, 0.3);
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
        .trainer-card-name-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .trainer-you-pill {
          font-family: var(--font-display, inherit);
          font-size: 0.65rem;
          font-weight: 800;
          padding: 2px 7px;
          border-radius: var(--radius-full, 9999px);
          background: #00E5FF;
          color: #0B0F19;
          letter-spacing: 0.05em;
          box-shadow: 0 0 8px rgba(0, 229, 255, 0.4);
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
          font-size: 0.82rem;
          color: var(--color-electric-yellow);
          font-weight: 600;
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
