import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Flame,
  Search,
  Layers,
  ArrowRight,
  TrendingUp,
  RotateCcw
} from 'lucide-react';
import { getCards, getSets } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useCollection } from '../hooks/useCollection';
import { recordSearch, getTopSearchedPokemon } from '../utils/searchTracker';
import PokemonCard from '../components/PokemonCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import SearchBar from '../components/SearchBar';
import PokeballHatLogo from '../components/PokeballHatLogo';
import '../styles/pages.css';

const QUICK_SEARCH_POKEMON = ['Pikachu', 'Charizard', 'Mewtwo', 'Gengar', 'Rayquaza', 'Lucario'];

// Safe helper to extract total card count from TCGdex set object
function getSetTotalCards(set) {
  if (!set) return null;
  if (typeof set.cardCount === 'number') return set.cardCount;
  if (typeof set.cardCount === 'object' && set.cardCount !== null) {
    return set.cardCount.total ?? set.cardCount.official ?? null;
  }
  if (typeof set.total === 'number') return set.total;
  return null;
}

// Safe helper to extract series name
function getSetSeriesName(set) {
  if (!set) return 'Pokémon TCG';
  if (typeof set.series === 'string') return set.series;
  if (typeof set.series === 'object' && set.series !== null && set.series.name) return set.series.name;
  if (typeof set.serie === 'string') return set.serie;
  if (typeof set.serie === 'object' && set.serie !== null && set.serie.name) return set.serie.name;
  return 'Pokémon TCG';
}

