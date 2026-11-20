import { ExternalLink, Heart, Code2, Database, Globe, Zap, Shield, Star, Award, BookOpen, Server, Package } from 'lucide-react';
import '../styles/pages.css';

const TECH_STACK = [
  {
    category: 'Frontend',
    color: '#61DAFB',
    glow: 'rgba(97, 218, 251, 0.25)',
    items: [
      { name: 'React 18', desc: 'UI component library', icon: '⚛️' },
      { name: 'Vite', desc: 'Lightning-fast build tool', icon: '⚡' },
      { name: 'React Router v6', desc: 'Client-side routing', icon: '🔀' },
      { name: 'Lucide React', desc: 'Modern icon library', icon: '✨' },
      { name: 'PWA (Vite Plugin)', desc: 'Progressive Web App support', icon: '📱' },
    ],
  },
  {
    category: 'Backend & Auth',
    color: '#3ECF8E',
    glow: 'rgba(62, 207, 142, 0.25)',
    items: [
      { name: 'Node.js + Express', desc: 'REST API server', icon: '🟢' },
      { name: 'Supabase', desc: 'Auth & PostgreSQL database', icon: '🗄️' },
      { name: 'Supabase RLS', desc: 'Row-level security policies', icon: '🔐' },
      { name: 'Axios', desc: 'HTTP client for API calls', icon: '🌐' },
    ],
  },
  {
    category: 'Data Source',
    color: '#FFCB05',
    glow: 'rgba(255, 203, 5, 0.25)',
    items: [
      { name: 'TCGdex API', desc: 'Pokémon card data & imagery', icon: '🃏' },
      { name: 'TCGdex SDK', desc: 'Official TypeScript/JS SDK', icon: '📦' },
    ],
  },
];

const FEATURES = [
  { icon: BookOpen, label: 'Card Catalog', desc: 'Browse thousands of Pokémon TCG cards with real-time search and advanced filters.' },
  { icon: Star, label: 'Wishlist', desc: 'Save cards you want to hunt for and move them to your collection when acquired.' },
  { icon: Shield, label: 'Collection Manager', desc: 'Track your cards with condition grades, quantities, and expansion filters.' },
  { icon: Zap, label: 'Smart Filters', desc: 'Filter by card type, set, condition, rarity, and sort in any direction.' },
  { icon: Globe, label: 'PWA Ready', desc: 'Install PokéDeckz on your device and use it like a native app, even offline.' },
  { icon: Award, label: 'Trainer Profile', desc: 'Personalize your trainer profile with an avatar and display your collection stats.' },
];

