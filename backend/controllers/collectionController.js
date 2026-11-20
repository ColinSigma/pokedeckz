const { createUserSupabaseClient } = require('../config/supabase');
const supabaseService = require('../services/supabaseService');

async function getCollection(req, res, next) {
  try {
    const supabase = createUserSupabaseClient(req.headers.authorization?.split(' ')[1]);
    const data = await supabaseService.getCollection(supabase, req.user.id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

async function addToCollection(req, res, next) {
  try {
    const { cardId, quantity, condition } = req.body;

    if (!cardId) {
      return res.status(400).json({ success: false, error: 'cardId is required' });
    }

    const supabase = createUserSupabaseClient(req.headers.authorization?.split(' ')[1]);
    const data = await supabaseService.addToCollection(supabase, req.user.id, cardId, quantity, condition);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

async function updateCollectionItem(req, res, next) {
  try {
    const { id } = req.params;
    const { quantity, condition } = req.body;

    const supabase = createUserSupabaseClient(req.headers.authorization?.split(' ')[1]);
    const data = await supabaseService.updateCollectionItem(supabase, req.user.id, id, quantity, condition);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

async function deleteCollectionItem(req, res, next) {
  try {
    const { id } = req.params;
    const supabase = createUserSupabaseClient(req.headers.authorization?.split(' ')[1]);
    await supabaseService.deleteCollectionItem(supabase, req.user.id, id);
    res.json({ success: true, data: { message: 'Item removed from collection' } });
  } catch (error) {
    next(error);
  }
}

module.exports = { getCollection, addToCollection, updateCollectionItem, deleteCollectionItem };
