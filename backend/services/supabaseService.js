/**
 * Supabase data-access service.
 * All functions accept a user-scoped Supabase client so RLS applies.
 */

// ─── Collection ──────────────────────────────────────────────

async function getCollection(client, userId) {
  let query = client.from('collection_items').select('*');
  if (userId) {
    query = query.eq('user_id', userId);
  }
  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

async function addToCollection(client, userId, cardId, quantity = 1, condition = 'Near Mint') {
  // Support both (client, userId, cardId, quantity, condition) and legacy (client, cardId, quantity, condition)
  let resolvedUserId = userId;
  let resolvedCardId = cardId;
  let resolvedQuantity = quantity;
  let resolvedCondition = condition;

  if (typeof userId === 'string' && (typeof cardId === 'number' || cardId === undefined)) {
    resolvedCardId = userId;
    resolvedQuantity = cardId || 1;
    resolvedCondition = quantity || 'Near Mint';
    resolvedUserId = null;
  }

  if (!resolvedUserId) {
    try {
      const { data: { user } } = await client.auth.getUser();
      resolvedUserId = user?.id;
    } catch (_) {}
  }

  // Check if card already exists in THIS user's collection
  let lookupQuery = client
    .from('collection_items')
    .select('id, quantity')
    .eq('card_id', resolvedCardId);

  if (resolvedUserId) {
    lookupQuery = lookupQuery.eq('user_id', resolvedUserId);
  }

  const { data: existing, error: lookupError } = await lookupQuery.maybeSingle();

  if (lookupError) throw lookupError;

  if (existing) {
    // Increment quantity
    let updateQuery = client
      .from('collection_items')
      .update({
        quantity: existing.quantity + resolvedQuantity,
        condition: resolvedCondition,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id);

    if (resolvedUserId) {
      updateQuery = updateQuery.eq('user_id', resolvedUserId);
    }

    const { data, error } = await updateQuery.select().single();

    if (error) throw error;
    return data;
  }

  // Insert new item WITH user_id attached
  const insertPayload = {
    card_id: resolvedCardId,
    quantity: resolvedQuantity,
    condition: resolvedCondition,
  };
  if (resolvedUserId) {
    insertPayload.user_id = resolvedUserId;
  }

  const { data, error } = await client
    .from('collection_items')
    .insert(insertPayload)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function updateCollectionItem(client, userId, itemId, quantity, condition) {
  // Support legacy signature (client, itemId, quantity, condition)
  let resolvedUserId = userId;
  let resolvedItemId = itemId;
  let resolvedQuantity = quantity;
  let resolvedCondition = condition;

  if (typeof userId === 'string' && typeof itemId === 'object' && itemId !== null) {
    resolvedItemId = userId;
    resolvedQuantity = itemId.quantity;
    resolvedCondition = itemId.condition;
    resolvedUserId = null;
  } else if (typeof userId === 'string' && (typeof itemId === 'number' || typeof itemId === 'string' && !condition && !quantity)) {
    // legacy check
  }

  const updates = { updated_at: new Date().toISOString() };
  if (resolvedQuantity !== undefined) updates.quantity = resolvedQuantity;
  if (resolvedCondition !== undefined) updates.condition = resolvedCondition;

  let query = client
    .from('collection_items')
    .update(updates)
    .eq('id', resolvedItemId);

  if (resolvedUserId) {
    query = query.eq('user_id', resolvedUserId);
  }

  const { data, error } = await query.select().single();

  if (error) throw error;
  return data;
}

async function deleteCollectionItem(client, userId, itemId) {
  let resolvedUserId = userId;
  let resolvedItemId = itemId;

  if (!itemId) {
    resolvedItemId = userId;
    resolvedUserId = null;
  }

  let query = client
    .from('collection_items')
    .delete()
    .eq('id', resolvedItemId);

  if (resolvedUserId) {
    query = query.eq('user_id', resolvedUserId);
  }

  const { error } = await query;

  if (error) throw error;
  return true;
}

// ─── Wishlist ────────────────────────────────────────────────

async function getWishlist(client, userId) {
  let query = client.from('wishlist_items').select('*');
  if (userId) {
    query = query.eq('user_id', userId);
  }
  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

async function addToWishlist(client, userId, cardId) {
  let resolvedUserId = userId;
  let resolvedCardId = cardId;

  if (cardId === undefined) {
    resolvedCardId = userId;
    resolvedUserId = null;
  }

  if (!resolvedUserId) {
    try {
      const { data: { user } } = await client.auth.getUser();
      resolvedUserId = user?.id;
    } catch (_) {}
  }

  // Check if card already exists in THIS user's wishlist
  let lookupQuery = client
    .from('wishlist_items')
    .select('id')
    .eq('card_id', resolvedCardId);

  if (resolvedUserId) {
    lookupQuery = lookupQuery.eq('user_id', resolvedUserId);
  }

  const { data: existing, error: lookupError } = await lookupQuery.maybeSingle();

  if (lookupError) throw lookupError;
  if (existing) return existing;

  const insertPayload = { card_id: resolvedCardId };
  if (resolvedUserId) {
    insertPayload.user_id = resolvedUserId;
  }

  const { data, error } = await client
    .from('wishlist_items')
    .insert(insertPayload)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function removeFromWishlist(client, userId, itemId) {
  let resolvedUserId = userId;
  let resolvedItemId = itemId;

  if (!itemId) {
    resolvedItemId = userId;
    resolvedUserId = null;
  }

  let query = client
    .from('wishlist_items')
    .delete()
    .eq('id', resolvedItemId);

  if (resolvedUserId) {
    query = query.eq('user_id', resolvedUserId);
  }

  const { error } = await query;

  if (error) throw error;
  return true;
}

// ─── Profile ─────────────────────────────────────────────────

async function getProfile(client, userId) {
  const { data, error } = await client
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;

  const defaultSuffix = userId ? userId.slice(0, 4).toUpperCase() : Math.floor(1000 + Math.random() * 9000);
  const defaultUsername = `PokeTrainer_${defaultSuffix}`;

  if (!data) {
    // Return default profile object with safe non-email username
    const initialProfile = {
      id: userId,
      username: defaultUsername,
      full_name: 'Pokémon Trainer',
      avatar_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
      updated_at: new Date().toISOString()
    };
    try {
      const { data: created } = await client.from('profiles').insert(initialProfile).select().single();
      if (created) return created;
    } catch (_) {}
    return initialProfile;
  }

  // If existing username is missing or was saved as an email address, sanitize it to default username!
  if (!data.username || data.username.includes('@')) {
    data.username = defaultUsername;
    client
      .from('profiles')
      .update({ username: defaultUsername, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .then(() => {})
      .catch(() => {});
  }

  return data;
}

async function updateProfile(client, userId, updates) {
  const updatePayload = { ...updates, updated_at: new Date().toISOString() };

  // 1. Try direct UPDATE first (succeeds with standard UPDATE RLS policy)
  const { data: updateData, error: updateError } = await client
    .from('profiles')
    .update(updatePayload)
    .eq('id', userId)
    .select()
    .maybeSingle();

  if (!updateError && updateData) {
    return updateData;
  }

  // 2. If row does not exist yet, attempt UPSERT/INSERT
  const { data, error } = await client
    .from('profiles')
    .upsert({ id: userId, ...updatePayload })
    .select()
    .single();

  if (error) throw error;
  return data;
}

module.exports = {
  getCollection,
  addToCollection,
  updateCollectionItem,
  deleteCollectionItem,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  getProfile,
  updateProfile,
};
