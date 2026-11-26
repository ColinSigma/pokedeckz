import { Link, useLocation } from 'react-router-dom';

const HIDDEN_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password'];

export default function GrassFooter() {
  const location = useLocation();

  if (HIDDEN_ROUTES.some((route) => location.pathname.startsWith(route))) {
    return null;
  }

  return (
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

      {/* Layered Pokémon Route Grass Silhouette + Rustling Particles + Pikachu with Ash's Hat */}
      <div className="footer-grass-layer" aria-hidden="true">
        <svg
          viewBox="0 0 1200 72"
          preserveAspectRatio="none"
          className="footer-grass-svg back"
        >
          <path
            d="M0,72 L0,46 Q25,22 48,44 Q70,18 95,46 Q120,25 148,48 Q175,16 204,45 Q232,20 260,46 Q288,18 318,45 Q348,24 375,47 Q402,16 432,44 Q460,22 490,46 Q520,18 552,45 Q582,22 612,47 Q642,16 672,44 Q704,20 734,46 Q764,18 796,45 Q825,24 855,47 Q886,16 916,44 Q946,22 976,46 Q1008,18 1038,45 Q1068,22 1098,47 Q1130,16 1162,45 Q1182,26 1200,44 L1200,72 Z"
            className="grass-back"
          />
        </svg>

        <div className="pikachu-grass-stage">
          <div className="grass-particles">
            <span className="grass-leaf p1" />
            <span className="grass-leaf p2" />
            <span className="grass-leaf p3" />
            <span className="grass-leaf p4" />
            <span className="grass-leaf p5" />
          </div>

          <div className="pikachu-peek-actor">
            <svg viewBox="0 0 120 110" className="pikachu-peek-svg">
              <path d="M28,46 L10,12 L34,30 Z" fill="#FACC15" stroke="#18181B" strokeWidth="2.5" strokeLinejoin="round" />
              <path d="M18,27 L10,12 L25,22 Z" fill="#18181B" />
              <path d="M92,46 L110,12 L86,30 Z" fill="#FACC15" stroke="#18181B" strokeWidth="2.5" strokeLinejoin="round" />
              <path d="M102,27 L110,12 L95,22 Z" fill="#18181B" />

              <ellipse cx="60" cy="68" rx="34" ry="30" fill="#FACC15" stroke="#18181B" strokeWidth="2.5" />

              <path d="M26,48 C26,23 94,23 94,48 Z" fill="#DC2626" stroke="#18181B" strokeWidth="2.5" />
              <path d="M40,47 C40,29 80,29 80,47 Z" fill="#FFFFFF" stroke="#18181B" strokeWidth="2" />
              <path d="M53,42 C53,35 67,35 67,42" fill="none" stroke="#16A34A" strokeWidth="3.2" strokeLinecap="round" />
              <line x1="60" y1="36" x2="60" y2="43" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M23,48 Q60,57 97,48 Q84,42 60,44 Q36,42 23,48 Z" fill="#B91C1C" stroke="#18181B" strokeWidth="2.2" />

              <circle cx="45" cy="64" r="5" fill="#18181B" />
              <circle cx="43.5" cy="62.2" r="1.8" fill="#FFFFFF" />
              <circle cx="75" cy="64" r="5" fill="#18181B" />
              <circle cx="73.5" cy="62.2" r="1.8" fill="#FFFFFF" />

              <polygon points="58,70 62,70 60,72.5" fill="#18181B" />
              <path d="M53,75 Q56.5,78 60,75 Q63.5,78 67,75" fill="none" stroke="#18181B" strokeWidth="2" strokeLinecap="round" />

              <circle cx="34" cy="74" r="6.5" fill="#EF4444" />
              <circle cx="86" cy="74" r="6.5" fill="#EF4444" />

              <ellipse cx="42" cy="92" rx="6" ry="5" fill="#FACC15" stroke="#18181B" strokeWidth="2" />
              <ellipse cx="78" cy="92" rx="6" ry="5" fill="#FACC15" stroke="#18181B" strokeWidth="2" />
            </svg>
          </div>
        </div>

        <svg
          viewBox="0 0 1200 72"
          preserveAspectRatio="none"
          className="footer-grass-svg front"
        >
          <path
            d="M0,72 L0,54 Q18,32 34,54 Q52,26 70,54 Q88,36 108,55 Q126,28 145,54 Q165,34 185,56 Q205,24 226,54 Q248,34 268,55 Q290,26 312,54 Q334,36 355,55 Q376,28 398,54 Q420,34 442,56 Q464,24 486,54 Q508,36 530,55 Q552,26 574,54 Q596,34 618,55 Q640,28 662,54 Q684,34 706,56 Q728,24 750,54 Q772,36 794,55 Q816,26 838,54 Q860,34 882,55 Q904,28 926,54 Q948,34 970,56 Q992,24 1014,54 Q1036,36 1058,55 Q1080,26 1102,54 Q1124,34 1146,55 Q1168,28 1188,54 L1200,52 L1200,72 Z"
            className="grass-front"
          />
          <circle cx="145" cy="40" r="3" className="grass-flower-yellow" />
          <circle cx="312" cy="42" r="2.5" className="grass-flower-white" />
          <circle cx="486" cy="39" r="3" className="grass-flower-red" />
          <circle cx="662" cy="41" r="2.5" className="grass-flower-yellow" />
          <circle cx="838" cy="40" r="3" className="grass-flower-white" />
          <circle cx="1014" cy="39" r="3" className="grass-flower-red" />
        </svg>
      </div>
    </footer>
  );
}
