import axios from 'axios';
import { supabase } from './supabase';

const TCGDEX_BASE_URL = 'https://api.tcgdex.net/v2/en';

// Configure Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? '' : 'http://localhost:3001'),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 8000,
});

// Request interceptor — attach auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
      }
    } catch (error) {
      console.warn('Could not get session for request interceptor:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — normalize errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

// ─── TCGdex Direct Fallback Client ──────────────────────────
const tcgdexClient = axios.create({
  baseURL: TCGDEX_BASE_URL,
  timeout: 15000,
});

// ─── Cards & Sets (With Seamless Direct Fallback) ────────────
export const getCards = async (params = {}) => {
  try {
    return await api.get('/api/cards', { params });
  } catch (err) {
    console.warn('[PokéDeckz] Backend not reachable, using direct TCGdex client fallback:', err.message);
    try {
      const page = parseInt(params.page, 10) || 1;
      const limit = Math.min(parseInt(params.limit, 10) || 24, 100);

      const tcgdexParams = new URLSearchParams();
      if (!params.set) tcgdexParams.append('image', 'notnull:');
      if (params.search) tcgdexParams.append('name', params.search);
      if (params.type && params.type !== 'All') tcgdexParams.append('types', params.type);
      if (params.rarity && params.rarity !== 'All') tcgdexParams.append('rarity', params.rarity);
      if (params.set) tcgdexParams.append('set', params.set);
      if (params.category && params.category !== 'All') tcgdexParams.append('category', params.category);
      if (params.serie) tcgdexParams.append('serie', params.serie);

      const resp = await tcgdexClient.get('/cards', { params: tcgdexParams });
      const allCards = Array.isArray(resp.data) ? resp.data : [];

      // Sort cards if requested
      if (params.sort) {
        const field = params.sort;
        const isDesc = (params.order || 'asc').toLowerCase() === 'desc';
        allCards.sort((a, b) => {
          const valA = a[field] ?? '';
          const valB = b[field] ?? '';
          return isDesc ? String(valB).localeCompare(String(valA)) : String(valA).localeCompare(String(valB));
        });
      }

      const totalItems = allCards.length;
      const startIndex = (page - 1) * limit;
      const pagedCards = allCards.slice(startIndex, startIndex + limit);
      const totalPages = Math.ceil(totalItems / limit) || 1;

      return {
        success: true,
        data: pagedCards,
        pagination: {
          page,
          limit,
          totalItems,
          totalPages,
          hasMore: startIndex + limit < totalItems,
        },
      };
    } catch (fallbackErr) {
      console.error('[PokéDeckz] Direct TCGdex request failed:', fallbackErr);
      throw new Error('Failed to load Pokémon cards from TCGdex. Please check your internet connection.');
    }
  }
};

export const getCardById = async (id) => {
  try {
    return await api.get(`/api/cards/${id}`);
  } catch (err) {
    console.warn('[PokéDeckz] Backend not reachable for card detail, falling back directly to TCGdex:', err.message);
    const resp = await tcgdexClient.get(`/cards/${id}`);
    return { success: true, data: resp.data };
  }
};

export const getSets = async (params = {}) => {
  try {
    return await api.get('/api/sets', { params });
  } catch (err) {
    console.warn('[PokéDeckz] Backend not reachable for sets, falling back directly to TCGdex:', err.message);
    const resp = await tcgdexClient.get('/sets');
    return { success: true, data: Array.isArray(resp.data) ? resp.data : [] };
  }
};

export const getSetById = async (id) => {
  try {
    return await api.get(`/api/sets/${id}`);
  } catch (err) {
    const resp = await tcgdexClient.get(`/sets/${id}`);
    return { success: true, data: resp.data };
  }
};

export const getSeries = async () => {
  try {
    return await api.get('/api/series');
  } catch (err) {
    console.warn('[PokéDeckz] Backend not reachable for series, falling back directly to TCGdex:', err.message);
    const resp = await tcgdexClient.get('/series');
    return { success: true, data: Array.isArray(resp.data) ? resp.data : [] };
  }
};

// ─── Collection (With Direct Supabase Fallback) ────────────
export const getCollection = async () => {
  try {
    return await api.get('/api/collection');
  } catch (err) {
    console.warn('[PokéDeckz] Backend not reachable for collection, falling back to direct Supabase:', err.message);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: true, data: [] };

    const { data, error } = await supabase
      .from('collection')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data: data || [] };
  }
};

