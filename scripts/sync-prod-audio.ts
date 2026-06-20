/**
 * 从生产站同步 Sonia Neural MP3
 *  - 850 词 → public/assets/audio/{slug}.mp3
 *  - 场景/拼词造句 → public/audio/sentences/{id}.mp3
 *
 * Usage:
 *   npm run audio:sync              # 仅 850 词
 *   npm run audio:sync -- --all   # 词 + 场景句（从 DB legacy_turn_id）
 *   npm run audio:sync -- --sentences
 *   npm run audio:sync -- --word come
 */
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { wordsData } from '../src/data/wordsList';
import { resolveSupabaseEnv } from '../src/lib/supabaseConfig';
import { PROD_AUDIO_ORIGIN, prodAudioUrl, wordToAudioSlug } from '../src/lib/wordAudioPath';

dotenv.config({ path: '.env.local' });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WORD_OUT = path.join(__dirname, '../public/assets/audio');
const SENTENCE_OUT = path.join(__dirname, '../public/audio/sentences');

function parseArgs() {
  const argv = process.argv.slice(2);
  const get = (f: string) => { const i = argv.indexOf(f); return i >= 0 ? argv[i + 1] : undefined; };
  return {
    word: get('--word'),
    limit: Number(get('--limit') ?? '0') || 0,
    force: argv.includes('--force'),
    sentences: argv.includes('--sentences'),
    all: argv.includes('--all'),
  };
}

async function download(url: string): Promise<Buffer | null> {
  const res = await fetch(url);
  if (!res.ok) return null;
  const ct = res.headers.get('content-type') ?? '';
  if (!ct.includes('audio')) return null;
  return Buffer.from(await res.arrayBuffer());
}

function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)); }

async function syncWords(opts: ReturnType<typeof parseArgs>) {
  fs.mkdirSync(WORD_OUT, { recursive: true });
  let words = wordsData.map((w) => w.word);
  if (opts.word) words = [opts.word];
  if (opts.limit) words = words.slice(0, opts.limit);

  console.log(`\n── 850 词 MP3 × ${words.length} ──\n`);
  let ok = 0, skip = 0, fail = 0;

  for (const word of words) {
    const slug = wordToAudioSlug(word);
    const outPath = path.join(WORD_OUT, `${slug}.mp3`);
    if (!opts.force && fs.existsSync(outPath)) { skip++; continue; }

    try {
      const buf = await download(prodAudioUrl(word));
      if (!buf) { console.error(`  ✗ ${word}`); fail++; continue; }
      fs.writeFileSync(outPath, buf);
      console.log(`  ✓ ${word}`);
      ok++;
      await sleep(60);
    } catch (e) {
      console.error(`  ✗ ${word}: ${e}`);
      fail++;
    }
  }
  console.log(`Words: ${ok} synced, ${skip} skipped, ${fail} failed → ${WORD_OUT}`);
  return fail;
}

async function fetchSentenceIds(): Promise<number[]> {
  const { url, serviceRoleKey, anonKey } = resolveSupabaseEnv();
  const sb = createClient(url, serviceRoleKey || anonKey);
  const { data, error } = await sb
    .from('dialogue_turns')
    .select('legacy_turn_id')
    .not('legacy_turn_id', 'is', null);
  if (error) throw error;
  const ids = [...new Set((data ?? []).map((r) => r.legacy_turn_id as number))].sort((a, b) => a - b);
  return ids;
}

async function syncSentences(opts: ReturnType<typeof parseArgs>) {
  fs.mkdirSync(SENTENCE_OUT, { recursive: true });
  let ids: number[];
  try {
    ids = await fetchSentenceIds();
    console.log(`\n── 场景对话 MP3 × ${ids.length}（DB legacy_turn_id）──\n`);
  } catch (e) {
    console.warn('DB 读取失败，回退扫描 1–806:', e);
    ids = Array.from({ length: 806 }, (_, i) => i + 1);
  }
  if (opts.limit) ids = ids.slice(0, opts.limit);

  let ok = 0, skip = 0, fail = 0;
  for (const id of ids) {
    const outPath = path.join(SENTENCE_OUT, `${id}.mp3`);
    if (!opts.force && fs.existsSync(outPath)) { skip++; continue; }

    const url = `${PROD_AUDIO_ORIGIN}/audio/sentences/${id}.mp3`;
    try {
      const buf = await download(url);
      if (!buf) { fail++; continue; }
      fs.writeFileSync(outPath, buf);
      if (ok < 5 || ok % 100 === 0) console.log(`  ✓ #${id} (${buf.length} bytes)`);
      ok++;
      await sleep(50);
    } catch {
      fail++;
    }
  }
  console.log(`Sentences: ${ok} synced, ${skip} skipped, ${fail} missing/failed → ${SENTENCE_OUT}`);
  return fail;
}

async function main() {
  const opts = parseArgs();
  let totalFail = 0;

  if (opts.all || !opts.sentences) {
    totalFail += await syncWords(opts);
  }
  if (opts.all || opts.sentences) {
    totalFail += await syncSentences(opts);
  }

  if (totalFail > 0) process.exit(1);
}

main();
