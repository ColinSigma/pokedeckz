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
    <div className="home-page mavrk-home">
      {/* ─── Hero Section with Pokémon Arena Backdrop ─── */}
      <div className="home-hero-backdrop" />

      <section className="mavrk-hero-frame">
        <div className="mavrk-hero-scrim" />
        <div className="mavrk-hero-content">
          <div className="mavrk-eyebrow">
            <span className="mavrk-dot lime" />
            <span>OFFICIAL TCGDEX ARCHIVE — 21,990+ CARDS</span>
          </div>

          <h1 className="mavrk-hero-title">
            Your Pokémon TCG Universe,
            <br />
            <span className="mavrk-hero-accent">Curated &amp; Tracked.</span>
          </h1>

          <p className="mavrk-hero-sub">
            Explore authentic Pokémon trading cards with official illustrations,
            manage your custom binder, and inspect cards in 360° 3D.
          </p>

          <div className="mavrk-hero-actions">
            <Link to="/catalog" className="mavrk-pill-btn solid-white">
              <span>EXPLORE 21,990+ CARDS</span>
              <span className="pill-dot" />
            </Link>
            {user ? (
              <Link to="/collection" className="mavrk-pill-btn dark-glass">
                <span>OPEN MY BINDER</span>
                <span className="pill-dot" />
              </Link>
            ) : (
              <Link to="/register" className="mavrk-pill-btn dark-glass">
                <span>CREATE FREE BINDER</span>
                <span className="pill-dot" />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ─── Infinite Editorial Marquee Strip ─── */}
      <div className="mavrk-marquee-strip" aria-hidden="true">
        <div className="mavrk-marquee-track">
          {[1, 2].map((loop) => (
            <div key={loop} className="mavrk-marquee-group">
              <span>SCARLET &amp; VIOLET</span><span className="marquee-sep">•</span>
              <span>SWORD &amp; SHIELD</span><span className="marquee-sep">•</span>
              <span>SUN &amp; MOON</span><span className="marquee-sep">•</span>
              <span>XY SERIES</span><span className="marquee-sep">•</span>
              <span>360° 3D CARD INSPECT</span><span className="marquee-sep">•</span>
              <span>TRAINER BINDERS</span><span className="marquee-sep">•</span>
              <span>LIVE WISHLISTS</span><span className="marquee-sep">•</span>
            </div>
          ))}
        </div>
      </div>

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
              <TrendingUp size={13} /> POPULAR:
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

      {/* ─── Featured Cards Section (Asymmetric 2-Column Editorial Header) ─── */}
      <section className="featured-section mavrk-section">
        <div className="mavrk-section-split">
          <div className="mavrk-split-left">
            <span className="mavrk-mono-eyebrow">
              <span className="mavrk-dot cyan" />
              {topSearched ? `01 / MOST SEARCHED: ${topSearched.toUpperCase()}` : '01 / SPOTLIGHT SHOWCASE'}
            </span>
          </div>
          <div className="mavrk-split-right">
            <div className="mavrk-split-title-row">
              <h2 className="mavrk-h2">
                {topSearched ? `${topSearched} Cards` : 'Iconic Pokémon Showcase'}
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
                  className="mavrk-pill-btn outline-light small"
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

      {/* ─── Choose Your Path (MAVRK Stacked Alternating Cards) ─── */}
      <section className="featured-section mavrk-section">
        <div className="mavrk-section-split">
          <div className="mavrk-split-left">
            <span className="mavrk-mono-eyebrow">
              <span className="mavrk-dot pink" />
              02 / CHOOSE YOUR PATH
            </span>
          </div>
          <div className="mavrk-split-right">
            <h2 className="mavrk-h2">Built for every type of collector</h2>
          </div>
        </div>

        <div className="mavrk-path-stack">
          {/* Dark Obsidian Card */}
          <div className="mavrk-path-card dark">
            <div className="mavrk-path-body">
              <span className="mavrk-path-tag">FOR ACTIVE COLLECTORS</span>
              <h3>Manage your digital binder</h3>
              <p>Keep an exact inventory of every pull, condition grade, and duplicate in one sleek vault.</p>
              <ul className="mavrk-check-list">
                <li><span>✓</span> Track Near Mint to Damaged condition grades</li>
                <li><span>✓</span> Live quantity counters &amp; set completion</li>
                <li><span>✓</span> Interactive 360° 3D card inspection</li>
              </ul>
            </div>
            <div className="mavrk-path-action">
              <Link to={user ? '/collection' : '/register'} className="mavrk-pill-btn solid-white">
                <span>{user ? 'OPEN COLLECTION' : 'START BINDER'}</span>
                <span className="pill-dot" />
              </Link>
            </div>
          </div>

          {/* Warm Alabaster Light Card */}
          <div className="mavrk-path-card light">
            <div className="mavrk-path-body">
              <span className="mavrk-path-tag dark-ink">FOR GRAIL HUNTERS</span>
              <h3>Track your dream wishlist</h3>
              <p>Filter 150+ official Pokémon TCG sets by rarity, type, or artist and bookmark your targets.</p>
              <ul className="mavrk-check-list dark-ink">
                <li><span>✓</span> Instant search across 21,990+ official cards</li>
                <li><span>✓</span> One-click transfer from Wishlist to Collection</li>
                <li><span>✓</span> Search &amp; inspect other trainers&apos; binders</li>
              </ul>
            </div>
            <div className="mavrk-path-action">
              <Link to="/catalog" className="mavrk-pill-btn solid-dark">
                <span>BROWSE CATALOG</span>
                <span className="pill-dot" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Expansion Sets ─── */}
      <section className="featured-section mavrk-section">
        <div className="mavrk-section-split">
          <div className="mavrk-split-left">
            <span className="mavrk-mono-eyebrow">
              <span className="mavrk-dot lime" />
              03 / EXPANSIONS
            </span>
          </div>
          <div className="mavrk-split-right">
            <div className="mavrk-split-title-row">
              <h2 className="mavrk-h2">Popular Expansion Sets</h2>
              <Link to="/catalog" className="mavrk-pill-btn outline-light small">
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
                className="expansion-set-card mavrk-set-card"
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
                    <span className="set-card-count mavrk-cobalt-num">
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

      {/* ─── MAVRK Acid Lime Stats & Overview Band ─── */}
      <section className="mavrk-lime-band">
        <div className="mavrk-rotated-label" aria-hidden="true">POKÉDECKZ STATS</div>

        <div className="mavrk-lime-inner">
          <div className="mavrk-lime-header">
            <span className="mavrk-mono-eyebrow dark-ink">04 / BY THE NUMBERS</span>
            <h2 className="mavrk-h2 dark-ink">
              {user ? 'Your Trainer Vault & Global Archive' : 'The complete Pokémon TCG archive'}
            </h2>
          </div>

          <div className="mavrk-kpi-grid">
            <div className="mavrk-kpi-item">
              <div className="mavrk-kpi-num">21,990+</div>
              <div className="mavrk-kpi-label">OFFICIAL CARDS INDEXED</div>
            </div>
            <div className="mavrk-kpi-item">
              <div className="mavrk-kpi-num">150+</div>
              <div className="mavrk-kpi-label">EXPANSION SETS &amp; PROMOS</div>
            </div>
            <div className="mavrk-kpi-item">
              <div className="mavrk-kpi-num">360°</div>
              <div className="mavrk-kpi-label">3D CARD INSPECTION</div>
            </div>
          </div>

          {user ? (
            <div className="mavrk-user-stats-wrap">
              <CollectionStats />
            </div>
          ) : (
            <div className="mavrk-lime-cta-row">
              <Link to="/register" className="mavrk-pill-btn solid-dark">
                <span>REGISTER FREE</span>
                <span className="pill-dot" />
              </Link>
              <Link to="/login" className="mavrk-pill-btn outline-dark">
                <span>SIGN IN</span>
                <span className="pill-dot" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ─── MAVRK Electric Cobalt Footer Band ─── */}
      <footer className="mavrk-cobalt-footer">
        <div className="mavrk-footer-marquee" aria-hidden="true">
          <div className="mavrk-marquee-track">
            {[1, 2].map((loop) => (
              <div key={loop} className="mavrk-marquee-group">
                <span>COLLECT &apos;EM ALL! ⚡</span>
                <span>BUILD YOUR BINDER •</span>
                <span>COLLECT &apos;EM ALL! ⚡</span>
                <span>HUNT YOUR GRAILS •</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mavrk-footer-bottom">
          <div className="mavrk-footer-wordmark">POKÉDECKZ</div>
          <div className="mavrk-footer-links">
            <Link to="/catalog">CATALOG</Link>
            <Link to="/collection">COLLECTION</Link>
            <Link to="/wishlist">WISHLIST</Link>
            <Link to="/about">ABOUT</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
