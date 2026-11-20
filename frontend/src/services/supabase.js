import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'placeholder-anon-key';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) {
  console.warn(
    '[Pokédeckz] Supabase credentials not found in frontend/.env. ' +
    'The public catalog and card browser will work directly via TCGdex. ' +
    'Configure your Supabase project in frontend/.env to enable user login and collection sync.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);
