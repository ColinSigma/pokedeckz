import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Heart,
  FolderPlus,
  Trash2,
  Plus,
  Minus,
  Sparkles,
  Info,
  CheckCircle,
  RotateCcw
} from 'lucide-react';
import {
  getCardById,
  getCollection,
  addToCollection,
  updateCollectionItem,
  deleteCollectionItem,
  getWishlist,
  addToWishlist,
  removeFromWishlist
} from '../services/api';
import { useAuth } from '../hooks/useAuth';
import LoadingSkeleton from '../components/LoadingSkeleton';
import Toast from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import '../styles/pages.css';

const CONDITIONS = [
  'Near Mint',
  'Lightly Played',
  'Moderately Played',
  'Heavily Played',
  'Damaged'
];

// Pokemon TCG back-of-card image
const CARD_BACK_URL = 'https://archives.bulbagarden.net/media/upload/thumb/1/17/Cardback.jpg/250px-Cardback.jpg';

export default function CardDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imgError, setImgError] = useState(false);

  // 3D card flip state
  const [isFlipped, setIsFlipped] = useState(false);

  // User collection & wishlist state
  const [collectionItem, setCollectionItem] = useState(null);
  const [wishlistItem, setWishlistItem] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Dialog & Toast
  const [toast, setToast] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Load card data
  useEffect(() => {
    let isMounted = true;
    async function loadCard() {
      setLoading(true);
      setError(null);
      try {
        const response = await getCardById(id);
        const cardData = response.data || response;
        if (!cardData || !cardData.id) {
          throw new Error('Card not found in the Pokémon TCG database.');
        }
        if (isMounted) setCard(cardData);
      } catch (err) {
        if (isMounted) setError(err.message || 'Failed to retrieve card data');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadCard();
    return () => { isMounted = false; };
  }, [id]);

  // Load user collection & wishlist status
  const checkUserStatus = async () => {
    if (!user) { setCollectionItem(null); setWishlistItem(null); return; }
    try {
      const [colRes, wishRes] = await Promise.allSettled([getCollection(), getWishlist()]);
      if (colRes.status === 'fulfilled') {
        const colData = colRes.value.data || colRes.value || [];
        setCollectionItem(colData.find(item => item.card_id === id) || null);
      }
      if (wishRes.status === 'fulfilled') {
        const wishData = wishRes.value.data || wishRes.value || [];
        setWishlistItem(wishData.find(item => item.card_id === id) || null);
      }
    } catch (err) {
      console.error('Error fetching user status:', err);
    }
  };

  useEffect(() => { checkUserStatus(); }, [id, user]);

  const handleAddToCollection = async () => {
    if (!user) { navigate('/login'); return; }
    setActionLoading(true);
    try {
      const res = await addToCollection(id, 1, 'Near Mint');
      setCollectionItem(res.data || res);
      showToast(`Added ${card.name} to your collection!`);
      if (wishlistItem) {
        try { await removeFromWishlist(wishlistItem.id); setWishlistItem(null); } catch (_) {}
      }
    } catch (err) {
      showToast(err.message || 'Failed to add card to collection', 'error');
    } finally { setActionLoading(false); }
  };

  const handleQuantityChange = async (newQty) => {
    if (!collectionItem || actionLoading) return;
    if (newQty <= 0) { setShowDeleteConfirm(true); return; }
    setActionLoading(true);
    try {
      const res = await updateCollectionItem(collectionItem.id, { quantity: newQty, condition: collectionItem.condition });
      setCollectionItem(res.data || res);
      showToast(`Quantity updated to ${newQty}`);
    } catch (err) {
      showToast(err.message || 'Failed to update quantity', 'error');
    } finally { setActionLoading(false); }
  };

  const handleConditionChange = async (newCondition) => {
    if (!collectionItem || actionLoading) return;
    setActionLoading(true);
    try {
      const res = await updateCollectionItem(collectionItem.id, { condition: newCondition, quantity: collectionItem.quantity });
      setCollectionItem(res.data || res);
      showToast(`Condition updated to ${newCondition}`);
    } catch (err) {
      showToast(err.message || 'Failed to update condition', 'error');
    } finally { setActionLoading(false); }
  };

  const handleDeleteFromCollection = async () => {
    if (!collectionItem || actionLoading) return;
    setActionLoading(true);
    try {
      await deleteCollectionItem(collectionItem.id);
      setCollectionItem(null);
      setShowDeleteConfirm(false);
      showToast(`Removed ${card.name} from collection`);
    } catch (err) {
      showToast(err.message || 'Failed to remove card from collection', 'error');
    } finally { setActionLoading(false); }
  };

  const handleToggleWishlist = async () => {
    if (!user) { navigate('/login'); return; }
    setActionLoading(true);
    try {
      if (wishlistItem) {
        await removeFromWishlist(wishlistItem.id);
        setWishlistItem(null);
        showToast(`Removed ${card.name} from your wishlist`);
      } else {
        const res = await addToWishlist(id);
        setWishlistItem(res.data || res);
        showToast(`Added ${card.name} to your wishlist!`);
      }
    } catch (err) {
      showToast(err.message || 'Failed to update wishlist', 'error');
    } finally { setActionLoading(false); }
  };

  if (loading) {
    return (
      <div className="card-detail-page">
        <button className="cd-back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Back
        </button>
        <LoadingSkeleton type="detail" />
      </div>
    );
  }

  if (error || !card) {
    return (
      <div className="card-detail-page">
        <button className="cd-back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Back
        </button>
        <div className="empty-state">
          <Info size={48} className="empty-state-icon" />
          <h2 className="empty-state-title">Card Not Found</h2>
          <p className="empty-state-message">{error || 'The requested card could not be retrieved.'}</p>
          <button className="empty-state-action" onClick={() => navigate('/catalog')}>Return to Catalog</button>
        </div>
      </div>
    );
  }

  const highImageUrl = card.image ? `${card.image}/high.webp` : null;
  const isPokemon = card.category === 'Pokemon' || (!card.category && card.hp);

  return (
    <div className="card-detail-page">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <button className="cd-back-btn" onClick={() => navigate(-1)}>
        <ArrowLeft size={16} /> Back
      </button>

      <div className="cd-layout">
        {/* ── Left: 3D Rotating Card ── */}
        <div className="cd-card-column">
          {/* 3D Flip Scene */}
          <div className="cd-flip-scene" onClick={() => setIsFlipped(f => !f)}>
            <div className={`cd-flip-card ${isFlipped ? 'is-flipped' : ''}`}>
              {/* Front */}
              <div className="cd-flip-face cd-flip-front">
                {highImageUrl && !imgError ? (
                  <img
                    src={highImageUrl}
                    alt={card.name}
                    className="cd-card-img"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="cd-img-fallback">
                    <Sparkles size={48} />
                    <span>Image unavailable</span>
                  </div>
                )}
              </div>
              {/* Back */}
              <div className="cd-flip-face cd-flip-back">
                <img
                  src={CARD_BACK_URL}
                  alt="Card back"
                  className="cd-card-img"
                />
              </div>
            </div>
          </div>

          <button
            className="cd-flip-hint"
            onClick={() => setIsFlipped(f => !f)}
            aria-label="Flip card"
          >
            <RotateCcw size={14} />
            {isFlipped ? 'See front' : 'Flip card'}
          </button>

          {/* Owned badge below card */}
          {collectionItem && (
            <div className="cd-owned-badge">
              <CheckCircle size={14} />
              Owned: {collectionItem.quantity}x — {collectionItem.condition}
            </div>
          )}
        </div>

        {/* ── Right: Card Info ── */}
        <div className="cd-info-column">
          {/* Name + HP */}
          <div className="cd-name-row">
            <h1 className="cd-name">{card.name}</h1>
            {card.hp && (
              <span className="cd-hp">
                {card.hp}<small>HP</small>
              </span>
            )}
          </div>

          {/* Set / Series */}
          <div className="cd-set-line">
            <span>{card.set?.name || 'Standard Set'}</span>
            {card.localId && <span className="cd-set-id">#{card.localId}</span>}
            {card.set?.series && <span className="cd-set-series">· {card.set.series}</span>}
          </div>

          {/* Type Badges */}
          <div className="cd-badges">
            {card.category && <span className="type-badge colorless">{card.category}</span>}
            {card.types?.map(t => (
              <span key={t} className={`type-badge ${t.toLowerCase()}`}>{t}</span>
            ))}
            {card.rarity && (
              <span className="type-badge" style={{ border: '1px solid var(--color-electric-yellow)', color: 'var(--color-electric-yellow)' }}>
                {card.rarity}
              </span>
            )}
            {card.stage && (
              <span className="type-badge colorless">
                {card.stage}{card.evolveFrom ? ` (from ${card.evolveFrom})` : ''}
              </span>
            )}
          </div>

          {/* ── Action Panel ── */}
          <div className="cd-actions-panel">
            {!user ? (
              <div className="cd-login-prompt">
                <p>Sign in to track this card in your binder or wishlist.</p>
                <Link to="/login" className="cd-btn-primary">Sign In to Collect</Link>
              </div>
            ) : collectionItem ? (
              <div className="cd-owned-panel">
                <div className="cd-control-row">
                  <span className="cd-control-label">Quantity</span>
                  <div className="cd-qty-stepper">
                    <button
                      className="cd-stepper-btn"
                      disabled={actionLoading}
                      onClick={() => handleQuantityChange((collectionItem.quantity || 1) - 1)}
                    >
                      <Minus size={14} />
                    </button>
                    <span className="cd-stepper-val">{collectionItem.quantity}</span>
                    <button
                      className="cd-stepper-btn"
                      disabled={actionLoading}
                      onClick={() => handleQuantityChange((collectionItem.quantity || 1) + 1)}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                <div className="cd-control-row">
                  <span className="cd-control-label">Condition</span>
                  <select
                    value={collectionItem.condition || 'Near Mint'}
                    onChange={e => handleConditionChange(e.target.value)}
                    disabled={actionLoading}
                    className="cd-condition-select"
                  >
                    {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="cd-action-row">
                  <button
                    className="cd-btn-danger"
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={actionLoading}
                  >
                    <Trash2 size={15} /> Remove
                  </button>
                  <button
                    className={wishlistItem ? 'cd-btn-secondary' : 'cd-btn-outline'}
                    onClick={handleToggleWishlist}
                    disabled={actionLoading}
                  >
                    <Heart size={15} fill={wishlistItem ? 'var(--color-red)' : 'none'} />
                    {wishlistItem ? 'In Wishlist' : 'Wishlist'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="cd-action-row">
                <button className="cd-btn-primary" onClick={handleAddToCollection} disabled={actionLoading}>
                  <FolderPlus size={16} /> Add to Collection
                </button>
                <button
                  className={wishlistItem ? 'cd-btn-secondary' : 'cd-btn-outline'}
                  onClick={handleToggleWishlist}
                  disabled={actionLoading}
                >
                  <Heart size={16} fill={wishlistItem ? 'var(--color-red)' : 'none'} />
                  {wishlistItem ? 'In Wishlist' : 'Wishlist'}
                </button>
              </div>
            )}
          </div>

          {/* Flavor text */}
          {card.description && (
            <blockquote className="cd-flavor">&ldquo;{card.description}&rdquo;</blockquote>
          )}

          {/* Abilities */}
          {card.abilities?.length > 0 && (
            <div className="attacks-section">
              <h3>Abilities</h3>
              {card.abilities.map((ab, i) => (
                <div key={i} className="attack-item">
                  <div className="attack-header">
                    <span className="attack-name" style={{ color: 'var(--color-red)' }}>
                      <Sparkles size={14} style={{ display: 'inline', marginRight: 6 }} />{ab.name}
                    </span>
                    {ab.type && <span className="type-badge colorless">{ab.type}</span>}
                  </div>
                  {ab.effect && <p className="attack-description">{ab.effect}</p>}
                </div>
              ))}
            </div>
          )}

          {/* Attacks */}
          {card.attacks?.length > 0 && (
            <div className="attacks-section">
              <h3>Attacks</h3>
              {card.attacks.map((att, i) => (
                <div key={i} className="attack-item">
                  <div className="attack-header">
                    <span className="attack-name">{att.name}</span>
                    {att.damage && <span className="attack-damage">{att.damage}</span>}
                  </div>
                  {att.cost?.length > 0 && (
                    <div className="attack-cost">
                      {att.cost.map((c, ci) => (
                        <span key={ci} className={`type-badge ${c.toLowerCase()}`}>{c}</span>
                      ))}
                    </div>
                  )}
                  {att.effect && <p className="attack-description">{att.effect}</p>}
                </div>
              ))}
            </div>
          )}

          {/* Battle Stats */}
          {isPokemon && (
            <div className="cd-battle-grid">
              <div className="cd-battle-box">
                <span className="cd-battle-label">Weakness</span>
                <span className="cd-battle-val">
                  {card.weaknesses?.length > 0
                    ? card.weaknesses.map(w => `${w.type} ${w.value || ''}`).join(', ')
                    : 'None'}
                </span>
              </div>
              <div className="cd-battle-box">
                <span className="cd-battle-label">Resistance</span>
                <span className="cd-battle-val">
                  {card.resistances?.length > 0
                    ? card.resistances.map(r => `${r.type} ${r.value || ''}`).join(', ')
                    : 'None'}
                </span>
              </div>
              <div className="cd-battle-box">
                <span className="cd-battle-label">Retreat</span>
                <span className="cd-battle-val">
                  {card.retreat !== undefined ? `${card.retreat} Energy` : 'None'}
                </span>
              </div>
            </div>
          )}

          {/* Meta footer */}
          <div className="cd-meta-footer">
            {card.illustrator && (
              <div className="cd-meta-line">
                <span className="cd-meta-label">Illustrator</span>
                <span className="cd-meta-val">{card.illustrator}</span>
              </div>
            )}
            {card.set?.id && (
              <div className="cd-meta-line">
                <span className="cd-meta-label">Set Code</span>
                <span className="cd-meta-val">{card.set.id.toUpperCase()}</span>
              </div>
            )}
            {card.variants && (
              <div className="cd-meta-line">
                <span className="cd-meta-label">Variants</span>
                <span className="cd-meta-val">
                  {Object.entries(card.variants).filter(([, v]) => Boolean(v)).map(([k]) => k).join(', ') || 'Standard'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Remove from Collection?"
        message={`Remove ${card.name} from your Pokédeckz binder?`}
        confirmLabel="Remove"
        onConfirm={handleDeleteFromCollection}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      <style>{`
        /* ── Card Detail Page ── */
        .card-detail-page {
          padding-top: 16px;
          padding-bottom: 48px;
        }
        .cd-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: var(--font-display);
          font-size: 0.82rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--color-muted-gray);
          background: transparent;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: var(--radius-sm);
          padding: 7px 14px;
          cursor: pointer;
          margin-bottom: 32px;
          transition: color var(--transition-fast), border-color var(--transition-fast);
        }
        .cd-back-btn:hover { color: var(--color-white); border-color: rgba(255,255,255,0.25); }

        /* ── Layout ── */
        .cd-layout {
          display: flex;
          flex-direction: column;
          gap: 36px;
        }
        @media (min-width: 769px) {
          .cd-layout {
            flex-direction: row;
            gap: 56px;
            align-items: flex-start;
          }
        }

        /* ── Left column ── */
        .cd-card-column {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          flex-shrink: 0;
        }
        @media (min-width: 769px) {
          .cd-card-column {
            position: sticky;
            top: 80px;
            width: 300px;
          }
        }

        /* ── 3D Flip Scene ── */
        .cd-flip-scene {
          width: 100%;
          max-width: 280px;
          aspect-ratio: 2.5 / 3.5;
          perspective: 1000px;
          cursor: pointer;
        }
        .cd-flip-card {
          width: 100%;
          height: 100%;
          position: relative;
          transform-style: preserve-3d;
          transition: transform 0.75s cubic-bezier(0.16, 1, 0.3, 1);
          /* Slow continuous tilt animation when not flipped */
          animation: cardFloat 6s ease-in-out infinite;
          border-radius: 12px;
          box-shadow:
            0 24px 60px rgba(0,0,0,0.75),
            0 0 40px rgba(255,203,5,0.08),
            0 0 0 1px rgba(255,255,255,0.06);
        }
        .cd-flip-card.is-flipped {
          transform: rotateY(180deg);
          animation: none;
        }
        @keyframes cardFloat {
          0%   { transform: rotateY(-4deg) rotateX(2deg) translateY(0px); box-shadow: 0 24px 60px rgba(0,0,0,0.75), 0 0 40px rgba(255,203,5,0.08); }
          25%  { transform: rotateY(0deg)  rotateX(0deg) translateY(-6px); box-shadow: 0 32px 70px rgba(0,0,0,0.65), 0 0 50px rgba(255,203,5,0.12); }
          50%  { transform: rotateY(4deg)  rotateX(-2deg) translateY(-2px); box-shadow: 0 20px 50px rgba(0,0,0,0.8), 0 0 35px rgba(255,203,5,0.07); }
          75%  { transform: rotateY(2deg)  rotateX(1deg) translateY(-8px); box-shadow: 0 36px 72px rgba(0,0,0,0.6), 0 0 55px rgba(255,203,5,0.14); }
          100% { transform: rotateY(-4deg) rotateX(2deg) translateY(0px); box-shadow: 0 24px 60px rgba(0,0,0,0.75), 0 0 40px rgba(255,203,5,0.08); }
        }
        .cd-flip-face {
          position: absolute;
          inset: 0;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          border-radius: 12px;
          overflow: hidden;
        }
        .cd-flip-back {
          transform: rotateY(180deg);
        }
        .cd-card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .cd-img-fallback {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          background: radial-gradient(circle at center, #252525 0%, #141414 100%);
          color: var(--color-muted-gray);
          font-size: 0.85rem;
        }

        /* Flip hint button */
        .cd-flip-hint {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: var(--font-display);
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--color-muted-gray);
          background: transparent;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: var(--radius-full);
          padding: 6px 14px;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .cd-flip-hint:hover { color: var(--color-white); border-color: rgba(255,255,255,0.3); }

        /* Owned badge */
        .cd-owned-badge {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 8px 16px;
          background: rgba(76,175,80,0.12);
          border: 1px solid rgba(76,175,80,0.3);
          border-radius: var(--radius-full);
          font-size: 0.8rem;
          font-weight: 600;
          color: #81c784;
        }

        /* ── Right column ── */
        .cd-info-column { flex: 1; min-width: 0; }

        /* Name + HP row */
        .cd-name-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 10px;
        }
        .cd-name {
          font-family: var(--font-display);
          font-size: clamp(2rem, 5vw, 3.2rem);
          font-weight: 900;
          letter-spacing: -0.03em;
          line-height: 1.0;
          color: var(--color-white);
          text-transform: uppercase;
          margin: 0;
        }
        .cd-hp {
          font-family: var(--font-display);
          font-size: 2rem;
          font-weight: 900;
          color: var(--color-red);
          line-height: 1;
          white-space: nowrap;
        }
        .cd-hp small {
          font-size: 0.75rem;
          color: var(--color-muted-gray);
          margin-left: 3px;
          font-family: var(--font-family);
        }

        /* Set line */
        .cd-set-line {
          font-size: 0.88rem;
          color: var(--color-muted-gray);
          font-weight: 500;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .cd-set-id {
          background: rgba(255,255,255,0.06);
          padding: 2px 8px;
          border-radius: var(--radius-sm);
          font-family: monospace;
          font-size: 0.8rem;
        }
        .cd-set-series { opacity: 0.7; }

        /* Badges row */
        .cd-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 24px;
        }

        /* ── Action Panel ── */
        .cd-actions-panel {
          background: var(--color-dark-surface);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: var(--radius-lg);
          padding: 20px;
          margin-bottom: 28px;
        }
        .cd-login-prompt { text-align: center; }
        .cd-login-prompt p { color: var(--color-muted-gray); font-size: 0.9rem; margin-bottom: 14px; }

        .cd-owned-panel { display: flex; flex-direction: column; gap: 14px; }
        .cd-control-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .cd-control-label {
          font-family: var(--font-display);
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--color-muted-gray);
        }
        .cd-qty-stepper {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: var(--radius-sm);
          padding: 6px 14px;
        }
        .cd-stepper-btn {
          background: transparent;
          border: none;
          color: var(--color-white);
          cursor: pointer;
          display: flex;
          align-items: center;
          padding: 2px;
          transition: color var(--transition-fast);
        }
        .cd-stepper-btn:hover { color: var(--color-electric-yellow); }
        .cd-stepper-btn:disabled { opacity: 0.3; }
        .cd-stepper-val {
          font-family: var(--font-display);
          font-weight: 900;
          font-size: 1.1rem;
          min-width: 28px;
          text-align: center;
        }
        .cd-condition-select {
          appearance: none;
          -webkit-appearance: none;
          padding: 8px 32px 8px 12px;
          background-color: rgba(255,255,255,0.05);
          background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%238899B0' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
          background-repeat: no-repeat;
          background-position: right 10px center;
          background-size: 14px;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: var(--radius-sm);
          color: var(--color-white);
          font-family: var(--font-family);
          font-size: 0.85rem;
          font-weight: 600;
          outline: none;
          cursor: pointer;
          transition: border-color var(--transition-fast);
        }
        .cd-condition-select:focus { border-color: var(--color-electric-yellow); }

        /* Action row buttons */
        .cd-action-row {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-top: 4px;
        }
        .cd-btn-primary, .cd-btn-secondary, .cd-btn-outline, .cd-btn-danger {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 11px 20px;
          font-family: var(--font-display);
          font-size: 0.88rem;
          font-weight: 800;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          border-radius: var(--radius-sm);
          border: none;
          cursor: pointer;
          text-decoration: none;
          transition: all var(--transition-fast);
        }
        .cd-btn-primary {
          background: var(--color-red);
          color: var(--color-white);
          box-shadow: 0 4px 16px rgba(229,57,53,0.35);
        }
        .cd-btn-primary:hover { background: var(--color-dark-red); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(229,57,53,0.5); }
        .cd-btn-secondary {
          background: rgba(229,57,53,0.12);
          color: var(--color-red);
          border: 1px solid rgba(229,57,53,0.3);
        }
        .cd-btn-secondary:hover { background: rgba(229,57,53,0.22); }
        .cd-btn-outline {
          background: transparent;
          color: var(--color-muted-gray);
          border: 1px solid rgba(255,255,255,0.12);
        }
        .cd-btn-outline:hover { color: var(--color-white); border-color: rgba(255,255,255,0.3); }
        .cd-btn-danger {
          background: rgba(229,57,53,0.1);
          color: #ef9a9a;
          border: 1px solid rgba(229,57,53,0.25);
        }
        .cd-btn-danger:hover { background: rgba(229,57,53,0.22); color: var(--color-white); }
        .cd-btn-primary:disabled,
        .cd-btn-secondary:disabled,
        .cd-btn-outline:disabled,
        .cd-btn-danger:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

        /* Flavor text */
        .cd-flavor {
          font-style: italic;
          color: var(--color-muted-gray);
          padding: 14px 18px;
          border-left: 3px solid var(--color-red);
          background: rgba(255,255,255,0.025);
          margin-bottom: 24px;
          border-radius: 0 var(--radius-md) var(--radius-md) 0;
          font-size: 0.92rem;
          line-height: 1.6;
        }

        /* Battle grid */
        .cd-battle-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin: 20px 0;
        }
        @media (max-width: 480px) {
          .cd-battle-grid { grid-template-columns: 1fr 1fr; }
        }
        .cd-battle-box {
          background: var(--color-dark-surface);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: var(--radius-md);
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .cd-battle-label {
          font-family: var(--font-display);
          font-size: 0.65rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--color-muted-gray);
        }
        .cd-battle-val {
          font-size: 0.88rem;
          font-weight: 700;
          color: var(--color-white);
        }

        /* Meta footer */
        .cd-meta-footer {
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid rgba(255,255,255,0.07);
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .cd-meta-line {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.85rem;
        }
        .cd-meta-label {
          font-family: var(--font-display);
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--color-muted-gray);
        }
        .cd-meta-val { font-weight: 600; color: var(--color-white); }
      `}</style>
    </div>
  );
}