export default function About() {
  return (
    <div className="about-page">
      <div className="about-hero-backdrop" />

      {/* Hero Section */}
      <div className="about-hero">
        <div className="about-hero-badge">
          <Heart size={12} />
          <span>Built with love for Pokémon fans</span>
        </div>
        <h1 className="about-title">
          About <span className="about-title-highlight">PokéDeckz</span>
        </h1>
        <p className="about-subtitle">
          Your personal Pokémon TCG collection companion — track, discover, and manage your cards all in one sleek, modern web app.
        </p>
      </div>

      {/* What is PokéDeckz */}
      <section className="about-section">
        <div className="about-section-header">
          <BookOpen size={20} className="about-section-icon" style={{ color: '#FFCB05' }} />
          <h2 className="about-section-title">What is PokéDeckz?</h2>
        </div>
        <div className="about-glass-card about-about-card">
          <p>
            <strong>PokéDeckz</strong> is a full-stack Pokémon TCG (Trading Card Game) collection management web app. Whether you're a seasoned collector or just starting to build your first deck, PokéDeckz gives you the tools to browse a comprehensive card catalog, wishlist cards you're hunting for, and track every card in your collection with its condition and quantity.
          </p>
          <p>
            The app is designed with a sleek dark aesthetic, responsive mobile-first layout, and Progressive Web App (PWA) support — meaning you can install it directly on your phone or desktop and have an app-like experience anywhere you go.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="about-section">
        <div className="about-section-header">
          <Zap size={20} className="about-section-icon" style={{ color: '#00E676' }} />
          <h2 className="about-section-title">Features</h2>
        </div>
        <div className="about-features-grid">
          {FEATURES.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="about-feature-card">
              <div className="about-feature-icon-wrap">
                <Icon size={22} />
              </div>
              <div>
                <div className="about-feature-label">{label}</div>
                <div className="about-feature-desc">{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack */}
      <section className="about-section">
        <div className="about-section-header">
          <Code2 size={20} className="about-section-icon" style={{ color: '#61DAFB' }} />
          <h2 className="about-section-title">Built With</h2>
        </div>
        <div className="about-tech-columns">
          {TECH_STACK.map(({ category, color, glow, items }) => (
            <div
              key={category}
              className="about-tech-group"
              style={{ '--tech-color': color, '--tech-glow': glow }}
            >
              <div className="about-tech-group-label" style={{ color }}>
                {category}
              </div>
              <div className="about-tech-list">
                {items.map(({ name, desc, icon }) => (
                  <div key={name} className="about-tech-item">
                    <span className="about-tech-emoji">{icon}</span>
                    <div className="about-tech-text">
                      <span className="about-tech-name">{name}</span>
                      <span className="about-tech-desc">{desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Credits */}
      <section className="about-section">
        <div className="about-section-header">
          <Award size={20} className="about-section-icon" style={{ color: '#FFCB05' }} />
          <h2 className="about-section-title">Credits & Data Sources</h2>
        </div>
        <div className="about-credits-grid">

          {/* TCGdex */}
          <div className="about-credit-card">
            <div className="about-credit-logo">🃏</div>
            <div className="about-credit-body">
              <div className="about-credit-name">TCGdex</div>
              <div className="about-credit-role">Pokémon Card Database & Artwork</div>
              <p className="about-credit-desc">
                All Pokémon card data, images, set information, and rarity details are sourced from the <strong>TCGdex Open API</strong> — a free and community-maintained Pokémon TCG database.
              </p>
              <a
                href="https://www.tcgdex.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="about-credit-link"
              >
                tcgdex.dev <ExternalLink size={12} />
              </a>
            </div>
          </div>

          {/* Pokémon IP */}
          <div className="about-credit-card">
            <div className="about-credit-logo">⚡</div>
            <div className="about-credit-body">
              <div className="about-credit-name">The Pokémon Company</div>
              <div className="about-credit-role">Original IP & Card Artwork</div>
              <p className="about-credit-desc">
                Pokémon and all related names, characters, card art, and trademarks are property of <strong>Nintendo / Creatures Inc. / GAME FREAK inc.</strong> — PokéDeckz is an unofficial fan project and is not affiliated with or endorsed by The Pokémon Company.
              </p>
              <a
                href="https://www.pokemon.com"
                target="_blank"
                rel="noopener noreferrer"
                className="about-credit-link"
              >
                pokemon.com <ExternalLink size={12} />
              </a>
            </div>
          </div>

          {/* Supabase */}
          <div className="about-credit-card">
            <div className="about-credit-logo">🗄️</div>
            <div className="about-credit-body">
              <div className="about-credit-name">Supabase</div>
              <div className="about-credit-role">Auth & Database Infrastructure</div>
              <p className="about-credit-desc">
                Authentication, user accounts, collection and wishlist data are powered by <strong>Supabase</strong> — an open-source Firebase alternative built on top of PostgreSQL.
              </p>
              <a
                href="https://supabase.com"
                target="_blank"
                rel="noopener noreferrer"
                className="about-credit-link"
              >
                supabase.com <ExternalLink size={12} />
              </a>
            </div>
          </div>

          {/* Lucide */}
          <div className="about-credit-card">
            <div className="about-credit-logo">✨</div>
            <div className="about-credit-body">
              <div className="about-credit-name">Lucide Icons</div>
              <div className="about-credit-role">Icon Library</div>
              <p className="about-credit-desc">
                All UI icons in PokéDeckz are from <strong>Lucide React</strong> — a beautiful and consistent open-source icon library.
              </p>
              <a
                href="https://lucide.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="about-credit-link"
              >
                lucide.dev <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="about-section">
        <div className="about-disclaimer">
          <Shield size={16} className="about-disclaimer-icon" />
          <p>
            <strong>Disclaimer:</strong> PokéDeckz is an unofficial fan project created for educational and personal use. All Pokémon card images and data are served via the TCGdex public API. Pokémon and all related trademarks are © Nintendo / Creatures Inc. / GAME FREAK inc. / The Pokémon Company.
          </p>
        </div>
      </section>

      <style>{`
        /* ─── About Page Layout ─────────────────────────────── */
        .about-page {
          position: relative;
          padding-bottom: 60px;
        }

        .about-hero-backdrop {
          position: absolute;
          top: -24px;
          left: 50%;
          transform: translateX(-50%);
          width: 100vw;
          height: 440px;
          background-image:
            linear-gradient(180deg, rgba(14,16,21,0.3) 0%, rgba(14,16,21,0.88) 65%, var(--color-primary-black) 100%),
            radial-gradient(circle at 30% 30%, rgba(255, 203, 5, 0.22) 0%, transparent 50%),
            radial-gradient(circle at 70% 60%, rgba(97, 218, 251, 0.14) 0%, transparent 50%),
            radial-gradient(circle at 50% 80%, rgba(62, 207, 142, 0.12) 0%, transparent 50%);
          z-index: 0;
          pointer-events: none;
          mask-image: linear-gradient(to bottom, black 55%, transparent 100%);
          -webkit-mask-image: linear-gradient(to bottom, black 55%, transparent 100%);
        }

        .about-hero {
          position: relative;
          z-index: 1;
          text-align: center;
          padding: 32px 0 44px;
        }

        .about-hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(255, 203, 5, 0.12);
          border: 1px solid rgba(255, 203, 5, 0.3);
          color: var(--color-electric-yellow);
          font-size: 0.74rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          padding: 5px 14px;
          border-radius: 100px;
          margin-bottom: 20px;
        }

        .about-title {
          font-size: 2.4rem;
          font-weight: 900;
          letter-spacing: -0.04em;
          color: var(--color-white);
          margin-bottom: 16px;
          line-height: 1.1;
        }

        @media (min-width: 769px) {
          .about-title { font-size: 3.2rem; }
        }

        .about-title-highlight {
          background: linear-gradient(135deg, #FFCB05 0%, #FFA000 60%, #FF6F00 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .about-subtitle {
          max-width: 600px;
          margin: 0 auto;
          color: var(--color-soft-white);
          font-size: 1.05rem;
          line-height: 1.65;
          opacity: 0.85;
        }

        /* ─── Sections ─────────────────────────────────────── */
        .about-section {
          position: relative;
          z-index: 1;
          margin-bottom: 44px;
        }

        .about-section-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.07);
        }

        .about-section-icon {
          flex-shrink: 0;
        }

        .about-section-title {
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--color-white);
          letter-spacing: -0.02em;
        }

        /* ─── Glass Card ───────────────────────────────────── */
        .about-glass-card {
          background: rgba(20, 23, 34, 0.75);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 18px;
          padding: 28px 32px;
        }

        .about-about-card p {
          color: var(--color-soft-white);
          font-size: 0.97rem;
          line-height: 1.72;
          margin-bottom: 16px;
          opacity: 0.88;
        }

        .about-about-card p:last-child { margin-bottom: 0; }
        .about-about-card strong { color: var(--color-white); }

        /* ─── Features Grid ────────────────────────────────── */
        .about-features-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 14px;
        }

        @media (min-width: 480px) {
          .about-features-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (min-width: 769px) {
          .about-features-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .about-feature-card {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          background: rgba(20, 23, 34, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 14px;
          padding: 18px;
          transition: border-color 0.2s, transform 0.2s;
        }

        .about-feature-card:hover {
          border-color: rgba(255, 255, 255, 0.16);
          transform: translateY(-2px);
        }

        .about-feature-icon-wrap {
          width: 42px;
          height: 42px;
          border-radius: 10px;
          background: rgba(255, 203, 5, 0.1);
          border: 1px solid rgba(255, 203, 5, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-electric-yellow);
          flex-shrink: 0;
        }

        .about-feature-label {
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--color-white);
          margin-bottom: 4px;
        }

        .about-feature-desc {
          font-size: 0.8rem;
          color: var(--color-muted-gray);
          line-height: 1.5;
        }

        /* ─── Tech Stack ───────────────────────────────────── */
        .about-tech-columns {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }

        @media (min-width: 600px) {
          .about-tech-columns {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .about-tech-group {
          background: rgba(20, 23, 34, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 16px;
          padding: 20px;
          transition: border-color 0.2s;
        }

        .about-tech-group:hover {
          border-color: var(--tech-color, rgba(255,255,255,0.15));
          box-shadow: 0 0 20px var(--tech-glow, rgba(255,255,255,0.05));
        }

        .about-tech-group-label {
          font-size: 0.72rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          margin-bottom: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .about-tech-group-label::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--tech-color, rgba(255,255,255,0.1));
          opacity: 0.3;
        }

        .about-tech-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .about-tech-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }

        .about-tech-emoji {
          font-size: 1.1rem;
          flex-shrink: 0;
          margin-top: 1px;
        }

        .about-tech-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .about-tech-name {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--color-white);
        }

        .about-tech-desc {
          font-size: 0.74rem;
          color: var(--color-muted-gray);
        }

        /* ─── Credits ──────────────────────────────────────── */
        .about-credits-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 14px;
        }

        @media (min-width: 600px) {
          .about-credits-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .about-credit-card {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          background: rgba(20, 23, 34, 0.75);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 22px;
          transition: border-color 0.2s, transform 0.2s;
        }

        .about-credit-card:hover {
          border-color: rgba(255, 203, 5, 0.25);
          transform: translateY(-2px);
        }

        .about-credit-logo {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: rgba(255, 203, 5, 0.08);
          border: 1px solid rgba(255, 203, 5, 0.18);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          flex-shrink: 0;
        }

        .about-credit-body {
          flex: 1;
          min-width: 0;
        }

        .about-credit-name {
          font-size: 0.95rem;
          font-weight: 800;
          color: var(--color-white);
          margin-bottom: 2px;
        }

        .about-credit-role {
          font-size: 0.74rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--color-electric-yellow);
          margin-bottom: 10px;
        }

        .about-credit-desc {
          font-size: 0.82rem;
          color: var(--color-muted-gray);
          line-height: 1.6;
          margin-bottom: 12px;
        }

        .about-credit-desc strong {
          color: var(--color-soft-white);
        }

        .about-credit-link {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 0.78rem;
          font-weight: 700;
          color: var(--color-electric-yellow);
          text-decoration: none;
          border-bottom: 1px solid rgba(255, 203, 5, 0.3);
          padding-bottom: 1px;
          transition: border-color 0.2s, color 0.2s;
        }

        .about-credit-link:hover {
          color: #FFE066;
          border-color: rgba(255, 224, 102, 0.6);
        }

        /* ─── Disclaimer ───────────────────────────────────── */
        .about-disclaimer {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          background: rgba(229, 57, 53, 0.07);
          border: 1px solid rgba(229, 57, 53, 0.2);
          border-radius: 12px;
          padding: 16px 20px;
          font-size: 0.8rem;
          color: var(--color-muted-gray);
          line-height: 1.65;
        }

        .about-disclaimer-icon {
          color: rgba(229, 57, 53, 0.7);
          flex-shrink: 0;
          margin-top: 2px;
        }

        .about-disclaimer strong {
          color: var(--color-soft-white);
        }
      `}</style>
    </div>
  );
}
