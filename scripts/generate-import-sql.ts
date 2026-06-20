/**
 * Emit SQL INSERTs for MCP / psql import (bypasses empty Vercel env pull).
 * Usage: npx tsx scripts/generate-import-sql.ts > /tmp/ogden-import.sql
 */
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { wordsData } from '../src/data/wordsList';
import wordAnnotations from '../src/data/word-annotations.json';
import { audioUrlForWord, resolveVisualType } from '../src/data/ogdenGrammar';
import { loadAllGuidesFromSupabase, wordGuideToRow } from './lib/guideSupabase';

dotenv.config({ path: '.env.local' });

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function esc(s: string | null | undefined): string {
  if (s == null) return 'NULL';
  return `'${String(s).replace(/'/g, "''")}'`;
}

function escJson(obj: unknown): string {
  return `'${JSON.stringify(obj).replace(/'/g, "''")}'::jsonb`;
}

async function main() {
  const rows = wordsData.map((w, i) => {
    const ann = (wordAnnotations as Record<string, { img?: string }>)[w.id];
    let { visual_type, visual_ref } = resolveVisualType(w.category, w.word);
    if (visual_type === 'image' && ann?.img) visual_ref = ann.img;
    return {
      id: w.id,
      word: w.word,
      category: w.category,
      translation: w.translation,
      ipa: w.ipa ?? null,
      definition_en: w.definition_en,
      visual_type,
      visual_ref,
      audio_url: audioUrlForWord(w.word),
      is_operator: w.category === 'operators',
      sort_order: i + 1,
    };
  });

  console.log('BEGIN;');
  console.log('TRUNCATE word_inflections, ogden_word_guides, ogden_words CASCADE;');

  for (const r of rows) {
    console.log(
      `INSERT INTO ogden_words (id, word, category, translation, ipa, definition_en, visual_type, visual_ref, audio_url, is_operator, sort_order) VALUES (${esc(r.id)}, ${esc(r.word)}, ${esc(r.category)}, ${esc(r.translation)}, ${esc(r.ipa)}, ${esc(r.definition_en)}, ${esc(r.visual_type)}, ${esc(r.visual_ref)}, ${esc(r.audio_url)}, ${r.is_operator}, ${r.sort_order}) ON CONFLICT (id) DO UPDATE SET word=EXCLUDED.word, category=EXCLUDED.category, translation=EXCLUDED.translation, ipa=EXCLUDED.ipa, definition_en=EXCLUDED.definition_en, visual_type=EXCLUDED.visual_type, visual_ref=EXCLUDED.visual_ref, audio_url=EXCLUDED.audio_url, is_operator=EXCLUDED.is_operator, sort_order=EXCLUDED.sort_order;`,
    );
  }

  const lemmaIds = new Set(wordsData.map((w) => w.id));
  const opLemma: Record<string, string> = {
    puts: 'put', putting: 'put', takes: 'take', took: 'take', taken: 'take', taking: 'take',
    goes: 'go', went: 'go', gone: 'go', going: 'go', comes: 'come', came: 'come', coming: 'come',
    gets: 'get', got: 'get', getting: 'get', gives: 'give', gave: 'give', given: 'give', giving: 'give',
    makes: 'make', made: 'make', making: 'make', keeps: 'keep', kept: 'keep', keeping: 'keep',
    sends: 'send', sent: 'send', sending: 'send', lets: 'let', letting: 'let',
    sees: 'see', saw: 'see', seen: 'see', seeing: 'see', has: 'have', had: 'have', having: 'have',
    does: 'do', did: 'do', done: 'do', doing: 'do', is: 'be', are: 'be', am: 'be',
    was: 'be', were: 'be', been: 'be', being: 'be', seems: 'seem', seemed: 'seem',
    says: 'say', said: 'say', saying: 'say', would: 'will', might: 'may',
  };

  const infl = new Map<string, { surface: string; lemma_id: string; kind: string }>();
  for (const [surface, lemma] of Object.entries(opLemma)) {
    if (lemmaIds.has(lemma)) infl.set(surface, { surface, lemma_id: lemma, kind: 'verb_form' });
  }
  for (const id of lemmaIds) {
    if (id.endsWith('y') && id.length > 2) {
      infl.set(id.slice(0, -1) + 'ies', { surface: id.slice(0, -1) + 'ies', lemma_id: id, kind: 'noun_plural' });
    }
    if (!id.endsWith('s') && id.length > 1) {
      infl.set(id + 's', { surface: id + 's', lemma_id: id, kind: 'noun_plural' });
    }
  }

  for (const e of infl.values()) {
    if (e.surface === e.lemma_id) continue;
    console.log(
      `INSERT INTO word_inflections (surface, lemma_id, kind) VALUES (${esc(e.surface)}, ${esc(e.lemma_id)}, ${esc(e.kind)}) ON CONFLICT (surface) DO NOTHING;`,
    );
  }

  const guides = await loadAllGuidesFromSupabase();
  for (const [id, guide] of guides) {
    const row = wordGuideToRow(id, guide);
    console.log(
      `INSERT INTO ogden_word_guides (id, hook, concept, equation, combine, ogden_tip, guide_sentences) VALUES (${esc(row.id)}, ${esc(row.hook ?? null)}, ${esc(row.concept ?? null)}, ${esc(row.equation ?? null)}, ${esc(row.combine ?? null)}, ${esc(row.ogden_tip ?? null)}, ${escJson(row.guide_sentences)}) ON CONFLICT (id) DO UPDATE SET hook=EXCLUDED.hook, concept=EXCLUDED.concept, equation=EXCLUDED.equation, combine=EXCLUDED.combine, ogden_tip=EXCLUDED.ogden_tip, guide_sentences=EXCLUDED.guide_sentences;`,
    );
  }

  console.log('COMMIT;');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
