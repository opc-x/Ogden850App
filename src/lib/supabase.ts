import { createClient } from '@supabase/supabase-js';
import { resolveSupabaseEnv } from './supabaseConfig';

const { url: supabaseUrl, anonKey: supabaseAnonKey } = resolveSupabaseEnv(
  import.meta.env as unknown as Record<string, string | undefined>,
);

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase config is missing. Please check your .env.local file");
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
);
