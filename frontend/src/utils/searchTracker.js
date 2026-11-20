/**
 * searchTracker.js
 * Tracks Pokémon search queries in localStorage so features like
 * "Featured Cards" can adapt to the user's favorite searched Pokémon.
 */

const STORAGE_KEY = 'pokedeckz_search_history';

export function recordSearch(rawTerm) {
  if (!rawTerm || typeof rawTerm !== 'string') return;
  const term = rawTerm.trim();
  if (term.length < 2) return;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const history = raw ? JSON.parse(raw) : {};

    // Key by lowercased term for accurate counting, store display capitalization
    const key = term.toLowerCase();
    const existing = history[key] || { count: 0, display: term };
    
    history[key] = {
      count: existing.count + 1,
      display: existing.display || term,
      lastSearched: Date.now(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {
    // LocalStorage quota or access error - ignore gracefully
  }
}

export function getTopSearchedPokemon() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const history = JSON.parse(raw);
    const entries = Object.values(history);
    if (!entries.length) return null;

    // Sort by search frequency descending, then by recency
    entries.sort((a, b) => b.count - a.count || b.lastSearched - a.lastSearched);
    return entries[0]?.display || null;
  } catch {
    return null;
  }
}

export function getTopSearchesList(limit = 5) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const history = JSON.parse(raw);
    const entries = Object.values(history);
    entries.sort((a, b) => b.count - a.count || b.lastSearched - a.lastSearched);
    return entries.slice(0, limit).map((e) => e.display);
  } catch {
    return [];
  }
}
