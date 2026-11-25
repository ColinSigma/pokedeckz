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

      const tcgdexParams = {};
      if (params.search) tcgdexParams.name = params.search;
      if (params.type && params.type !== 'All') tcgdexParams.types = params.type;
      if (params.rarity && params.rarity !== 'All') tcgdexParams.rarity = params.rarity;
      if (params.set) tcgdexParams.set = params.set;
      if (params.category && params.category !== 'All') tcgdexParams.category = params.category;
      if (params.serie) tcgdexParams.serie = params.serie;

      const resp = await tcgdexClient.get('/cards', { params: tcgdexParams });
      let allCards = Array.isArray(resp.data) ? resp.data : [];

      // Ensure every returned card has valid scanned artwork
      allCards = allCards.filter((c) => Boolean(c.image));

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

    // Try collection_items (schema table) first, then collection
    let res = await supabase
      .from('collection_items')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (res.error && (res.error.message?.includes('does not exist') || res.error.message?.includes('schema cache'))) {
      res = await supabase
        .from('collection')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
    }

    if (res.error) throw res.error;
    return { success: true, data: res.data || [] };
  }
};

export const addToCollection = async (cardId, quantity = 1, condition = 'Near Mint') => {
  try {
    return await api.post('/api/collection', { cardId, quantity, condition });
  } catch (err) {
    console.warn('[PokéDeckz] Backend not reachable for addToCollection, falling back to direct Supabase:', err.message);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('You must be logged in to add cards to your collection');

    // 1. Check if card already exists in collection_items
    const { data: existing } = await supabase
      .from('collection_items')
      .select('id, quantity')
      .eq('user_id', user.id)
      .eq('card_id', cardId)
      .maybeSingle();

    if (existing) {
      const { data, error } = await supabase
        .from('collection_items')
        .update({
          quantity: (existing.quantity || 1) + (quantity || 1),
          condition: condition || 'Near Mint',
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    }

    // 2. Insert new item
    const insertPayload = {
      user_id: user.id,
      card_id: cardId,
      quantity: quantity || 1,
      condition: condition || 'Near Mint',
    };

    let res = await supabase
      .from('collection_items')
      .insert(insertPayload)
      .select()
      .single();

    if (res.error && (res.error.message?.includes('does not exist') || res.error.message?.includes('schema cache'))) {
      res = await supabase
        .from('collection')
        .insert(insertPayload)
        .select()
        .single();
    }

    if (res.error) throw res.error;
    return { success: true, data: res.data };
  }
};

export const updateCollectionItem = async (id, data) => {
  try {
    return await api.put(`/api/collection/${id}`, data);
  } catch (err) {
    let res = await supabase
      .from('collection_items')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (res.error && (res.error.message?.includes('does not exist') || res.error.message?.includes('schema cache'))) {
      res = await supabase
        .from('collection')
        .update(data)
        .eq('id', id)
        .select()
        .single();
    }

    if (res.error) throw res.error;
    return { success: true, data: res.data };
  }
};

export const deleteCollectionItem = async (id) => {
  try {
    return await api.delete(`/api/collection/${id}`);
  } catch (err) {
    let res = await supabase
      .from('collection_items')
      .delete()
      .eq('id', id);

    if (res.error && (res.error.message?.includes('does not exist') || res.error.message?.includes('schema cache'))) {
      res = await supabase
        .from('collection')
        .delete()
        .eq('id', id);
    }

    if (res.error) throw res.error;
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

    let res = await supabase
      .from('wishlist_items')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (res.error && (res.error.message?.includes('does not exist') || res.error.message?.includes('schema cache'))) {
      res = await supabase
        .from('wishlist')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
    }

    if (res.error) throw res.error;
    return { success: true, data: res.data || [] };
  }
};

export const addToWishlist = async (cardId) => {
  try {
    return await api.post('/api/wishlist', { cardId });
  } catch (err) {
    console.warn('[PokéDeckz] Backend not reachable for addToWishlist, falling back to direct Supabase:', err.message);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('You must be logged in to add to wishlist');

    const payload = {
      user_id: user.id,
      card_id: cardId,
    };

    let res = await supabase
      .from('wishlist_items')
      .upsert(payload, { onConflict: 'user_id,card_id' })
      .select()
      .single();

    if (res.error && (res.error.message?.includes('does not exist') || res.error.message?.includes('schema cache'))) {
      res = await supabase
        .from('wishlist')
        .upsert(payload, { onConflict: 'user_id,card_id' })
        .select()
        .single();
    }

    if (res.error) throw res.error;
    return { success: true, data: res.data };
  }
};

export const removeFromWishlist = async (id) => {
  try {
    return await api.delete(`/api/wishlist/${id}`);
  } catch (err) {
    let res = await supabase
      .from('wishlist_items')
      .delete()
      .eq('id', id);

    if (res.error && (res.error.message?.includes('does not exist') || res.error.message?.includes('schema cache'))) {
      res = await supabase
        .from('wishlist')
        .delete()
        .eq('id', id);
    }

    if (res.error) throw res.error;
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

// ─── Trainer Search & Public Discovery ───────────────────────
export const searchTrainers = async (query = '') => {
  try {
    let q = supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(60);

    const trimmed = (query || '').trim();
    if (trimmed) {
      q = q.or(`username.ilike.%${trimmed}%,full_name.ilike.%${trimmed}%`);
    }

    const { data, error } = await q;
    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (err) {
    console.warn('[Pokédeckz] searchTrainers fallback error:', err.message);
    return { success: false, error: err.message, data: [] };
  }
};

export const getTrainerById = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.warn('[Pokédeckz] getTrainerById error:', err.message);
    return { success: false, error: err.message, data: null };
  }
};

export const getTrainerCollection = async (userId) => {
  try {
    let res = await supabase
      .from('collection_items')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (res.error && (res.error.message?.includes('does not exist') || res.error.message?.includes('schema cache'))) {
      res = await supabase
        .from('collection')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
    }

    if (res.error) throw res.error;
    return { success: true, data: res.data || [] };
  } catch (err) {
    console.warn('[Pokédeckz] getTrainerCollection error:', err.message);
    return { success: false, error: err.message, data: [] };
  }
};

export const getTrainerWishlist = async (userId) => {
  try {
    let res = await supabase
      .from('wishlist_items')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (res.error && (res.error.message?.includes('does not exist') || res.error.message?.includes('schema cache'))) {
      res = await supabase
        .from('wishlist')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
    }

    if (res.error) throw res.error;
    return { success: true, data: res.data || [] };
  } catch (err) {
    console.warn('[Pokédeckz] getTrainerWishlist error:', err.message);
    return { success: false, error: err.message, data: [] };
  }
};

export default api;
