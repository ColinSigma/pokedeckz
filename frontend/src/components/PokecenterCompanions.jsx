export default function PokecenterCompanions() {
  return (
    <div className="pokecenter-page-companions" aria-hidden="true">
      {/* Left Side of Page: Professor Oak */}
      <div className="pokecenter-side pokecenter-side-left">
        <div className="side-character-card oak-card">
          <svg viewBox="0 0 140 160" className="side-character-svg">
            <defs>
              <radialGradient id="oakGlow" cx="50%" cy="45%" r="50%">
                <stop offset="0%" stopColor="#FEE2E2" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#FECACA" stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx="70" cy="70" r="65" fill="url(#oakGlow)" />
            {/* Lab Coat */}
            <path d="M22,160 C22,112 42,102 70,102 C98,102 118,112 118,160 Z" fill="#FFFFFF" stroke="#1E293B" strokeWidth="3" />
            <path d="M54,102 L70,128 L86,102 Z" fill="#B91C1C" />
            <path d="M54,102 L44,122 L62,126 Z" fill="#F8FAFC" stroke="#1E293B" strokeWidth="2" />
            <path d="M86,102 L96,122 L78,126 Z" fill="#F8FAFC" stroke="#1E293B" strokeWidth="2" />
            {/* Neck & Head */}
            <rect x="60" y="84" width="20" height="22" fill="#FDBA74" />
            <ellipse cx="70" cy="64" rx="26" ry="29" fill="#FDBA74" stroke="#1E293B" strokeWidth="2.8" />
            {/* Grey Hair */}
            <path d="M40,62 C36,30 104,30 100,62 C93,43 47,43 40,62 Z" fill="#94A3B8" stroke="#1E293B" strokeWidth="2.5" />
            <path d="M50,55 L62,53" stroke="#64748B" strokeWidth="3.2" strokeLinecap="round" />
            <path d="M78,53 L90,55" stroke="#64748B" strokeWidth="3.2" strokeLinecap="round" />
            {/* Eyes & Smile */}
            <circle cx="58" cy="64" r="3.2" fill="#1E293B" />
            <circle cx="82" cy="64" r="3.2" fill="#1E293B" />
            <path d="M60,77 Q70,83 80,77" fill="none" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          <span className="side-character-tag">Professor Oak</span>
        </div>
      </div>

      {/* Right Side of Page: Nurse Joy & Blissey */}
      <div className="pokecenter-side pokecenter-side-right">
        <div className="side-character-card joy-blissey-card">
          <div className="joy-blissey-pair">
            <img
              src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/242.png"
              alt="Blissey"
              className="side-blissey-img"
            />
            <svg viewBox="0 0 140 160" className="side-character-svg joy-svg">
              <defs>
                <radialGradient id="joyGlow" cx="50%" cy="45%" r="50%">
                  <stop offset="0%" stopColor="#FFE4E6" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#FECDD3" stopOpacity="0" />
                </radialGradient>
              </defs>
              <circle cx="70" cy="70" r="65" fill="url(#joyGlow)" />
              {/* Nurse Uniform */}
              <path d="M26,160 C26,112 44,102 70,102 C96,102 114,112 114,160 Z" fill="#FDA4AF" stroke="#1E293B" strokeWidth="3" />
              <path d="M52,102 L70,124 L88,102 Z" fill="#FFFFFF" />
              {/* Pink Looped Hair */}
              <circle cx="36" cy="68" r="14" fill="#F472B6" stroke="#1E293B" strokeWidth="2.5" />
              <circle cx="104" cy="68" r="14" fill="#F472B6" stroke="#1E293B" strokeWidth="2.5" />
              {/* Head */}
              <ellipse cx="70" cy="66" rx="24" ry="27" fill="#FED7AA" stroke="#1E293B" strokeWidth="2.8" />
              <path d="M46,60 C48,36 92,36 94,60 C84,48 56,48 46,60 Z" fill="#F472B6" stroke="#1E293B" strokeWidth="2.5" />
              {/* Nurse Cap with Red Cross */}
              <path d="M48,38 L92,38 L86,20 L54,20 Z" fill="#FFFFFF" stroke="#1E293B" strokeWidth="2.5" />
              <path d="M70,24 V34 M65,29 H75" stroke="#E11D48" strokeWidth="3.2" strokeLinecap="round" />
              {/* Blue Eyes & Smile */}
              <circle cx="59" cy="66" r="3.4" fill="#2563EB" />
              <circle cx="81" cy="66" r="3.4" fill="#2563EB" />
              <path d="M62,78 Q70,84 78,78" fill="none" stroke="#E11D48" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <span className="side-character-tag">Nurse Joy &amp; Blissey</span>
        </div>
      </div>
    </div>
  );
}
