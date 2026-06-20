/**
 * 单场景 0→1 试点管线 — 整篇 LLM 一次性生成 + 质量门禁 + 写入 JSON
 */
import type { SceneDialogueRecord } from '../../src/types/sceneDialogue';
import { validateDialogueBatch } from './dialogueQuality';
import type { DialogueProvider } from './llmDialogue';
import { buildSceneDialogues, countBeats } from './sceneDialogueBuilder';

export interface PilotBuildResult {
  sceneKey: string;
  records: SceneDialogueRecord[];
  report: {
    target: number;
    curated: number;
    llmGenerated: number;
    total: number;
    provider: DialogueProvider;
    qualityIssues: string[];
    beats: Record<string, number>;
  };
}

export async function buildPilotScene(opts: {
  sceneKey: string;
  target: number;
  provider: DialogueProvider;
  startId: number;
  onProgress?: (n: number) => void;
}): Promise<PilotBuildResult> {
  const { lines: merged, llmGenerated, qualityIssues: builderIssues } = await buildSceneDialogues({
    sceneKey: opts.sceneKey,
    target: opts.target,
    provider: opts.provider,
    onProgress: opts.onProgress,
  });

  const issues =
    builderIssues.length > 0
      ? builderIssues
      : validateDialogueBatch(
          opts.sceneKey,
          merged.map((l) => ({ en: l.en, zh: l.zh, speaker: l.speaker, beat: l.beat })),
        ).map((i) => i.message);

  let nextId = opts.startId;
  const records: SceneDialogueRecord[] = merged.map((line, i) => ({
    id: nextId++,
    scene: opts.sceneKey,
    seq: i + 1,
    speaker: line.speaker,
    sentence: line.en,
    zh: line.zh,
    beat: line.beat,
    source: 'generated' as const,
  }));

  const beats = countBeats(merged);

  return {
    sceneKey: opts.sceneKey,
    records,
    report: {
      target: opts.target,
      curated: 0,
      llmGenerated,
      total: records.length,
      provider: opts.provider,
      qualityIssues: issues,
      beats,
    },
  };
}
