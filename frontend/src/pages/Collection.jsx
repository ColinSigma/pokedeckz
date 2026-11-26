import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCollection } from '../hooks/useCollection';
import { getCardById } from '../services/api';
import { getRarityColor } from '../utils/rarity';
import Toast from '../components/Toast';
import HeroBackdropPokemon from '../components/HeroBackdropPokemon';
import EmptyState from '../components/EmptyState';
import LoadingSkeleton from '../components/LoadingSkeleton';
import SearchBar from '../components/SearchBar';
import CustomSelect from '../components/CustomSelect';
import { Shield, Layers, ArrowUpDown, RotateCcw, ChevronDown, Sparkles, PackageOpen } from 'lucide-react';
import '../styles/pages.css';

const CONDITIONS = ['Near Mint', 'Lightly Played', 'Moderately Played', 'Heavily Played', 'Damaged'];

const CATEGORY_TABS = [
  { id: 'All', label: 'All Cards' },
  { id: 'Pokemon', label: 'Pokémon' },
  { id: 'Trainer', label: 'Trainers' },
  { id: 'Energy', label: 'Energy' }
];

const SORT_OPTIONS = [
  { value: 'recently_added', label: 'Recently Added' },
  { value: 'name_asc', label: 'Name (A to Z)' },
  { value: 'name_desc', label: 'Name (Z to A)' },
  { value: 'qty_desc', label: 'Quantity (High to Low)' },
  { value: 'condition_desc', label: 'Condition Grade' }
];

const getConditionClass = (cond) => {
  switch (cond) {
    case 'Near Mint': return 'cond-nm';
    case 'Lightly Played': return 'cond-lp';
    case 'Moderately Played': return 'cond-mp';
    case 'Heavily Played': return 'cond-hp';
    case 'Damaged': return 'cond-dmg';
    default: return 'cond-nm';
  }
};

