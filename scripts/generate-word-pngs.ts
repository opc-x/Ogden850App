/**
 * 输出 Cursor GenerateImage 任务队列（不调用外部 API）。
 *
 * Agent 流程：
 *   1. npm run generate:word-pngs -- flat general   # 或 --from-heuristic
 *   2. 对每个 slug 用 Cursor GenerateImage，filename={slug}.png
 *   3. ./scripts/install-word-pngs.sh flat general
 *   4. npm run sync:word-png-manifest
 *
 * Usage:
 *   npm run generate:word-pngs -- flat fixed free
 *   npm run generate:word-pngs -- --from-heuristic --limit 50
 *   npm run generate:word-pngs -- --missing --limit 30 --category picturables
 */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ALL_WORD_PNG_PROMPTS, buildPrompt } from './word-png-prompts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const HEURISTIC_PATH = path.join(ROOT, 'Designs/audit/word-png-heuristic.json');
const MANUAL_PATH = path.join(ROOT, 'Designs/audit/word-png-manual-audit.json');

function parseArgs() {
  const args = process.argv.slice(2);
  const getNum = (flag: string, fallback: number) => {
    const idx = args.indexOf(flag);
    return idx >= 0 ? Number(args[idx + 1]) : fallback;
  };
  const catIdx = args.indexOf('--category');
  return {
    fromHeuristic: args.includes('--from-heuristic'),
    fromManual: args.includes('--from-manual'),
    missing: args.includes('--missing'),
    limit: getNum('--limit', 50),
    category: catIdx >= 0 ? args[catIdx + 1] : 'all',
    slugs: args.filter((a) => !a.startsWith('--') && !['--limit', '--category'].includes(a)),
  };
}

function slugsFromHeuristic(limit: number): string[] {
  if (!fs.existsSync(HEURISTIC_PATH)) return [];
  const data = JSON.parse(fs.readFileSync(HEURISTIC_PATH, 'utf8')) as {
    regenerate?: { word: string }[];
    review?: { word: string }[];
  };
  const slugs = [
    ...(data.regenerate ?? []).map((r) => r.word.toLowerCase()),
    ...(data.review ?? []).map((r) => r.word.toLowerCase()),
  ];
  return [...new Set(slugs)].slice(0, limit);
}

function slugsFromManual(limit: number): string[] {
  if (!fs.existsSync(MANUAL_PATH)) return [];
  const data = JSON.parse(fs.readFileSync(MANUAL_PATH, 'utf8')) as {
    flagged?: { word: string }[];
    weakPromptWordsNeedVisionAudit?: string[];
  };
  const slugs = [
    ...(data.flagged ?? []).map((r) => r.word.toLowerCase()),
    ...(data.weakPromptWordsNeedVisionAudit ?? []),
  ];
  return [...new Set(slugs)].slice(0, limit);
}

function slugsFromMissing(limit: number, category: string): string[] {
  const out = execSync(`npx tsx "${path.join(__dirname, 'list-word-png-queue.ts')}" ${limit} ${category}`, {
    cwd: ROOT,
    encoding: 'utf8',
  });
  return out
    .split('\n')
    .map((l) => l.split('\t')[0]?.trim())
    .filter((s) => s && !s.startsWith('#'));
}

function printBatch(slugs: string[]) {
  if (!slugs.length) {
    console.error('No slugs to generate.');
    console.error('Usage: npm run generate:word-pngs -- flat [more slugs]');
    console.error('       npm run generate:word-pngs -- --from-heuristic --limit 50');
    console.error('       npm run generate:word-pngs -- --missing --limit 30 --category picturables');
    process.exit(1);
  }

  console.log(`# Cursor GenerateImage queue — ${slugs.length} words`);
  console.log(`# After generation:`);
  console.log(`./scripts/install-word-pngs.sh ${slugs.join(' ')}`);
  console.log(`npm run sync:word-png-manifest`);
  console.log('');

  for (const slug of slugs) {
    const semantic = ALL_WORD_PNG_PROMPTS[slug];
    if (!semantic) {
      console.log(`── ${slug}`);
      console.log('GenerateImage: NO PROMPT — run npm run build:word-png-prompts first');
      console.log('');
      continue;
    }
    const prompt = buildPrompt(slug, semantic);
    console.log(`── ${slug}`);
    console.log(`GenerateImage filename=${slug}.png`);
    console.log(prompt);
    console.log('');
  }
}

function main() {
  const { fromHeuristic, fromManual, missing, limit, category, slugs: cliSlugs } = parseArgs();

  let slugs = cliSlugs.map((s) => s.toLowerCase());
  if (fromHeuristic) slugs = slugsFromHeuristic(limit);
  else if (fromManual) slugs = slugsFromManual(limit);
  else if (missing) slugs = slugsFromMissing(limit, category);

  printBatch(slugs);
}

main();
