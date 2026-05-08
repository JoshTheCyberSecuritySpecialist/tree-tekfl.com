import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

/** Expected project API URL — anon key must be from the same Supabase project. */
const EXPECTED_PROJECT_URL = 'https://pwrhoqszstnvwltzimfw.supabase.co';

if (import.meta.env.DEV) {
  const normalized = String(supabaseUrl).replace(/\/$/, '');
  if (normalized !== EXPECTED_PROJECT_URL) {
    console.warn(
      `[supabase] VITE_SUPABASE_URL should be ${EXPECTED_PROJECT_URL} for this deployment (got: ${normalized}). ` +
        'Mismatch often causes empty admins checks or auth errors. Restart Vite after editing .env.',
    );
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
