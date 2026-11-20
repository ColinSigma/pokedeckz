import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Heart,
  FolderPlus,
  Trash2,
  Plus,
  Minus,
  Shield,
  Zap,
  Sparkles,
  Info,
  CheckCircle,
  ExternalLink
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

export default function CardDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imgError, setImgError] = useState(false);

  // User collection & wishlist state for this card
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
          throw new Error('Card not found in the authentic Pokémon TCG database.');
        }
        if (isMounted) setCard(cardData);
      } catch (err) {
        if (isMounted) setError(err.message || 'Failed to retrieve authentic Pokémon TCG card data');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadCard();
    return () => {
      isMounted = false;
    };
  }, [id]);

  // Load user collection & wishlist status if authenticated
  const checkUserStatus = async () => {
    if (!user) {
      setCollectionItem(null);
      setWishlistItem(null);
      return;
    }

    try {
      const [colRes, wishRes] = await Promise.allSettled([
        getCollection(),
        getWishlist()
      ]);

      if (colRes.status === 'fulfilled') {
        const colData = colRes.value.data || colRes.value || [];
        const found = colData.find((item) => item.card_id === id);
        setCollectionItem(found || null);
      }

      if (wishRes.status === 'fulfilled') {
        const wishData = wishRes.value.data || wishRes.value || [];
        const foundWish = wishData.find((item) => item.card_id === id);
        setWishlistItem(foundWish || null);
      }
    } catch (err) {
      console.error('Error fetching user status:', err);
    }
  };

  useEffect(() => {
    checkUserStatus();
  }, [id, user]);

  // Collection Handlers
  const handleAddToCollection = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setActionLoading(true);
    try {
      const res = await addToCollection(id, 1, 'Near Mint');
      setCollectionItem(res.data || res);
      showToast(`Added ${card.name} to your collection!`);
      // If was in wishlist, optionally refresh
      if (wishlistItem) {
        try {
          await removeFromWishlist(wishlistItem.id);
          setWishlistItem(null);
        } catch (_) {}
      }
    } catch (err) {
      showToast(err.message || 'Failed to add card to collection', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleQuantityChange = async (newQty) => {
    if (!collectionItem || actionLoading) return;
    if (newQty <= 0) {
      setShowDeleteConfirm(true);
      return;
    }
    setActionLoading(true);
    try {
      const res = await updateCollectionItem(collectionItem.id, {
        quantity: newQty,
        condition: collectionItem.condition
      });
      setCollectionItem(res.data || res);
      showToast(`Quantity updated to ${newQty}`);
    } catch (err) {
      showToast(err.message || 'Failed to update quantity', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConditionChange = async (newCondition) => {
    if (!collectionItem || actionLoading) return;
    setActionLoading(true);
    try {
      const res = await updateCollectionItem(collectionItem.id, {
        condition: newCondition,
        quantity: collectionItem.quantity
      });
      setCollectionItem(res.data || res);
      showToast(`Condition updated to ${newCondition}`);
    } catch (err) {
      showToast(err.message || 'Failed to update condition', 'error');
    } finally {
      setActionLoading(false);
    }
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
    } finally {
      setActionLoading(false);
    }
  };

  // Wishlist Handlers
  const handleToggleWishlist = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
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
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card-detail-page">
        <button className="card-detail-back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} /> Back
        </button>
        <LoadingSkeleton type="detail" />
      </div>
    );
  }

  if (error || !card) {
    return (
      <div className="card-detail-page">
        <button className="card-detail-back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} /> Back
        </button>
        <div className="empty-state">
          <Info size={48} className="empty-state-icon" />
          <h2 className="empty-state-title">Card Not Found</h2>
          <p className="empty-state-message">
            {error || 'The requested Pokémon card could not be retrieved from the TCGdex database.'}
          </p>
          <button className="empty-state-action" onClick={() => navigate('/catalog')}>
            Return to Catalog
          </button>
        </div>
      </div>
    );
  }

  const highImageUrl = card.image
    ? `${card.image}/high.webp`
    : (card.id === 'miscp-001' ? 'https://images.pokemontcg.io/basep/8_hires.png' : null);
  const isPokemon = card.category === 'Pokemon' || (!card.category && card.hp);

  return (
    <div className="card-detail-page">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <button className="card-detail-back-btn" onClick={() => navigate(-1)}>
        <ArrowLeft size={18} /> Back
      </button>

      <div className="card-detail-layout">
        {/* Left Column: Authentic Card Art */}
        <div className="card-detail-image">
          {highImageUrl && !imgError ? (
            <img
              src={highImageUrl}
              alt={card.name}
              className="card-detail-img"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="pokemon-card-fallback" style={{ minHeight: '380px' }}>
              <Sparkles size={64} />
              <span>Image unavailable for this authentic card</span>
            </div>
          )}

          {/* Quick Collection Status Badge */}
          {collectionItem && (
            <div className="card-status-badge owned">
              <CheckCircle size={16} /> Owned: {collectionItem.quantity}x ({collectionItem.condition})
            </div>
          )}
        </div>

        {/* Right Column: Complete Authentic Metadata */}
        <div className="card-detail-info">
          <div className="card-header-meta">
            <h1>{card.name}</h1>
            {card.hp && (
              <span className="card-hp">
                {card.hp} <small>HP</small>
              </span>
            )}
          </div>

          <div className="card-detail-set">
            {card.set?.name || 'Standard Set'}
            {card.localId && ` • #${card.localId}`}
            {card.set?.series && ` • Series: ${card.set.series}`}
          </div>

          {/* Type and Category Badges */}
          <div className="card-detail-meta">
            {card.category && (
              <span className="type-badge colorless">
                {card.category}
              </span>
            )}
            {card.types &&
              card.types.map((t) => (
                <span
                  key={t}
                  className={`type-badge ${t.toLowerCase()}`}
                >
                  {t}
                </span>
              ))}
            {card.rarity && (
              <span className="type-badge" style={{ border: '1px solid var(--color-red)' }}>
                {card.rarity}
              </span>
            )}
            {card.stage && (
              <span className="type-badge colorless">
                {card.stage} {card.evolveFrom ? `(From ${card.evolveFrom})` : ''}
              </span>
            )}
          </div>

          {/* Actions: Add to Collection & Wishlist */}
          <div className="card-actions-panel">
            {!user ? (
              <div className="card-login-prompt">
                <p>Sign in with your Pokédeckz account to add this card to your binder or wishlist.</p>
                <Link to="/login" className="card-action-btn primary">
                  Sign In to Collect
                </Link>
              </div>
            ) : (
              <div className="collection-control-box">
                {collectionItem ? (
                  <div className="owned-management-box">
                    <div className="owned-control-row">
                      <span className="control-label">Your Quantity:</span>
                      <div className="quantity-stepper">
                        <button
                          className="stepper-btn"
                          disabled={actionLoading}
                          onClick={() => handleQuantityChange((collectionItem.quantity || 1) - 1)}
                        >
                          <Minus size={14} />
                        </button>
                        <span className="stepper-val">{collectionItem.quantity}</span>
                        <button
                          className="stepper-btn"
                          disabled={actionLoading}
                          onClick={() => handleQuantityChange((collectionItem.quantity || 1) + 1)}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="owned-control-row">
                      <span className="control-label">Card Condition:</span>
                      <select
                        value={collectionItem.condition || 'Near Mint'}
                        onChange={(e) => handleConditionChange(e.target.value)}
                        disabled={actionLoading}
                        className="condition-dropdown"
                      >
                        {CONDITIONS.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="owned-control-actions">
                      <button
                        className="card-action-btn secondary remove"
                        onClick={() => setShowDeleteConfirm(true)}
                        disabled={actionLoading}
                      >
                        <Trash2 size={16} /> Remove from Collection
                      </button>

                      <button
                        className={`card-action-btn ${wishlistItem ? 'secondary' : 'primary'}`}
                        onClick={handleToggleWishlist}
                        disabled={actionLoading}
                      >
                        <Heart size={16} fill={wishlistItem ? 'var(--color-red)' : 'none'} />
                        {wishlistItem ? 'Remove Wishlist' : 'Add to Wishlist'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="card-actions">
                    <button
                      className="card-action-btn primary"
                      onClick={handleAddToCollection}
                      disabled={actionLoading}
                    >
                      <FolderPlus size={18} /> Add to Collection
                    </button>
                    <button
                      className={`card-action-btn secondary ${wishlistItem ? 'active-wish' : ''}`}
                      onClick={handleToggleWishlist}
                      disabled={actionLoading}
                    >
                      <Heart size={18} fill={wishlistItem ? 'var(--color-red)' : 'none'} />
                      {wishlistItem ? 'In Wishlist' : 'Add to Wishlist'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Description / Flavor Text */}
          {card.description && (
            <div className="card-flavor-text">
              <p>"{card.description}"</p>
            </div>
          )}

          {/* Abilities */}
          {card.abilities && card.abilities.length > 0 && (
            <div className="attacks-section">
              <h3>Special Abilities</h3>
              {card.abilities.map((ab, idx) => (
                <div key={idx} className="attack-item ability-item">
                  <div className="attack-header">
                    <span className="attack-name" style={{ color: 'var(--color-red)' }}>
                      <Sparkles size={16} style={{ display: 'inline', marginRight: 6 }} />
                      {ab.name}
                    </span>
                    {ab.type && <span className="type-badge colorless">{ab.type}</span>}
                  </div>
                  {ab.effect && <p className="attack-description">{ab.effect}</p>}
                </div>
              ))}
            </div>
          )}

          {/* Attacks */}
          {card.attacks && card.attacks.length > 0 && (
            <div className="attacks-section">
              <h3>Attacks</h3>
              {card.attacks.map((att, idx) => (
                <div key={idx} className="attack-item">
                  <div className="attack-header">
                    <span className="attack-name">{att.name}</span>
                    {att.damage && <span className="attack-damage">{att.damage}</span>}
                  </div>
                  {att.cost && att.cost.length > 0 && (
                    <div className="attack-cost">
                      {att.cost.map((c, i) => (
                        <span key={i} className={`type-badge ${c.toLowerCase()}`}>
                          {c}
                        </span>
                      ))}
                    </div>
                  )}
                  {att.effect && <p className="attack-description">{att.effect}</p>}
                </div>
              ))}
            </div>
          )}

          {/* Battle Mechanics: Weaknesses, Resistances, Retreat */}
          {isPokemon && (
            <div className="battle-stats-grid">
              <div className="battle-stat-box">
                <span className="battle-stat-title">Weakness</span>
                <span className="battle-stat-content">
                  {card.weaknesses && card.weaknesses.length > 0
                    ? card.weaknesses.map((w) => `${w.type} ${w.value || ''}`).join(', ')
                    : 'None'}
                </span>
              </div>
              <div className="battle-stat-box">
                <span className="battle-stat-title">Resistance</span>
                <span className="battle-stat-content">
                  {card.resistances && card.resistances.length > 0
                    ? card.resistances.map((r) => `${r.type} ${r.value || ''}`).join(', ')
                    : 'None'}
                </span>
              </div>
              <div className="battle-stat-box">
                <span className="battle-stat-title">Retreat Cost</span>
                <span className="battle-stat-content">
                  {card.retreat !== undefined ? `${card.retreat} Energy` : 'None'}
                </span>
              </div>
            </div>
          )}

          {/* Authentic Metadata Footprint */}
          <div className="card-extra-details">
            {card.illustrator && (
              <div className="meta-line">
                <span className="meta-label">Illustrator:</span>
                <span className="meta-value">{card.illustrator}</span>
              </div>
            )}
            {card.set?.id && (
              <div className="meta-line">
                <span className="meta-label">Set Code:</span>
                <span className="meta-value">{card.set.id.toUpperCase()}</span>
              </div>
            )}
            {card.variants && (
              <div className="meta-line">
                <span className="meta-label">Card Variants:</span>
                <span className="meta-value">
                  {Object.entries(card.variants)
                    .filter(([_, val]) => Boolean(val))
                    .map(([key]) => key)
                    .join(', ') || 'Standard'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Remove Card from Collection?"
        message={`Are you sure you want to remove ${card.name} from your Pokédeckz binder?`}
        confirmLabel="Remove Card"
        onConfirm={handleDeleteFromCollection}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      {/* Scoped CSS styling for detail-page specific elements */}
      <style>{`
        .card-detail-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: var(--color-muted-gray);
          font-size: 0.875rem;
          font-weight: 600;
          margin-bottom: 20px;
          cursor: pointer;
          background: transparent;
          border: none;
          transition: color var(--transition-fast);
        }
        .card-detail-back-btn:hover {
          color: var(--color-white);
        }
        .card-header-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }
        .card-hp {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--color-red);
        }
        .card-hp small {
          font-size: 0.8rem;
          color: var(--color-muted-gray);
          margin-left: 2px;
        }
        .card-status-badge {
          margin-top: 14px;
          padding: 8px 14px;
          border-radius: var(--radius-md);
          font-size: 0.8rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: rgba(76, 175, 80, 0.15);
          color: #81c784;
          border: 1px solid rgba(76, 175, 80, 0.3);
        }
        .card-actions-panel {
          margin: 20px 0;
          padding: 16px;
          background: var(--color-secondary-black);
          border-radius: var(--radius-lg);
          border: 1px solid rgba(255, 255, 255, 0.06);
        }
        .card-login-prompt {
          text-align: center;
          padding: 10px;
        }
        .card-login-prompt p {
          color: var(--color-muted-gray);
          font-size: 0.9rem;
          margin-bottom: 12px;
        }
        .owned-control-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }
        .control-label {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--color-muted-gray);
        }
        .quantity-stepper {
          display: flex;
          align-items: center;
          gap: 10px;
          background: var(--color-dark-surface);
          padding: 4px 10px;
          border-radius: var(--radius-md);
        }
        .stepper-btn {
          background: transparent;
          border: none;
          color: var(--color-white);
          cursor: pointer;
          display: flex;
          align-items: center;
          padding: 4px;
        }
        .stepper-btn:disabled {
          opacity: 0.3;
        }
        .stepper-val {
          font-weight: 700;
          font-size: 1rem;
          min-width: 24px;
          text-align: center;
        }
        .condition-dropdown {
          appearance: none;
          -webkit-appearance: none;
          padding: 8px 34px 8px 12px;
          background-color: var(--color-dark-surface);
          background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2300E676' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
          background-repeat: no-repeat;
          background-position: right 10px center;
          background-size: 14px;
          border: 1px solid rgba(0, 230, 118, 0.25);
          border-radius: var(--radius-md);
          color: var(--color-white);
          font-size: 0.85rem;
          font-weight: 600;
          outline: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .condition-dropdown:hover {
          border-color: rgba(0, 230, 118, 0.5);
          background-color: var(--color-surface-hover);
        }
        .condition-dropdown:focus {
          border-color: var(--color-grass-green, #00E676);
          box-shadow: 0 0 0 3px rgba(0, 230, 118, 0.2);
        }
        .owned-control-actions {
          display: flex;
          gap: 10px;
          margin-top: 16px;
          flex-wrap: wrap;
        }
        .card-action-btn.remove {
          background: rgba(229, 57, 53, 0.15);
          color: var(--color-red);
          border: 1px solid rgba(229, 57, 53, 0.3);
        }
        .card-action-btn.remove:hover {
          background: rgba(229, 57, 53, 0.25);
        }
        .card-flavor-text {
          font-style: italic;
          color: var(--color-muted-gray);
          padding: 12px 16px;
          border-left: 3px solid var(--color-red);
          background: rgba(255, 255, 255, 0.02);
          margin-bottom: 20px;
          border-radius: 0 var(--radius-md) var(--radius-md) 0;
          font-size: 0.9rem;
        }
        .battle-stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin: 20px 0;
        }
        .battle-stat-box {
          background: var(--color-secondary-black);
          padding: 12px;
          border-radius: var(--radius-md);
          border: 1px solid rgba(255, 255, 255, 0.04);
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .battle-stat-title {
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--color-muted-gray);
          font-weight: 600;
        }
        .battle-stat-content {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--color-white);
        }
        .card-extra-details {
          margin-top: 24px;
          padding-top: 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .meta-line {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
        }
        .meta-label {
          color: var(--color-muted-gray);
        }
        .meta-value {
          font-weight: 600;
          color: var(--color-white);
        }
      `}</style>
    </div>
  );
}
