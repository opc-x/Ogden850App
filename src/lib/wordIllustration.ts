/** 词卡插图静态资源路径 — PNG 优先，SVG 次之 */

export function wordSlug(word: string): string {
  return word.toLowerCase().replace(/\s+/g, '-');
}

export function wordPngUrl(word: string): string {
  return `/assets/word-img/${wordSlug(word)}.png`;
}

export function wordSvgAssetUrl(word: string): string {
  return `/assets/word-img/${wordSlug(word)}.svg`;
}

/** PNG → SVG 候选路径（img onError 逐级回退） */
export function wordIllustrationCandidates(word: string): string[] {
  const slug = wordSlug(word);
  return [`/assets/word-img/${slug}.png`, `/assets/word-img/${slug}.svg`];
}
