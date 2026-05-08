import { supabase } from '../lib/supabase.js';

/** Login-only: thrown when auth succeeded but user has no admins row (query ok, data null). */
export const ERR_ADMIN_NOT_IN_TABLE = 'ERR_ADMIN_NOT_IN_TABLE';

const AUTH_USER_MAX_ATTEMPTS = 15;
const AUTH_USER_DELAY_MS = 80;

/**
 * After sign-in or on refresh, JWT/user may not be visible to getUser() immediately.
 * Retries supabase.auth.getUser() until id exists or attempts are exhausted.
 */
async function resolveAuthUserWithRetry() {
  let lastError = null;

  for (let attempt = 0; attempt < AUTH_USER_MAX_ATTEMPTS; attempt++) {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    lastError = error;

    if (user?.id) {
      return { user, error: null };
    }

    await new Promise((r) => setTimeout(r, AUTH_USER_DELAY_MS));
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  return { user: user ?? null, error: error ?? lastError };
}

/**
 * Requires an authenticated user (by id). Runs the admins table check only when user is non-null.
 * Uses maybeSingle() for the admins query.
 *
 * @returns {Promise<
 *   | { type: 'query_error'; error: import('@supabase/supabase-js').PostgrestError }
 *   | { type: 'not_admin' }
 *   | { type: 'ok' }
 * >}
 */
async function adminRowCheck(user) {
  const { data, error } = await supabase
    .from('admins')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();

  console.log('ADMIN CHECK DATA:', data);
  console.log('ADMIN CHECK ERROR:', error);

  if (error) {
    return { type: 'query_error', error };
  }

  if (!data?.id) {
    return { type: 'not_admin' };
  }

  return { type: 'ok' };
}

/**
 * Resolves whether the current client has an admin session.
 * Uses getUser() only — never queries admins until user exists.
 *
 * @returns {Promise<
 *   | { type: 'no_user' }
 *   | { type: 'query_error'; error: import('@supabase/supabase-js').PostgrestError }
 *   | { type: 'not_admin' }
 *   | { type: 'admin'; session: import('@supabase/supabase-js').Session }
 * >}
 */
export async function getAdminAccess() {
  const { user, error: userError } = await resolveAuthUserWithRetry();

  console.log('AUTH USER:', user);

  if (userError && import.meta.env.DEV) {
    console.warn('[auth] getUser error after retries:', userError.message);
  }

  if (!user?.id) {
    return { type: 'no_user' };
  }

  const row = await adminRowCheck(user);

  if (row.type === 'query_error') {
    return { type: 'query_error', error: row.error };
  }

  if (row.type === 'not_admin') {
    return { type: 'not_admin' };
  }

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session) {
    if (import.meta.env.DEV) {
      console.warn('[auth] admin row ok but getSession failed', sessionError?.message);
    }
    return { type: 'no_user' };
  }

  return { type: 'admin', session };
}

/**
 * @returns {Promise<import('@supabase/supabase-js').Session | null>}
 * Session only if user is authenticated and present in public.admins.
 */
export async function getAdminSession() {
  const access = await getAdminAccess();

  if (access.type === 'admin') {
    return access.session;
  }

  return null;
}

export async function loginAdmin({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  const { user, error: userError } = await resolveAuthUserWithRetry();

  console.log('AUTH USER:', user);

  if (!user?.id) {
    const detail = userError?.message ? ` (${userError.message})` : '';
    throw new Error(`Session could not be established. Please try again.${detail}`);
  }

  const row = await adminRowCheck(user);

  if (row.type === 'query_error') {
    await supabase.auth.signOut();
    throw row.error;
  }

  if (row.type === 'not_admin') {
    await supabase.auth.signOut();
    throw new Error(ERR_ADMIN_NOT_IN_TABLE);
  }

  return data;
}

export async function logoutAdmin() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
}

/**
 * Subscribe to auth changes. Callback receives (event, session) from Supabase.
 */
export function onAdminAuthChange(callback) {
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });

  return () => {
    data.subscription.unsubscribe();
  };
}
