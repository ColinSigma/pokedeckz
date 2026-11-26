export default function PokecenterCompanions() {
  return (
    <div className="pokecenter-page-companions" aria-hidden="true">
      {/* Left Side of Page: Professor Oak */}
      <div className="pokecenter-side pokecenter-side-left">
        <img
          src="/images/professor-oak.png"
          alt="Professor Oak"
          className="side-character-full-img oak-img"
        />
      </div>

      {/* Right Side of Page: Nurse Joy & Blissey */}
      <div className="pokecenter-side pokecenter-side-right">
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
      </div>
    </div>
  );
}
