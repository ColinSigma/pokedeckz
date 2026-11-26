export default function PokecenterCompanions() {
  return (
    <div className="pokecenter-page-companions" aria-hidden="true">
      {/* Left Side of Page: Professor Oak */}
      <div className="pokecenter-side pokecenter-side-left">
        <div className="pokecenter-character-stage">
          <div className="pokecenter-floor-glow oak-glow" />
          <div className="pokecenter-floor-shadow" />
          <img
            src="/images/professor-oak.png"
            alt="Professor Oak"
            className="side-character-full-img oak-img"
          />
          <div className="pokecenter-npc-badge oak-badge">
            <span className="npc-badge-dot" />
            <span className="npc-badge-name">PROF. OAK</span>
            <span className="npc-badge-role">PALLET LAB</span>
          </div>
        </div>
      </div>

      {/* Right Side of Page: Nurse Joy & Blissey */}
      <div className="pokecenter-side pokecenter-side-right">
        <div className="pokecenter-character-stage joy-stage">
          <div className="pokecenter-floor-glow joy-glow" />
          <div className="pokecenter-floor-shadow joy-shadow" />
          <img
            src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/242.png"
            alt="Blissey"
            className="side-blissey-img"
          />
          <img
            src="/images/nurse-joy.png"
            alt="Nurse Joy"
            className="side-character-full-img joy-img"
          />
          <div className="pokecenter-npc-badge joy-badge">
            <span className="npc-badge-cross">+</span>
            <span className="npc-badge-name">NURSE JOY &amp; BLISSEY</span>
            <span className="npc-badge-role">POKÉMON CENTER</span>
          </div>
        </div>
      </div>
    </div>
  );
}
