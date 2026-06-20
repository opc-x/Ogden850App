/**
 * LLM 修复单词详情例句 → 直接写回 Supabase ogden_word_guides
 *
 * Usage:
 *   npm run audit:guides
 *   npm run repair:guides -- --limit 20
 *   npm run repair:guides -- --word account
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

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const limit = arg('--limit') ? Number(arg('--limit')) : undefined;
  const wordFilter = arg('--word');
  const batchSize = Number(arg('--batch') ?? 15);

  const guides = await loadAllGuidesFromSupabase();

  function buildTodo(): Array<{ word: Word; guide: WordGuide; issues: ReturnType<typeof auditWordGuide> }> {
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

  console.log(`待修复（模板病句）: ${todo.length} 词, batch=${batchSize}`);

  let repaired = 0;
  let failed = 0;

  for (const [bi, batch] of chunk(todo, batchSize).entries()) {
    const ids = batch.map((b) => b.word.id).join(', ');
    process.stdout.write(`[${bi + 1}/${Math.ceil(todo.length / batchSize)}] ${ids} … `);
    try {
      const patches = await repairGuidesBatchWithLlm({ items: batch });
      await saveGuidePatchesToSupabase(patches);
      for (const [id, guide] of Object.entries(patches)) {
        guides.set(id, guide);
      }
      repaired += batch.length;
      console.log('OK');
    } catch (err) {
      failed += batch.length;
      console.log('FAIL', err instanceof Error ? err.message : err);
      for (const item of batch) {
        try {
          const single = await repairGuidesBatchWithLlm({ items: [item] });
          await saveGuidePatchesToSupabase(single);
          for (const [id, guide] of Object.entries(single)) {
            guides.set(id, guide);
          }
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
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
