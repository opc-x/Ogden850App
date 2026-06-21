import { slugifySceneKey } from './sceneSlug';

/** Public scene cover webp — respects Vite `base` and normalizes slug. */
export function sceneCoverUrl(slug: string): string {
  const safe = slugifySceneKey(slug);
  const base = (import.meta.env.BASE_URL ?? '/').replace(/\/$/, '');
  return `${base}/assets/scenes/${safe}.webp`;
}
