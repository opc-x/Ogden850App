import { useEffect, useState } from 'react';
import type { SceneAggregateStats, SceneCatalogItem } from '../types/scene';
import { SceneService } from '../services/scene.service';

type CatalogPayload = {
  catalog: SceneCatalogItem[];
  aggregate: SceneAggregateStats;
};

async function loadSceneCatalog(): Promise<CatalogPayload> {
  const catalog = await SceneService.fetchCatalog();
  const aggregate = await SceneService.buildAggregateStats(catalog);
  return { catalog, aggregate };
}

export function useSceneCatalog() {
  const [scenes, setScenes] = useState<SceneCatalogItem[]>([]);
  const [stats, setStats] = useState<SceneAggregateStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { catalog, aggregate } = await loadSceneCatalog();
        if (!cancelled) {
          setScenes(catalog);
          setStats(aggregate);
          setError(catalog.length ? null : '场景数据为空，请检查 sceneStoryScripts 与 sceneDialogues.json');
        }
      } catch (e) {
        if (!cancelled) {
          setScenes([]);
          setStats(null);
          setError(e instanceof Error ? e.message : '场景加载失败');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const topScenes = scenes.slice(0, 10);

  return { scenes, topScenes, stats, loading, error };
}