export default function Collection() {
  const navigate = useNavigate();
  const { collection, stats, loading, updateCard, removeCard } = useCollection();

  const [enrichedItems, setEnrichedItems] = useState([]);
  // Start as true so we never flash an empty state before enriching begins
  const [enriching, setEnriching] = useState(true);
  const [toast, setToast] = useState(null);

  // Filters & Sorting state
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [conditionFilter, setConditionFilter] = useState('');
  const [setFilter, setSetFilter] = useState('');
  const [sortBy, setSortBy] = useState('recently_added');

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (loading) return; // Wait for the hook to finish loading first
    if (!collection || collection.length === 0) {
      setEnrichedItems([]);
      setEnriching(false);
      return;
    }
    setEnriching(true);
    Promise.allSettled(
      collection.map(item =>
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
  }, [collection, loading]);

  // Dynamically extract sets present in the collection
  const availableSets = useMemo(() => {
    const setsMap = new Map();
    enrichedItems.forEach(item => {
      const sName = item.card?.set?.name;
      if (sName) {
        setsMap.set(sName, (setsMap.get(sName) || 0) + 1);
      }
    });
    return Array.from(setsMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([name, count]) => ({
        value: name,
        label: `${name} (${count})`
      }));
  }, [enrichedItems]);

  // Dynamic counts for category tabs
  const categoryCounts = useMemo(() => {
    const counts = { All: enrichedItems.length, Pokemon: 0, Trainer: 0, Energy: 0 };
    enrichedItems.forEach(i => {
      const cat = i.card?.category?.toLowerCase() || '';
      if (cat === 'pokemon') counts.Pokemon++;
      else if (cat === 'trainer') counts.Trainer++;
      else if (cat === 'energy') counts.Energy++;
    });
    return counts;
  }, [enrichedItems]);

  // Filter & Sort computation
  const filteredItems = useMemo(() => {
    let items = [...enrichedItems];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      items = items.filter(item =>
        item.card?.name?.toLowerCase().includes(q) ||
        item.card?.set?.name?.toLowerCase().includes(q) ||
        String(item.card_id).toLowerCase().includes(q)
      );
    }

    if (categoryFilter !== 'All') {
      items = items.filter(item => {
        const cat = item.card?.category?.toLowerCase() || '';
        if (categoryFilter === 'Pokemon') return cat === 'pokemon';
        if (categoryFilter === 'Trainer') return cat === 'trainer';
        if (categoryFilter === 'Energy') return cat === 'energy';
        return true;
      });
    }

    if (conditionFilter) {
      items = items.filter(item => item.condition === conditionFilter);
    }

    if (setFilter) {
      items = items.filter(item => item.card?.set?.name === setFilter);
    }

    switch (sortBy) {
      case 'name_asc':
        items.sort((a, b) => (a.card?.name || '').localeCompare(b.card?.name || ''));
        break;
      case 'name_desc':
        items.sort((a, b) => (b.card?.name || '').localeCompare(a.card?.name || ''));
        break;
      case 'qty_desc':
        items.sort((a, b) => (b.quantity || 1) - (a.quantity || 1));
        break;
      case 'condition_desc':
        items.sort((a, b) => CONDITIONS.indexOf(a.condition) - CONDITIONS.indexOf(b.condition));
        break;
      case 'recently_added':
      default:
        items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
    }

    return items;
  }, [enrichedItems, searchQuery, categoryFilter, conditionFilter, setFilter, sortBy]);

  const hasActiveFilters = Boolean(
    searchQuery.trim() ||
    categoryFilter !== 'All' ||
    conditionFilter ||
    setFilter ||
    sortBy !== 'recently_added'
  );

  const handleResetFilters = () => {
    setSearchQuery('');
    setCategoryFilter('All');
    setConditionFilter('');
    setSetFilter('');
    setSortBy('recently_added');
  };

  const handleQuantityChange = async (item, delta) => {
    const newQty = Math.max(1, (item.quantity || 1) + delta);
    try {
      await updateCard(item.id, { quantity: newQty });
      showToast(`Quantity updated to ${newQty}`);
    } catch {
      showToast('Failed to update quantity', 'error');
    }
  };

  const handleConditionChange = async (item, newCondition) => {
    try {
      await updateCard(item.id, { condition: newCondition });
      showToast(`Condition updated to ${newCondition}`);
    } catch {
      showToast('Failed to update condition', 'error');
    }
  };

  const handleRemove = async (item) => {
    const confirmed = window.confirm(
      `Remove ${item.card?.name || 'this card'} from your collection?`
    );
    if (!confirmed) return;
    try {
      await removeCard(item.id);
      showToast('Card removed from collection');
    } catch {
      showToast('Failed to remove card', 'error');
    }
  };

  return (
    <div className="collection-page">
      <div className="collection-hero-backdrop">
        <HeroBackdropPokemon page="collection" />
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div className="collection-header">
        <h1 className="page-title">My Collection</h1>
        <div className="collection-stats-bar">
          <div className="coll-stat">
            <span className="coll-stat-value">{stats.uniqueCards}</span>
            <span className="coll-stat-label">Unique Cards</span>
          </div>
          <div className="coll-stat">
            <span className="coll-stat-value">{stats.totalCards}</span>
            <span className="coll-stat-label">Total Cards</span>
          </div>
          <div className="coll-stat">
            <span className="coll-stat-value">{stats.totalSets}</span>
            <span className="coll-stat-label">Sets</span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="collection-search-wrapper">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by card name, set, or ID…"
        />
      </div>

      {/* Category Pills Bar (Minimalist & Uncrowded) */}
      <div className="coll-category-pills">
        {CATEGORY_TABS.map(tab => {
          const count = categoryCounts[tab.id] || 0;
          const isActive = categoryFilter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              className={`coll-category-pill ${isActive ? 'is-active' : ''} ${tab.id === 'Pokemon' ? 'tab-pokemon' : ''}`}
              onClick={() => setCategoryFilter(tab.id)}
            >
              <span>{tab.label}</span>
              <span className="coll-pill-badge">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Modern Filter Shelf (Only 3 clean, uncluttered custom dropdowns) */}
      <div className="collection-filter-shelf">
        <div className="collection-filter-grid">
          {/* Condition Filter */}
          <CustomSelect
            label="Condition"
            icon={Shield}
            options={[
              { value: '', label: 'All Conditions' },
              ...CONDITIONS.map(c => ({ value: c, label: c }))
            ]}
            value={conditionFilter}
            onChange={setConditionFilter}
            placeholder="All Conditions"
            isActive={Boolean(conditionFilter)}
          />

          {/* Set / Expansion Filter */}
          <CustomSelect
            label="Card Set"
            icon={Layers}
            options={[
              { value: '', label: 'All Card Sets' },
              ...availableSets
            ]}
            value={setFilter}
            onChange={setSetFilter}
            placeholder="All Card Sets"
            searchable={availableSets.length > 6}
            searchPlaceholder="Search sets in collection…"
            isActive={Boolean(setFilter)}
          />

          {/* Sort By Filter */}
          <CustomSelect
            label="Sort Order"
            icon={ArrowUpDown}
            options={SORT_OPTIONS}
            value={sortBy}
            onChange={setSortBy}
            placeholder="Sort Order"
            isActive={sortBy !== 'recently_added'}
          />
        </div>

        {/* Active Filters Summary & Reset */}
        {hasActiveFilters && (
          <div className="coll-active-filters-row">
            <div className="coll-results-counter">
              <Sparkles size={13} className="coll-counter-icon" />
              <span>Showing {filteredItems.length} of {enrichedItems.length} cards</span>
            </div>
            <button
              type="button"
              className="coll-reset-filters-btn"
              onClick={handleResetFilters}
            >
              <RotateCcw size={12} />
              <span>Reset Filters</span>
            </button>
          </div>
        )}
      </div>

      {/* Cards Area: Loading Skeleton -> Empty State -> Cards Grid */}
      {(loading || enriching) ? (
        <LoadingSkeleton type="card" count={8} />
      ) : filteredItems.length === 0 ? (
        <EmptyState
          icon={PackageOpen}
          title="No cards found"
          message={
            hasActiveFilters
              ? 'No cards in your collection match the current filter selection.'
              : 'Your collection is empty. Start adding cards from the catalog!'
          }
          actionLabel={hasActiveFilters ? 'Clear Filters' : 'Browse Catalog'}
          onAction={hasActiveFilters ? handleResetFilters : () => navigate('/catalog')}
        />
      ) : (
        <div className="collection-grid">
          {filteredItems.map(item => {
            const card = item.card;
            const imgSrc = card?.image
              ? `${card.image}/low.webp`
              : null;

            return (
              <div key={item.id} className="collection-card">
                {/* Floating Quantity Pill Badge */}
                <div className="coll-card-qty-badge" title={`You own ${item.quantity || 1} copy`}>
                  <span>×{item.quantity || 1}</span>
                </div>

                {/* Quick Remove Action Badge */}
                <button
                  className="coll-card-remove-badge"
                  onClick={() => handleRemove(item)}
                  title="Remove from collection"
                >
                  ✕
                </button>

                {/* Card image */}
                <div
                  className="coll-item-image"
                  onClick={() => navigate('/card/' + item.card_id)}
                >
                  {imgSrc ? (
                    <img src={imgSrc} alt={card?.name || 'Card'} />
                  ) : (
                    <div className="coll-item-placeholder">🃏</div>
                  )}
                  <div className="coll-image-shine" />
                </div>

                {/* Card info */}
                <div className="coll-item-body">
                  <div
                    className="coll-item-name"
                    onClick={() => navigate('/card/' + item.card_id)}
                    title={card?.name || item.card_id}
                  >
                    {card?.name || item.card_id}
                  </div>

                  <div className="coll-item-meta">
                    <span className="coll-item-set">
                      <span className="coll-set-dot" />
                      {card?.set?.name || 'Pokémon TCG'}
                    </span>
                    {card?.rarity && (
                      <span
                        className="coll-item-rarity"
                        style={{ color: getRarityColor(card.rarity).color }}
                      >
                        {card.rarity}
                      </span>
                    )}
                  </div>

                  {/* Symmetrical Modern Condition Chip */}
                  <div className="coll-card-condition-row">
                    <div className="coll-card-condition-chip" title="Change card condition grade">
                      <span className={`condition-indicator-dot ${getConditionClass(item.condition)}`} />
                      <span className="condition-display-text">{item.condition || 'Near Mint'}</span>
                      <ChevronDown size={13} className="condition-dropdown-arrow" />
                      <select
                        className="condition-stealth-picker"
                        value={item.condition || 'Near Mint'}
                        onChange={e => handleConditionChange(item, e.target.value)}
                        title="Select condition grade"
                      >
                        {CONDITIONS.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Quantity Stepper & Details Bar */}
                  <div className="coll-action-bar">
                    <div className="coll-qty-stepper">
                      <button
                        className="coll-qty-btn"
                        onClick={() => handleQuantityChange(item, -1)}
                        disabled={(item.quantity || 1) <= 1}
                        title="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="coll-qty-value">{item.quantity || 1}</span>
                      <button
                        className="coll-qty-btn"
                        onClick={() => handleQuantityChange(item, 1)}
                        title="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    <button
                      className="coll-view-btn"
                      onClick={() => navigate('/card/' + item.card_id)}
                      title="Inspect card details"
                    >
                      Details →
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        .collection-header {
          margin-bottom: 20px;
        }
        .collection-stats-bar {
          display: flex;
          gap: 14px;
          margin-top: 12px;
          flex-wrap: wrap;
        }
        .coll-stat {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(22, 24, 34, 0.72);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(0, 230, 118, 0.18);
          border-radius: 12px;
          padding: 8px 18px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.25);
        }
        .coll-stat-value {
          font-size: 1.4rem;
          font-weight: 800;
          color: var(--color-grass-green, #00E676);
          line-height: 1;
          letter-spacing: -0.02em;
        }
        .coll-stat-label {
          font-size: 0.75rem;
          color: var(--color-muted-gray);
          text-transform: uppercase;
          letter-spacing: 0.6px;
          font-weight: 600;
        }

        /* Search wrapper */
        .collection-search-wrapper {
          margin-bottom: 14px;
        }

        /* Category quick pills */
        .coll-category-pills {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 8px;
          margin-bottom: 14px;
          scrollbar-width: none;
        }
        .coll-category-pills::-webkit-scrollbar {
          display: none;
        }
        .coll-category-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 7px 14px;
          border-radius: 100px;
          background: rgba(26, 29, 41, 0.75);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: var(--color-muted-gray);
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        .coll-category-pill:hover {
          background: rgba(255, 255, 255, 0.08);
          color: var(--color-white);
          border-color: rgba(255, 255, 255, 0.16);
        }
        .coll-category-pill.is-active {
          background: rgba(0, 230, 118, 0.16);
          border-color: rgba(0, 230, 118, 0.45);
          color: var(--color-grass-green, #00E676);
          box-shadow: 0 0 14px rgba(0, 230, 118, 0.15);
        }
        .coll-category-pill.tab-pokemon {
          background: #111111;
          border-color: #D32F2F;
          color: #FFFFFF;
        }
        .coll-category-pill.tab-pokemon:hover {
          background: #222222;
          border-color: #FF3B30;
          color: #FFFFFF;
        }
        .coll-category-pill.tab-pokemon.is-active {
          background: #D32F2F;
          border-color: #000000;
          color: #FFFFFF;
          box-shadow: 0 0 12px rgba(211, 47, 47, 0.45);
        }
        .coll-category-pill.tab-pokemon.is-active .coll-pill-badge {
          background: #000000;
          color: #FFFFFF;
        }
        .coll-pill-badge {
          background: rgba(255, 255, 255, 0.1);
          color: var(--color-white);
          font-size: 0.7rem;
          font-weight: 700;
          padding: 1px 6px;
          border-radius: 10px;
        }
        .coll-category-pill.is-active .coll-pill-badge {
          background: rgba(0, 230, 118, 0.3);
          color: var(--color-grass-green, #00E676);
        }

        /* Modern Filter Shelf (3 sleek dropdowns) */
        .collection-filter-shelf {
          position: relative;
          z-index: 50;
          background: rgba(20, 23, 33, 0.7);
          backdrop-filter: blur(14px);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 16px;
          padding: 14px;
          margin-bottom: 24px;
          box-shadow: 0 6px 20px rgba(0,0,0,0.25);
        }
        .collection-filter-shelf:focus-within,
        .collection-filter-shelf:has(.is-open) {
          z-index: 100;
        }
        .collection-filter-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 12px;
          position: relative;
          z-index: 50;
        }

        /* Active filters row */
        .coll-active-filters-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 12px;
          padding-top: 10px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          gap: 12px;
          flex-wrap: wrap;
        }
        .coll-results-counter {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.78rem;
          color: var(--color-muted-gray);
        }
        .coll-counter-icon {
          color: var(--color-grass-green, #00E676);
        }
        .coll-reset-filters-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.74rem;
          font-weight: 700;
          color: var(--color-red);
          background: rgba(229, 57, 53, 0.1);
          border: 1px solid rgba(229, 57, 53, 0.25);
          padding: 4px 10px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .coll-reset-filters-btn:hover {
          background: rgba(229, 57, 53, 0.2);
          border-color: rgba(229, 57, 53, 0.4);
          transform: translateY(-1px);
        }

        /* Collection Grid */
        .collection-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-top: 8px;
        }
        @media (min-width: 480px) {
          .collection-grid {
            grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
            gap: 16px;
          }
        }
        @media (min-width: 769px) {
          .collection-grid {
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 24px;
          }
        }

        @media (max-width: 480px) {
          .collection-card {
            border-radius: 14px;
          }
          .coll-card-qty-badge {
            top: 6px;
            left: 6px;
            font-size: 0.68rem;
            padding: 2px 6px;
          }
          .coll-card-remove-badge {
            top: 6px;
            right: 6px;
            width: 24px;
            height: 24px;
            font-size: 0.7rem;
          }
          .coll-item-body {
            padding: 8px 10px 10px;
            gap: 6px;
          }
          .coll-item-name {
            font-size: 0.8rem;
          }
          .coll-item-meta {
            font-size: 0.68rem;
          }
          .coll-card-condition-chip {
            padding: 4px 8px;
            gap: 5px;
          }
          .condition-display-text {
            font-size: 0.68rem;
          }
          .coll-action-bar {
            gap: 5px;
          }
          .coll-qty-btn {
            width: 22px;
            height: 22px;
            font-size: 0.8rem;
          }
          .coll-qty-value {
            font-size: 0.75rem;
            padding: 0 4px;
          }
          .coll-view-btn {
            padding: 5px 8px;
            font-size: 0.68rem;
          }
        }
        .collection-card {
          position: relative;
          background: rgba(26, 29, 41, 0.78);
          backdrop-filter: blur(14px);
          border: 1px solid rgba(0, 230, 118, 0.14);
          border-radius: 18px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: 0 6px 24px rgba(0, 0, 0, 0.35);
          transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
        }
        .collection-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 14px 40px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(0, 230, 118, 0.3);
          border-color: rgba(0, 230, 118, 0.35);
        }
        .coll-card-qty-badge {
          position: absolute;
          top: 10px;
          left: 10px;
          z-index: 2;
          background: rgba(14, 16, 21, 0.82);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(0, 230, 118, 0.4);
          color: var(--color-grass-green, #00E676);
          font-weight: 800;
          font-size: 0.76rem;
          padding: 3px 9px;
          border-radius: 12px;
          letter-spacing: 0.02em;
          box-shadow: 0 2px 8px rgba(0,0,0,0.4);
          pointer-events: none;
        }
        .coll-card-remove-badge {
          position: absolute;
          top: 10px;
          right: 10px;
          z-index: 2;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: rgba(14, 16, 21, 0.75);
          backdrop-filter: blur(6px);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: var(--color-muted-gray);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        }
        .coll-card-remove-badge:hover {
          background: rgba(229, 57, 53, 0.85);
          color: var(--color-white);
          border-color: rgba(229, 57, 53, 0.9);
          transform: scale(1.1);
        }
        .coll-item-image {
          width: 100%;
          aspect-ratio: 2.5/3.5;
          background: linear-gradient(135deg, #141722 0%, #1c2030 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          cursor: pointer;
          position: relative;
        }
        .coll-item-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }
        .coll-item-image:hover img {
          transform: scale(1.05);
        }
        .coll-image-shine {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 55%);
          pointer-events: none;
        }
        .coll-item-placeholder {
          font-size: 3rem;
          opacity: 0.3;
        }
        .coll-item-body {
          padding: 12px 14px 14px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          flex: 1;
        }
        .coll-item-name {
          font-weight: 700;
          font-size: 0.92rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          color: var(--color-white);
          cursor: pointer;
          transition: color 0.15s;
          letter-spacing: 0.01em;
        }
        .coll-item-name:hover {
          color: var(--color-grass-green, #00E676);
        }
        .coll-item-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 6px;
          font-size: 0.72rem;
        }
        .coll-item-set {
          color: var(--color-muted-gray);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          display: flex;
          align-items: center;
          gap: 5px;
          flex: 1;
        }
        .coll-set-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: var(--color-grass-green, #00E676);
          flex-shrink: 0;
          opacity: 0.7;
        }
        .coll-item-rarity {
          color: rgba(0, 230, 118, 0.75);
          font-style: italic;
          font-size: 0.68rem;
          white-space: nowrap;
        }

        /* Symmetrical Condition Chip on the Card */
        .coll-card-condition-row {
          width: 100%;
        }
        .coll-card-condition-chip {
          position: relative;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 10px;
          background: rgba(14, 16, 22, 0.65);
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .coll-card-condition-chip:hover {
          border-color: rgba(0, 230, 118, 0.4);
          background: rgba(14, 16, 22, 0.85);
          box-shadow: 0 0 10px rgba(0, 230, 118, 0.12);
        }
        .condition-indicator-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .condition-indicator-dot.cond-nm {
          background: #00E676;
          box-shadow: 0 0 6px rgba(0, 230, 118, 0.7);
        }
        .condition-indicator-dot.cond-lp {
          background: #29B6F6;
          box-shadow: 0 0 6px rgba(41, 182, 246, 0.7);
        }
        .condition-indicator-dot.cond-mp {
          background: #FFCA28;
          box-shadow: 0 0 6px rgba(255, 202, 40, 0.7);
        }
        .condition-indicator-dot.cond-hp {
          background: #FF7043;
          box-shadow: 0 0 6px rgba(255, 112, 67, 0.7);
        }
        .condition-indicator-dot.cond-dmg {
          background: #EF5350;
          box-shadow: 0 0 6px rgba(239, 83, 80, 0.7);
        }
        .condition-display-text {
          flex: 1;
          font-size: 0.74rem;
          font-weight: 700;
          color: var(--color-white);
          letter-spacing: 0.02em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .condition-dropdown-arrow {
          color: var(--color-muted-gray);
          flex-shrink: 0;
          transition: transform 0.2s ease;
        }
        .coll-card-condition-chip:hover .condition-dropdown-arrow {
          color: var(--color-grass-green, #00E676);
          transform: translateY(1px);
        }
        .condition-indicator-dot,
        .condition-display-text,
        .condition-dropdown-arrow {
          pointer-events: none;
        }
        .condition-stealth-picker {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          cursor: pointer;
          border: none;
          outline: none;
          z-index: 10;
          pointer-events: auto;
          appearance: none;
          -webkit-appearance: none;
        }

        /* Quantity & Actions Bar */
        .coll-action-bar {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: auto;
        }
        .coll-qty-stepper {
          display: inline-flex;
          align-items: center;
          background: rgba(14, 16, 21, 0.65);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          padding: 2px;
          flex: 1;
          justify-content: space-between;
        }
        .coll-qty-btn {
          width: 26px;
          height: 26px;
          border-radius: 7px;
          background: rgba(255, 255, 255, 0.05);
          color: var(--color-white);
          font-size: 0.95rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .coll-qty-btn:hover:not(:disabled) {
          background: rgba(0, 230, 118, 0.25);
          color: var(--color-grass-green, #00E676);
        }
        .coll-qty-btn:disabled {
          opacity: 0.25;
          cursor: not-allowed;
        }
        .coll-qty-value {
          font-weight: 700;
          font-size: 0.85rem;
          color: var(--color-white);
          padding: 0 6px;
        }
        .coll-view-btn {
          padding: 6px 12px;
          font-size: 0.74rem;
          font-weight: 700;
          letter-spacing: 0.03em;
          border-radius: 10px;
          background: linear-gradient(135deg, rgba(0, 230, 118, 0.16) 0%, rgba(0, 191, 165, 0.12) 100%);
          color: var(--color-grass-green, #00E676);
          border: 1px solid rgba(0, 230, 118, 0.28);
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        .coll-view-btn:hover {
          background: linear-gradient(135deg, rgba(0, 230, 118, 0.3) 0%, rgba(0, 191, 165, 0.22) 100%);
          border-color: rgba(0, 230, 118, 0.5);
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
}
