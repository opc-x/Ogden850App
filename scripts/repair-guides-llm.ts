/**
 * LLM 修复单词详情例句 → 直接写回 Supabase ogden_word_guides
 *
 * Usage:
 *   npm run audit:guides
 *   npm run repair:guides
 *   npm run repair:guides -- --limit 20
 *   npm run repair:guides -- --word prison
 *   npm run repair:guides -- --batch 10 --concurrency 6
 */
import * as dotenv from 'dotenv';
import { wordsData } from '../src/data/wordsList';
import {
  auditWordGuide,
  guideNeedsTemplateRepair,
  type WordGuide,
} from './lib/guideQuality';
import { loadAllGuidesFromSupabase, saveGuidePatchesToSupabase } from './lib/guideSupabase';
import { repairGuidesBatchWithLlm } from './lib/llmRepairGuide';
import { runPool, sleep, withRetry } from './lib/runPool';
import type { Word } from '../src/types/word';

dotenv.config({ path: '.env.local' });

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

type TodoItem = { word: Word; guide: WordGuide; issues: ReturnType<typeof auditWordGuide> };

async function repairBatchWithFallback(
  batch: TodoItem[],
  guides: Map<string, WordGuide>,
): Promise<{ repaired: number; failed: number }> {
  const ids = batch.map((b) => b.word.id).join(', ');
  try {
    const patches = await withRetry(
      () => repairGuidesBatchWithLlm({ items: batch }),
      { label: ids.slice(0, 60) },
    );
    await saveGuidePatchesToSupabase(patches);
    for (const [id, guide] of Object.entries(patches)) {
      guides.set(id, guide);
    }
    return { repaired: batch.length, failed: 0 };
  } catch (err) {
    console.log(`  batch FAIL (${ids.slice(0, 80)}…):`, err instanceof Error ? err.message : err);
    let repaired = 0;
    let failed = 0;
    for (const item of batch) {
      try {
        const single = await withRetry(
          () => repairGuidesBatchWithLlm({ items: [item] }),
          { label: item.word.id },
        );
        await saveGuidePatchesToSupabase(single);
        for (const [id, guide] of Object.entries(single)) {
          guides.set(id, guide);
        }
        repaired++;
        console.log(`  ↳ 重试 OK: ${item.word.id}`);
      } catch (e2) {
        failed++;
        console.log(`  ↳ 重试 FAIL: ${item.word.id}`, e2 instanceof Error ? e2.message : e2);
      }
      await sleep(300);
    }
    return { repaired, failed };
  }
}

async function main() {
  const limit = arg('--limit') ? Number(arg('--limit')) : undefined;
  const wordFilter = arg('--word');
  const batchSize = Number(arg('--batch') ?? 10);
  const concurrency = Number(arg('--concurrency') ?? 6);

  const guides = await loadAllGuidesFromSupabase();

  function buildTodo(): TodoItem[] {
    let todo = wordsData
      .map((word) => {
        const guide = guides.get(word.id) ?? {};
        const issues = auditWordGuide(word.id, guide);
        return { word, guide, issues };
      })
      .filter((x) => guideNeedsTemplateRepair(x.issues));
    if (wordFilter) {
      todo = todo.filter((x) => x.word.id === wordFilter || x.word.word === wordFilter);
    }
    if (limit) todo = todo.slice(0, limit);
    return todo;
  }

  const todo = buildTodo();
  const batches = chunk(todo, batchSize);

  console.log(
    `待修复（模板病句）: ${todo.length} 词, ${batches.length} 批, batch=${batchSize}, concurrency=${concurrency}`,
  );

  let repaired = 0;
  let failed = 0;
  let batchIndex = 0;

  await runPool(batches, async (batch) => {
    const bi = ++batchIndex;
    const ids = batch.map((b) => b.word.id).join(', ');
    process.stdout.write(`[${bi}/${batches.length}] ${ids.slice(0, 100)}${ids.length > 100 ? '…' : ''} … `);
    const result = await repairBatchWithFallback(batch, guides);
    repaired += result.repaired;
    failed += result.failed;
    console.log(result.failed ? `部分 OK (${result.repaired}/${batch.length})` : 'OK');
    await sleep(200);
  }, concurrency);

  console.log(`完成: 修复 ${repaired}/${todo.length}, 失败 ${failed}`);
  if (failed > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
