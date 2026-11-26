export default function PokecenterCompanions() {
  return (
    <div className="pokecenter-companions" aria-hidden="true">
      {/* Left: Professor Oak */}
      <div className="pokecenter-npc oak-npc">
        <div className="npc-portrait-frame oak-frame">
          <svg viewBox="0 0 100 100" className="npc-svg">
            {/* Background Warm Lab Glow */}
            <circle cx="50" cy="50" r="48" fill="#FEF2F2" />
            {/* Lab Coat & Polo */}
            <path d="M20,100 C20,76 35,70 50,70 C65,70 80,76 80,100 Z" fill="#FFFFFF" stroke="#1E293B" strokeWidth="2.5" />
            <path d="M40,70 L50,86 L60,70 Z" fill="#991B1B" />
            {/* Neck & Head */}
            <rect x="44" y="58" width="12" height="14" fill="#FDBA74" />
            <ellipse cx="50" cy="44" rx="18" ry="20" fill="#FDBA74" stroke="#1E293B" strokeWidth="2.2" />
            {/* Grey Hair & Eyebrows */}
            <path d="M30,42 C28,22 72,22 70,42 C66,30 34,30 30,42 Z" fill="#94A3B8" stroke="#1E293B" strokeWidth="2" />
            <path d="M37,39 L45,38" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M55,38 L63,39" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" />
            {/* Eyes & Smile */}
            <circle cx="42" cy="44" r="2.2" fill="#1E293B" />
            <circle cx="58" cy="44" r="2.2" fill="#1E293B" />
            <path d="M44,53 Q50,57 56,53" fill="none" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <span className="npc-label">Prof. Oak</span>
      </div>

      {/* Center: Official Blissey Artwork */}
      <div className="pokecenter-npc blissey-npc">
        <img
          src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/242.png"
          alt="Blissey"
          className="blissey-artwork"
        />
      </div>

      {/* Right: Nurse Joy */}
      <div className="pokecenter-npc joy-npc">
        <div className="npc-portrait-frame joy-frame">
          <svg viewBox="0 0 100 100" className="npc-svg">
            {/* Background Pink Healing Glow */}
            <circle cx="50" cy="50" r="48" fill="#FFF1F2" />
            {/* Nurse Uniform */}
            <path d="M22,100 C22,76 35,70 50,70 C65,70 78,76 78,100 Z" fill="#FDA4AF" stroke="#1E293B" strokeWidth="2.5" />
            <path d="M38,70 L50,84 L62,70 Z" fill="#FFFFFF" />
            {/* Pink Looped Hair */}
            <circle cx="28" cy="46" r="10" fill="#F472B6" stroke="#1E293B" strokeWidth="2" />
            <circle cx="72" cy="46" r="10" fill="#F472B6" stroke="#1E293B" strokeWidth="2" />
            {/* Head */}
            <ellipse cx="50" cy="46" rx="17" ry="19" fill="#FED7AA" stroke="#1E293B" strokeWidth="2.2" />
            {/* Bangs */}
            <path d="M33,42 C34,26 66,26 67,42 C60,34 40,34 33,42 Z" fill="#F472B6" stroke="#1E293B" strokeWidth="2" />
            {/* Nurse Cap with Red Cross */}
            <path d="M35,28 L65,28 L61,15 L39,15 Z" fill="#FFFFFF" stroke="#1E293B" strokeWidth="2" />
            <path d="M50,18 V25 M46.5,21.5 H53.5" stroke="#E11D48" strokeWidth="2.5" strokeLinecap="round" />
            {/* Blue Eyes & Smile */}
            <circle cx="43" cy="46" r="2.4" fill="#2563EB" />
            <circle cx="57" cy="46" r="2.4" fill="#2563EB" />
            <path d="M45,54 Q50,58 55,54" fill="none" stroke="#E11D48" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <span className="npc-label">Nurse Joy</span>
      </div>
    </div>
  );
}