export const addToCollection = async (cardId, quantity = 1, condition = 'Near Mint') => {
  try {
    return await api.post('/api/collection', { cardId, quantity, condition });
  } catch (err) {
    console.warn('[PokéDeckz] Backend not reachable for addToCollection, falling back to direct Supabase:', err.message);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('You must be logged in to add cards to your collection');

    // Fetch card details for caching
    let cardData = {};
    try {
      const cardRes = await tcgdexClient.get(`/cards/${cardId}`);
      cardData = cardRes.data || {};
    } catch {}

    const { data, error } = await supabase
      .from('collection')
      .upsert(
        {
          user_id: user.id,
          card_id: cardId,
          card_name: cardData.name || 'Unknown Card',
          card_image: cardData.image ? `${cardData.image}/high.webp` : null,
          card_set: cardData.set?.name || null,
          card_rarity: cardData.rarity || null,
          quantity: quantity || 1,
          condition: condition || 'Near Mint',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,card_id' }
      )
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  }
};

export const updateCollectionItem = async (id, data) => {
  try {
    return await api.put(`/api/collection/${id}`, data);
  } catch (err) {
    const { data: updated, error } = await supabase
      .from('collection')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data: updated };
  }
};

export const deleteCollectionItem = async (id) => {
  try {
    return await api.delete(`/api/collection/${id}`);
  } catch (err) {
    const { error } = await supabase
      .from('collection')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true, data: { message: 'Item removed from collection' } };
  }
};

// ─── Wishlist (With Direct Supabase Fallback) ──────────────
export const getWishlist = async () => {
  try {
    return await api.get('/api/wishlist');
  } catch (err) {
    console.warn('[PokéDeckz] Backend not reachable for wishlist, falling back to direct Supabase:', err.message);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: true, data: [] };

    const { data, error } = await supabase
      .from('wishlist')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data: data || [] };
  }
};

export const addToWishlist = async (cardId) => {
  try {
    return await api.post('/api/wishlist', { cardId });
  } catch (err) {
    console.warn('[PokéDeckz] Backend not reachable for addToWishlist, falling back to direct Supabase:', err.message);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('You must be logged in to add to wishlist');

    let cardData = {};
    try {
      const cardRes = await tcgdexClient.get(`/cards/${cardId}`);
      cardData = cardRes.data || {};
    } catch {}

    const { data, error } = await supabase
      .from('wishlist')
      .upsert(
        {
          user_id: user.id,
          card_id: cardId,
          card_name: cardData.name || 'Unknown Card',
          card_image: cardData.image ? `${cardData.image}/high.webp` : null,
          card_set: cardData.set?.name || null,
          card_rarity: cardData.rarity || null,
        },
        { onConflict: 'user_id,card_id' }
      )
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  }
};

export const removeFromWishlist = async (id) => {
  try {
    return await api.delete(`/api/wishlist/${id}`);
  } catch (err) {
    const { error } = await supabase
      .from('wishlist')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true, data: { message: 'Item removed from wishlist' } };
  }
};

// ─── Profile (With Direct Supabase Fallback) ───────────────
export const getProfile = async () => {
  try {
    return await api.get('/api/profile');
  } catch (err) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: true, data: null };

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return { success: true, data: data || { id: user.id, username: user.email?.split('@')[0] } };
  }
};

export const updateProfile = async (data) => {
  try {
    return await api.put('/api/profile', data);
  } catch (err) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not logged in');

    const { data: updated, error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, ...data, updated_at: new Date().toISOString() })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data: updated };
  }
};

export default api;
