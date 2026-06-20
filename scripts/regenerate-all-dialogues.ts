/**
 * 全量整篇重生 50 场景对话 — issue #8
 */
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { SceneDialogueRecord } from '../src/types/sceneDialogue';
import { listTop50SceneKeys } from '../src/data/sceneStoryScripts';
import { createSupabaseAdmin } from './lib/syncDialoguesToDb';
import { pickProvider, resolveDialogueProvider } from './lib/llmDialogue';
import { loadDialogues, saveDialogues, pilotOneScene, PILOT_DIR } from './lib/pilotRunner';
import { syncSceneDialoguesToDb } from './lib/syncDialoguesToDb';
import {
  validateDialogueBatch,
  validateDuplicateClosingPhrases,
  validateExactDuplicateLines,
} from './lib/dialogueQuality';

dotenv.config({ path: '.env.local' });

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

function scoreScene(sceneKey: string, rows: SceneDialogueRecord[]): number {
  const mapped = rows.map((r) => ({
    en: r.sentence,
    zh: r.zh,
    speaker: r.speaker,
    beat: r.beat,
  }));
  const batch = validateDialogueBatch(sceneKey, mapped);
  const closing = validateDuplicateClosingPhrases(mapped);
  const duplicates = validateExactDuplicateLines(
    rows.map((r) => ({ seq: r.seq, en: r.sentence })),
  );
  let score = 0;
  for (const i of batch) {
    if (i.kind === 'closingPhrase') score += 20;
    else if (i.kind === 'duplicateLine') score += 25;
    else if (i.kind === 'structure') score += 10;
    else if (i.kind === 'vocabCoverage') score += 3;
    else score += 1;
  }
  score += closing.length * 20;
  score += duplicates.length * 25;
  return score;
}

async function main() {
  const providerPref = resolveDialogueProvider();
  const engine = pickProvider(providerPref === 'auto' ? 'deepseek' : providerPref);
  if (!engine) {
    console.error('❌ 需要 DEEPSEEK_API_KEY 或 GEMINI_API_KEY');
    process.exit(1);
  }

  const target = Number(arg('--target') ?? '32');
  const sceneFilter = arg('--scene');
  const fromRank = Number(arg('--from') ?? '1');
  const skipSync = process.argv.includes('--skip-sync');

  let keys = listTop50SceneKeys();
  if (sceneFilter) keys = keys.filter((k) => k === sceneFilter);
  else if (fromRank > 1) keys = keys.slice(fromRank - 1);

  console.log(`\n══ 全量整篇重生 ══ Provider: ${engine} | 目标: ${target} 句 | 场景: ${keys.length}\n`);

  let dialogues = loadDialogues();
  const results: Array<{
    sceneKey: string;
    ok: boolean;
    total: number;
    qualityIssues: string[];
    closingHits: number;
    kept: 'new' | 'previous';
  }> = [];

  const supabase = skipSync ? null : createSupabaseAdmin();

  for (const sceneKey of keys) {
    const backup = dialogues.filter((d) => d.scene === sceneKey);
    const backupScore = backup.length > 0 ? scoreScene(sceneKey, backup) : Infinity;

    let ok = false;
    let lastResult: (typeof results)[0] | null = null;
    let bestNewRows: SceneDialogueRecord[] = [];
    let bestNewScore = Infinity;

    const maxRounds = sceneFilter ? 8 : 6;
    for (let round = 0; round < maxRounds && !ok; round++) {
      const { dialogues: merged, result } = await pilotOneScene({
        sceneKey,
        target,
        provider: engine,
        dialogues,
        verbose: true,
      });
      dialogues = merged;

      const sceneRows = dialogues.filter((d) => d.scene === sceneKey);
      const closingIssues = validateDuplicateClosingPhrases(sceneRows.map((r) => ({ en: r.sentence })));
      const duplicateIssues = validateExactDuplicateLines(
        sceneRows.map((r) => ({ seq: r.seq, en: r.sentence })),
      );
      const newScore = scoreScene(sceneKey, sceneRows);

      if (newScore < bestNewScore) {
        bestNewScore = newScore;
        bestNewRows = sceneRows;
      }

      lastResult = {
        sceneKey,
        ok: closingIssues.length === 0 && duplicateIssues.length === 0,
        total: result.total,
        qualityIssues: [
          ...result.qualityIssues,
          ...duplicateIssues.map((i) => i.message),
          ...closingIssues.map((i) => i.message),
        ],
        closingHits: closingIssues.length,
        kept: 'new',
      };
      ok = lastResult.ok;

      if (!ok && round < maxRounds - 1) {
        console.log(`  ↻ 未达标，整篇重试 (${round + 2}/${maxRounds})…`);
        await new Promise((r) => setTimeout(r, 1200));
      }
    }

    if (!ok && backup.length > 0 && !sceneFilter) {
      dialogues = [...dialogues.filter((d) => d.scene !== sceneKey), ...backup];
      lastResult = {
        sceneKey,
        ok: backupScore === 0,
        total: backup.length,
        qualityIssues: backupScore === 0 ? [] : [`保留旧稿（新稿未过门禁 score=${bestNewScore}）`],
        closingHits: validateDuplicateClosingPhrases(backup.map((r) => ({ en: r.sentence }))).length,
        kept: 'previous',
      };
      console.log(`  ↩ 保留旧稿（新稿未过门禁）`);
    } else if (!ok && sceneFilter && bestNewRows.length > 0) {
      dialogues = [...dialogues.filter((d) => d.scene !== sceneKey), ...bestNewRows];
      saveDialogues(dialogues);
      console.log(`  ⚠ 单场景模式：保留 score 最低的新稿 (score=${bestNewScore})`);
    } else if (lastResult) {
      lastResult.kept = 'new';
    }

    saveDialogues(dialogues);

    if (!skipSync && supabase) {
      try {
        const sceneRows = dialogues.filter((d) => d.scene === sceneKey);
        await syncSceneDialoguesToDb(sceneKey, sceneRows, { status: 'published', verbose: false });
        console.log(`  ↳ DB 已同步`);
      } catch (err) {
        console.warn(`  ⚠ DB 同步失败: ${err instanceof Error ? err.message : err}`);
      }
    }

    if (lastResult) results.push(lastResult);
    await new Promise((r) => setTimeout(r, 600));
  }

  const okCount = results.filter((r) => r.ok).length;
  const reportPath = path.join(PILOT_DIR, 'regenerate-all-report.json');
  fs.mkdirSync(PILOT_DIR, { recursive: true });
  fs.writeFileSync(
    reportPath,
    JSON.stringify({ completedAt: new Date().toISOString(), target, okCount, total: results.length, results }, null, 2),
  );

  console.log(`\n══ 完成 ══ ✅ ${okCount}/${results.length}`);
  const failed = results.filter((r) => !r.ok);
  if (failed.length > 0) {
    console.log('未达标:');
    for (const f of failed) {
      console.log(`  ${f.sceneKey} [${f.kept}]: ${f.qualityIssues[0] ?? `closingHits=${f.closingHits}`}`);
    }
  }
  console.log(`报告: ${reportPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
