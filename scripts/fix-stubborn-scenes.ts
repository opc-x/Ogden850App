/**
 * 顽固场景定向修复 — issue #8 复核打回
 * - Health / Feelings / Sad: 逐句去掉中段告别语
 * - Online Banking: 修复 3000/2500 重复对话，剧情单向推进
 */
import * as dotenv from 'dotenv';
import { callDeepSeek } from './lib/deepseekDialogue';
import { loadDialogues, saveDialogues } from './lib/pilotRunner';
import {
  findClosingPhraseHits,
  validateDuplicateClosingPhrases,
} from './lib/dialogueQuality';
import type { SceneDialogueRecord } from '../src/types/sceneDialogue';

dotenv.config({ path: '.env.local' });

function closingLinesToFix(rows: SceneDialogueRecord[]): SceneDialogueRecord[] {
  const hits = rows
    .map((r, i) => ({ row: r, i, labels: findClosingPhraseHits(r.sentence) }))
    .filter((h) => h.labels.length > 0);
  if (hits.length === 0) return [];
  const keep = hits[hits.length - 1]!;
  const lastAllowed = rows.length - 3;
  if (keep.i < lastAllowed) return hits.map((h) => h.row);
  return hits.filter((h) => h.row.seq !== keep.row.seq).map((h) => h.row);
}

async function fixClosingScene(sceneKey: string, maxTries = 12): Promise<boolean> {
  const dialogues = loadDialogues();
  const backup = dialogues.filter((d) => d.scene === sceneKey).sort((a, b) => a.seq - b.seq);
  const badRows = closingLinesToFix(backup);
  if (badRows.length === 0) return true;

  const context = backup.map((r) => `${r.seq}. ${r.speaker}: ${r.sentence} / ${r.zh}`).join('\n');
  const targets = badRows.map((r) => `${r.seq}. ${r.speaker}: ${r.sentence} / ${r.zh}`).join('\n');

  for (let t = 0; t < maxTries; t++) {
    const prompt = `Fix ONLY the numbered lines in scene "${sceneKey}".
Remove ALL farewell/closing phrases (goodbye, bye, see you, good night, sleep well, rest well, take care) from these mid-scene lines — the story MUST continue after them.
Use "I will go now", "talk later", "until tomorrow", "get some rest" (without sleep well/rest well) instead.
Ogden 850 words only. Max 20 words per line. Natural spoken Chinese.

FULL SCENE:
${context}

LINES TO FIX (rewrite en + zh, keep seq/speaker/beat):
${targets}

Return JSON: {"lines":[{"seq":11,"speaker":"A","en":"...","zh":"...","beat":"进行"}]}`;

    const raw = await callDeepSeek(prompt);
    const bySeq = new Map(backup.map((r) => [r.seq, { ...r }]));
    for (const l of raw as Array<{ seq?: number; en?: string; zh?: string }>) {
      const seq = Number(l.seq);
      const row = bySeq.get(seq);
      if (!row || !l.en?.trim() || !l.zh?.trim()) continue;
      row.sentence = l.en.trim();
      row.zh = l.zh.trim();
    }
    const fixed = [...bySeq.values()].sort((a, b) => a.seq - b.seq);
    const closing = validateDuplicateClosingPhrases(fixed.map((r) => ({ en: r.sentence })));
    if (closing.length === 0) {
      const merged = [...dialogues.filter((d) => d.scene !== sceneKey), ...fixed];
      saveDialogues(merged);
      console.log(`  ✅ ${sceneKey}: ${fixed.length} 句 (try ${t + 1})`);
      return true;
    }
    process.stdout.write(`\r  ${sceneKey} try ${t + 1}: ${closing.length} closing issues`);
  }
  console.log(`\n  ❌ ${sceneKey}: 未修复`);
  return false;
}

async function fixOnlineBanking(maxTries = 12): Promise<boolean> {
  const sceneKey = 'Online Banking';
  const dialogues = loadDialogues();
  const backup = dialogues.filter((d) => d.scene === sceneKey).sort((a, b) => a.seq - b.seq);
  const context = backup.map((r) => `${r.seq}. [${r.beat}] ${r.speaker}: ${r.sentence} / ${r.zh}`).join('\n');

  for (let t = 0; t < maxTries; t++) {
    const prompt = `Rewrite lines 24-28 ONLY in scene "Online Banking" (网银转账缴费).
PROBLEM: lines 24-25 and 27-28 repeat the same "3000 vs 2500 amount mismatch" — the story loops instead of progressing.
FIX: Keep lines 1-23 unchanged in meaning. Lines 24-28 must resolve the payment in ONE direction:
  - Line 24: discover amount mismatch (3000 needed, only 2500 available) — ONCE only
  - Lines 25-28: adjust amount, confirm transfer, sign out — NO re-asking or repeating the mismatch
Do NOT say goodbye/go to bed before the story ends. Only ONE farewell in last 3 lines if any.
Ogden 850 words only. Natural Chinese.

FULL SCENE:
${context}

Return JSON: {"lines":[{"seq":24,"speaker":"A","en":"...","zh":"...","beat":"进行"}, ... seq 25-28]}`;

    const raw = await callDeepSeek(prompt);
    const bySeq = new Map(backup.map((r) => [r.seq, { ...r }]));
    for (const l of raw as Array<{ seq?: number; speaker?: string; en?: string; zh?: string; beat?: string }>) {
      const seq = Number(l.seq);
      if (seq < 24 || seq > 28) continue;
      const row = bySeq.get(seq);
      if (!row || !l.en?.trim() || !l.zh?.trim()) continue;
      row.sentence = l.en.trim();
      row.zh = l.zh.trim();
      if (l.speaker === 'A' || l.speaker === 'B') row.speaker = l.speaker;
      if (l.beat) row.beat = l.beat as SceneDialogueRecord['beat'];
    }
    const fixed = [...bySeq.values()].sort((a, b) => a.seq - b.seq);

    const tail = fixed.slice(23).map((r) => r.sentence.toLowerCase()).join(' ');
    const hasDup =
      (tail.match(/3000/g)?.length ?? 0) > 1 && (tail.match(/2500/g)?.length ?? 0) > 1;
    const closing = validateDuplicateClosingPhrases(fixed.map((r) => ({ en: r.sentence })));

    if (!hasDup && closing.length === 0) {
      const merged = [...dialogues.filter((d) => d.scene !== sceneKey), ...fixed];
      saveDialogues(merged);
      console.log(`  ✅ Online Banking: lines 24-28 fixed (try ${t + 1})`);
      return true;
    }
    process.stdout.write(`\r  Online Banking try ${t + 1}: dup=${hasDup} closing=${closing.length}`);
  }
  console.log(`\n  ❌ Online Banking: 未修复`);
  return false;
}

async function main() {
  console.log('\n══ 顽固场景定向修复 ══\n');
  const results: Record<string, boolean> = {};
  for (const scene of ['Health', 'Sad', 'Feelings']) {
    results[scene] = await fixClosingScene(scene);
  }
  results['Online Banking'] = await fixOnlineBanking();

  const ok = Object.values(results).every(Boolean);
  console.log('\n结果:', results);
  process.exit(ok ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
