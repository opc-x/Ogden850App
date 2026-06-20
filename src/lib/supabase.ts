import { createClient } from '@supabase/supabase-js';
import { resolveSupabaseEnv, supabaseProjectRef } from './supabaseConfig';

const { url: supabaseUrl, anonKey: supabaseAnonKey } = resolveSupabaseEnv(
  import.meta.env as unknown as Record<string, string | undefined>,
);

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase config is missing. Please check your .env.local file');
} else if (import.meta.env.DEV) {
  const ref = supabaseProjectRef(supabaseUrl);
  console.info(`[Ogden850] Supabase → ${ref ?? supabaseUrl}`);
}

/** Avoid browser HTTP cache serving stale guide rows after DB updates. */
function noStoreFetch(input: RequestInfo | URL, init?: RequestInit) {
  return fetch(input, { ...init, cache: 'no-store' });
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder',
  {
    global: { fetch: noStoreFetch },
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
);
