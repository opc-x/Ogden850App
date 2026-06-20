/**
 * 输出下一批待生成 PNG 的词 slug 列表（按优先级）。
 * Usage: npx tsx scripts/list-word-png-queue.ts [limit] [category]
 *   category: picturables | directions | generals | qualities | opposites | all (default all)
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { wordsData } from '../src/data/wordsList';
import { SUPPORTED_DIRECTION_WORDS } from '../src/components/DirectionsVisual';
import { ALL_WORD_PNG_PROMPTS } from './word-png-prompts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IMG_DIR = path.join(__dirname, '../public/assets/word-img');
const limit = parseInt(process.argv[2] || '30', 10);
const catFilter = process.argv[3] || 'all';

const existing = new Set(
  fs.readdirSync(IMG_DIR).filter((f) => f.endsWith('.png')).map((f) => f.replace(/\.png$/, '')),
);

const PRIORITY: string[] = [
  ...wordsData.filter((w) => w.category === 'picturables').map((w) => w.id),
  ...SUPPORTED_DIRECTION_WORDS,
  ...wordsData.filter((w) => w.category === 'generals').map((w) => w.id),
  ...wordsData.filter((w) => w.category === 'qualities').map((w) => w.id),
  ...wordsData.filter((w) => w.category === 'opposites').map((w) => w.id),
];

function catOf(slug: string): string {
  const w = wordsData.find((x) => x.id === slug);
  if (w) return w.category;
  if (SUPPORTED_DIRECTION_WORDS.includes(slug)) return 'directions';
  return 'unknown';
}

const missing = PRIORITY.filter((id) => !existing.has(id));
const filtered = catFilter === 'all' ? missing : missing.filter((id) => catOf(id) === catFilter || (catFilter === 'directions' && SUPPORTED_DIRECTION_WORDS.includes(id)));
const batch = filtered.slice(0, limit);

console.log(`# Missing total: ${missing.length}, batch: ${batch.length}`);
for (const slug of batch) {
  const prompt = ALL_WORD_PNG_PROMPTS[slug];
  console.log(`${slug}\t${catOf(slug)}\t${prompt?.slice(0, 80) ?? 'NO PROMPT'}`);
}
