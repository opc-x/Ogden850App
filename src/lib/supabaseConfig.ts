/**
 * Resolve Supabase credentials from Vercel integration names or standard VITE_* vars.
 */
export function resolveSupabaseEnv(
  env: Record<string, string | undefined> = process.env as Record<string, string | undefined>,
) {
  const url =
    env.VITE_SUPABASE_URL ||
    env.Ogden850App_SUPABASE_URL ||
    env.NEXT_PUBLIC_Ogden850App_SUPABASE_URL ||
    env.SUPABASE_URL ||
    '';

  const anonKey =
    env.VITE_SUPABASE_ANON_KEY ||
    env.Ogden850App_SUPABASE_ANON_KEY ||
    env.Ogden850App_SUPABASE_PUBLISHABLE_KEY ||
    env.NEXT_PUBLIC_Ogden850App_SUPABASE_ANON_KEY ||
    env.NEXT_PUBLIC_Ogden850App_SUPABASE_PUBLISHABLE_KEY ||
    env.SUPABASE_ANON_KEY ||
    '';

  const serviceRoleKey =
    env.SUPABASE_SERVICE_ROLE_KEY ||
    env.Ogden850App_SUPABASE_SERVICE_ROLE_KEY ||
    env.Ogden850App_SUPABASE_SECRET_KEY ||
    '';

  const postgresUrl =
    env.Ogden850App_POSTGRES_URL_NON_POOLING ||
    env.Ogden850App_POSTGRES_URL ||
    env.DATABASE_URL ||
    '';

  return { url, anonKey, serviceRoleKey, postgresUrl };
}

export function supabaseProjectRef(url: string): string | null {
  const m = url.match(/https:\/\/([^.]+)\.supabase\.co/);
  return m?.[1] ?? null;
}
