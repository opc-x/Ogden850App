import type { Word } from '../types/word';

const IMAGE_EXTS = ['svg', 'webp', 'png', 'jpg', 'jpeg'] as const;

export function wordImageUrl(word: Word): string | null {
  if (word.visual_type === 'image' && word.visual_ref) {
    return word.visual_ref;
  }
  return null;
}

/** 候选静态图路径（运行时由 img onError 逐级回退） */
export function wordImageCandidates(word: Word): string[] {
  const raw = wordImageUrl(word);
  if (!raw) return [];
  const base = raw.replace(/\.(svg|webp|png|jpe?g)$/i, '');
  return IMAGE_EXTS.map((ext) => `${base}.${ext}`);
}

export function wordImageSrc(word: Word, size = 120): string | null {
  const candidates = wordImageCandidates(word);
  return candidates[0] ?? null;
}
