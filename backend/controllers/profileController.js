const { createUserSupabaseClient } = require('../config/supabase');
const supabaseService = require('../services/supabaseService');

async function getProfile(req, res, next) {
  try {
    const supabase = createUserSupabaseClient(req.headers.authorization?.split(' ')[1]);
    const data = await supabaseService.getProfile(supabase, req.user.id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

async function updateProfile(req, res, next) {
  try {
    const { username, full_name, avatar_url } = req.body;
    const updates = {};
    if (username !== undefined) updates.username = username;
    if (full_name !== undefined) updates.full_name = full_name;
    if (avatar_url !== undefined) updates.avatar_url = avatar_url;

    const supabase = createUserSupabaseClient(req.headers.authorization?.split(' ')[1]);
    const data = await supabaseService.updateProfile(supabase, req.user.id, updates);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

module.exports = { getProfile, updateProfile };
