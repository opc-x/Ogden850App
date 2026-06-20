/**
 * Write working Supabase dev env from Vercel-linked integration project.
 * Values come from the active integration (runrqlsdzdjjdgjjrchk), not empty Vercel pull placeholders.
 */
import fs from 'fs';
import path from 'path';

const PROJECT_REF = 'runrqlsdzdjjdgjjrchk';
const SUPABASE_URL = `https://${PROJECT_REF}.supabase.co`;

// Publishable anon JWT from integration project (public client key)
const ANON_KEY =
  process.env.OGDEN_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1bnJxbHNkemRqamRnampyY2hrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2NjUzNTQsImV4cCI6MjA5NzI0MTM1NH0.1e73BPlFkW59zAZG2BLS3ERjg9YwktxlViorm2hmjOU';

const lines = [
  '# Auto-synced for Ogden850 Vercel Supabase integration (supabase-erin-car)',
  `VITE_SUPABASE_URL=${SUPABASE_URL}`,
  `VITE_SUPABASE_ANON_KEY=${ANON_KEY}`,
  `Ogden850App_SUPABASE_URL=${SUPABASE_URL}`,
  `Ogden850App_SUPABASE_ANON_KEY=${ANON_KEY}`,
  `NEXT_PUBLIC_Ogden850App_SUPABASE_URL=${SUPABASE_URL}`,
  `NEXT_PUBLIC_Ogden850App_SUPABASE_ANON_KEY=${ANON_KEY}`,
  '',
];

const envPath = path.join(process.cwd(), '.env.local');
const existing = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
const merged = new Map<string, string>();

for (const line of [...existing.split('\n'), ...lines]) {
  if (!line || line.startsWith('#') || !line.includes('=')) continue;
  const idx = line.indexOf('=');
  merged.set(line.slice(0, idx), line.slice(idx + 1));
}

for (const line of lines) {
  if (!line || line.startsWith('#') || !line.includes('=')) continue;
  const idx = line.indexOf('=');
  merged.set(line.slice(0, idx), line.slice(idx + 1));
}

const out = [
  '# Ogden850 local dev env',
  ...[...merged.entries()].map(([k, v]) => `${k}=${v}`),
  '',
].join('\n');

fs.writeFileSync(envPath, out);
console.log('Synced .env.local with Supabase integration URL + anon key');
