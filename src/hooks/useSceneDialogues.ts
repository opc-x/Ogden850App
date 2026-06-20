import { useEffect, useState } from 'react';
import type { DialogueTurn } from '../types/scene';
import { slugifySceneKey } from '../lib/sceneSlug';
import { SceneService } from '../services/scene.service';

export function useSceneDialogues(sceneKey: string | null) {
  const [turns, setTurns] = useState<DialogueTurn[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sceneKey) {
      setTurns([]);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        const slug = slugifySceneKey(sceneKey);
        const dbTurns = await SceneService.fetchDialogueTurnsBySlug(slug);
        if (!cancelled) {
          setTurns(dbTurns);
          setError(dbTurns.length ? null : '该场景暂无对话数据');
        }
      } catch (e) {
        if (!cancelled) {
          setTurns([]);
          setError(e instanceof Error ? e.message : '对话加载失败');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sceneKey]);

  return { turns, loading, error };
}
