const { createUserSupabaseClient } = require('../config/supabase');
const supabaseService = require('../services/supabaseService');

async function getWishlist(req, res, next) {
  try {
    const supabase = createUserSupabaseClient(req.headers.authorization?.split(' ')[1]);
    const data = await supabaseService.getWishlist(supabase, req.user.id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

async function addToWishlist(req, res, next) {
  try {
    const { cardId } = req.body;

    if (!cardId) {
      return res.status(400).json({ success: false, error: 'cardId is required' });
    }

    const supabase = createUserSupabaseClient(req.headers.authorization?.split(' ')[1]);
    const data = await supabaseService.addToWishlist(supabase, req.user.id, cardId);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

async function removeFromWishlist(req, res, next) {
  try {
    const { id } = req.params;
    const supabase = createUserSupabaseClient(req.headers.authorization?.split(' ')[1]);
    await supabaseService.removeFromWishlist(supabase, req.user.id, id);
    res.json({ success: true, data: { message: 'Item removed from wishlist' } });
  } catch (error) {
    next(error);
  }
}

module.exports = { getWishlist, addToWishlist, removeFromWishlist };
