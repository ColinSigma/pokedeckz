/**
 * Pokédeckz — Card Rarity & Tag Color System
 * Provides distinctive, vibrant color palettes for every Pokémon TCG card rarity tier.
 */

export function getRarityColor(rarity) {
  if (!rarity) {
    return {
      color: '#CBD5E1',
      bg: '#1E293B',
      border: '#64748B',
      text: '#F8FAFC',
    };
  }

  const r = rarity.toLowerCase().trim();

  // 1. Secret Rare / Hyper Rare / Rainbow Rare -> Vibrant Crimson / Neon Magenta
  if (r.includes('secret') || r.includes('hyper') || r.includes('rainbow')) {
    return {
      color: '#F43F5E',
      bg: '#881337',
      border: '#FB7185',
      text: '#FFE4E6',
    };
  }

  // 2. Illustration Rare / Special Illustration / Alt Art -> Radiant Cyan / Mystic Teal
  if (r.includes('illustration') || r.includes('special art') || r.includes('alt')) {
    return {
      color: '#00E5FF',
      bg: '#0E3A45',
      border: '#00E5FF',
      text: '#E0F7FA',
    };
  }

  // 3. Ultra Rare / Double Rare / V / VMAX / VSTAR / EX / GX -> Radiant Gold / Amber
  if (
    r.includes('ultra') ||
    r.includes('double') ||
    r.includes('vmax') ||
    r.includes('vstar') ||
    r.includes('ex') ||
    r.includes('gx')
  ) {
    return {
      color: '#FFB300',
      bg: '#5D4037',
      border: '#FFA000',
      text: '#FFF8E1',
    };
  }

  // 4. Rare Holo / Holofoil / Shiny Rare / Radiant -> Amethyst Violet / Purple
  if (r.includes('holo') || r.includes('shiny') || r.includes('radiant') || r.includes('amazing')) {
    return {
      color: '#B388FF',
      bg: '#311B92',
      border: '#7C4DFF',
      text: '#EDE7F6',
    };
  }

  // 5. ACE SPEC Rare -> Fiery Hot Pink / Scarlet
  if (r.includes('ace spec')) {
    return {
      color: '#FF1744',
      bg: '#B71C1C',
      border: '#FF5252',
      text: '#FFEBEE',
    };
  }

  // 6. Promo -> Electric Pikachu Gold
  if (r.includes('promo')) {
    return {
      color: '#FFD700',
      bg: '#4E3A00',
      border: '#FFCA28',
      text: '#FFFDE7',
    };
  }

  // 7. Rare (Standard Star Rare) -> Sapphire Cobalt Blue
  if (r === 'rare' || r.includes('rare')) {
    return {
      color: '#448AFF',
      bg: '#0D2B66',
      border: '#2979FF',
      text: '#E3F2FD',
    };
  }

  // 8. Uncommon (Diamond) -> Emerald Mint Green
  if (r.includes('uncommon')) {
    return {
      color: '#00E676',
      bg: '#004D20',
      border: '#00C853',
      text: '#E8F5E9',
    };
  }

  // 9. Common (Circle) -> Silver Slate
  if (r.includes('common')) {
    return {
      color: '#90A4AE',
      bg: '#263238',
      border: '#607D8B',
      text: '#ECEFF1',
    };
  }

  return {
    color: '#CBD5E1',
    bg: '#1E293B',
    border: '#64748B',
    text: '#F8FAFC',
  };
}

export function getRarityBadgeStyle(rarity) {
  const conf = getRarityColor(rarity);
  return {
    backgroundColor: conf.bg,
    color: conf.text,
    border: `1.5px solid ${conf.border}`,
    fontWeight: '700',
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  };
}
