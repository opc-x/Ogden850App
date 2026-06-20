/**
 * LLM v2：JSON 图元 spec → 统一渲染 → 硬门禁 → 人工可批
 *
 * Usage:
 *   npm run generate:word-svgs -- --word bulb --force
 *   npm run generate:word-svgs -- --flagged --force --provider gemini
 */
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { wordsData } from '../src/data/wordsList';
import { auditWordVisual } from './lib/wordVisualAudit';
import type { WordSvgProvider } from './lib/llmWordSvg';
import { generateWordSvgSpecWithLlm } from './lib/llmWordSvgSpec';
import { approveWord, writeWordSvgManifest } from './lib/wordSvgManifest';

dotenv.config({ path: '.env.local' });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, '../public/assets/word-img');
const REPORT_PATH = path.join(__dirname, '../Designs/audit/word-svg-generation.json');

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function parseArgs() {
  const argv = process.argv.slice(2);
  const get = (flag: string) => {
    const i = argv.indexOf(flag);
    return i >= 0 ? argv[i + 1] : undefined;
  };
  return {
    word: get('--word'),
    category: get('--category'),
    flagged: argv.includes('--flagged'),
    all: argv.includes('--all'),
    force: argv.includes('--force'),
    provider: (get('--provider') ?? 'gemini') as WordSvgProvider,
    limit: Number(get('--limit') ?? '0') || 0,
  };
}

function selectWords(opts: ReturnType<typeof parseArgs>) {
  if (opts.word) {
    const w = wordsData.find((x) => x.id === opts.word.toLowerCase() || x.word === opts.word);
    if (!w) throw new Error(`Word not found: ${opts.word}`);
    return [w];
  }

  let pool = [...wordsData];

  if (opts.flagged) {
    const flagged = new Set(
      wordsData
        .map(auditWordVisual)
        .filter((r) => r.fidelity === 'shared-bad')
        .map((r) => r.id),
    );
    pool = pool.filter((w) => flagged.has(w.id));
  } else if (opts.category) {
    pool = pool.filter((w) => w.category === opts.category);
  } else if (!opts.all) {
    console.error('Specify --word, --flagged, --category <cat>, or --all');
    process.exit(1);
  }

  if (opts.limit > 0) pool = pool.slice(0, opts.limit);
  return pool;
}

async function main() {
  const opts = parseArgs();
  const words = selectWords(opts);

  fs.mkdirSync(OUT_DIR, { recursive: true });

  const report: Array<{
    word: string;
    status: 'ok' | 'skipped' | 'failed';
    provider?: string;
    attempts?: number;
    elements?: number;
    error?: string;
  }> = [];

  console.log(`v2 spec pipeline · ${words.length} word(s) · provider=${opts.provider}`);

  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    const outPath = path.join(OUT_DIR, `${w.id}.svg`);

    if (!opts.force && fs.existsSync(outPath)) {
      console.log(`[${i + 1}/${words.length}] skip ${w.word}`);
      report.push({ word: w.word, status: 'skipped' });
      continue;
    }

    process.stdout.write(`[${i + 1}/${words.length}] ${w.word}… `);
    try {
      const result = await generateWordSvgSpecWithLlm({
        word: w.word,
        translation: w.translation,
        category: w.category,
        provider: opts.provider,
      });
      fs.writeFileSync(outPath, result.svg, 'utf8');
      approveWord(w.id);
      writeWordSvgManifest(OUT_DIR);
      console.log(`ok (${result.provider}, ${result.spec.elements.length} el, ${result.attempts}x)`);
      report.push({
        word: w.word,
        status: 'ok',
        provider: result.provider,
        attempts: result.attempts,
        elements: result.spec.elements.length,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.log(`FAIL: ${msg}`);
      report.push({ word: w.word, status: 'failed', error: msg });
    }

    await sleep(400);
  }

  writeWordSvgManifest(OUT_DIR);
  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(
    REPORT_PATH,
    JSON.stringify({ generatedAt: new Date().toISOString(), pipeline: 'v2-spec', report }, null, 2),
  );

  const ok = report.filter((r) => r.status === 'ok').length;
  const failed = report.filter((r) => r.status === 'failed').length;
  console.log(`\nDone: ${ok} ok, ${failed} failed`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
