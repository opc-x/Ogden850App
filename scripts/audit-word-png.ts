/**
 * 审计 word-img PNG 覆盖率，按 Ogden 分类输出缺失列表。
 * Usage: npx tsx scripts/audit-word-png.ts [--json]
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { wordsData } from '../src/data/wordsList';
import { SUPPORTED_DIRECTION_WORDS } from '../src/components/DirectionsVisual';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IMG_DIR = path.join(__dirname, '../public/assets/word-img');
const jsonMode = process.argv.includes('--json');

const existing = new Set(
  fs.readdirSync(IMG_DIR).filter((f) => f.endsWith('.png')).map((f) => f.replace(/\.png$/, '')),
);

const cats = ['operators', 'actions', 'picturables', 'generals', 'qualities', 'opposites'] as const;
const report: Record<string, { total: number; have: number; missing: string[] }> = {};

for (const cat of cats) {
  const words = wordsData.filter((w) => w.category === cat).map((w) => w.id);
  const missing = words.filter((id) => !existing.has(id));
  report[cat] = { total: words.length, have: words.length - missing.length, missing };
}

const dirMissing = SUPPORTED_DIRECTION_WORDS.filter((w) => !existing.has(w));

if (jsonMode) {
  console.log(JSON.stringify({ report, directions: { total: SUPPORTED_DIRECTION_WORDS.length, missing: dirMissing }, pngCount: existing.size }, null, 2));
} else {
  console.log(`PNG count: ${existing.size}`);
  console.log(`Total words: ${wordsData.length}, covered: ${wordsData.filter((w) => existing.has(w.id)).length}`);
  for (const cat of cats) {
    const r = report[cat];
    console.log(`\n${cat}: ${r.have}/${r.total} (${r.missing.length} missing)`);
    if (r.missing.length && r.missing.length <= 30) console.log('  ', r.missing.join(', '));
    else if (r.missing.length) console.log('  ', r.missing.slice(0, 10).join(', '), `... +${r.missing.length - 10} more`);
  }
  console.log(`\ndirections (subset of actions): ${SUPPORTED_DIRECTION_WORDS.length - dirMissing.length}/${SUPPORTED_DIRECTION_WORDS.length}`);
}
