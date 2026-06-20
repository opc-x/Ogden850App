import { useMemo } from 'react';
import { usePracticedScenes } from '../contexts/ProgressContext';
import { useSceneCatalog } from './useSceneCatalog';

export function useScenePracticeStats() {
  const practicedScenes = usePracticedScenes();
  const { scenes, loading, error } = useSceneCatalog();

  return useMemo(() => {
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
      loading,
      error,
      totalSceneCount,
      practicedSceneCount,
      totalSentenceCount,
      practicedSentenceCount,
      top10Total,
      top10Practiced,
      scenePercent,
      sentencePercent,
    };
  }, [scenes, practicedScenes, loading, error]);
}
