/**
 * 场景静态数据 — 1 场景 = 1 JSON 整包（故事 + 对话）
 * 编辑 src/data/scenes/{slug}.json 后刷新即生效，无需 sync/audit/repair 管线。
 */
import type { ScenePackage } from '../../types/scenePackage';

const modules = import.meta.glob<ScenePackage>('./*.json', { eager: true, import: 'default' });

let cached: ScenePackage[] | null = null;

export function getAllScenePackages(): ScenePackage[] {
  if (!cached) {
    cached = Object.values(modules).sort((a, b) => a.freqRank - b.freqRank);
  }
  return cached;
}

export function getScenePackageBySlug(slug: string): ScenePackage | undefined {
  return getAllScenePackages().find((p) => p.slug === slug);
}

export function getScenePackageByKey(sceneKey: string): ScenePackage | undefined {
  return getAllScenePackages().find((p) => p.sceneKey === sceneKey);
}
