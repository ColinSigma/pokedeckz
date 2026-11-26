import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import HeroBackdropPokemon from '../components/HeroBackdropPokemon';
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
  MoveHorizontal
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
import { getRarityBadgeStyle } from '../utils/rarity';
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

const CARD_BACK_IMG = '/images/card-back.jpg';
const EXTENSIONS = ['/high.webp', '/high.png', '/low.webp', '/low.png'];

export default function CardDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [extIndex, setExtIndex] = useState(0);
  const [imgFailed, setImgFailed] = useState(false);

  // 3D Continuous / Endless Interactive Rotation State
  const [rotationY, setRotationY] = useState(0);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartRotRef = useRef(0);
  const animFrameRef = useRef(null);
  const lastTimeRef = useRef(null);

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
      setExtIndex(0);
      setImgFailed(false);
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

  // Smooth continuous forward rotation loop that never resets back
  useEffect(() => {
    const loop = (timestamp) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = timestamp;
      }
      const delta = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;

      if (!isDraggingRef.current) {
        // Smoothly rotate forward continuously without resetting or jerking back
        setRotationY((prev) => prev + delta * 22);
      }
      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // Touch & Mouse Drag Handlers to freely rotate the card to any angle
  const handlePointerDown = (e) => {
    isDraggingRef.current = true;
    dragStartXRef.current = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    dragStartRotRef.current = rotationY;
  };

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current) return;
    const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const diff = clientX - dragStartXRef.current;
    // Map drag distance smoothly to rotation angle
    setRotationY(dragStartRotRef.current + diff * 0.9);
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  // Collection & Wishlist checks
  const checkUserStatus = async () => {
    if (!user) { setCollectionItem(null); setWishlistItem(null); return; }
    try {
      const [colRes, wishRes] = await Promise.allSettled([getCollection(), getWishlist()]);
      if (colRes.status === 'fulfilled') {
        const colData = colRes.value.data || colRes.value || [];
        setCollectionItem(colData.find((item) => item.card_id === id) || null);
      }
      if (wishRes.status === 'fulfilled') {
        const wishData = wishRes.value.data || wishRes.value || [];
        setWishlistItem(wishData.find((item) => item.card_id === id) || null);
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
        <div className="card-detail-hero-backdrop">
        <HeroBackdropPokemon page="card-detail" />
      </div>
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
        <div className="card-detail-hero-backdrop">
        <HeroBackdropPokemon page="card-detail" />
      </div>
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

  // Multi-tier image resolution
  const getBaseImageUrl = () => {
    if (card.image) return card.image;
    if (card.set?.id && card.localId) {
      return `https://assets.tcgdex.net/en/${card.set.id}/${card.localId}`;
    }
    return null;
  };

  const baseImg = getBaseImageUrl();
  const currentCardImgUrl = baseImg
    ? `${baseImg}${EXTENSIONS[extIndex]}`
    : (card.id === 'miscp-001' ? 'https://images.pokemontcg.io/basep/8_hires.png' : null);

  const handleImageError = () => {
    if (extIndex < EXTENSIONS.length - 1) {
      setExtIndex(extIndex + 1);
    } else {
      setImgFailed(true);
    }
  };

  const isPokemon = card.category === 'Pokemon' || (!card.category && card.hp);

  return (
    <div
      className="card-detail-page"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Full Page Dedicated Backdrop */}
      <div className="card-detail-hero-backdrop">
        <HeroBackdropPokemon page="card-detail" />
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <button className="cd-back-btn" onClick={() => navigate(-1)}>
        <ArrowLeft size={16} /> Back
      </button>

      <div className="cd-layout">
        {/* ── Left Column: 360° Hero Card (Larger, No Empty Space) ── */}
        <div className="cd-card-column">
          {/* 3D Viewport with Perspective */}
          <div
            className="cd-3d-viewport"
            onPointerDown={handlePointerDown}
            title="Drag horizontally to inspect card in 3D"
          >
            <div
              className="cd-3d-card"
              style={{
                transform: `rotateY(${rotationY}deg)`,
              }}
            >
              {/* Front Face: Authentic Scanned Card Art */}
              <div className="cd-card-face cd-card-front">
                {currentCardImgUrl && !imgFailed ? (
                  <img
                    src={currentCardImgUrl}
                    alt={card.name}
                    className="cd-card-face-img"
                    onError={handleImageError}
                    draggable="false"
                  />
                ) : (
                  <img
                    src={CARD_BACK_IMG}
                    alt={card.name}
                    className="cd-card-face-img"
                    draggable="false"
                  />
                )}
              </div>

              {/* Back Face: Clean Authentic Pokémon Card Back */}
              <div className="cd-card-face cd-card-back">
                <img
                  src={CARD_BACK_IMG}
                  alt="Official Pokémon Card Back"
                  className="cd-card-face-img"
                  draggable="false"
                />
              </div>
            </div>

            {/* Dynamic Ground Shadow that shifts realistically with angle */}
            <div
              className="cd-card-ground-shadow"
              style={{
                transform: `scaleX(${0.5 + 0.5 * Math.abs(Math.cos((rotationY * Math.PI) / 180))})`,
                opacity: 0.55 + 0.3 * Math.abs(Math.sin((rotationY * Math.PI) / 180)),
              }}
            />
          </div>

          {/* Minimal Drag Hint Pill (Replaces the clunky hotbar box) */}
          <div className="cd-drag-hint-pill">
            <MoveHorizontal size={14} className="cd-hint-icon" />
            <span>Drag card to rotate in 3D</span>
          </div>

          {/* Owned status badge */}
          {collectionItem && (
            <div className="cd-owned-badge">
              <CheckCircle size={14} />
              Owned: {collectionItem.quantity}x — {collectionItem.condition}
            </div>
          )}
        </div>

        {/* ── Right Column: Card Details & Editorial Info ── */}
        <div className="cd-info-column">
          {/* Title + HP */}
          <div className="cd-name-row">
            <h1 className="cd-name">{card.name}</h1>
            {card.hp && (
              <span className="cd-hp">
                {card.hp}<small>HP</small>
              </span>
            )}
          </div>

          {/* Set / Series Info */}
          <div className="cd-set-line">
            <span>{card.set?.name || 'Standard Set'}</span>
            {card.localId && <span className="cd-set-id">#{card.localId}</span>}
            {card.set?.series && <span className="cd-set-series">· {card.set.series}</span>}
          </div>

          {/* Badges */}
          <div className="cd-badges">
            {card.category && (
              <span
                className={`type-badge ${
                  card.category.toLowerCase().includes('pokemon') || card.category.toLowerCase().includes('pokémon')
                    ? 'pokemon'
                    : 'colorless'
                }`}
              >
                {card.category}
              </span>
            )}
            {card.types?.map((t) => (
              <span key={t} className={`type-badge ${t.toLowerCase()}`}>{t}</span>
            ))}
            {card.rarity && (
              <span
                className="type-badge rarity-badge"
                style={getRarityBadgeStyle(card.rarity)}
              >
                {card.rarity}
              </span>
            )}
            {card.stage && (
              <span className="type-badge colorless">
                {card.stage}{card.evolveFrom ? ` (from ${card.evolveFrom})` : ''}
              </span>
            )}
          </div>

          {/* Action Shelf */}
          <div className="cd-actions-panel">
            {!user ? (
              <div className="cd-login-prompt">
                <p>Sign in to record this card into your personal collection or wishlist.</p>
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
                    onChange={(e) => handleConditionChange(e.target.value)}
                    disabled={actionLoading}
                    className="cd-condition-select"
                  >
                    {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
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

          {/* Flavor Text */}
          {card.description && (
            <blockquote className="cd-flavor">&ldquo;{card.description}&rdquo;</blockquote>
          )}

          {/* Special Abilities */}
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

          {/* Battle Mechanics */}
          {isPokemon && (
            <div className="cd-battle-grid">
              <div className="cd-battle-box">
                <span className="cd-battle-label">Weakness</span>
                <span className="cd-battle-val">
                  {card.weaknesses?.length > 0
                    ? card.weaknesses.map((w) => `${w.type} ${w.value || ''}`).join(', ')
                    : 'None'}
                </span>
              </div>
              <div className="cd-battle-box">
                <span className="cd-battle-label">Resistance</span>
                <span className="cd-battle-val">
                  {card.resistances?.length > 0
                    ? card.resistances.map((r) => `${r.type} ${r.value || ''}`).join(', ')
                    : 'None'}
                </span>
              </div>
              <div className="cd-battle-box">
                <span className="cd-battle-label">Retreat Cost</span>
                <span className="cd-battle-val">
                  {card.retreat !== undefined ? `${card.retreat} Energy` : 'None'}
                </span>
              </div>
            </div>
          )}

          {/* Metadata */}
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
        /* ── Page Layout ── */
        .card-detail-page {
          position: relative;
          padding-top: 16px;
          padding-bottom: 56px;
        }

        .cd-back-btn {
          position: relative;
          z-index: 1;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: var(--font-display);
          font-size: 0.85rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--color-muted-gray);
          background: rgba(18, 22, 32, 0.7);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-sm);
          padding: 8px 16px;
          cursor: pointer;
          margin-bottom: 28px;
          transition: all var(--transition-fast);
        }
        .cd-back-btn:hover {
          color: var(--color-white);
          border-color: rgba(255, 255, 255, 0.3);
          transform: translateX(-2px);
        }

        .cd-layout {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          gap: 36px;
        }
        @media (min-width: 769px) {
          .cd-layout {
            flex-direction: row;
            gap: 52px;
            align-items: flex-start;
          }
        }

        /* ── Left Column: 3D Card (Larger, No Empty Space) ── */
        .cd-card-column {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
          flex-shrink: 0;
          margin: 0 auto;
          width: 100%;
          max-width: 360px;
        }
        @media (min-width: 769px) {
          .cd-card-column {
            position: sticky;
            top: 76px;
            margin: 0;
            width: 360px;
          }
        }

        /* ── 3D Viewport — Scaled up to eliminate blank space ── */
        .cd-3d-viewport {
          position: relative;
          width: 310px;
          height: 433px;
          perspective: 1300px;
          cursor: grab;
          user-select: none;
          touch-action: pan-y;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .cd-3d-viewport:active {
          cursor: grabbing;
        }

        /* ── 3D Card Container (Exact 63/88 Pokemon card aspect ratio) ── */
        .cd-3d-card {
          width: 300px;
          height: 419px;
          position: relative;
          transform-style: preserve-3d;
          transform-origin: center center;
          transition: transform 0.04s linear;
        }

        /* ── Faces (Front and Back) ── */
        .cd-card-face {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          border-radius: 12px;
          overflow: hidden;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          background: #11141E;
          box-shadow:
            0 20px 50px rgba(0, 0, 0, 0.8),
            0 0 32px rgba(255, 203, 5, 0.12),
            inset 0 0 0 1px rgba(255, 255, 255, 0.1);
        }

        .cd-card-front {
          transform: rotateY(0deg);
        }

        .cd-card-back {
          transform: rotateY(180deg);
        }

        /* Zero white sides & perfect fit */
        .cd-card-face-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          border-radius: 12px;
          background: #11141E;
        }

        /* Realistic Ground Shadow under the card */
        .cd-card-ground-shadow {
          position: absolute;
          bottom: -18px;
          left: 8%;
          right: 8%;
          height: 20px;
          background: radial-gradient(ellipse at center, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0) 70%);
          border-radius: 50%;
          pointer-events: none;
          transition: transform 0.06s linear, opacity 0.06s linear;
        }

        /* Minimal Drag Hint Pill */
        .cd-drag-hint-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          background: rgba(22, 26, 38, 0.7);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: var(--radius-full);
          font-family: var(--font-display);
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: var(--color-muted-gray);
        }
        .cd-hint-icon {
          color: var(--color-electric-yellow);
        }

        .cd-owned-badge {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 8px 16px;
          background: rgba(76, 175, 80, 0.15);
          border: 1px solid rgba(76, 175, 80, 0.35);
          border-radius: var(--radius-full);
          font-size: 0.82rem;
          font-weight: 700;
          color: #81c784;
        }

        /* ── Right Column: Info ── */
        .cd-info-column {
          flex: 1;
          min-width: 0;
        }

        .cd-name-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 8px;
        }

        .cd-name {
          font-family: var(--font-display);
          font-size: clamp(2.2rem, 5vw, 3.4rem);
          font-weight: 900;
          letter-spacing: -0.02em;
          line-height: 1.0;
          color: var(--color-white);
          text-transform: uppercase;
          margin: 0;
        }

        .cd-hp {
          font-family: var(--font-display);
          font-size: 2.2rem;
          font-weight: 900;
          color: var(--color-red);
          line-height: 1;
          white-space: nowrap;
        }
        .cd-hp small {
          font-size: 0.8rem;
          color: var(--color-muted-gray);
          margin-left: 3px;
          font-family: var(--font-family);
        }

        .cd-set-line {
          font-size: 0.9rem;
          color: var(--color-muted-gray);
          font-weight: 500;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .cd-set-id {
          background: rgba(255, 255, 255, 0.08);
          padding: 3px 9px;
          border-radius: var(--radius-sm);
          font-family: monospace;
          font-size: 0.82rem;
          color: var(--color-electric-yellow);
        }

        .cd-set-series {
          opacity: 0.75;
        }

        .cd-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 24px;
        }

        /* ── Action Shelf ── */
        .cd-actions-panel {
          background: rgba(18, 22, 32, 0.8);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: var(--radius-lg);
          padding: 20px;
          margin-bottom: 28px;
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
        }

        .cd-login-prompt {
          text-align: center;
        }
        .cd-login-prompt p {
          color: var(--color-muted-gray);
          font-size: 0.92rem;
          margin-bottom: 14px;
        }

        .cd-owned-panel {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .cd-control-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .cd-control-label {
          font-family: var(--font-display);
          font-size: 0.78rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--color-muted-gray);
        }

        .cd-qty-stepper {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
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
        .cd-stepper-btn:hover {
          color: var(--color-electric-yellow);
        }
        .cd-stepper-btn:disabled {
          opacity: 0.3;
        }

        .cd-stepper-val {
          font-family: var(--font-display);
          font-weight: 900;
          font-size: 1.15rem;
          min-width: 28px;
          text-align: center;
        }

        .cd-condition-select {
          appearance: none;
          -webkit-appearance: none;
          padding: 8px 32px 8px 12px;
          background-color: rgba(255, 255, 255, 0.06);
          background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%238899B0' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
          background-repeat: no-repeat;
          background-position: right 10px center;
          background-size: 14px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: var(--radius-sm);
          color: var(--color-white);
          font-family: var(--font-family);
          font-size: 0.88rem;
          font-weight: 600;
          outline: none;
          cursor: pointer;
          transition: border-color var(--transition-fast);
        }
        .cd-condition-select:focus {
          border-color: var(--color-electric-yellow);
        }

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
          padding: 11px 22px;
          font-family: var(--font-display);
          font-size: 0.9rem;
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
          background: linear-gradient(135deg, #E53935 0%, #D32F2F 100%);
          color: var(--color-white);
          box-shadow: 0 4px 18px rgba(229, 57, 53, 0.4);
        }
        .cd-btn-primary:hover {
          background: linear-gradient(135deg, #FF5252 0%, #E53935 100%);
          transform: translateY(-2px);
          box-shadow: 0 8px 26px rgba(229, 57, 53, 0.55);
        }

        .cd-btn-secondary {
          background: rgba(229, 57, 53, 0.14);
          color: var(--color-red);
          border: 1px solid rgba(229, 57, 53, 0.35);
        }
        .cd-btn-secondary:hover {
          background: rgba(229, 57, 53, 0.24);
        }

        .cd-btn-outline {
          background: rgba(255, 255, 255, 0.05);
          color: var(--color-muted-gray);
          border: 1px solid rgba(255, 255, 255, 0.12);
        }
        .cd-btn-outline:hover {
          color: var(--color-white);
          border-color: rgba(255, 255, 255, 0.3);
          background: rgba(255, 255, 255, 0.09);
        }

        .cd-btn-danger {
          background: rgba(229, 57, 53, 0.12);
          color: #ef9a9a;
          border: 1px solid rgba(229, 57, 53, 0.25);
        }
        .cd-btn-danger:hover {
          background: rgba(229, 57, 53, 0.24);
          color: var(--color-white);
        }

        .cd-flavor {
          font-style: italic;
          color: var(--color-muted-gray);
          padding: 14px 18px;
          border-left: 3px solid var(--color-red);
          background: rgba(255, 255, 255, 0.03);
          margin-bottom: 24px;
          border-radius: 0 var(--radius-md) var(--radius-md) 0;
          font-size: 0.92rem;
          line-height: 1.6;
        }

        .cd-battle-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin: 20px 0;
        }
        @media (max-width: 480px) {
          .cd-battle-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
        .cd-battle-box {
          background: rgba(18, 22, 32, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: var(--radius-md);
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .cd-battle-label {
          font-family: var(--font-display);
          font-size: 0.68rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--color-muted-gray);
        }
        .cd-battle-val {
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--color-white);
        }

        .cd-meta-footer {
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .cd-meta-line {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.88rem;
        }
        .cd-meta-label {
          font-family: var(--font-display);
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--color-muted-gray);
        }
        .cd-meta-val {
          font-weight: 600;
          color: var(--color-white);
        }
      `}</style>
    </div>
  );
}
