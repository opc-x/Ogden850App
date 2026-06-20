/**
 * 修复收尾语违规场景 — 基于现有台词整篇 LLM 重写（非分幕拼接）
 */
import * as dotenv from 'dotenv';
import { scenePromptFor } from './lib/sceneGenConfig';
import { buildClosingRewritePrompt, buildFreshStoryPrompt } from './lib/dialoguePrompt';
import { callDeepSeek } from './lib/deepseekDialogue';
import { polishZhLines, pickProvider, type DialogueProvider } from './lib/llmDialogue';
import { loadDialogues, saveDialogues } from './lib/pilotRunner';
import {
  auditDialogueLines,
  findClosingPhraseHits,
  validateDialogueBatch,
  validateDuplicateClosingPhrases,
} from './lib/dialogueQuality';
import { repairLinesWithLlm } from './lib/llmRepairDialogue';
import { getSceneStory } from '../src/data/sceneStoryScripts';
import type { SceneDialogueRecord } from '../src/types/sceneDialogue';
import type { StoryBeat } from './lib/sceneGenConfig';

dotenv.config({ path: '.env.local' });

const MAX_ATTEMPTS = 20;
const FRESH_STORY_AFTER = 3;

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

function recordsFromTurns(
  sceneKey: string,
  turns: Array<{ seq: number; speaker: string; en: string; zh: string; beat?: string }>,
  startId: number,
): SceneDialogueRecord[] {
  let id = startId;
  return turns.map((t) => ({
    id: id++,
    scene: sceneKey,
    seq: t.seq,
    speaker: t.speaker as 'A' | 'B',
    sentence: t.en,
    zh: t.zh,
    beat: (t.beat ?? '进行') as StoryBeat,
    source: 'generated' as const,
  }));
}

function scenePasses(sceneKey: string, rows: SceneDialogueRecord[]): boolean {
  if (rows.length < 28) return false;
  const mapped = rows.map((r) => ({ en: r.sentence, zh: r.zh, speaker: r.speaker, beat: r.beat }));
  return (
    validateDialogueBatch(sceneKey, mapped).length === 0 &&
    validateDuplicateClosingPhrases(mapped).length === 0
  );
}

/** 找出需改写的中段告别句（保留末句唯一 farewell） */
function closingLinesToRepair(backup: SceneDialogueRecord[]): SceneDialogueRecord[] {
  const hits = backup
    .map((r, i) => ({ row: r, i, labels: findClosingPhraseHits(r.sentence) }))
    .filter((h) => h.labels.length > 0);
  if (hits.length === 0) return [];
  if (hits.length === 1 && hits[0].i >= backup.length - 3) return [];

  const keep = hits[hits.length - 1]!;
  const lastAllowed = backup.length - 3;
  if (keep.i < lastAllowed) return hits.map((h) => h.row);
  return hits.filter((h) => h.row.seq !== keep.row.seq).map((h) => h.row);
}

/** 中段告别 — LLM 专向修复违规句 */
async function repairClosingLinesDirect(
  sceneKey: string,
  backup: SceneDialogueRecord[],
  badRows: SceneDialogueRecord[],
): Promise<SceneDialogueRecord[] | null> {
  const prompt = scenePromptFor(sceneKey);
  const context = backup
    .map((r) => `${r.seq}. ${r.speaker}: ${r.sentence} / ${r.zh}`)
    .join('\n');
  const targets = badRows
    .map((r) => `${r.seq}. ${r.speaker}: ${r.sentence} / ${r.zh}`)
    .join('\n');

  const rewritePrompt = `Fix ONLY the numbered lines below in scene "${sceneKey}" (${prompt.titleZh}).
Remove ALL goodbye, bye, see you, good night, sleep well, rest well, take care from these lines — the story must continue after them.
Use "I will go now", "talk later", "until tomorrow" instead. Ogden 850 words only.

FULL SCENE:
${context}

LINES TO FIX (rewrite en + zh, keep seq/speaker/beat):
${targets}

Return JSON: {"lines":[{"seq":11,"speaker":"A","en":"...","zh":"...","beat":"进行"}]}`;

  const raw = await callDeepSeek(rewritePrompt);
  const bySeq = new Map(backup.map((r) => [r.seq, { ...r }]));
  for (const l of raw as Array<{ seq?: number; speaker?: string; en?: string; zh?: string }>) {
    const seq = Number(l.seq);
    const row = bySeq.get(seq);
    if (!row || !l.en?.trim() || !l.zh?.trim()) continue;
    row.sentence = l.en.trim();
    row.zh = l.zh.trim();
  }
  const records = [...bySeq.values()].sort((a, b) => a.seq - b.seq);
  return scenePasses(sceneKey, records) ? records : null;
}

/** 中段告别 — LLM 逐句改写去掉 farewell，保留末句唯一告别 */
async function tryClosingLineRepair(
  sceneKey: string,
  backup: SceneDialogueRecord[],
): Promise<SceneDialogueRecord[] | null> {
  const badRows = closingLinesToRepair(backup);
  if (badRows.length === 0 || badRows.length > 20) return null;

  for (let tryN = 0; tryN < 3; tryN++) {
    const direct = await repairClosingLinesDirect(sceneKey, backup, badRows);
    if (direct) return direct;
  }

  const turns = backup.map((r) => ({
    seq: r.seq,
    speaker: r.speaker,
    en: r.sentence,
    zh: r.zh,
    beat: r.beat,
  }));
  const audited = auditDialogueLines(sceneKey, turns);
  const flagged = audited.filter((l) => badRows.some((b) => b.seq === l.seq));
  for (const row of flagged) {
    row.issues.push({
      kind: 'closingPhrase',
      message: 'Remove goodbye/bye/see you/good night/sleep well/rest well/take care from this mid-scene line; story must continue after it',
    });
  }

  const fixed = await repairLinesWithLlm({ sceneKey, lines: turns, flagged, provider: 'deepseek' });
  const startId = backup[0]?.id ?? 300_000;
  const records = recordsFromTurns(sceneKey, fixed, startId);
  return scenePasses(sceneKey, records) ? records : null;
}

