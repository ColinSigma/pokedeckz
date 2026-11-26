import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  Compass,
  Sparkles,
  Shield,
  Layers,
  Heart,
  Calendar,
  ExternalLink,
  PackageOpen,
  CheckCircle,
  FolderHeart,
  Star,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import {
  getTrainerById,
  getTrainerCollection,
  getTrainerWishlist,
  getCardById
} from '../services/api';
import PokemonCard from '../components/PokemonCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import '../styles/pages.css';

export default function TrainerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [trainer, setTrainer] = useState(null);
  const [collection, setCollection] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [enrichedCollection, setEnrichedCollection] = useState([]);
  const [enrichedWishlist, setEnrichedWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cardsLoading, setCardsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('collection'); // 'collection' | 'wishlist'

  // Load Trainer profile and their items
  useEffect(() => {
    let isMounted = true;
    const fetchTrainerData = async () => {
      setLoading(true);
      try {
        const [profRes, colRes, wishRes] = await Promise.allSettled([
          getTrainerById(id),
          getTrainerCollection(id),
          getTrainerWishlist(id)
        ]);

        if (profRes.status === 'fulfilled' && profRes.value.success) {
          if (isMounted) setTrainer(profRes.value.data);
        }

        const rawCol = colRes.status === 'fulfilled' && colRes.value.success ? colRes.value.data || [] : [];
        const rawWish = wishRes.status === 'fulfilled' && wishRes.value.success ? wishRes.value.data || [] : [];

        if (isMounted) {
          setCollection(rawCol);
          setWishlist(rawWish);
          setLoading(false);
        }

        // Now enrich card metadata from TCGdex
        if (rawCol.length > 0 || rawWish.length > 0) {
          if (isMounted) setCardsLoading(true);

          const colPromises = rawCol.map(async (item) => {
            try {
              const c = await getCardById(item.card_id);
              return { ...item, cardData: c.data || c };
            } catch {
              return { ...item, cardData: { id: item.card_id, name: 'Pokémon Card' } };
            }
          });

          const wishPromises = rawWish.map(async (item) => {
            try {
              const c = await getCardById(item.card_id);
              return { ...item, cardData: c.data || c };
            } catch {
              return { ...item, cardData: { id: item.card_id, name: 'Pokémon Card' } };
            }
          });

          const [enCol, enWish] = await Promise.all([
            Promise.all(colPromises),
            Promise.all(wishPromises)
          ]);

          if (isMounted) {
            setEnrichedCollection(enCol);
            setEnrichedWishlist(enWish);
            setCardsLoading(false);
          }
        }
      } catch (err) {
        console.error('Failed to load trainer detail:', err);
        if (isMounted) setLoading(false);
      }
    };

    fetchTrainerData();
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="trainer-detail-page">
        <button className="cd-back-btn" onClick={() => navigate('/trainers')}>
          <ArrowLeft size={16} /> Back to Trainers
        </button>
        <LoadingSkeleton type="detail" />
      </div>
    );
  }

  if (!trainer) {
    return (
      <div className="trainer-detail-page">
        <button className="cd-back-btn" onClick={() => navigate('/trainers')}>
          <ArrowLeft size={16} /> Back to Trainers
        </button>
        <div className="empty-state">
          <Users size={52} className="empty-state-icon" />
          <h2 className="empty-state-title">Trainer Not Found</h2>
          <p className="empty-state-message">This trainer passport could not be found in the League Registry.</p>
          <Link to="/trainers" className="empty-state-action">
            Browse All Trainers
          </Link>
        </div>
      </div>
    );
  }

  const avatarUrl =
    trainer.avatar_url ||
    'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png';
  const joinedDate = trainer.created_at
    ? new Date(trainer.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })
    : null;

  const isSelf = user?.id === trainer.id;

  return (
    <div className="trainer-detail-page">
      <div className="trainer-detail-hero-backdrop" />

      {/* Back button */}
      <button className="cd-back-btn" onClick={() => navigate(-1)}>
        <ArrowLeft size={16} /> Back
      </button>

      {/* Trainer Passport Banner */}
      <div className="trainer-passport-banner">
        <div className="passport-glow-bar" />

        {isSelf && (
          <div className="passport-self-banner">
            <UserCheck size={15} color="#00E5FF" />
            <span>You are viewing your own public trainer passport (as seen by other trainers).</span>
          </div>
        )}

        <div className="passport-main-row">
          <div className="passport-avatar-wrap">
            <img src={avatarUrl} alt={trainer.username} />
          </div>

          <div className="passport-info">
            <div className="passport-title-row">
              <h1 className="passport-name">{trainer.full_name || 'Pokémon Trainer'}</h1>
              {isSelf && <span className="passport-you-badge">YOU</span>}
            </div>

            <div className="passport-subline">
              <span className="passport-handle">@{trainer.username || 'trainer'}</span>
              {joinedDate && (
                <span className="passport-join-date">
                  <Calendar size={13} /> Joined {joinedDate}
                </span>
              )}
            </div>

            <div className="passport-tags-row">
              {trainer.favorite_type && (
                <span className={`type-badge ${trainer.favorite_type.toLowerCase()}`}>
                  Favorite: {trainer.favorite_type}
                </span>
              )}
              {trainer.region && (
                <span className="trainer-badge-region">
                  <Compass size={12} /> {trainer.region} Region
                </span>
              )}
            </div>

            {trainer.bio && (
              <p className="passport-bio">"{trainer.bio}"</p>
            )}
          </div>
        </div>

        {/* Quick Trainer Stats Bar */}
        <div className="passport-stats-bar">
          <div className="passport-stat-item">
            <span className="passport-stat-num">{collection.length}</span>
            <span className="passport-stat-lbl">Cards in Binder</span>
          </div>
          <div className="passport-stat-item">
            <span className="passport-stat-num">{wishlist.length}</span>
            <span className="passport-stat-lbl">Cards on Wishlist</span>
          </div>
          <div className="passport-stat-item">
            <span className="passport-stat-num" style={{ color: '#00E5FF' }}>
              {trainer.favorite_type || 'Classic'}
            </span>
            <span className="passport-stat-lbl">Primary Affinity</span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="trainer-view-tabs">
        <button
          className={`trainer-view-tab ${activeTab === 'collection' ? 'active' : ''}`}
          onClick={() => setActiveTab('collection')}
        >
          <FolderHeart size={16} />
          <span>Collection Binder ({collection.length})</span>
        </button>

        <button
          className={`trainer-view-tab ${activeTab === 'wishlist' ? 'active' : ''}`}
          onClick={() => setActiveTab('wishlist')}
        >
          <Star size={16} />
          <span>Wishlist ({wishlist.length})</span>
        </button>
      </div>

      {/* Active Tab Content */}
      <div className="trainer-tab-content">
        {activeTab === 'collection' ? (
          <div>
            {cardsLoading ? (
              <LoadingSkeleton type="grid" />
            ) : enrichedCollection.length > 0 ? (
              <div className="card-grid">
                {enrichedCollection.map((item) => (
                  <div key={item.id || item.card_id} className="trainer-card-wrapper">
                    <PokemonCard card={item.cardData} />
                    <div className="trainer-card-overlay-meta">
                      <span className="trainer-card-condition-tag">
                        {item.condition || 'Near Mint'}
                      </span>
                      {item.quantity > 1 && (
                        <span className="trainer-card-qty-tag">
                          {item.quantity}x
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <PackageOpen size={48} className="empty-state-icon" />
                <h3 className="empty-state-title">Binder is Empty</h3>
                <p className="empty-state-message">
                  {trainer.full_name || 'This trainer'} hasn't added any cards to their collection binder yet.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div>
            {cardsLoading ? (
              <LoadingSkeleton type="grid" />
            ) : enrichedWishlist.length > 0 ? (
              <div className="card-grid">
                {enrichedWishlist.map((item) => (
                  <div key={item.id || item.card_id} className="trainer-card-wrapper">
                    <PokemonCard card={item.cardData} />
                    <div className="trainer-card-overlay-meta">
                      <span className="trainer-card-wish-tag">
                        <Heart size={11} fill="var(--color-red)" /> Seeking
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <Star size={48} className="empty-state-icon" />
                <h3 className="empty-state-title">Wishlist is Empty</h3>
                <p className="empty-state-message">
                  {trainer.full_name || 'This trainer'} currently has no cards on their wishlist.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        .trainer-detail-page {
          position: relative;
          padding-top: 12px;
          padding-bottom: 56px;
        }

        .trainer-detail-hero-backdrop {
          position: fixed;
          inset: 0;
          width: 100vw;
          height: 100vh;
          background-image:
            linear-gradient(180deg, rgba(8, 12, 22, 0.7) 0%, rgba(10, 14, 26, 0.9) 60%, rgba(10, 14, 26, 0.98) 100%),
            radial-gradient(circle at 75% 25%, rgba(0, 229, 255, 0.16) 0%, transparent 60%),
            radial-gradient(circle at 25% 65%, rgba(255, 203, 5, 0.12) 0%, transparent 50%),
            url('/images/cynthia-bg.jpg');
          background-size: cover;
          background-position: center 30%;
          background-repeat: no-repeat;
          z-index: 0;
          pointer-events: none;
        }

        /* Passport Banner */
        .trainer-passport-banner {
          position: relative;
          z-index: 1;
          background: rgba(18, 22, 34, 0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-xl);
          padding: 28px 24px 20px;
          margin-bottom: 28px;
          overflow: hidden;
          box-shadow: 0 16px 48px rgba(0,0,0,0.6);
        }

        .passport-glow-bar {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #00E5FF 0%, #FFCB05 50%, #FF5252 100%);
        }

        .passport-main-row {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 18px;
          margin-bottom: 22px;
        }
        @media (min-width: 600px) {
          .passport-main-row {
            flex-direction: row;
            text-align: left;
            align-items: center;
            gap: 24px;
          }
        }

        .passport-avatar-wrap {
          width: 96px;
          height: 96px;
          border-radius: 50%;
          border: 3px solid var(--color-electric-yellow);
          box-shadow: 0 0 24px rgba(255, 203, 5, 0.35);
          overflow: hidden;
          background: #141824;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .passport-avatar-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .passport-info {
          flex: 1;
          min-width: 0;
        }

        .passport-self-banner {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          margin-bottom: 20px;
          background: rgba(0, 229, 255, 0.1);
          border: 1px solid rgba(0, 229, 255, 0.35);
          border-radius: var(--radius-md);
          font-size: 0.85rem;
          color: #00E5FF;
          font-weight: 600;
        }

        .passport-title-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .passport-you-badge {
          display: inline-block;
          font-family: var(--font-display);
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          padding: 3px 10px;
          border-radius: var(--radius-full);
          background: linear-gradient(135deg, #00E5FF 0%, #2979FF 100%);
          color: #0B0F19;
          box-shadow: 0 0 12px rgba(0, 229, 255, 0.4);
        }
        @media (min-width: 600px) {
          .passport-title-row {
            justify-content: flex-start;
          }
        }

        .passport-name {
          font-family: var(--font-display);
          font-size: clamp(1.8rem, 4vw, 2.6rem);
          font-weight: 900;
          color: var(--color-white);
          margin: 0;
          letter-spacing: -0.02em;
          line-height: 1.1;
        }

        .passport-id-badge {
          display: inline-block;
          font-family: monospace;
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--color-electric-yellow);
          background: rgba(255, 203, 5, 0.12);
          border: 1px solid rgba(255, 203, 5, 0.3);
          padding: 3px 10px;
          border-radius: var(--radius-full);
        }

        .passport-subline {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          margin-top: 4px;
          font-size: 0.88rem;
        }
        @media (min-width: 600px) {
          .passport-subline {
            justify-content: flex-start;
          }
        }

        .passport-handle {
          color: var(--color-electric-yellow);
          font-weight: 700;
        }

        .passport-join-date {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          color: var(--color-muted-gray);
        }

        .passport-tags-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 10px;
          flex-wrap: wrap;
        }
        @media (min-width: 600px) {
          .passport-tags-row {
            justify-content: flex-start;
          }
        }

        .passport-bio {
          font-style: italic;
          font-size: 0.88rem;
          color: var(--color-muted-gray);
          margin-top: 10px;
          line-height: 1.5;
        }

        /* Stats Bar */
        .passport-stats-bar {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          padding-top: 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          text-align: center;
        }
        .passport-stat-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .passport-stat-num {
          font-family: var(--font-display);
          font-size: 1.6rem;
          font-weight: 900;
          color: var(--color-white);
          line-height: 1;
        }
        .passport-stat-lbl {
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--color-muted-gray);
        }

        /* Tabs */
        .trainer-view-tabs {
          position: relative;
          z-index: 1;
          display: flex;
          gap: 10px;
          margin-bottom: 24px;
        }

        .trainer-view-tab {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 22px;
          background: rgba(18, 22, 34, 0.75);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: var(--radius-sm);
          font-family: var(--font-display);
          font-size: 0.88rem;
          font-weight: 800;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: var(--color-muted-gray);
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .trainer-view-tab:hover {
          color: var(--color-white);
          border-color: rgba(255, 255, 255, 0.25);
        }
        .trainer-view-tab.active {
          color: var(--color-white);
          background: rgba(0, 229, 255, 0.14);
          border-color: #00E5FF;
          box-shadow: 0 0 16px rgba(0, 229, 255, 0.25);
        }

        /* Content */
        .trainer-tab-content {
          position: relative;
          z-index: 1;
        }

        .trainer-card-wrapper {
          position: relative;
        }

        .trainer-card-overlay-meta {
          position: absolute;
          top: 8px;
          left: 8px;
          display: flex;
          gap: 6px;
          z-index: 2;
        }

        .trainer-card-condition-tag {
          font-size: 0.65rem;
          font-weight: 700;
          text-transform: uppercase;
          background: rgba(10, 14, 22, 0.88);
          backdrop-filter: blur(6px);
          color: #a5d6a7;
          border: 1px solid rgba(76, 175, 80, 0.35);
          padding: 2px 7px;
          border-radius: var(--radius-sm);
        }

        .trainer-card-qty-tag {
          font-size: 0.65rem;
          font-weight: 800;
          font-family: var(--font-display);
          background: var(--color-electric-yellow);
          color: #111;
          padding: 2px 6px;
          border-radius: var(--radius-sm);
        }

        .trainer-card-wish-tag {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 0.65rem;
          font-weight: 700;
          text-transform: uppercase;
          background: rgba(10, 14, 22, 0.88);
          backdrop-filter: blur(6px);
          color: #ef9a9a;
          border: 1px solid rgba(229, 57, 53, 0.35);
          padding: 2px 7px;
          border-radius: var(--radius-sm);
        }
      `}</style>
    </div>
  );
}
