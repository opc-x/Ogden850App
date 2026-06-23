/**
 * Probe real Supabase guest auth (no mock). Usage: npx tsx scripts/probe-supabase-auth.ts
 */
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolveSupabaseEnv, supabaseProjectRef } from '../src/lib/supabaseConfig';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const { url, anonKey } = resolveSupabaseEnv();

type Step = { name: string; ok: boolean; detail: string };

const steps: Step[] = [];

function record(name: string, ok: boolean, detail: string) {
  steps.push({ name, ok, detail });
  const mark = ok ? 'PASS' : 'FAIL';
  console.log(`[${mark}] ${name}: ${detail}`);
}

async function main() {
  if (!url || !anonKey) {
    record('env', false, 'VITE_SUPABASE_URL 或 VITE_SUPABASE_ANON_KEY 缺失');
    process.exit(1);
  }

  const ref = supabaseProjectRef(url);
  record('env', true, `project=${ref ?? 'unknown'}, anonKeyLen=${anonKey.length}`);

  try {
    const health = await fetch(`${url}/auth/v1/health`, {
      headers: { apikey: anonKey },
    });
    record('auth health', health.ok, `HTTP ${health.status}`);
  } catch (e) {
    record('auth health', false, e instanceof Error ? e.message : String(e));
  }

  const supabase = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const guestId = crypto.randomUUID().replace(/-/g, '').slice(0, 10);
  const email = `guest+probe-${guestId}@example.com`;
  const password = crypto.randomUUID().replace(/-/g, '') + 'Aa1!';

  const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        is_guest: true,
        auth_provider: 'guest',
        display_name: `probe ${guestId.slice(0, 6)}`,
      },
    },
  });

  if (signUpErr) {
    record('guest signUp', false, `${signUpErr.message} (status=${signUpErr.status ?? 'n/a'})`);
  } else {
    record(
      'guest signUp',
      true,
      `user=${signUpData.user?.id?.slice(0, 8) ?? '?'}… session=${signUpData.session ? 'yes' : 'no'}`,
    );
  }

  const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInErr) {
    record('guest signInWithPassword', false, `${signInErr.message} (status=${signInErr.status ?? 'n/a'})`);
  } else {
    record(
      'guest signInWithPassword',
      true,
      `user=${signInData.user?.id?.slice(0, 8) ?? '?'}…`,
    );
  }

  const userId = signInData.user?.id ?? signUpData.user?.id;
  if (userId) {
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('id, is_guest, auth_provider')
      .eq('id', userId)
      .maybeSingle();

    if (profileErr) {
      record('profiles read (RLS)', false, profileErr.message);
    } else if (!profile) {
      record('profiles read (RLS)', false, '无 profile 行（trigger 或 RLS 可能阻断）');
    } else {
      record(
        'profiles read (RLS)',
        true,
        `is_guest=${profile.is_guest} auth_provider=${profile.auth_provider}`,
      );
    }
  } else {
    record('profiles read (RLS)', false, '无 userId，跳过');
  }

  const failed = steps.filter((s) => !s.ok);
  console.log('\n--- summary ---');
  console.log(`total=${steps.length} pass=${steps.length - failed.length} fail=${failed.length}`);
  process.exit(failed.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