async function main() {
  const engine = pickProvider('deepseek');
  if (!engine) throw new Error('需要 DEEPSEEK_API_KEY');

  const target = Number(arg('--target') ?? '32');
  const sceneFilter = arg('--scene');
  let dialogues = loadDialogues();
  const scenes = [...new Set(dialogues.map((d) => d.scene))];

  const failing = scenes.filter((sceneKey) => {
    if (sceneFilter && sceneKey !== sceneFilter) return false;
    const rows = dialogues.filter((d) => d.scene === sceneKey).sort((a, b) => a.seq - b.seq);
    return validateDuplicateClosingPhrases(rows.map((r) => ({ en: r.sentence }))).length > 0;
  });

  console.log(`\n══ 收尾语修复 ══ 场景: ${failing.length}\n`);

  for (const sceneKey of failing) {
    // 每场景重新读盘，避免并行脚本覆盖
    dialogues = loadDialogues();
    const script = getSceneStory(sceneKey);
    if (!script) continue;
    const prompt = scenePromptFor(sceneKey);
    const backup = dialogues.filter((d) => d.scene === sceneKey).sort((a, b) => a.seq - b.seq);

    const backupClosing = validateDuplicateClosingPhrases(backup.map((r) => ({ en: r.sentence }))).length;
    console.log(`══ ${script.titleZh} (${sceneKey}) — 违规 ${backupClosing} ══`);
    let best: SceneDialogueRecord[] = backup;
    let bestOk = false;
    let lastViolationHints: string[] = [];

    let lineRepaired: SceneDialogueRecord[] | null = null;
    for (let pass = 0; pass < 5; pass++) {
      const candidate = await tryClosingLineRepair(sceneKey, best);
      if (!candidate) break;
      lineRepaired = candidate;
      best = candidate;
      if (scenePasses(sceneKey, best)) {
        bestOk = true;
        console.log(`  ✅ ${best.length} 句 (line repair${pass > 0 ? ` pass ${pass + 1}` : ''})`);
        break;
      }
    }

    for (let attempt = 0; !bestOk && attempt < MAX_ATTEMPTS; attempt++) {
      const useFresh = backupClosing >= 4 || attempt >= FRESH_STORY_AFTER;
      const rewritePrompt = useFresh
        ? buildFreshStoryPrompt({
            sceneKey,
            titleZh: prompt.titleZh,
            titleEn: prompt.titleEn,
            storyHook: prompt.storyHook,
            storyOutline: prompt.storyOutline,
            target,
          })
        : buildClosingRewritePrompt({
            sceneKey,
            titleZh: prompt.titleZh,
            titleEn: prompt.titleEn,
            storyHook: prompt.storyHook,
            target,
            violationHints: lastViolationHints,
            existing: backup.map((r) => ({
              speaker: r.speaker,
              en: r.sentence,
              zh: r.zh,
              beat: r.beat,
            })),
          });

      const raw = await callDeepSeek(rewritePrompt);
      const polished = await polishZhLines(raw, 'deepseek');
      let lastBeat: StoryBeat = '开场';
      const lines: SceneDialogueRecord[] = [];
      let nextId = dialogues.reduce((m, r) => Math.max(m, r.id), 299_999) + 1;

      for (const l of polished.slice(0, target)) {
        const en = l.en?.trim();
        const zh = l.zh?.trim();
        if (!en || !zh) continue;
        const beat = (['开场', '进行', '收束'].includes(l.beat) ? l.beat : lastBeat) as StoryBeat;
        lastBeat = beat;
        lines.push({
          id: nextId++,
          scene: sceneKey,
          seq: lines.length + 1,
          speaker: l.speaker,
          sentence: en,
          zh,
          beat,
          source: 'generated',
        });
      }

      const issues = validateDialogueBatch(
        sceneKey,
        lines.map((r) => ({ en: r.sentence, zh: r.zh, speaker: r.speaker, beat: r.beat })),
      );
      const closing = validateDuplicateClosingPhrases(lines.map((r) => ({ en: r.sentence })));
      const violationHints = [
        ...issues.map((i) => i.message),
        ...closing.map((i) => i.message),
      ];
      const ok = issues.length === 0 && closing.length === 0 && lines.length >= 28;

      if (ok) {
        best = lines;
        bestOk = true;
        console.log(`  ✅ ${lines.length} 句 (attempt ${attempt + 1}${useFresh ? ', fresh story' : ''})`);
        break;
      }

      lastViolationHints = violationHints.slice(0, 8);
      process.stdout.write(
        `\r  attempt ${attempt + 1}${useFresh ? ' [fresh]' : ''}: ${lines.length} lines, issues ${issues.length + closing.length}`,
      );
    }

    if (!bestOk) {
      best = backup;
      console.log(`\n  ↩ 保留旧稿（${backup.length} 句）`);
    }

    dialogues = [...dialogues.filter((d) => d.scene !== sceneKey), ...best].sort((a, b) =>
      a.scene === b.scene ? a.seq - b.seq : a.scene.localeCompare(b.scene),
    );
    saveDialogues(dialogues);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
