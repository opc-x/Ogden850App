import { useEffect, useState } from 'react';
import type { StoryNarrative } from '../types/scene';
import { SceneService } from '../services/scene.service';
import { slugifySceneKey } from '../lib/sceneSlug';

export function useSceneNarrative(sceneKey: string | null) {
  const [narrative, setNarrative] = useState<StoryNarrative | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!sceneKey) {
      setNarrative(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const n = await SceneService.fetchNarrativeBySlug(slugifySceneKey(sceneKey));
        if (!cancelled) setNarrative(n);
      } catch {
        if (!cancelled) setNarrative(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sceneKey]);

  return { narrative, loading };
}

export const NARRATIVE_LABELS: Array<{ key: keyof StoryNarrative; label: string }> = [
  { key: 'when', label: '时间' },
  { key: 'where', label: '地点' },
  { key: 'who', label: '人物' },
  { key: 'how', label: '方式' },
  { key: 'method', label: '方法' },
  { key: 'event', label: '事件' },
];
