/** 对违规场景应用 direct closing line repair 并写回 JSON */
import * as dotenv from 'dotenv';
import { loadDialogues, saveDialogues } from './lib/pilotRunner';
import { listTop50SceneKeys } from '../src/data/sceneStoryScripts';
import {
  findClosingPhraseHits,
  validateDialogueBatch,
  validateDuplicateClosingPhrases,
} from './lib/dialogueQuality';
import { callDeepSeek } from './lib/deepseekDialogue';
import { scenePromptFor } from './lib/sceneGenConfig';

dotenv.config({ path: '.env.local' });

function closingLinesToRepair(
  rows: Array<{ seq: number; speaker: string; sentence: string; zh: string; beat: string }>,
) {
  const hits = rows
    .map((r, i) => ({ row: r, i, labels: findClosingPhraseHits(r.sentence) }))
    .filter((h) => h.labels.length > 0);
  if (hits.length === 0) return [];
  if (hits.length === 1 && hits[0].i >= rows.length - 3) return [];
  const keep = hits[hits.length - 1]!;
  const lastAllowed = rows.length - 3;
  if (keep.i < lastAllowed) return hits.map((h) => h.row);
  return hits.filter((h) => h.row.seq !== keep.row.seq).map((h) => h.row);
}

async function repairScene(sceneKey: string): Promise<boolean> {
  let dialogues = loadDialogues();
  const backup = dialogues.filter((d) => d.scene === sceneKey).sort((a, b) => a.seq - b.seq);
  const rows = backup.map((r) => ({
    seq: r.seq,
    speaker: r.speaker,
    sentence: r.sentence,
    zh: r.zh,
    beat: r.beat,
  }));

  for (let round = 0; round < 5; round++) {
    const badRows = closingLinesToRepair(rows);
    if (badRows.length === 0) break;
    if (badRows.length > 20) return false;

    const prompt = scenePromptFor(sceneKey);
    const context = rows.map((r) => `${r.seq}. ${r.speaker}: ${r.sentence}`).join('\n');
    const targets = badRows.map((r) => `${r.seq}. ${r.speaker}: ${r.sentence}`).join('\n');
    const rewritePrompt = `Fix ONLY these lines in "${sceneKey}" (${prompt.titleZh}). Remove goodbye/bye/see you/good night. Ogden 850 only. Story continues after each line.

FULL:
${context}

FIX:
${targets}

Return JSON: {"lines":[{"seq":1,"speaker":"A","en":"...","zh":"...","beat":"进行"}]}`;

    const raw = await callDeepSeek(rewritePrompt);
    for (const l of raw as Array<{ seq?: number; en?: string; zh?: string }>) {
      const seq = Number(l.seq);
      const row = rows.find((r) => r.seq === seq);
      if (!row || !l.en?.trim()) continue;
      row.sentence = l.en.trim();
      if (l.zh?.trim()) row.zh = l.zh.trim();
    }
  }

  const mapped = rows.map((r) => ({ en: r.sentence, zh: r.zh, speaker: r.speaker, beat: r.beat }));
  const closing = validateDuplicateClosingPhrases(mapped);
  const batch = validateDialogueBatch(sceneKey, mapped);
  if (closing.length > 0 || batch.length > 0 || rows.length < 28) {
    console.log(`  ❌ ${sceneKey}: closing=${closing.length} batch=${batch.length} lines=${rows.length}`);
    if (batch[0]) console.log(`     ${batch[0].message}`);
    return false;
  }

  dialogues = loadDialogues();
  const startId = backup[0]?.id ?? 300_000;
  const records = rows.map((r, i) => ({
    id: startId + i,
    scene: sceneKey,
    seq: r.seq,
    speaker: r.speaker as 'A' | 'B',
    sentence: r.sentence,
    zh: r.zh,
    beat: r.beat as '开场' | '进行' | '收束',
    source: 'generated' as const,
  }));
  dialogues = [...dialogues.filter((d) => d.scene !== sceneKey), ...records];
  saveDialogues(dialogues);
  console.log(`  ✅ ${sceneKey} (${rows.length} 句)`);
  return true;
}

async function main() {
  const filter = process.argv[2];
  const failing = listTop50SceneKeys().filter((sceneKey) => {
    if (filter && sceneKey !== filter) return false;
    const rows = loadDialogues().filter((d) => d.scene === sceneKey).sort((a, b) => a.seq - b.seq);
    return validateDuplicateClosingPhrases(rows.map((r) => ({ en: r.sentence }))).length > 0;
  });

  console.log(`\n══ Direct repair: ${failing.length} 场景 ══\n`);
  let ok = 0;
  for (const sceneKey of failing) {
    if (await repairScene(sceneKey)) ok++;
  }
  console.log(`\n完成: ${ok}/${failing.length}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
