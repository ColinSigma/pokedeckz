import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWishlist } from '../hooks/useWishlist';
import { getCardById } from '../services/api';
import { getRarityColor } from '../utils/rarity';
import Toast from '../components/Toast';
import EmptyState from '../components/EmptyState';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { Star } from 'lucide-react';
import '../styles/pages.css';

export default function Wishlist() {
  const navigate = useNavigate();
  const { wishlist, loading, removeCard, moveToCollection } = useWishlist();

  const [enrichedItems, setEnrichedItems] = useState([]);
  // Start as true so we never flash an empty state before enriching begins
  const [enriching, setEnriching] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (loading) return; // Wait for the hook to finish loading first
    if (!wishlist || wishlist.length === 0) {
      setEnrichedItems([]);
      setEnriching(false);
      return;
    }
    setEnriching(true);
    Promise.allSettled(
      wishlist.map(item =>
        getCardById(item.card_id)
          .then(res => {
            const cardObj = res?.data || res;
            return { ...item, card: cardObj };
          })
          .catch(() => ({ ...item, card: null }))
      )
    ).then(results => {
      const valid = results
        .filter(r => r.status === 'fulfilled' && r.value)
        .map(r => r.value);
      setEnrichedItems(valid);
      setEnriching(false);
    });
  }, [wishlist, loading]);

  const handleMoveToCollection = async (item) => {
    try {
      await moveToCollection(item.id, item.card_id);
      showToast(`${item.card?.name || 'Card'} added to your collection! 🎉`);
    } catch {
      showToast('Failed to move card to collection', 'error');
    }
  };

  const handleRemove = async (item) => {
    const confirmed = window.confirm(
      `Remove ${item.card?.name || 'this card'} from your wishlist?`
    );
    if (!confirmed) return;
    try {
      await removeCard(item.id);
      showToast('Card removed from wishlist');
    } catch {
      showToast('Failed to remove card', 'error');
    }
  };

  return (
    <div className="wishlist-page">
      <div className="wishlist-hero-backdrop" />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div className="wishlist-header">
        <h1 className="page-title">⭐ My Wishlist</h1>
        {enrichedItems.length > 0 && (
          <p className="wishlist-count">
            <span className="wishlist-count-badge">{enrichedItems.length}</span>
            {enrichedItems.length === 1 ? 'card on your radar' : 'cards on your radar'}
          </p>
        )}
      </div>

      {/* Cards Area: Loading Skeleton -> Empty State -> Cards Grid */}
      {(loading || enriching) ? (
        <LoadingSkeleton type="card" count={8} />
      ) : enrichedItems.length === 0 ? (
        <EmptyState
          icon={Star}
          title="Your wishlist is empty"
          message="No cards in your wishlist yet. Browse the catalog to add cards!"
          actionLabel="Browse Catalog"
          onAction={() => navigate('/catalog')}
        />
      ) : (
        <div className="wishlist-grid">
          {enrichedItems.map(item => {
            const card = item.card;
            const imgSrc = card?.image ? `${card.image}/low.webp` : null;

            return (
              <div key={item.id} className="wishlist-card">
                {/* Star badge */}
                <div className="wish-star-badge">⭐</div>

                {/* Card image */}
                <div
                  className="wish-item-image"
                  onClick={() => navigate('/card/' + item.card_id)}
                >
                  {imgSrc ? (
                    <img src={imgSrc} alt={card?.name || 'Card'} />
                  ) : (
                    <div className="wish-item-placeholder">🃏</div>
                  )}
                  <div className="wish-image-shine" />
                </div>

                {/* Card info */}
                <div className="wish-item-body">
                  <div
                    className="wish-item-name"
                    onClick={() => navigate('/card/' + item.card_id)}
                  >
                    {card?.name || item.card_id}
                  </div>
                  {card?.set?.name && (
                    <div className="wish-item-set">
                      <span className="wish-set-dot" />
                      {card.set.name}
                    </div>
                  )}
                  {card?.rarity && (
                    <div
                      className="wish-item-rarity"
                      style={{ color: getRarityColor(card.rarity).color }}
                    >
                      {card.rarity}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="wishlist-actions">
                  <button
                    className="wish-btn-collect"
                    onClick={() => handleMoveToCollection(item)}
                    title="Move to Collection"
                  >
                    <span className="wish-btn-icon">＋</span>
                    Add to Collection
                  </button>
                  <button
                    className="wish-btn-remove"
                    onClick={() => handleRemove(item)}
                    title="Remove from Wishlist"
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        .wishlist-header {
          margin-bottom: 28px;
          display: flex;
          align-items: baseline;
          gap: 16px;
          flex-wrap: wrap;
        }
        .wishlist-count {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--color-muted-gray);
          font-size: 0.85rem;
        }
        .wishlist-count-badge {
          background: rgba(255, 203, 5, 0.18);
          color: var(--color-electric-yellow);
          font-weight: 700;
          font-size: 0.8rem;
          padding: 2px 8px;
          border-radius: 20px;
          border: 1px solid rgba(255, 203, 5, 0.3);
        }
        .wishlist-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        @media (min-width: 480px) {
          .wishlist-grid {
            grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
            gap: 16px;
          }
        }
        @media (min-width: 769px) {
          .wishlist-grid {
            grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
            gap: 20px;
          }
        }

        @media (max-width: 480px) {
          .wishlist-card {
            border-radius: 14px;
          }
          .wish-star-badge {
            top: 6px;
            right: 6px;
            width: 22px;
            height: 22px;
            font-size: 0.75rem;
          }
          .wish-item-body {
            padding: 8px 10px 6px;
          }
          .wish-item-name {
            font-size: 0.8rem;
          }
          .wish-item-set {
            font-size: 0.68rem;
          }
          .wish-item-rarity {
            font-size: 0.65rem;
          }
          .wishlist-actions {
            padding: 0 10px 10px;
            gap: 6px;
          }
          .wish-btn-collect {
            padding: 6px 8px;
            font-size: 0.65rem;
            border-radius: 8px;
          }
          .wish-btn-remove {
            width: 28px;
            height: 28px;
            border-radius: 8px;
            font-size: 0.7rem;
          }
        }
        .wishlist-card {
          position: relative;
          background: rgba(30, 34, 48, 0.75);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 203, 5, 0.12);
          border-radius: 16px;
          overflow: hidden;
          transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        }
        .wishlist-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 36px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,203,5,0.25);
          border-color: rgba(255, 203, 5, 0.3);
        }
        .wish-star-badge {
          position: absolute;
          top: 10px;
          right: 10px;
          z-index: 2;
          font-size: 0.85rem;
          background: rgba(255, 203, 5, 0.2);
          border: 1px solid rgba(255, 203, 5, 0.4);
          border-radius: 50%;
          width: 26px;
          height: 26px;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
        }
        .wish-item-image {
          width: 100%;
          aspect-ratio: 2.5/3.5;
          background: linear-gradient(135deg, #1a1d2e 0%, #22243a 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          cursor: pointer;
          position: relative;
        }
        .wish-item-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }
        .wish-item-image:hover img {
          transform: scale(1.06);
        }
        .wish-image-shine {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 50%);
          pointer-events: none;
        }
        .wish-item-placeholder {
          font-size: 3rem;
          opacity: 0.3;
        }
        .wish-item-body {
          padding: 12px 14px 8px;
        }
        .wish-item-name {
          font-weight: 700;
          font-size: 0.88rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          color: var(--color-white);
          cursor: pointer;
          transition: color 0.15s;
          letter-spacing: 0.01em;
        }
        .wish-item-name:hover {
          color: var(--color-electric-yellow);
        }
        .wish-item-set {
          font-size: 0.72rem;
          color: var(--color-muted-gray);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-top: 4px;
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .wish-set-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: rgba(255,203,5,0.5);
          flex-shrink: 0;
        }
        .wish-item-rarity {
          font-size: 0.68rem;
          color: rgba(255, 203, 5, 0.6);
          font-style: italic;
          margin-top: 3px;
          letter-spacing: 0.03em;
        }
        .wishlist-actions {
          display: flex;
          gap: 8px;
          padding: 0 12px 14px;
          align-items: center;
        }
        .wish-btn-collect {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          padding: 8px 10px;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          border-radius: 10px;
          background: linear-gradient(135deg, rgba(255,203,5,0.18) 0%, rgba(255,160,0,0.12) 100%);
          color: var(--color-electric-yellow);
          border: 1px solid rgba(255, 203, 5, 0.25);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .wish-btn-collect:hover {
          background: linear-gradient(135deg, rgba(255,203,5,0.35) 0%, rgba(255,160,0,0.28) 100%);
          border-color: rgba(255, 203, 5, 0.6);
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(255,203,5,0.2);
        }
        .wish-btn-collect:active {
          transform: translateY(0);
        }
        .wish-btn-icon {
          font-size: 1rem;
          line-height: 1;
          font-weight: 400;
        }
        .wish-btn-remove {
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.05);
          color: var(--color-muted-gray);
          font-size: 0.75rem;
          border: 1px solid rgba(255, 255, 255, 0.07);
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }
        .wish-btn-remove:hover {
          background: rgba(229, 57, 53, 0.18);
          color: var(--color-red);
          border-color: rgba(229, 57, 53, 0.3);
        }
      `}</style>
    </div>
  );
}
