import { useTheme } from '../context/ThemeContext';

const POKEMON_SPRITE_BASE =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork';

/**
 * Canonical lore/story Pokémon duos per page & theme.
 * Left-side Pokémon face left; right-side Pokémon face right (except `about`).
 */
const PAGE_DUOS = {
  home: {
    dark: {
      // Shadow/Ghost duo: Mega Gengar + Marshadow
      left: { id: 10038, name: 'Mega Gengar', flip: false, size: '64vh' },
      right: { id: 802, name: 'Marshadow', flip: true, size: '56vh' },
    },
    light: {
      // Partner duo: Pikachu + Eevee
      left: { id: 25, name: 'Pikachu', flip: false, size: '60vh' },
      right: { id: 133, name: 'Eevee', flip: true, size: '56vh' },
    },
  },
  catalog: {
    dark: {
      // Super-Ancient Hoenn duo: Groudon + Kyogre
      left: { id: 383, name: 'Groudon', flip: true, size: '64vh' },
      right: { id: 382, name: 'Kyogre', flip: true, size: '62vh' },
    },
    light: {
      // Johto Tower duo: Lugia + Ho-Oh
      left: { id: 249, name: 'Lugia', flip: false, size: '66vh' },
      right: { id: 250, name: 'Ho-Oh', flip: false, size: '66vh' },
    },
  },
  collection: {
    dark: {
      // Unova Dark/Illusion duo: Zekrom + Zoroark
      left: { id: 644, name: 'Zekrom', flip: false, size: '66vh' },
      right: { id: 571, name: 'Zoroark', flip: true, size: '64vh' },
    },
    light: {
      // Sword of the Vale duo: Victini + Reshiram
      left: { id: 494, name: 'Victini', flip: false, size: '58vh' },
      right: { id: 643, name: 'Reshiram', flip: false, size: '68vh' },
    },
  },
  wishlist: {
    dark: {
      // Lunar duo: Darkrai + Cresselia
      left: { id: 491, name: 'Darkrai', flip: false, size: '64vh' },
      right: { id: 488, name: 'Cresselia', flip: false, size: '62vh' },
    },
    light: {
      // Wish Maker duo: Jirachi + Absol
      left: { id: 385, name: 'Jirachi', flip: false, size: '58vh' },
      right: { id: 359, name: 'Absol', flip: false, size: '60vh' },
    },
  },
  'card-detail': {
    dark: {
      // Destiny Deoxys duo: Rayquaza + Deoxys
      left: { id: 384, name: 'Rayquaza', flip: false, size: '66vh' },
      right: { id: 386, name: 'Deoxys', flip: true, size: '62vh' },
    },
    light: {
      // Eon duo: Latias + Latios
      left: { id: 380, name: 'Latias', flip: false, size: '60vh' },
      right: { id: 381, name: 'Latios', flip: true, size: '64vh' },
    },
  },
  profile: {
    dark: {
      // Sinnoh Creation duo: Dialga + Palkia
      left: { id: 483, name: 'Dialga', flip: true, size: '64vh' },
      right: { id: 484, name: 'Palkia', flip: true, size: '64vh' },
    },
    light: {
      // Sun & Moon Eeveelution duo: Espeon + Umbreon
      left: { id: 196, name: 'Espeon', flip: false, size: '58vh' },
      right: { id: 197, name: 'Umbreon', flip: false, size: '58vh' },
    },
  },
  about: {
    dark: {
      // Genetic duo: Mewtwo + Mew (explicitly unflipped)
      left: { id: 150, name: 'Mewtwo', flip: false, size: '50vh' },
      right: { id: 151, name: 'Mew', flip: false, size: '44vh' },
    },
    light: {
      // Voice of the Forest duo: Celebi + Suicune (explicitly unflipped)
      left: { id: 251, name: 'Celebi', flip: false, size: '52vh' },
      right: { id: 245, name: 'Suicune', flip: false, size: '60vh' },
    },
  },
  trainers: {
    dark: {
      // Champion Cynthia duo: Garchomp + Spiritomb
      left: { id: 445, name: 'Garchomp', flip: false, size: '64vh' },
      right: { id: 442, name: 'Spiritomb', flip: false, size: '54vh' },
    },
    light: {
      // Galar Hero duo: Zacian + Zamazenta
      left: { id: 888, name: 'Zacian', flip: true, size: '62vh' },
      right: { id: 889, name: 'Zamazenta', flip: true, size: '62vh' },
    },
  },
};

export default function HeroBackdropPokemon({ page }) {
  const { theme } = useTheme();
  const mode = theme === 'light' ? 'light' : 'dark';
  const duo = PAGE_DUOS[page]?.[mode];

  if (!duo) return null;

  return (
    <div className="hero-pokemon-pair" aria-hidden="true">
      <div className="hero-poke-slot hero-poke-slot-left">
        <img
          src={`${POKEMON_SPRITE_BASE}/${duo.left.id}.png`}
          alt={duo.left.name}
          className={`hero-poke-img ${duo.left.flip ? 'is-flipped' : ''}`}
          style={{ height: duo.left.size }}
          loading="eager"
        />
      </div>
      <div className="hero-poke-slot hero-poke-slot-right">
        <img
          src={`${POKEMON_SPRITE_BASE}/${duo.right.id}.png`}
          alt={duo.right.name}
          className={`hero-poke-img ${duo.right.flip ? 'is-flipped' : ''}`}
          style={{ height: duo.right.size }}
          loading="eager"
        />
      </div>
    </div>
  );
}
