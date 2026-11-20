export default function PokeballHatLogo({ size = 26, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{
        display: 'inline-block',
        verticalAlign: 'middle',
        overflow: 'visible',
      }}
      aria-label="Poké Ball with Pikachu Hat"
    >
      <defs>
        {/* Shiny Poké Ball gloss */}
        <linearGradient id="pokeballRed" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FF4D4D" />
          <stop offset="100%" stopColor="#D32F2F" />
        </linearGradient>
        <linearGradient id="pokeballWhite" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#DFE6E9" />
        </linearGradient>
        <linearGradient id="pikachuYellow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFEB3B" />
          <stop offset="100%" stopColor="#FBC02D" />
        </linearGradient>
        <filter id="ballGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#FFCB05" floodOpacity="0.35" />
        </filter>
      </defs>

      {/* ─── 1. Pikachu Ears ─── */}
      {/* Left Ear */}
      <g>
        <path
          d="M 32 32 L 14 6 C 12 3, 8 6, 11 11 L 24 38 Z"
          fill="url(#pikachuYellow)"
          stroke="#1E1E1E"
          strokeWidth="2"
        />
        {/* Left Ear Black Tip */}
        <path
          d="M 14 6 L 19 15 L 12 18 C 10 13, 10 8, 14 6 Z"
          fill="#1E1E1E"
        />
      </g>

      {/* Right Ear */}
      <g>
        <path
          d="M 68 32 L 86 6 C 88 3, 92 6, 89 11 L 76 38 Z"
          fill="url(#pikachuYellow)"
          stroke="#1E1E1E"
          strokeWidth="2"
        />
        {/* Right Ear Black Tip */}
        <path
          d="M 86 6 L 81 15 L 88 18 C 90 13, 90 8, 86 6 Z"
          fill="#1E1E1E"
        />
      </g>

      {/* ─── 2. Main Poké Ball Body ─── */}
      <g filter="url(#ballGlow)">
        {/* Bottom Half: Pure White */}
        <path
          d="M 18 56 A 32 32 0 0 0 82 56 Z"
          fill="url(#pokeballWhite)"
          stroke="#1E1E1E"
          strokeWidth="3.5"
        />

        {/* Top Half: Red */}
        <path
          d="M 18 56 A 32 32 0 0 1 82 56 Z"
          fill="url(#pokeballRed)"
          stroke="#1E1E1E"
          strokeWidth="3.5"
        />

        {/* Gloss highlight on red half */}
        <path
          d="M 24 50 A 26 26 0 0 1 48 30 Q 34 38 24 50 Z"
          fill="rgba(255, 255, 255, 0.45)"
        />

        {/* Center Belt */}
        <line
          x1="18"
          y1="56"
          x2="82"
          y2="56"
          stroke="#1E1E1E"
          strokeWidth="6"
        />

        {/* Center Button Outer Ring */}
        <circle
          cx="50"
          cy="56"
          r="10"
          fill="#1E1E1E"
        />

        {/* Center Button Inner White Disc */}
        <circle
          cx="50"
          cy="56"
          r="6"
          fill="#FFFFFF"
          stroke="#1E1E1E"
          strokeWidth="2"
        />

        {/* Center Glow Core */}
        <circle
          cx="50"
          cy="56"
          r="2.5"
          fill="#00E5FF"
        />
      </g>

      {/* ─── 3. Ash Ketchum's Iconic Trainer Hat ─── */}
      <g>
        {/* Hat Dome (Red) */}
        <path
          d="M 28 36 C 28 20, 72 20, 72 36 Z"
          fill="#D32F2F"
          stroke="#1E1E1E"
          strokeWidth="2.5"
        />

        {/* White Front Panel */}
        <path
          d="M 36 36 C 36 24, 64 24, 64 36 Z"
          fill="#FFFFFF"
          stroke="#1E1E1E"
          strokeWidth="1.5"
        />

        {/* Classic Green/Teal Poké Ball Emblem on Hat */}
        <path
          d="M 46 29 A 4 4 0 0 1 54 29"
          stroke="#00897B"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        <circle cx="50" cy="30" r="1.5" fill="#00897B" />

        {/* Hat Visor / Brim (angled red visor with white underside) */}
        <path
          d="M 24 37 Q 50 43 76 37 Q 50 47 24 37 Z"
          fill="#B71C1C"
          stroke="#1E1E1E"
          strokeWidth="2.5"
        />
        <path
          d="M 28 38 Q 50 44 72 38"
          stroke="#FFFFFF"
          strokeWidth="1.5"
          fill="none"
        />
      </g>
    </svg>
  );
}
