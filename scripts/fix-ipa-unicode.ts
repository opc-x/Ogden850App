/**
 * Audit and fix IPA Unicode in word-annotations.json, then sync to Supabase.
 * Usage: npx tsx scripts/fix-ipa-unicode.ts [--dry-run]
 */
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ipaNeedsNormalization, normalizeIpa } from './lib/normalizeIpa';
import { resolveSupabaseEnv } from '../src/lib/supabaseConfig';

dotenv.config({ path: '.env.local' });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const annotationsPath = path.join(__dirname, '../src/data/word-annotations.json');
const dryRun = process.argv.includes('--dry-run');

type Annotations = Record<string, { ipa?: string; cn?: string; img?: string }>;

function loadAnnotations(): Annotations {
  return JSON.parse(fs.readFileSync(annotationsPath, 'utf8')) as Annotations;
}

function fixAnnotations(ann: Annotations): { fixed: { word: string; before: string; after: string }[] } {
  const fixed: { word: string; before: string; after: string }[] = [];

  for (const [word, entry] of Object.entries(ann)) {
    const ipa = entry?.ipa;
    if (!ipa || !ipaNeedsNormalization(ipa)) continue;
    const after = normalizeIpa(ipa);
    fixed.push({ word, before: ipa, after });
    entry.ipa = after;
  }

  return { fixed };
}

async function syncToSupabase(fixed: { word: string; after: string }[]) {
  const { url, serviceRoleKey, anonKey } = resolveSupabaseEnv();
  const apiKey = serviceRoleKey || anonKey;
  if (!url || !apiKey) {
    console.warn('No Supabase credentials — skipping DB sync. Run import:vocab after fixing.');
    return;
  }

  const supabase = createClient(url, apiKey);
  for (const { word, after } of fixed) {
    const { error } = await supabase
      .from('ogden_words')
      .update({ ipa: after, updated_at: new Date().toISOString() })
      .eq('id', word);
    if (error) throw new Error(`ogden_words.${word}: ${error.message}`);
  }
  console.log(`Synced ${fixed.length} IPA fixes to Supabase`);
}

async function main() {
  const ann = loadAnnotations();
  const { fixed } = fixAnnotations(ann);

  console.log(`IPA audit: ${fixed.length} entries need normalization`);
  for (const { word, before, after } of fixed) {
    console.log(`  ${word}: ${JSON.stringify(before)} → ${JSON.stringify(after)}`);
  }

  if (fixed.length === 0) {
    console.log('Nothing to fix.');
    return;
  }

  if (dryRun) {
    console.log('Dry run — no files or DB updated.');
    return;
  }

  fs.writeFileSync(annotationsPath, `${JSON.stringify(ann, null, 2)}\n`, 'utf8');
  console.log(`Updated ${annotationsPath}`);

  await syncToSupabase(fixed.map(({ word, after }) => ({ word, after })));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
