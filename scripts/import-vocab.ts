/**
 * Import 850 words, inflections, and guides into Supabase.
 * Usage: npx tsx scripts/import-vocab.ts
 * Requires: VITE_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env.local
 */
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { wordsData } from '../src/data/wordsList';
import wordAnnotations from '../src/data/word-annotations.json';
import { audioUrlForWord, resolveVisualType } from '../src/data/ogdenGrammar';
import { resolveSupabaseEnv } from '../src/lib/supabaseConfig';
import { normalizeIpa } from './lib/normalizeIpa';

dotenv.config({ path: '.env.local' });

const { url, serviceRoleKey, anonKey } = resolveSupabaseEnv();

const apiKey = serviceRoleKey || anonKey;

if (!url || !apiKey) {
  console.error('Missing Supabase URL or API key. Run: npx tsx scripts/sync-integration-env.ts');
  process.exit(1);
}

if (!serviceRoleKey) {
  console.warn('Using anon key for import (bootstrap policies must be enabled on DB).');
}

const supabase = createClient(url, apiKey);

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function importWords() {
  const rows = wordsData.map((w, i) => {
    const ann = (wordAnnotations as Record<string, { img?: string }>)[w.id];
    let { visual_type, visual_ref } = resolveVisualType(w.category, w.word);
    if (visual_type === 'image' && ann?.img) {
      visual_ref = ann.img;
    }
    return {
      id: w.id,
      word: w.word,
      category: w.category,
      translation: w.translation,
      ipa: normalizeIpa(w.ipa ?? '') || null,
      definition_en: w.definition_en,
      visual_type,
      visual_ref,
      audio_url: audioUrlForWord(w.word),
      is_operator: w.category === 'operators',
      sort_order: i + 1,
    };
  });

  for (const batch of chunk(rows, 100)) {
    const { error } = await supabase.from('ogden_words').upsert(batch, { onConflict: 'id' });
    if (error) throw new Error(`ogden_words: ${error.message}`);
  }
  console.log(`Imported ${rows.length} words`);
}

async function importInflections() {
  const lemmaIds = new Set(wordsData.map((w) => w.id));
  const entries: { surface: string; lemma_id: string; kind: string }[] = [];

  const opLemma: Record<string, string> = {
    puts: 'put', putting: 'put', takes: 'take', took: 'take', taken: 'take', taking: 'take',
    goes: 'go', went: 'go', gone: 'go', going: 'go', comes: 'come', came: 'come', coming: 'come',
    gets: 'get', got: 'get', gotten: 'get', getting: 'get', gives: 'give', gave: 'give', given: 'give', giving: 'give',
    makes: 'make', made: 'make', making: 'make', keeps: 'keep', kept: 'keep', keeping: 'keep',
    sends: 'send', sent: 'send', sending: 'send', lets: 'let', letting: 'let',
    sees: 'see', saw: 'see', seen: 'see', seeing: 'see', has: 'have', had: 'have', having: 'have',
    does: 'do', did: 'do', done: 'do', doing: 'do', is: 'be', are: 'be', am: 'be',
    was: 'be', were: 'be', been: 'be', being: 'be', seems: 'seem', seemed: 'seem',
    says: 'say', said: 'say', saying: 'say', would: 'will', might: 'may',
  };

  for (const id of lemmaIds) {
    if (id.endsWith('y') && id.length > 2) {
      entries.push({ surface: id.slice(0, -1) + 'ies', lemma_id: id, kind: 'noun_plural' });
    }
    if (!id.endsWith('s') && id.length > 1) {
      entries.push({ surface: id + 's', lemma_id: id, kind: 'noun_plural' });
    }
  }

  for (const [surface, lemma] of Object.entries(opLemma)) {
    if (lemmaIds.has(lemma)) entries.push({ surface, lemma_id: lemma, kind: 'verb_form' });
  }

  const unique = new Map<string, { surface: string; lemma_id: string; kind: string }>();
  for (const e of entries) {
    if (lemmaIds.has(e.lemma_id) && e.surface !== e.lemma_id) {
      unique.set(e.surface, e);
    }
  }

  const list = [...unique.values()];
  for (const batch of chunk(list, 200)) {
    const { error } = await supabase.from('word_inflections').upsert(batch, { onConflict: 'surface' });
    if (error) throw new Error(`word_inflections: ${error.message}`);
  }
  console.log(`Imported ${list.length} inflections`);
}

async function importGuides() {
  console.warn('ogden_word_guides: 跳过 JSON 导入（数据源为 Supabase，使用 repair:guides 维护）');
}

async function main() {
  console.log('Starting vocab import…');
  await importWords();
  await importInflections();
  await importGuides();
  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
