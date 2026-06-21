import { useMemo } from 'react';
import { computeScenePracticeStats } from '../lib/scenePracticeStats';
import { usePracticedScenes } from '../contexts/ProgressContext';
import { useSceneCatalog } from './useSceneCatalog';

export function useScenePracticeStats() {
  const practicedScenes = usePracticedScenes();
  const { scenes, loading, error } = useSceneCatalog();

  const stats = useMemo(
    () => computeScenePracticeStats(scenes, practicedScenes),
    [scenes, practicedScenes],
  );

  return { loading, error, ...stats };
}