function CollectionStats() {
  const { stats } = useCollection();
  return (
    <div className="stats-dashboard">
      <div className="dashboard-card accent">
        <div className="dashboard-value">{stats?.uniqueCards ?? 0}</div>
        <div className="dashboard-label">Unique Cards</div>
      </div>
      <div className="dashboard-card">
        <div className="dashboard-value">{stats?.totalCards ?? 0}</div>
        <div className="dashboard-label">Total Cards</div>
      </div>
      <div className="dashboard-card">
        <div className="dashboard-value">{stats?.totalSets ?? 0}</div>
        <div className="dashboard-label">Sets Collected</div>
      </div>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Quick Search
  const [searchQuery, setSearchQuery] = useState('');

  // Featured Cards State
  const [topSearched, setTopSearched] = useState(null);
  const [featuredCards, setFeaturedCards] = useState([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [featuredError, setFeaturedError] = useState(null);

  // Carousel ref and scroll indicators
  const carouselRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Recent Sets
  const [sets, setSets] = useState([]);
  const [setsLoading, setSetsLoading] = useState(true);
  const [setsError, setSetsError] = useState(null);

  // 1. Detect most searched Pokémon and fetch authentic featured cards
  useEffect(() => {
    const mostSearched = getTopSearchedPokemon();
    setTopSearched(mostSearched);

    setFeaturedLoading(true);
    setFeaturedError(null);

    // If user has a top searched Pokémon, spotlight that Pokémon!
    // Otherwise fallback to iconic Pikachu cards
    const queryTerm = mostSearched || 'Pikachu';

    getCards({ search: queryTerm, limit: 16 })
      .then((result) => {
        const items = result.data || [];
        if (items.length > 0) {
          setFeaturedCards(items);
        } else {
          // Fallback if the query returned no items
          getCards({ limit: 16, page: 1 })
            .then((fallback) => {
              setFeaturedCards(fallback.data || []);
            })
            .catch(() => {});
        }
      })
      .catch((err) => {
        setFeaturedError(err?.message || 'Failed to load featured Pokémon cards.');
      })
      .finally(() => setFeaturedLoading(false));
  }, []);

  // 2. Fetch sets
  useEffect(() => {
    setSetsLoading(true);
    setSetsError(null);
    getSets({ limit: 6 })
      .then((result) => {
        const items = result.data || [];
        setSets(items.slice(0, 6));
      })
      .catch((err) => {
        setSetsError(err?.message || 'Failed to load expansion sets.');
      })
      .finally(() => setSetsLoading(false));
  }, []);

  // Check carousel scroll boundaries
  const updateScrollButtons = () => {
    if (!carouselRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  };

  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;
    updateScrollButtons();
    el.addEventListener('scroll', updateScrollButtons, { passive: true });
    window.addEventListener('resize', updateScrollButtons);
    return () => {
      el.removeEventListener('scroll', updateScrollButtons);
      window.removeEventListener('resize', updateScrollButtons);
    };
  }, [featuredCards]);

  const handleScrollCarousel = (direction) => {
    if (!carouselRef.current) return;
    const cardWidth = 220; // approximate card + gap width
    const scrollDelta = direction === 'left' ? -cardWidth * 2 : cardWidth * 2;
    carouselRef.current.scrollBy({ left: scrollDelta, behavior: 'smooth' });
  };

  // 3. Search action (Fix: handles string value, records query, and navigates)
  const handleSearch = (rawQuery) => {
    const term = (typeof rawQuery === 'string' ? rawQuery : searchQuery).trim();
    if (!term) return;

    // Record in search history so "Featured" adapts dynamically!
    recordSearch(term);

    // Save to storage and navigate to Catalog
    sessionStorage.setItem('pokedeckz_search', term);
    sessionStorage.setItem('pokedeckz_page', '1');
    navigate(`/catalog?search=${encodeURIComponent(term)}`);
  };

  const handleQuickTagClick = (pokemonName) => {
    recordSearch(pokemonName);
    sessionStorage.setItem('pokedeckz_search', pokemonName);
    sessionStorage.setItem('pokedeckz_page', '1');
    navigate(`/catalog?search=${encodeURIComponent(pokemonName)}`);
  };

  return (
    <div className="home-page">
      {/* ─── Hero Section with Pokémon Arena Backdrop ─── */}
      <div className="home-hero-backdrop" />

      <section className="hero-section">
        <div className="hero-badge">
          <PokeballHatLogo size={20} />
          <span>Official TCGdex Pokémon Database</span>
        </div>

        <h1>
          Your Pokémon TCG Universe,
          <br />
          <span className="hero-accent">Curated & Tracked.</span>
        </h1>
        <p>
          Explore over 21,990 authentic Pokémon trading cards with official illustrations,
          manage your custom collection binder, and track your wishlist.
        </p>

        <div className="hero-actions">
          <Link to="/catalog" className="hero-cta">
            <Layers size={18} /> Explore 21,990+ Cards
          </Link>
          {user ? (
            <Link to="/collection" className="hero-secondary-cta">
              Open My Binder
            </Link>
          ) : (
            <Link to="/register" className="hero-secondary-cta">
              Create Free Binder
            </Link>
          )}
        </div>
      </section>

      {/* ─── Quick Search with working Enter & Instant Buttons ─── */}
      <section className="home-search-section">
        <div className="home-search-container">
          <SearchBar
            value={searchQuery}
            onChange={(val) => setSearchQuery(val)}
            onSearch={handleSearch}
            placeholder="Search any Pokémon card (e.g. Charizard, Pikachu, Mewtwo)..."
          />

          <div className="quick-search-tags">
            <span className="quick-search-label">
              <TrendingUp size={13} /> Popular Searches:
            </span>
            {QUICK_SEARCH_POKEMON.map((name) => (
              <button
                key={name}
                type="button"
                className="quick-search-tag"
                onClick={() => handleQuickTagClick(name)}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Featured Cards Section (Adapted to Most Searched) ─── */}
      <section className="featured-section">
        <div className="section-header">
          <div className="section-header-title">
            <div className="featured-badge">
              {topSearched ? (
                <>
                  <Flame size={15} className="featured-badge-icon hot" />
                  <span>Based on your most searched: <strong>{topSearched}</strong></span>
                </>
              ) : (
                <>
                  <Sparkles size={15} className="featured-badge-icon" />
                  <span>Featured Pokémon Spotlight</span>
                </>
              )}
            </div>
            <h2>
              {topSearched ? `Top Searched: ${topSearched} Cards` : 'Iconic Pokémon Showcase'}
            </h2>
          </div>

          <div className="featured-nav-controls">
            <button
              className={`carousel-nav-btn${!canScrollLeft ? ' disabled' : ''}`}
              onClick={() => handleScrollCarousel('left')}
              disabled={!canScrollLeft}
              aria-label="Scroll left"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              className={`carousel-nav-btn${!canScrollRight ? ' disabled' : ''}`}
              onClick={() => handleScrollCarousel('right')}
              disabled={!canScrollRight}
              aria-label="Scroll right"
            >
              <ChevronRight size={20} />
            </button>
            <Link
              to={topSearched ? `/catalog?search=${encodeURIComponent(topSearched)}` : '/catalog'}
              className="view-all-link"
            >
              View All <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {featuredLoading ? (
          <div className="featured-carousel-wrapper">
            <div className="featured-carousel">
              <LoadingSkeleton type="card" count={6} />
            </div>
          </div>
        ) : featuredError ? (
          <div className="featured-error-box">
            <p>{featuredError}</p>
          </div>
        ) : (
          <div className="featured-carousel-wrapper">
            <div className="featured-carousel" ref={carouselRef}>
              {featuredCards.map((card) => (
                <div key={card.id} className="carousel-card-item">
                  <PokemonCard card={card} />
                </div>
              ))}
            </div>
            {/* Visual gradient edge hints so cards don't look awkwardly cut off */}
            {canScrollLeft && <div className="carousel-edge-fade left" />}
            {canScrollRight && <div className="carousel-edge-fade right" />}
          </div>
        )}
      </section>

      {/* ─── Expansion Sets ─── */}
      <section className="featured-section">
        <div className="section-header">
          <div className="section-header-title">
            <div className="featured-badge">
              <Layers size={14} className="featured-badge-icon" />
              <span>Official TCG Releases</span>
            </div>
            <h2>Popular Expansion Sets</h2>
          </div>
          <Link to="/catalog" className="view-all-link">
            All Sets <ArrowRight size={14} />
          </Link>
        </div>

        {setsLoading ? (
          <LoadingSkeleton type="card" count={6} />
        ) : setsError ? (
          <p style={{ color: 'var(--color-red)' }}>{setsError}</p>
        ) : (
          <>
            <div className="expansion-sets-grid">
              {sets.map((set) => (
                <div
                  key={set.id}
                  className="expansion-set-card"
                  onClick={() => {
                    sessionStorage.setItem('pokedeckz_set', set.id);
                    sessionStorage.setItem('pokedeckz_page', '1');
                    navigate(`/catalog?set=${set.id}`);
                  }}
                >
                  <div className="set-card-content">
                    <h3 className="set-card-name">{set.name}</h3>
                    <p className="set-card-series">{getSetSeriesName(set)}</p>
                    <div className="set-card-footer">
                      <span className="set-card-count">
                        {getSetTotalCards(set) != null ? `${getSetTotalCards(set)} Cards` : 'Expansion Set'}
                      </span>
                      <span className="set-card-arrow">→</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="sets-view-all-container">
              <Link to="/catalog" className="sets-browse-all-btn">
                <Layers size={15} /> Explore All 150+ Sets & Promos in Catalog <ArrowRight size={14} />
              </Link>
            </div>
          </>
        )}
      </section>

      {/* ─── Collection Stats Dashboard ─── */}
      <section className="featured-section">
        <div className="section-header">
          <div className="section-header-title">
            <div className="featured-badge">
              <Sparkles size={14} className="featured-badge-icon" />
              <span>Trainer Statistics</span>
            </div>
            <h2>My Collection Overview</h2>
          </div>
          {user && (
            <Link to="/collection" className="view-all-link">
              My Binder <ArrowRight size={14} />
            </Link>
          )}
        </div>

        {user ? (
          <CollectionStats />
        ) : (
          <div className="stats-dashboard-cta">
            <div className="dashboard-cta-inner">
              <PokeballHatLogo size={42} />
              <h3>Start Your Digital Binder Today</h3>
              <p>Sign in to record card conditions, quantities, and build your dream Pokémon wishlist.</p>
              <div className="dashboard-cta-buttons">
                <Link to="/login" className="hero-secondary-cta">
                  Log In
                </Link>
                <Link to="/register" className="hero-cta">
                  Register Free
                </Link>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
