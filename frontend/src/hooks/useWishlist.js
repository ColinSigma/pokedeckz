import { useState, useEffect, useCallback } from 'react';
import * as api from '../services/api';

export function useWishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWishlist = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getWishlist();
      setWishlist(response.data || response || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching wishlist:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addCard = useCallback(async (cardId) => {
    try {
      await api.addToWishlist(cardId);
      await fetchWishlist();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [fetchWishlist]);

  const removeCard = useCallback(async (id) => {
    try {
      await api.removeFromWishlist(id);
      setWishlist((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const moveToCollection = useCallback(async (id, cardId) => {
    try {
      await api.addToCollection(cardId, 1, 'Near Mint');
      await api.removeFromWishlist(id);
      setWishlist((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  return {
    wishlist,
    loading,
    error,
    fetchWishlist,
    addCard,
    removeCard,
    moveToCollection,
  };
}
