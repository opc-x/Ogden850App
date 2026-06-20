/**
 * 单场景试点 — 供 pilot-scene.ts / pilot-batch.ts 共用
 */
import fs from 'fs';
import path from 'path';
import type { SceneDialogueRecord } from '../../src/types/sceneDialogue';
import { getStoryNarrative } from '../../src/data/storyNarrative';
import { getSceneStory } from '../../src/data/sceneStoryScripts';
import { buildPilotScene } from './scenePilot';
import { curatedSeedLines } from './curatedSceneDialogues';
import type { DialogueProvider } from './llmDialogue';

export const DIALOGUES_PATH = path.join(process.cwd(), 'src/data/sceneDialogues.json');
export const PILOT_DIR = path.join(process.cwd(), 'Designs/pilot');

export function loadDialogues(): SceneDialogueRecord[] {
  if (!fs.existsSync(DIALOGUES_PATH)) return [];
  return JSON.parse(fs.readFileSync(DIALOGUES_PATH, 'utf8')) as SceneDialogueRecord[];
}

export function saveDialogues(rows: SceneDialogueRecord[]): void {
  fs.writeFileSync(DIALOGUES_PATH, JSON.stringify(rows, null, 0));
}

export interface PilotOneResult {
  sceneKey: string;
  titleZh: string;
  freqRank: number;
  ok: boolean;
  total: number;
  qualityIssues: string[];
  statusPath: string;
}

export async function pilotOneScene(opts: {
  sceneKey: string;
  target: number;
  provider: 'gemini' | 'deepseek';
  dialogues: SceneDialogueRecord[];
  verbose?: boolean;
}): Promise<{ dialogues: SceneDialogueRecord[]; result: PilotOneResult }> {
  const script = getSceneStory(opts.sceneKey);
  if (!script) {
    throw new Error(`未知场景: ${opts.sceneKey}`);
  }

  const narrative = getStoryNarrative(opts.sceneKey);
  const curatedCount = curatedSeedLines(opts.sceneKey).length;
  const maxId = opts.dialogues.reduce((m, r) => Math.max(m, r.id), 299_999);

  if (opts.verbose) {
    console.log(`\n══ TOP ${script.freqRank} ${script.titleZh} (${opts.sceneKey}) ══`);
  }

  const built = await buildPilotScene({
    sceneKey: opts.sceneKey,
    target: opts.target,
    provider: opts.provider,
    startId: maxId + 1,
    onProgress: opts.verbose
      ? (n) => process.stdout.write(`\r  LLM: ${n}/${Math.max(0, opts.target - curatedCount)}`)
      : undefined,
  });
  if (opts.verbose) process.stdout.write('\n');

  const merged = [
    ...opts.dialogues.filter((d) => d.scene !== opts.sceneKey),
    ...built.records,
  ].sort((a, b) => (a.scene === b.scene ? a.seq - b.seq : a.scene.localeCompare(b.scene)));

  fs.mkdirSync(PILOT_DIR, { recursive: true });
  const statusPath = path.join(PILOT_DIR, `${opts.sceneKey}.status.json`);
  const ok = built.report.qualityIssues.length === 0 && built.report.total > 0;

  fs.writeFileSync(
    statusPath,
    JSON.stringify(
      {
        phase: ok ? '1-to-n-complete' : '1-to-n-needs-review',
        sceneKey: opts.sceneKey,
        titleZh: script.titleZh,
        freqRank: script.freqRank,
        completedAt: new Date().toISOString(),
        provider: opts.provider,
        narrative,
        report: built.report,
        sample: built.records.slice(0, 3).map((r) => ({
          seq: r.seq,
          speaker: r.speaker,
          en: r.sentence,
          zh: r.zh,
        })),
      },
      null,
      2,
    ),
  );

  if (opts.verbose) {
    console.log(
      `  → ${built.report.total} 句 (种子 ${built.report.curated} + LLM ${built.report.llmGenerated})` +
        (built.report.qualityIssues.length ? ` ⚠ ${built.report.qualityIssues[0]}` : ' ✅'),
    );
  }

  return {
    dialogues: merged,
    result: {
      sceneKey: opts.sceneKey,
      titleZh: script.titleZh,
      freqRank: script.freqRank,
      ok,
      total: built.report.total,
      qualityIssues: built.report.qualityIssues,
      statusPath,
    },
  };
}
