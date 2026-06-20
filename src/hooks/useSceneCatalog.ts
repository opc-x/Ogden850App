import { useEffect, useState } from 'react';
import type { SceneAggregateStats, SceneCatalogItem } from '../types/scene';
import { SceneService } from '../services/scene.service';

type CatalogPayload = {
  catalog: SceneCatalogItem[];
  aggregate: SceneAggregateStats;
};

let sharedLoad: Promise<CatalogPayload> | null = null;
let sharedResult: CatalogPayload | null = null;

function loadSceneCatalog(): Promise<CatalogPayload> {
  if (sharedResult) return Promise.resolve(sharedResult);
  if (!sharedLoad) {
    sharedLoad = (async () => {
      const catalog = await SceneService.fetchCatalog();
      const aggregate = await SceneService.buildAggregateStats(catalog);
      sharedResult = { catalog, aggregate };
      return sharedResult;
    })().catch((err) => {
      sharedLoad = null;
      throw err;
    });
  }
  return sharedLoad;
}

export function useSceneCatalog() {
  const [scenes, setScenes] = useState<SceneCatalogItem[]>(sharedResult?.catalog ?? []);
  const [stats, setStats] = useState<SceneAggregateStats | null>(sharedResult?.aggregate ?? null);
  const [loading, setLoading] = useState(!sharedResult);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { catalog, aggregate } = await loadSceneCatalog();
        if (!cancelled) {
          setScenes(catalog);
          setStats(aggregate);
          setError(catalog.length ? null : '场景数据为空，请先运行 npm run sync:dialogues');
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
