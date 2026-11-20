const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || 'placeholder-anon-key';

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_PUBLISHABLE_KEY) {
  console.warn(
    '[Pokédeckz] Note: SUPABASE_URL or SUPABASE_PUBLISHABLE_KEY not set in .env. ' +
    'Card catalog and health endpoints will work via TCGdex; ' +
    'set real Supabase credentials to enable authenticated collection & wishlist features.'
  );
}

// Base client for non-authenticated operations
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * Create a Supabase client scoped to a user's access token for RLS.
 * @param {string} accessToken - The user's JWT access token
 * @returns {import('@supabase/supabase-js').SupabaseClient}
 */
function createUserSupabaseClient(accessToken) {
  return createClient(SUPABASE_URL, SUPABASE_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
}

module.exports = { supabase, createUserSupabaseClient };
