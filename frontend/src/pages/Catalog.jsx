import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import HeroBackdropPokemon from '../components/HeroBackdropPokemon';
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  Sparkles,
  RefreshCw,
  Archive,
  Layers,
  ArrowUpDown,
  LayoutGrid,
  RotateCcw,
  Bookmark,
  Zap
} from 'lucide-react';
import { getCards, getSets, getSeries } from '../services/api';
import { recordSearch } from '../utils/searchTracker';
import { OFFICIAL_SETS_FALLBACK } from '../utils/pokemonSets';
import SearchBar from '../components/SearchBar';
import CustomSelect from '../components/CustomSelect';
import PokemonCard from '../components/PokemonCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import '../styles/components.css';

const RARITIES = ['All', 'Common', 'Uncommon', 'Rare', 'Rare Holo', 'Ultra Rare', 'Secret Rare'];
const CATEGORIES = ['All', 'Pokemon', 'Trainer', 'Energy'];
const CARD_TYPES = [
  'All',
  'Colorless',
  'Darkness',
  'Dragon',
  'Fairy',
  'Fighting',
  'Fire',
  'Grass',
  'Lightning',
  'Metal',
  'Psychic',
  'Water'
];
const SERIES_FALLBACK = [
  { value: '', label: 'All Generations & Eras' },
  { value: 'sv', label: 'Scarlet & Violet (Gen 9)' },
  { value: 'swsh', label: 'Sword & Shield (Gen 8)' },
  { value: 'sm', label: 'Sun & Moon (Gen 7)' },
  { value: 'xy', label: 'XY Series (Gen 6)' },
  { value: 'bw', label: 'Black & White (Gen 5)' },
  { value: 'dp', label: 'Diamond & Pearl (Gen 4)' },
  { value: 'pl', label: 'Platinum Era' },
  { value: 'hgss', label: 'HeartGold & SoulSilver' },
  { value: 'ex', label: 'EX Ruby & Sapphire (Gen 3)' },
  { value: 'ecard', label: 'E-Card Era' },
  { value: 'neo', label: 'Neo Era (Gen 2)' },
  { value: 'base', label: 'Classic Original Base (Gen 1)' },
  { value: 'pop', label: 'POP & Special Promos' },
];
const SORT_OPTIONS = [
  { label: 'Name A–Z', field: 'name', order: 'asc' },
  { label: 'Name Z–A', field: 'name', order: 'desc' },
  { label: 'Number ↑', field: 'localId', order: 'asc' },
  { label: 'Number ↓', field: 'localId', order: 'desc' },
];

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Restore page & filter state from URL params or sessionStorage
  const [search, setSearch] = useState(() => searchParams.get('search') || sessionStorage.getItem('pokedeckz_search') || '');
  const [serie, setSerie] = useState(() => searchParams.get('series') || sessionStorage.getItem('pokedeckz_series') || '');
  const [setId, setSetId] = useState(() => searchParams.get('set') || sessionStorage.getItem('pokedeckz_set') || '');
  const [cardType, setCardType] = useState(() => searchParams.get('type') || sessionStorage.getItem('pokedeckz_type') || 'All');
  const [rarity, setRarity] = useState(() => searchParams.get('rarity') || sessionStorage.getItem('pokedeckz_rarity') || 'All');
  const [category, setCategory] = useState(() => searchParams.get('category') || sessionStorage.getItem('pokedeckz_category') || 'All');
  const [sortIndex, setSortIndex] = useState(() => {
    const s = searchParams.get('sort') || sessionStorage.getItem('pokedeckz_sort');
    return s !== null ? Number(s) : 0;
  });
  const [limit, setLimit] = useState(() => {
    const l = searchParams.get('limit') || sessionStorage.getItem('pokedeckz_limit');
    return l ? Number(l) : 24;
  });
  const [page, setPage] = useState(() => {
    const p = searchParams.get('page') || sessionStorage.getItem('pokedeckz_page');
    return p ? Math.max(1, parseInt(p, 10)) : 1;
  });

  const [jumpPageInput, setJumpPageInput] = useState('');
  const [seriesList, setSeriesList] = useState(SERIES_FALLBACK);
  const [sets, setSets] = useState(OFFICIAL_SETS_FALLBACK);
  const [cards, setCards] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sync state into sessionStorage and URL search params so browser Back button preserves page
  const syncStateToStorage = (p, s, ser, set, type, r, c, sIdx, lim) => {
    sessionStorage.setItem('pokedeckz_page', String(p));
    sessionStorage.setItem('pokedeckz_search', s || '');
    sessionStorage.setItem('pokedeckz_series', ser || '');
    sessionStorage.setItem('pokedeckz_set', set || '');
    sessionStorage.setItem('pokedeckz_type', type || 'All');
    sessionStorage.setItem('pokedeckz_rarity', r);
    sessionStorage.setItem('pokedeckz_category', c);
    sessionStorage.setItem('pokedeckz_sort', String(sIdx));
    sessionStorage.setItem('pokedeckz_limit', String(lim));

    const params = new URLSearchParams();
    if (p > 1) params.set('page', String(p));
    if (s && s.trim()) params.set('search', s.trim());
    if (ser) params.set('series', ser);
    if (set) params.set('set', set);
    if (type && type !== 'All') params.set('type', type);
    if (r !== 'All') params.set('rarity', r);
    if (c !== 'All') params.set('category', c);
    if (sIdx > 0) params.set('sort', String(sIdx));
    if (lim !== 24) params.set('limit', String(lim));

    setSearchParams(params, { replace: true });
  };

  // Load series & sets once on mount
  useEffect(() => {
    getSeries()
      .then((res) => {
        const items = res.data || [];
        if (items.length > 0) {
          setSeriesList([
            { value: '', label: 'All Generations & Eras' },
            ...items.map((it) => ({ value: it.id, label: it.name })),
          ]);
        }
      })
      .catch(() => {});

    getSets({ limit: 120 })
      .then((result) => setSets(result.data || []))
      .catch(() => setSets([]));
  }, []);

  // Fetch cards whenever filters or page changes
  const fetchCards = useCallback(() => {
    setLoading(true);
    setError(null);

    const sortOpt = SORT_OPTIONS[sortIndex] || SORT_OPTIONS[0];
    const params = { page, limit, sort: sortOpt.field, order: sortOpt.order };
    if (search.trim()) params.search = search.trim();
    if (serie) params.serie = serie;
    if (setId) params.set = setId;
    if (cardType !== 'All') params.type = cardType;
    if (rarity !== 'All') params.rarity = rarity;
    if (category !== 'All') params.category = category;

    getCards(params)
      .then((result) => {
        setCards(result.data || []);
        setPagination(result.pagination || null);
      })
      .catch((err) => {
        setError(err?.message || 'Failed to load authentic Pokémon cards from TCGdex.');
        setCards([]);
        setPagination(null);
      })
      .finally(() => setLoading(false));
  }, [search, serie, setId, cardType, rarity, category, sortIndex, page, limit]);

  useEffect(() => {
    fetchCards();
    syncStateToStorage(page, search, serie, setId, cardType, rarity, category, sortIndex, limit);
  }, [fetchCards]);

  // Sync state if URL search parameters change (e.g. from Home search or Set click)
  useEffect(() => {
    const urlSearch = searchParams.get('search');
    const urlSet = searchParams.get('set');
    const urlSeries = searchParams.get('series');
    const urlPage = searchParams.get('page');

    if (urlSearch !== null && urlSearch !== search) {
      setSearch(urlSearch);
    }
    if (urlSet !== null && urlSet !== setId) {
      setSetId(urlSet);
    }
    if (urlSeries !== null && urlSeries !== serie) {
      setSerie(urlSeries);
    }
    if (urlPage !== null) {
      const p = Math.max(1, parseInt(urlPage, 10));
      if (!isNaN(p) && p !== page) {
        setPage(p);
      }
    }
  }, [searchParams]);

  const handleSearch = useCallback((query) => {
    setSearch(query);
    setPage(1);
    if (query && query.trim()) {
      recordSearch(query);
    }
    syncStateToStorage(1, query, serie, setId, cardType, rarity, category, sortIndex, limit);
  }, [serie, setId, cardType, rarity, category, sortIndex, limit]);

  const handleSeriesChange = (newSeries) => {
    setSerie(newSeries);
    setPage(1);
    syncStateToStorage(1, search, newSeries, setId, cardType, rarity, category, sortIndex, limit);
  };

  const handleSetChange = (newSetId) => {
    setSetId(newSetId);
    setPage(1);
    syncStateToStorage(1, search, serie, newSetId, cardType, rarity, category, sortIndex, limit);
  };

  const handleCardTypeChange = (newType) => {
    setCardType(newType);
    setPage(1);
    syncStateToStorage(1, search, serie, setId, newType, rarity, category, sortIndex, limit);
  };

  const handleRarityChange = (newRarity) => {
    setRarity(newRarity);
    setPage(1);
    syncStateToStorage(1, search, serie, setId, cardType, newRarity, category, sortIndex, limit);
  };

  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory);
    setPage(1);
    syncStateToStorage(1, search, serie, setId, cardType, rarity, newCategory, sortIndex, limit);
  };

  const handleSortChange = (newSortIndex) => {
    setSortIndex(newSortIndex);
    setPage(1);
    syncStateToStorage(1, search, serie, setId, cardType, rarity, category, newSortIndex, limit);
  };

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setPage(1);
    syncStateToStorage(1, search, serie, setId, cardType, rarity, category, sortIndex, newLimit);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    syncStateToStorage(newPage, search, serie, setId, cardType, rarity, category, sortIndex, limit);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetFilters = () => {
    setSearch('');
    setSerie('');
    setSetId('');
    setCardType('All');
    setRarity('All');
    setCategory('All');
    setSortIndex(0);
    setLimit(24);
    setPage(1);
    sessionStorage.removeItem('pokedeckz_search');
    sessionStorage.removeItem('pokedeckz_series');
    sessionStorage.removeItem('pokedeckz_set');
    sessionStorage.removeItem('pokedeckz_type');
    sessionStorage.removeItem('pokedeckz_rarity');
    sessionStorage.removeItem('pokedeckz_category');
    sessionStorage.removeItem('pokedeckz_sort');
    sessionStorage.removeItem('pokedeckz_limit');
    sessionStorage.setItem('pokedeckz_page', '1');
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  // Determine total pages safely
  const totalPages = pagination?.totalItems
    ? Math.ceil(pagination.totalItems / limit)
    : (pagination?.hasMore ? page + 5 : page);

  // Jump to specific page submit
  const handleJumpSubmit = (e) => {
    e.preventDefault();
    const target = parseInt(jumpPageInput.trim(), 10);
    if (!isNaN(target) && target >= 1) {
      const clamped = Math.min(Math.max(1, target), totalPages);
      handlePageChange(clamped);
      setJumpPageInput('');
    }
  };

  // Generate dynamic page numbers around current page
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, page - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let p = start; p <= end; p++) pages.push(p);
    return pages;
  };

  const hasActiveFilters = Boolean(
    search.trim() || serie || setId || cardType !== 'All' || rarity !== 'All' || category !== 'All' || sortIndex !== 0 || limit !== 24
  );

  return (
    <div className="catalog-page">
      <div className="catalog-hero-backdrop">
        <HeroBackdropPokemon page="catalog" />
      </div>
      {/* Header */}
      <div className="catalog-header">
        <div>
          <h1 className="catalog-title">Authentic Pokémon TCG Catalog</h1>
          <p className="catalog-subtitle">
            Explore genuine trading cards with official TCGdex artwork and stats
          </p>
        </div>
        {pagination && (
          <div className="catalog-count-pill">
            <Sparkles size={14} className="count-pill-icon" />
            <span>{pagination.totalItems ? `${pagination.totalItems.toLocaleString()} Cards Available` : 'Browsing Database'}</span>
          </div>
        )}
      </div>

      {/* Search Bar */}
      <div className="catalog-search-wrapper">
        <SearchBar
          value={search}
          onSearch={handleSearch}
          placeholder="Search by Pokémon name (e.g. Pikachu, Charizard, Mewtwo)..."
        />
      </div>

      {/* Modern Aesthetic Filter Bar */}
      <div className="filter-shelf">
        <div className="filter-shelf-header">
          <div className="filter-shelf-label">
            <Filter size={16} /> Filter & Sort Collection
          </div>
          {hasActiveFilters && (
            <button className="reset-filters-btn" onClick={handleResetFilters}>
              <RotateCcw size={13} /> Reset Filters
            </button>
          )}
        </div>

        <div className="filter-shelf-grid">
          {/* Generation & Era (Series) Filter */}
          <CustomSelect
            label="Series / Era"
            icon={Bookmark}
            options={seriesList}
            value={serie}
            onChange={handleSeriesChange}
            searchable={false}
            placeholder="All Generations"
            isActive={Boolean(serie)}
          />

          {/* All Card Sets (Expansions, Subsets & Promos) */}
          <CustomSelect
            label="Card Set"
            icon={Archive}
            options={[
              { value: '', label: serie ? 'All Sets in Series' : 'All Sets & Promos' },
              ...(serie
                ? sets.filter((s) => {
                    const sId = typeof s.serie === 'object' ? s.serie?.id : (s.serie || s.series);
                    return sId === serie;
                  })
                : sets
              ).map((s) => {
                let totalCards = undefined;
                if (typeof s.cardCount === 'number') {
                  totalCards = s.cardCount;
                } else if (typeof s.cardCount === 'object' && s.cardCount !== null) {
                  totalCards = s.cardCount.total ?? s.cardCount.official;
                }
                return {
                  value: s.id || '',
                  label: s.name || '',
                  count: totalCards,
                };
              }),
            ]}
            value={setId}
            onChange={handleSetChange}
            searchable={true}
            searchPlaceholder="Search sets (e.g. 151, Crown Zenith, Base)..."
            placeholder={serie ? 'All Sets in Series' : 'All Sets & Promos'}
            isActive={Boolean(setId)}
          />

          {/* Energy / Pokémon Type Filter */}
          <CustomSelect
            label="Energy Type"
            icon={Zap}
            options={CARD_TYPES.map((t) => ({ value: t, label: t === 'All' ? 'All Energy Types' : t }))}
            value={cardType}
            onChange={handleCardTypeChange}
            placeholder="All Energy Types"
            isActive={cardType !== 'All'}
          />

          {/* Rarity Filter */}
          <CustomSelect
            label="Card Rarity"
            icon={Sparkles}
            options={RARITIES.map((r) => ({ value: r, label: r === 'All' ? 'All Rarities' : r }))}
            value={rarity}
            onChange={handleRarityChange}
            placeholder="All Rarities"
            isActive={rarity !== 'All'}
          />

          {/* Category Filter */}
          <CustomSelect
            label="Card Category"
            icon={Layers}
            options={CATEGORIES.map((c) => ({ value: c, label: c === 'All' ? 'All Categories' : c }))}
            value={category}
            onChange={handleCategoryChange}
            placeholder="All Categories"
            isActive={category !== 'All'}
          />

          {/* Sort Filter */}
          <CustomSelect
            label="Order By"
            icon={ArrowUpDown}
            options={SORT_OPTIONS.map((o, i) => ({ value: i, label: o.label }))}
            value={sortIndex}
            onChange={handleSortChange}
            placeholder="Order By"
            isActive={sortIndex !== 0}
          />

          {/* Cards per Page */}
          <CustomSelect
            label="Cards Per Page"
            icon={LayoutGrid}
            options={[
              { value: 24, label: '24 Cards' },
              { value: 48, label: '48 Cards' },
              { value: 72, label: '72 Cards' },
              { value: 96, label: '96 Cards' },
            ]}
            value={limit}
            onChange={handleLimitChange}
            placeholder="24 Cards"
            isActive={limit !== 24}
          />
        </div>
      </div>

      {/* Card Grid */}
      {loading ? (
        <div className="card-grid">
          <LoadingSkeleton type="card" count={limit} />
        </div>
      ) : error ? (
        <EmptyState
          icon={RefreshCw}
          title="Could not load cards"
          message={error}
          actionLabel="Retry Connection"
          onAction={fetchCards}
        />
      ) : cards.length === 0 ? (
        <EmptyState
          icon={Filter}
          title="No cards found"
          message="Try adjusting your search keywords, sets, or rarity filters."
          actionLabel="Reset All Filters"
          onAction={handleResetFilters}
        />
      ) : (
        <>
          <div className="card-grid">
            {cards.map((card) => (
              <PokemonCard key={card.id} card={card} />
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="pagination">
            <button
              className="pagination-btn"
              onClick={() => handlePageChange(Math.max(1, page - 1))}
              disabled={page <= 1}
              aria-label="Previous Page"
            >
              <ChevronLeft size={16} /> Prev
            </button>

            {getPageNumbers().map((p) => (
              <button
                key={p}
                className={`pagination-btn${p === page ? ' active' : ''}`}
                onClick={() => handlePageChange(p)}
              >
                {p}
              </button>
            ))}

            <button
              className="pagination-btn"
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages}
              aria-label="Next Page"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>

          {/* Clean Go-to-Page Input Without Arrows */}
          <form className="pagination-jump-form" onSubmit={handleJumpSubmit}>
            <span className="jump-label">Go to page:</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={jumpPageInput}
              onChange={(e) => setJumpPageInput(e.target.value)}
              placeholder={`1–${totalPages.toLocaleString()}`}
              className="jump-input clean-number-input"
            />
            <button type="submit" className="jump-btn">
              Go
            </button>
          </form>

          <div className="catalog-page-indicator">
            Showing {cards.length} cards on Page <strong>{page}</strong> of <strong>{totalPages.toLocaleString()}</strong>
          </div>
        </>
      )}

      {/* Scoped CSS for the new aesthetic filter bar and clean number input */}
      <style>{`
        .catalog-title {
          font-size: 1.85rem;
          font-weight: 800;
          letter-spacing: -0.5px;
          color: var(--color-white);
        }
        .catalog-subtitle {
          color: var(--color-muted-gray);
          font-size: 0.875rem;
          margin-top: 4px;
        }
        .catalog-count-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 100px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--color-white);
        }
        .count-pill-icon {
          color: var(--color-red);
        }
        .catalog-search-wrapper {
          margin: 18px 0 14px;
        }
        .filter-shelf {
          background: linear-gradient(145deg, rgba(28, 28, 28, 0.9) 0%, rgba(18, 18, 18, 0.95) 100%);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: var(--radius-xl);
          padding: 18px 20px 20px;
          margin-bottom: 24px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
        }
        .filter-shelf-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
        }
        .filter-shelf-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          color: var(--color-muted-gray);
        }
        .reset-filters-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(229, 57, 53, 0.12);
          border: 1px solid rgba(229, 57, 53, 0.3);
          color: var(--color-red);
          border-radius: 100px;
          padding: 4px 12px;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .reset-filters-btn:hover {
          background: var(--color-red);
          color: var(--color-white);
        }

        /* Clean number input without arrow steppers */
        .clean-number-input::-webkit-outer-spin-button,
        .clean-number-input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        .clean-number-input[type=number] {
          -moz-appearance: textfield;
          appearance: textfield;
        }

        .pagination-jump-form {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 18px;
        }
        .jump-label {
          font-size: 0.85rem;
          color: var(--color-muted-gray);
          font-weight: 500;
        }
        .jump-input {
          width: 84px;
          height: 38px;
          padding: 0 10px;
          background: var(--color-secondary-black);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: var(--radius-md);
          color: var(--color-white);
          font-size: 0.9rem;
          font-weight: 700;
          text-align: center;
          outline: none;
          transition: border-color var(--transition-fast);
        }
        .jump-input:focus {
          border-color: var(--color-red);
          box-shadow: 0 0 0 2px rgba(229, 57, 53, 0.2);
        }
        .jump-btn {
          height: 38px;
          padding: 0 18px;
          background: var(--color-dark-surface);
          color: var(--color-white);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: var(--radius-md);
          font-size: 0.875rem;
          font-weight: 700;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .jump-btn:hover {
          background: var(--color-red);
          border-color: var(--color-red);
        }
        .catalog-page-indicator {
          text-align: center;
          margin-top: 14px;
          color: var(--color-muted-gray);
          font-size: 0.825rem;
        }
        .catalog-page-indicator strong {
          color: var(--color-white);
        }
      `}</style>
    </div>
  );
}
