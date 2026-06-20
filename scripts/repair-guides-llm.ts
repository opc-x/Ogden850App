/**
 * LLM 修复单词详情例句 → word-guides.json → 可选入库
 *
 * Usage:
 *   npm run audit:guides
 *   npm run repair:guides -- --limit 20
 *   npm run repair:guides -- --word account
 *   npm run repair:guides -- --sync
 */
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { wordsData } from '../src/data/wordsList';
import { auditWordGuide, guideNeedsRepair, type WordGuide } from './lib/guideQuality';
import { repairGuidesBatchWithLlm } from './lib/llmRepairGuide';
import type { Word } from '../src/types/word';

dotenv.config({ path: '.env.local' });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const GUIDES_PATH = path.join(__dirname, '../src/components/word-guides.json');

type GuideFile = Record<string, Record<string, unknown>>;

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const limit = arg('--limit') ? Number(arg('--limit')) : undefined;
  const wordFilter = arg('--word');
  const batchSize = Number(arg('--batch') ?? 6);
  const doSync = process.argv.includes('--sync');

  function loadGuides(): GuideFile {
    return JSON.parse(fs.readFileSync(GUIDES_PATH, 'utf8')) as GuideFile;
  }

  function savePatches(patches: Record<string, WordGuide>) {
    const latest = loadGuides();
    for (const [id, guide] of Object.entries(patches)) {
      latest[id] = { ...latest[id], ...guide };
    }
    fs.writeFileSync(GUIDES_PATH, JSON.stringify(latest, null, 2));
  }

  function buildTodo(): Array<{ word: Word; guide: WordGuide; issues: ReturnType<typeof auditWordGuide> }> {
    const guides = loadGuides();
    let todo = wordsData
      .map((word) => {
        const guide = guides[word.id] ?? {};
        const issues = auditWordGuide(word.id, guide);
        return { word, guide, issues };
      })
      .filter((x) => guideNeedsRepair(x.issues));
    if (wordFilter) {
      todo = todo.filter((x) => x.word.id === wordFilter || x.word.word === wordFilter);
    }
    if (limit) todo = todo.slice(0, limit);
    return todo;
  }

  let todo = buildTodo();

  console.log(`待修复: ${todo.length} 词, batch=${batchSize}`);

  let repaired = 0;
  let failed = 0;

  for (const [bi, batch] of chunk(todo, batchSize).entries()) {
    const ids = batch.map((b) => b.word.id).join(', ');
    process.stdout.write(`[${bi + 1}] ${ids} … `);
    try {
      const patches = await repairGuidesBatchWithLlm({ items: batch });
      savePatches(patches);
      repaired += batch.length;
      console.log('OK');
    } catch (err) {
      failed += batch.length;
      console.log('FAIL', err instanceof Error ? err.message : err);
      // 单词级重试
      for (const item of batch) {
        try {
          const single = await repairGuidesBatchWithLlm({ items: [item] });
          savePatches(single);
          repaired++;
          failed--;
          console.log(`  ↳ 重试 OK: ${item.word.id}`);
        } catch (e2) {
          console.log(`  ↳ 重试 FAIL: ${item.word.id}`, e2 instanceof Error ? e2.message : e2);
        }
        await sleep(400);
      }
    }
    await sleep(300);
  }

  console.log(`完成: 修复 ${repaired}, 失败 ${failed}`);

  if (doSync && repaired > 0) {
    const { execSync } = await import('child_process');
    execSync('npm run import:vocab', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
