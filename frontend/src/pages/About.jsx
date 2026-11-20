import { useState, useEffect } from 'react';
import {
  ExternalLink,
  Heart,
  Code2,
  Database,
  Globe,
  Zap,
  Shield,
  Star,
  Award,
  BookOpen,
  User,
  GraduationCap,
  Mail,
  Github,
  Download,
  Smartphone,
  Monitor,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import '../styles/pages.css';

const TECH_STACK = [
  {
    category: 'Frontend',
    color: '#61DAFB',
    glow: 'rgba(97, 218, 251, 0.25)',
    items: [
      { name: 'React 18', desc: 'Modern component-based UI', icon: '⚛️' },
      { name: 'Vite', desc: 'Lightning-fast build tool & dev server', icon: '⚡' },
      { name: 'React Router v6', desc: 'Client-side SPA navigation', icon: '🔀' },
      { name: 'Lucide React', desc: 'Clean, modern icon library', icon: '✨' },
      { name: 'Vite PWA Plugin', desc: 'Offline service workers & manifest', icon: '📱' },
    ],
  },
  {
    category: 'Backend & Database',
    color: '#3ECF8E',
    glow: 'rgba(62, 207, 142, 0.25)',
    items: [
      { name: 'Node.js + Express', desc: 'REST API orchestrator', icon: '🟢' },
      { name: 'Supabase', desc: 'PostgreSQL database & Auth system', icon: '🗄️' },
      { name: 'Row Level Security', desc: 'Per-user data privacy & isolation', icon: '🔐' },
      { name: 'Axios', desc: 'Interceptors with JWT auth tokens', icon: '🌐' },
    ],
  },
  {
    category: 'Card Data Source',
    color: '#FFCB05',
    glow: 'rgba(255, 203, 5, 0.25)',
    items: [
      { name: 'TCGdex API', desc: 'Pokémon TCG card database & artwork', icon: '🃏' },
      { name: 'TCGdex SDK', desc: 'Official JavaScript/TypeScript SDK', icon: '📦' },
      { name: 'High-Res CDN', desc: 'Ultra-clear Pokémon card renders', icon: '🖼️' },
    ],
  },
];

const FEATURES = [
  { icon: BookOpen, label: 'Card Catalog', desc: 'Browse thousands of Pokémon TCG cards with real-time search and multi-criteria filters.' },
  { icon: Star, label: 'Wishlist Tracker', desc: 'Save cards you are actively hunting for and move them to your collection in one tap.' },
  { icon: Shield, label: 'Collection Manager', desc: 'Track your personal cards with condition grades (NM to DMG), quantity steppers, and sets.' },
  { icon: Zap, label: 'Modern Filters', desc: 'Filter effortlessly by condition, card expansion set, and multiple sorting orders.' },
  { icon: Globe, label: 'Installable PWA', desc: 'Download PokéDeckz onto your phone or desktop and run it just like a native app.' },
  { icon: Award, label: 'Trainer Profile', desc: 'Choose your starter avatar, customize your trainer name, and review your stats.' },
];

export default function About() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already running in standalone/installed mode
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
      setIsInstalled(true);
    }

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setInstallPrompt(null);
      }
    } else {
      alert(
        'How to Download / Install PokéDeckz:\n\n' +
        '• Desktop (Chrome / Edge): Click the Install icon in the address bar (or Menu ⋮ > Install PokéDeckz).\n\n' +
        '• Android (Chrome): Tap the three-dot menu (⋮) > "Install app" or "Add to Home screen".\n\n' +
        '• iPhone / iPad (Safari): Tap the Share button at the bottom > "Add to Home Screen".'
      );
    }
  };

  return (
    <div className="about-page">
      <div className="about-hero-backdrop" />

      {/* Hero Section */}
      <div className="about-hero">
        <div className="about-hero-badge">
          <Heart size={12} />
          <span>Built with passion for Pokémon TCG Trainers</span>
        </div>
        <h1 className="about-title">
          About <span className="about-title-highlight">PokéDeckz</span>
        </h1>
        <p className="about-subtitle">
          Your personal Pokémon TCG collection companion — track, discover, and manage your cards all in one sleek, modern, installable web app.
        </p>
      </div>

      {/* Creator Profile Section */}
      <section className="about-section">
        <div className="about-section-header">
          <User size={20} className="about-section-icon" style={{ color: '#00E676' }} />
          <h2 className="about-section-title">Meet the Creator</h2>
        </div>

        <div className="about-creator-card">
          <div className="about-creator-header">
            <div className="about-creator-avatar">
              <User size={32} className="creator-avatar-icon" />
            </div>
            <div className="about-creator-main">
              <div className="about-creator-badge">
                <Sparkles size={12} />
                <span>Lead Developer</span>
              </div>
              <h3 className="about-creator-name">Colin Madani Suprayogo</h3>
              <p className="about-creator-bio">
                Passionate software developer and Pokémon fan studying Computer Engineering, dedicated to crafting sleek, modern web applications.
              </p>
            </div>
          </div>

          <div className="about-creator-details-grid">
            {/* NIM */}
            <div className="about-creator-detail-item">
              <div className="detail-item-icon">
                <Code2 size={16} />
              </div>
              <div className="detail-item-content">
                <span className="detail-item-label">Student ID (NIM)</span>
                <span className="detail-item-value highlight-nim">21120124140129</span>
              </div>
            </div>

            {/* University */}
            <div className="about-creator-detail-item">
              <div className="detail-item-icon">
                <GraduationCap size={16} />
              </div>
              <div className="detail-item-content">
                <span className="detail-item-label">University</span>
                <span className="detail-item-value">Diponegoro University (UNDIP)</span>
              </div>
            </div>

            {/* Email */}
            <div className="about-creator-detail-item">
              <div className="detail-item-icon">
                <Mail size={16} />
              </div>
              <div className="detail-item-content">
                <span className="detail-item-label">Email Address</span>
                <a
                  href="mailto:colinmadanisuprayogo@gmail.com"
                  className="detail-item-value email-link"
                >
                  colinmadanisuprayogo@gmail.com
                </a>
              </div>
            </div>

            {/* GitHub */}
            <div className="about-creator-detail-item">
              <div className="detail-item-icon">
                <Github size={16} />
              </div>
              <div className="detail-item-content">
                <span className="detail-item-label">GitHub Profile</span>
                <a
                  href="https://github.com/ColinSigma"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="detail-item-value github-link"
                >
                  github.com/ColinSigma <ExternalLink size={12} />
                </a>
              </div>
            </div>
          </div>

          <div className="about-creator-actions">
            <a
              href="mailto:colinmadanisuprayogo@gmail.com"
              className="creator-action-btn primary"
            >
              <Mail size={15} />
              <span>Contact Creator</span>
            </a>
            <a
              href="https://github.com/ColinSigma/pokedeckz"
              target="_blank"
              rel="noopener noreferrer"
              className="creator-action-btn secondary"
            >
              <Github size={15} />
              <span>View Repository</span>
            </a>
          </div>
        </div>
      </section>

      {/* Download & Install (PWA) Section */}
      <section className="about-section">
        <div className="about-section-header">
          <Download size={20} className="about-section-icon" style={{ color: '#FFCB05' }} />
          <h2 className="about-section-title">Download & Install PokéDeckz</h2>
        </div>

        <div className="about-download-card">
          <div className="about-download-top">
            <div className="about-download-icon-box">
              <Smartphone size={32} />
            </div>
            <div className="about-download-info">
              <h3 className="about-download-title">Downloadable Progressive Web App (PWA)</h3>
              <p className="about-download-desc">
                PokéDeckz is a Progressive Web App (PWA). You can download and install it directly onto your computer, iPhone, iPad, or Android phone without going through an app store. It works offline, opens in standalone fullscreen, and updates automatically!
              </p>
            </div>
            <div className="about-download-cta">
              {isInstalled ? (
                <div className="installed-badge">
                  <CheckCircle2 size={16} />
                  <span>Installed & Ready</span>
                </div>
              ) : (
                <button
                  type="button"
                  className="download-install-btn"
                  onClick={handleInstallClick}
                >
                  <Download size={18} />
                  <span>Download / Install App</span>
                </button>
              )}
            </div>
          </div>

          <div className="about-install-steps-grid">
            <div className="install-step-card">
              <div className="step-card-header">
                <Monitor size={18} />
                <span>Desktop (Windows / Mac)</span>
              </div>
              <p>Click the <strong>Install</strong> icon in your browser URL bar (Chrome or Edge) or click the button above.</p>
            </div>

            <div className="install-step-card">
              <div className="step-card-header">
                <Smartphone size={18} />
                <span>iPhone / iPad (iOS)</span>
              </div>
              <p>Open in Safari, tap the <strong>Share</strong> button (box with arrow up), then select <strong>"Add to Home Screen"</strong>.</p>
            </div>

            <div className="install-step-card">
              <div className="step-card-header">
                <Smartphone size={18} />
                <span>Android</span>
              </div>
              <p>Open in Chrome, tap the three dots <strong>(⋮)</strong> in the top-right, and select <strong>"Install app"</strong>.</p>
            </div>
          </div>
        </div>
      </section>

      {/* What is PokéDeckz */}
      <section className="about-section">
        <div className="about-section-header">
          <BookOpen size={20} className="about-section-icon" style={{ color: '#FFCB05' }} />
          <h2 className="about-section-title">What is PokéDeckz?</h2>
        </div>
        <div className="about-glass-card about-about-card">
          <p>
            <strong>PokéDeckz</strong> is a full-stack Pokémon TCG (Trading Card Game) collection management web app. Whether you're a seasoned collector or just starting to build your first binder, PokéDeckz gives you the tools to browse a comprehensive card catalog, wishlist cards you're hunting for, and track every card in your collection with its condition grade and quantity.
          </p>
          <p>
            The app features a sleek dark aesthetic, responsive mobile-first layout, custom glassmorphism filters, and Progressive Web App (PWA) support — meaning you can install it on your devices and enjoy an app-like experience anywhere you go.
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
          padding: 32px 0 36px;
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
          margin-bottom: 18px;
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
          margin-bottom: 40px;
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

        /* ─── Creator Card ─────────────────────────────────── */
        .about-creator-card {
          background: linear-gradient(135deg, rgba(22, 26, 38, 0.82) 0%, rgba(18, 21, 31, 0.9) 100%);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(0, 230, 118, 0.22);
          border-radius: 20px;
          padding: 28px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35), 0 0 20px rgba(0, 230, 118, 0.08);
          transition: border-color 0.25s, box-shadow 0.25s;
        }

        .about-creator-card:hover {
          border-color: rgba(0, 230, 118, 0.4);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.45), 0 0 30px rgba(0, 230, 118, 0.14);
        }

        .about-creator-header {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .about-creator-avatar {
          width: 64px;
          height: 64px;
          border-radius: 18px;
          background: linear-gradient(135deg, rgba(0, 230, 118, 0.2) 0%, rgba(0, 191, 165, 0.15) 100%);
          border: 1.5px solid rgba(0, 230, 118, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-grass-green, #00E676);
          box-shadow: 0 4px 16px rgba(0, 230, 118, 0.15);
          flex-shrink: 0;
        }

        .creator-avatar-icon {
          color: var(--color-grass-green, #00E676);
          filter: drop-shadow(0 0 8px rgba(0, 230, 118, 0.5));
        }

        .about-creator-main {
          flex: 1;
          min-width: 220px;
        }

        .about-creator-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: rgba(0, 230, 118, 0.15);
          color: var(--color-grass-green, #00E676);
          border: 1px solid rgba(0, 230, 118, 0.35);
          border-radius: 100px;
          padding: 3px 10px;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          margin-bottom: 6px;
        }

        .about-creator-name {
          font-size: 1.45rem;
          font-weight: 800;
          color: var(--color-white);
          margin-bottom: 6px;
          letter-spacing: -0.02em;
        }

        .about-creator-bio {
          font-size: 0.88rem;
          color: var(--color-soft-white);
          line-height: 1.55;
          opacity: 0.85;
          max-width: 640px;
        }

        .about-creator-details-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
          margin-bottom: 24px;
        }

        @media (min-width: 600px) {
          .about-creator-details-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .about-creator-detail-item {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(14, 17, 24, 0.65);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 12px 16px;
          transition: border-color 0.2s, background 0.2s;
        }

        .about-creator-detail-item:hover {
          border-color: rgba(255, 255, 255, 0.18);
          background: rgba(14, 17, 24, 0.85);
        }

        .detail-item-icon {
          color: var(--color-grass-green, #00E676);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .detail-item-content {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }

        .detail-item-label {
          font-size: 0.72rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--color-muted-gray);
        }

        .detail-item-value {
          font-size: 0.88rem;
          font-weight: 700;
          color: var(--color-white);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .detail-item-value.highlight-nim {
          font-family: 'SF Mono', 'Fira Code', 'Roboto Mono', monospace;
          color: #FFCB05;
          letter-spacing: 0.5px;
        }

        .detail-item-value.email-link,
        .detail-item-value.github-link {
          color: var(--color-electric-yellow);
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          transition: color 0.2s;
        }

        .detail-item-value.email-link:hover,
        .detail-item-value.github-link:hover {
          color: #FFE066;
          text-decoration: underline;
        }

        .about-creator-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .creator-action-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 9px 18px;
          border-radius: 10px;
          font-size: 0.82rem;
          font-weight: 700;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .creator-action-btn.primary {
          background: linear-gradient(135deg, rgba(0, 230, 118, 0.2) 0%, rgba(0, 191, 165, 0.2) 100%);
          border: 1px solid rgba(0, 230, 118, 0.4);
          color: var(--color-grass-green, #00E676);
        }

        .creator-action-btn.primary:hover {
          background: linear-gradient(135deg, rgba(0, 230, 118, 0.35) 0%, rgba(0, 191, 165, 0.3) 100%);
          transform: translateY(-1px);
        }

        .creator-action-btn.secondary {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: var(--color-white);
        }

        .creator-action-btn.secondary:hover {
          background: rgba(255, 255, 255, 0.12);
          transform: translateY(-1px);
        }

        /* ─── Download / Install Card ──────────────────────── */
        .about-download-card {
          background: linear-gradient(135deg, rgba(22, 26, 38, 0.8) 0%, rgba(18, 21, 31, 0.85) 100%);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 203, 5, 0.25);
          border-radius: 20px;
          padding: 26px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35);
        }

        .about-download-top {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 22px;
          flex-wrap: wrap;
        }

        .about-download-icon-box {
          width: 58px;
          height: 58px;
          border-radius: 16px;
          background: rgba(255, 203, 5, 0.12);
          border: 1.5px solid rgba(255, 203, 5, 0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-electric-yellow);
          flex-shrink: 0;
        }

        .about-download-info {
          flex: 1;
          min-width: 240px;
        }

        .about-download-title {
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--color-white);
          margin-bottom: 4px;
        }

        .about-download-desc {
          font-size: 0.84rem;
          color: var(--color-soft-white);
          line-height: 1.55;
          opacity: 0.85;
        }

        .about-download-cta {
          flex-shrink: 0;
        }

        .download-install-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 22px;
          background: linear-gradient(135deg, #FFCB05 0%, #FFA000 100%);
          color: #0E1015;
          font-size: 0.9rem;
          font-weight: 800;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 18px rgba(255, 203, 5, 0.35);
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .download-install-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 24px rgba(255, 203, 5, 0.5);
        }

        .installed-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          background: rgba(0, 230, 118, 0.15);
          border: 1px solid rgba(0, 230, 118, 0.4);
          color: var(--color-grass-green, #00E676);
          font-size: 0.84rem;
          font-weight: 700;
          border-radius: 12px;
        }

        .about-install-steps-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          padding-top: 18px;
        }

        @media (min-width: 769px) {
          .about-install-steps-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .install-step-card {
          background: rgba(14, 17, 24, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 12px;
          padding: 14px 16px;
        }

        .step-card-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--color-electric-yellow);
          margin-bottom: 6px;
        }

        .install-step-card p {
          font-size: 0.78rem;
          color: var(--color-muted-gray);
          line-height: 1.5;
        }

        .install-step-card strong {
          color: var(--color-white);
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
