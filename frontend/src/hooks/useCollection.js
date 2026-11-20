import { useState, useEffect, useCallback, useMemo } from 'react';
import * as api from '../services/api';

export function useCollection() {
  const [collection, setCollection] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCollection = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getCollection();
      setCollection(response.data || response || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching collection:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addCard = useCallback(async (cardId, quantity = 1, condition = 'Near Mint') => {
    try {
      await api.addToCollection(cardId, quantity, condition);
      await fetchCollection();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [fetchCollection]);

  const updateCard = useCallback(async (id, data) => {
    try {
      await api.updateCollectionItem(id, data);
      await fetchCollection();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [fetchCollection]);

  const removeCard = useCallback(async (id) => {
    try {
      await api.deleteCollectionItem(id);
      setCollection((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const stats = useMemo(() => {
    const items = Array.isArray(collection) ? collection : [];
    const uniqueCards = items.length;
    const totalCards = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const setIds = new Set(items.map((item) => item.card_id?.split('-')[0]).filter(Boolean));
    const totalSets = setIds.size;
    return { uniqueCards, totalCards, totalSets };
  }, [collection]);

  useEffect(() => {
    fetchCollection();
  }, [fetchCollection]);

  return {
    collection,
    loading,
    error,
    stats,
    fetchCollection,
    addCard,
    updateCard,
    removeCard,
  };
}
