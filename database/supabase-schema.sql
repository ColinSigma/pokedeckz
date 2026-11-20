-- =============================================================================
-- Pokédeckz — Supabase PostgreSQL Schema
-- A Pokémon TCG Collection Manager
--
-- Run this script in the Supabase SQL Editor to initialize the database.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. PROFILES TABLE
--    Stores public user profile data. The primary key references auth.users
--    so every row is tied to a Supabase Auth user.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username   TEXT UNIQUE,
  full_name  TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- 2. COLLECTION_ITEMS TABLE
--    Each row represents a card the user owns, with quantity and condition.
--    A user can have only one entry per card_id (upsert on add).
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS collection_items (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  card_id    TEXT NOT NULL,
  quantity   INTEGER DEFAULT 1 CHECK (quantity > 0),
  condition  TEXT DEFAULT 'Near Mint'
             CHECK (condition IN (
               'Near Mint',
               'Lightly Played',
               'Moderately Played',
               'Heavily Played',
               'Damaged'
             )),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE (user_id, card_id)
);

-- ---------------------------------------------------------------------------
-- 3. WISHLIST_ITEMS TABLE
--    Cards a user wants but does not yet own. One entry per card per user.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS wishlist_items (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  card_id    TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE (user_id, card_id)
);

-- ---------------------------------------------------------------------------
-- 4. INDEXES
--    Speed up queries that filter by user_id or card_id.
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_collection_items_user_id ON collection_items (user_id);
CREATE INDEX IF NOT EXISTS idx_collection_items_card_id ON collection_items (card_id);

CREATE INDEX IF NOT EXISTS idx_wishlist_items_user_id   ON wishlist_items (user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_items_card_id   ON wishlist_items (card_id);

-- ---------------------------------------------------------------------------
-- 5. UPDATED_AT TRIGGER FUNCTION
--    Automatically sets updated_at to now() on every UPDATE.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger to profiles
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- Apply the trigger to collection_items
CREATE TRIGGER trg_collection_items_updated_at
  BEFORE UPDATE ON collection_items
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- 6. HANDLE NEW USER TRIGGER FUNCTION
--    When a new user signs up via Supabase Auth, automatically create a
--    matching profiles row. Falls back to email as the username.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_username TEXT;
BEGIN
  default_username := 'PokeTrainer_' || substring(NEW.id::text from 1 for 4);

  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NULLIF(NEW.raw_user_meta_data ->> 'username', ''), default_username),
    COALESCE(NULLIF(NEW.raw_user_meta_data ->> 'full_name', ''), 'Pokémon Trainer'),
    COALESCE(NULLIF(NEW.raw_user_meta_data ->> 'avatar_url', ''), 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fire after every new auth.users row
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ---------------------------------------------------------------------------
-- 7. ROW LEVEL SECURITY (RLS) & TABLE PERMISSIONS
-- ---------------------------------------------------------------------------

-- Grant table access to authenticated users
GRANT ALL ON TABLE profiles TO authenticated;
GRANT ALL ON TABLE collection_items TO authenticated;
GRANT ALL ON TABLE wishlist_items TO authenticated;

-- ---- profiles ----
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ---- collection_items ----
ALTER TABLE collection_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own collection" ON collection_items;
CREATE POLICY "Users can view their own collection"
  ON collection_items FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can add to their own collection" ON collection_items;
CREATE POLICY "Users can add to their own collection"
  ON collection_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own collection" ON collection_items;
CREATE POLICY "Users can update their own collection"
  ON collection_items FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete from their own collection" ON collection_items;
CREATE POLICY "Users can delete from their own collection"
  ON collection_items FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ---- wishlist_items ----
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own wishlist" ON wishlist_items;
CREATE POLICY "Users can view their own wishlist"
  ON wishlist_items FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can add to their own wishlist" ON wishlist_items;
CREATE POLICY "Users can add to their own wishlist"
  ON wishlist_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete from their own wishlist" ON wishlist_items;
CREATE POLICY "Users can delete from their own wishlist"
  ON wishlist_items FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =============================================================================
-- Done. All tables, indexes, triggers, and RLS policies are ready.
-- =============================================================================
