/**
 * Comprehensive list of authentic Pokémon Trading Card Game sets & promo collections.
 * Used as fallback enrichment when TCGdex API encounters latency or timeouts.
 */
const OFFICIAL_SETS_FALLBACK = [
  // ─── Scarlet & Violet Era (Gen 9) ───
  { id: 'sv08', name: 'Surging Sparks', series: 'sv', cardCount: 252 },
  { id: 'sv07', name: 'Stellar Crown', series: 'sv', cardCount: 175 },
  { id: 'sv06pt5', name: 'Shrouded Fable', series: 'sv', cardCount: 99 },
  { id: 'sv06', name: 'Twilight Masquerade', series: 'sv', cardCount: 226 },
  { id: 'sv05', name: 'Temporal Forces', series: 'sv', cardCount: 218 },
  { id: 'sv04pt5', name: 'Paldean Fates', series: 'sv', cardCount: 245 },
  { id: 'sv04', name: 'Paradox Rift', series: 'sv', cardCount: 266 },
  { id: 'sv03pt5', name: '151 (Special Set)', series: 'sv', cardCount: 207 },
  { id: 'sv03', name: 'Obsidian Flames', series: 'sv', cardCount: 230 },
  { id: 'sv02', name: 'Paldea Evolved', series: 'sv', cardCount: 279 },
  { id: 'sv01', name: 'Scarlet & Violet Base', series: 'sv', cardCount: 258 },
  { id: 'svp', name: 'Scarlet & Violet Promos', series: 'sv', cardCount: 160 },

  // ─── Sword & Shield Era (Gen 8) ───
  { id: 'swsh12pt5', name: 'Crown Zenith', series: 'swsh', cardCount: 230 },
  { id: 'swsh12', name: 'Silver Tempest', series: 'swsh', cardCount: 245 },
  { id: 'swsh11', name: 'Lost Origin', series: 'swsh', cardCount: 247 },
  { id: 'swsh10pt5', name: 'Pokémon GO', series: 'swsh', cardCount: 88 },
  { id: 'swsh10', name: 'Astral Radiance', series: 'swsh', cardCount: 246 },
  { id: 'swsh09', name: 'Brilliant Stars', series: 'swsh', cardCount: 216 },
  { id: 'swsh08', name: 'Fusion Strike', series: 'swsh', cardCount: 284 },
  { id: 'cel25', name: 'Celebrations (25th Anniv)', series: 'swsh', cardCount: 50 },
  { id: 'swsh07', name: 'Evolving Skies', series: 'swsh', cardCount: 237 },
  { id: 'swsh06', name: 'Chilling Reign', series: 'swsh', cardCount: 233 },
  { id: 'swsh05', name: 'Battle Styles', series: 'swsh', cardCount: 183 },
  { id: 'swsh45', name: 'Shining Fates', series: 'swsh', cardCount: 195 },
  { id: 'swsh04', name: 'Vivid Voltage', series: 'swsh', cardCount: 203 },
  { id: 'swsh35', name: "Champion's Path", series: 'swsh', cardCount: 80 },
  { id: 'swsh03', name: 'Darkness Ablaze', series: 'swsh', cardCount: 201 },
  { id: 'swsh02', name: 'Rebel Clash', series: 'swsh', cardCount: 209 },
  { id: 'swsh01', name: 'Sword & Shield Base', series: 'swsh', cardCount: 216 },
  { id: 'swshp', name: 'SWSH Black Star Promos', series: 'swsh', cardCount: 307 },

  // ─── Sun & Moon Era (Gen 7) ───
  { id: 'sm12', name: 'Cosmic Eclipse', series: 'sm', cardCount: 271 },
  { id: 'sm115', name: 'Hidden Fates', series: 'sm', cardCount: 163 },
  { id: 'sm11', name: 'Unified Minds', series: 'sm', cardCount: 258 },
  { id: 'sm10', name: 'Unbroken Bonds', series: 'sm', cardCount: 234 },
  { id: 'sm09', name: 'Team Up', series: 'sm', cardCount: 196 },
  { id: 'sm08', name: 'Lost Thunder', series: 'sm', cardCount: 236 },
  { id: 'sm75', name: 'Dragon Majesty', series: 'sm', cardCount: 78 },
  { id: 'sm07', name: 'Celestial Storm', series: 'sm', cardCount: 183 },
  { id: 'sm06', name: 'Forbidden Light', series: 'sm', cardCount: 146 },
  { id: 'sm05', name: 'Ultra Prism', series: 'sm', cardCount: 173 },
  { id: 'sm04', name: 'Crimson Invasion', series: 'sm', cardCount: 124 },
  { id: 'sm35', name: 'Shining Legends', series: 'sm', cardCount: 78 },
  { id: 'sm03', name: 'Burning Shadows', series: 'sm', cardCount: 169 },
  { id: 'sm02', name: 'Guardians Rising', series: 'sm', cardCount: 169 },
  { id: 'sm01', name: 'Sun & Moon Base', series: 'sm', cardCount: 163 },
  { id: 'smp', name: 'SM Black Star Promos', series: 'sm', cardCount: 248 },

  // ─── Classic & Vintage Eras (Gen 1-6) ───
  { id: 'xy12', name: 'Evolutions', series: 'xy', cardCount: 113 },
  { id: 'g1', name: 'Generations (20th Anniv)', series: 'xy', cardCount: 115 },
  { id: 'bw11', name: 'Legendary Treasures', series: 'bw', cardCount: 140 },
  { id: 'hgss1', name: 'HeartGold & SoulSilver', series: 'hgss', cardCount: 124 },
  { id: 'pl1', name: 'Platinum Base', series: 'pl', cardCount: 133 },
  { id: 'dp1', name: 'Diamond & Pearl Base', series: 'dp', cardCount: 130 },
  { id: 'ex1', name: 'Ruby & Sapphire', series: 'ex', cardCount: 109 },
  { id: 'neo1', name: 'Neo Genesis', series: 'neo', cardCount: 111 },
  { id: 'base1', name: 'Base Set (Original 1999)', series: 'base', cardCount: 102 },
  { id: 'miscp', name: 'Miscellaneous Promos', series: 'misc', cardCount: 1 },
];

const SERIES_FALLBACK = [
  { id: 'sv', name: 'Scarlet & Violet (Gen 9)' },
  { id: 'swsh', name: 'Sword & Shield (Gen 8)' },
  { id: 'sm', name: 'Sun & Moon (Gen 7)' },
  { id: 'xy', name: 'XY Series (Gen 6)' },
  { id: 'bw', name: 'Black & White (Gen 5)' },
  { id: 'hgss', name: 'HeartGold & SoulSilver' },
  { id: 'pl', name: 'Platinum Era' },
  { id: 'dp', name: 'Diamond & Pearl (Gen 4)' },
  { id: 'ex', name: 'EX Ruby & Sapphire (Gen 3)' },
  { id: 'neo', name: 'Neo Era (Gen 2)' },
  { id: 'base', name: 'Classic Original Base (Gen 1)' },
];

module.exports = { OFFICIAL_SETS_FALLBACK, SERIES_FALLBACK };
