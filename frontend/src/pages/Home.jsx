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
    <div className="home-page studio-home">
      {/* ─── Hero Section with Pokémon Arena Backdrop ─── */}
      <div className="home-hero-backdrop" />

      <section className="studio-hero-frame">
        <div className="studio-hero-scrim" />
        <div className="studio-hero-content">
          <div className="studio-eyebrow">
            <span className="studio-dot" />
            <span>OFFICIAL TCGDEX ARCHIVE</span>
          </div>

          <h1 className="studio-hero-title">
            Pokémon TCG Archive
            <br />
            <span className="studio-hero-serif">&amp; Collection Ledger.</span>
          </h1>

          <p className="studio-hero-sub">
            Browse 21,990+ official cards, record condition grades in your personal binder, and inspect cards in 360° 3D.
          </p>

          <div className="studio-hero-actions">
            <Link to="/catalog" className="studio-pill-btn solid">
              <span>EXPLORE CATALOG</span>
              <span className="pill-dot" />
            </Link>
            {user ? (
              <Link to="/collection" className="studio-pill-btn ghost">
                <span>OPEN BINDER</span>
                <span className="pill-dot" />
              </Link>
            ) : (
              <Link to="/register" className="studio-pill-btn ghost">
                <span>CREATE BINDER</span>
                <span className="pill-dot" />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ─── Minimal Hairline Ticker ─── */}
      <div className="studio-marquee-strip" aria-hidden="true">
        <div className="studio-marquee-track">
          {[1, 2].map((loop) => (
            <div key={loop} className="studio-marquee-group">
              <span>SCARLET &amp; VIOLET</span><span className="marquee-sep">/</span>
              <span>SWORD &amp; SHIELD</span><span className="marquee-sep">/</span>
              <span>SUN &amp; MOON</span><span className="marquee-sep">/</span>
              <span>XY SERIES</span><span className="marquee-sep">/</span>
              <span>BLACK &amp; WHITE</span><span className="marquee-sep">/</span>
              <span>BASE SET</span><span className="marquee-sep">/</span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Quick Search ─── */}
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
              <TrendingUp size={13} /> INDEX:
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

      {/* ─── 01 / Spotlight Showcase ─── */}
      <section className="featured-section studio-section">
        <div className="studio-section-split">
          <div className="studio-split-left">
            <span className="studio-mono-eyebrow">
              {topSearched ? `01 / ${topSearched.toUpperCase()}` : '01 / SPOTLIGHT'}
            </span>
          </div>
          <div className="studio-split-right">
            <div className="studio-split-title-row">
              <h2 className="studio-h2">
                {topSearched ? `${topSearched} Cards` : 'Featured Cards'}
              </h2>
              <div className="featured-nav-controls">
                <button
                  className={`carousel-nav-btn${!canScrollLeft ? ' disabled' : ''}`}
                  onClick={() => handleScrollCarousel('left')}
                  disabled={!canScrollLeft}
                  aria-label="Scroll left"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  className={`carousel-nav-btn${!canScrollRight ? ' disabled' : ''}`}
                  onClick={() => handleScrollCarousel('right')}
                  disabled={!canScrollRight}
                  aria-label="Scroll right"
                >
                  <ChevronRight size={18} />
                </button>
                <Link
                  to={topSearched ? `/catalog?search=${encodeURIComponent(topSearched)}` : '/catalog'}
                  className="studio-pill-btn outline small"
                >
                  <span>VIEW ALL</span>
                  <span className="pill-dot" />
                </Link>
              </div>
            </div>
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
            {canScrollLeft && <div className="carousel-edge-fade left" />}
            {canScrollRight && <div className="carousel-edge-fade right" />}
          </div>
        )}
      </section>

      {/* ─── 02 / Expansion Sets ─── */}
      <section className="featured-section studio-section">
        <div className="studio-section-split">
          <div className="studio-split-left">
            <span className="studio-mono-eyebrow">02 / EXPANSIONS</span>
          </div>
          <div className="studio-split-right">
            <div className="studio-split-title-row">
              <h2 className="studio-h2">Recent Expansions</h2>
              <Link to="/catalog" className="studio-pill-btn outline small">
                <span>ALL 150+ SETS</span>
                <span className="pill-dot" />
              </Link>
            </div>
          </div>
        </div>

        {setsLoading ? (
          <LoadingSkeleton type="card" count={6} />
        ) : setsError ? (
          <p style={{ color: 'var(--color-red)' }}>{setsError}</p>
        ) : (
          <div className="expansion-sets-grid">
            {sets.map((set) => (
              <div
                key={set.id}
                className="expansion-set-card studio-set-card"
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
                    <span className="set-card-count studio-set-count">
                      {getSetTotalCards(set) != null ? `${getSetTotalCards(set)} CARDS` : 'EXPANSION'}
                    </span>
                    <span className="set-card-arrow">→</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ─── 03 / Personal Collection Ledger ─── */}
      <section className="featured-section studio-section">
        <div className="studio-section-split">
          <div className="studio-split-left">
            <span className="studio-mono-eyebrow">03 / BINDER</span>
          </div>
          <div className="studio-split-right">
            <div className="studio-split-title-row">
              <h2 className="studio-h2">
                {user ? 'Your Collection Overview' : 'Start Your Binder'}
              </h2>
              {user && (
                <Link to="/collection" className="studio-pill-btn outline small">
                  <span>OPEN BINDER</span>
                  <span className="pill-dot" />
                </Link>
              )}
            </div>
          </div>
        </div>

        {user ? (
          <div className="studio-user-stats">
            <CollectionStats />
          </div>
        ) : (
          <div className="studio-auth-panel">
            <div className="studio-auth-copy">
              <h3>Keep an exact ledger of your collection</h3>
              <p>Sign in to log card quantities, track condition grades, and save wishlist targets.</p>
            </div>
            <div className="studio-hero-actions">
              <Link to="/register" className="studio-pill-btn solid">
                <span>REGISTER FREE</span>
                <span className="pill-dot" />
              </Link>
              <Link to="/login" className="studio-pill-btn outline">
                <span>SIGN IN</span>
                <span className="pill-dot" />
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* ─── Editorial Footer with Pokémon Route Grass Design ─── */}
      <footer className="studio-footer studio-footer-with-grass">
        <div className="studio-footer-inner">
          <div className="studio-footer-top">
            <div className="studio-footer-wordmark">POKÉDECKZ</div>
            <div className="studio-footer-links">
              <Link to="/catalog">CATALOG</Link>
              <Link to="/collection">COLLECTION</Link>
              <Link to="/wishlist">WISHLIST</Link>
              <Link to="/about">ABOUT</Link>
            </div>
          </div>
          <div className="studio-footer-bottom">
            <span>POWERED BY TCGDEX OPEN API</span>
            <span>PERSONAL COLLECTION ARCHIVE</span>
          </div>
        </div>

        {/* Layered Pokémon Route Grass Silhouette */}
        <div className="footer-grass-layer" aria-hidden="true">
          <svg
            viewBox="0 0 1200 72"
            preserveAspectRatio="none"
            className="footer-grass-svg"
          >
            {/* Back darker foliage wave */}
            <path
              d="M0,72 L0,46 Q25,22 48,44 Q70,18 95,46 Q120,25 148,48 Q175,16 204,45 Q232,20 260,46 Q288,18 318,45 Q348,24 375,47 Q402,16 432,44 Q460,22 490,46 Q520,18 552,45 Q582,22 612,47 Q642,16 672,44 Q704,20 734,46 Q764,18 796,45 Q825,24 855,47 Q886,16 916,44 Q946,22 976,46 Q1008,18 1038,45 Q1068,22 1098,47 Q1130,16 1162,45 Q1182,26 1200,44 L1200,72 Z"
              className="grass-back"
            />
            {/* Front bright route grass blades */}
            <path
              d="M0,72 L0,54 Q18,32 34,54 Q52,26 70,54 Q88,36 108,55 Q126,28 145,54 Q165,34 185,56 Q205,24 226,54 Q248,34 268,55 Q290,26 312,54 Q334,36 355,55 Q376,28 398,54 Q420,34 442,56 Q464,24 486,54 Q508,36 530,55 Q552,26 574,54 Q596,34 618,55 Q640,28 662,54 Q684,34 706,56 Q728,24 750,54 Q772,36 794,55 Q816,26 838,54 Q860,34 882,55 Q904,28 926,54 Q948,34 970,56 Q992,24 1014,54 Q1036,36 1058,55 Q1080,26 1102,54 Q1124,34 1146,55 Q1168,28 1188,54 L1200,52 L1200,72 Z"
              className="grass-front"
            />
            {/* Tiny route wildflowers */}
            <circle cx="145" cy="40" r="3" className="grass-flower-yellow" />
            <circle cx="312" cy="42" r="2.5" className="grass-flower-white" />
            <circle cx="486" cy="39" r="3" className="grass-flower-red" />
            <circle cx="662" cy="41" r="2.5" className="grass-flower-yellow" />
            <circle cx="838" cy="40" r="3" className="grass-flower-white" />
            <circle cx="1014" cy="39" r="3" className="grass-flower-red" />
          </svg>
        </div>
      </footer>
    </div>
  );
}
