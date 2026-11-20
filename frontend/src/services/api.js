import axios from 'axios';
import { supabase } from './supabase';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
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
      console.error('Error getting session for request interceptor:', error);
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

// ─── Cards & Sets ──────────────────────────────────────────
export const getCards = (params) => api.get('/api/cards', { params });

export const getCardById = (id) => api.get(`/api/cards/${id}`);

export const getSets = (params) => api.get('/api/sets', { params });

export const getSetById = (id) => api.get(`/api/sets/${id}`);

export const getSeries = () => api.get('/api/series');

// ─── Collection ────────────────────────────────────────────
export const getCollection = () => api.get('/api/collection');

export const addToCollection = (cardId, quantity = 1, condition = 'Near Mint') =>
  api.post('/api/collection', { cardId, quantity, condition });

export const updateCollectionItem = (id, data) =>
  api.put(`/api/collection/${id}`, data);

export const deleteCollectionItem = (id) =>
  api.delete(`/api/collection/${id}`);

// ─── Wishlist ──────────────────────────────────────────────
export const getWishlist = () => api.get('/api/wishlist');

export const addToWishlist = (cardId) =>
  api.post('/api/wishlist', { cardId });

export const removeFromWishlist = (id) =>
  api.delete(`/api/wishlist/${id}`);

// ─── Profile ───────────────────────────────────────────────
export const getProfile = () => api.get('/api/profile');

export const updateProfile = (data) => api.put('/api/profile', data);

export default api;
