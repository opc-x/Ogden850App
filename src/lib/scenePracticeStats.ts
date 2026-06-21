import type { SceneCatalogItem } from '../types/scene';

export type ScenePracticeStats = {
  totalSceneCount: number;
  practicedSceneCount: number;
  totalSentenceCount: number;
  practicedSentenceCount: number;
  top10Total: number;
  top10Practiced: number;
  scenePercent: number;
  sentencePercent: number;
};

export function computeScenePracticeStats(
  scenes: SceneCatalogItem[],
  practicedScenes: Record<string, boolean>,
): ScenePracticeStats {
  const readyScenes = scenes.filter((s) => s.status === 'ready' && s.sentenceCount > 0);
  const practicedReady = readyScenes.filter((s) => practicedScenes[s.sceneKey]);
  const totalSceneCount = readyScenes.length;
  const practicedSceneCount = practicedReady.length;
  const totalSentenceCount = readyScenes.reduce((sum, s) => sum + s.sentenceCount, 0);
  const practicedSentenceCount = practicedReady.reduce((sum, s) => sum + s.sentenceCount, 0);
  const top10Total = readyScenes.filter((s) => s.freqRank <= 10).length;
  const top10Practiced = practicedReady.filter((s) => s.freqRank <= 10).length;
  const scenePercent = totalSceneCount
    ? Math.round((practicedSceneCount / totalSceneCount) * 100)
    : 0;
  const sentencePercent = totalSentenceCount
    ? Math.round((practicedSentenceCount / totalSentenceCount) * 100)
    : 0;

  return {
    totalSceneCount,
    practicedSceneCount,
    totalSentenceCount,
    practicedSentenceCount,
    top10Total,
    top10Practiced,
    scenePercent,
    sentencePercent,
  };
}
