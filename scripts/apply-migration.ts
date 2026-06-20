/**
 * Apply SQL migration via direct Postgres connection (Vercel Supabase integration).
 * Usage: npx tsx scripts/apply-migration.ts
 */
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { resolveSupabaseEnv } from '../src/lib/supabaseConfig';

dotenv.config({ path: '.env.local' });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.join(__dirname, '../supabase/migrations');

async function main() {
  const cfg = resolveSupabaseEnv();
  const { postgresUrl } = cfg;
  if (!postgresUrl) {
    const keys = Object.keys(process.env).filter((k) => k.includes('Ogden') || k.includes('POSTGRES'));
    console.error('No Postgres URL. Loaded keys:', keys.join(', ') || '(none)');
    process.exit(1);
  }

  const { default: pg } = await import('pg');
  const client = new pg.Client({ connectionString: postgresUrl, ssl: { rejectUnauthorized: false } });

  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  await client.connect();
  try {
    for (const file of files) {
      const sqlPath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(sqlPath, 'utf8');
      await client.query(sql);
      console.log('Migration applied:', file);
    }
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
