/** 词卡插图静态资源路径 — 仅 PNG（SVG 已废弃） */

export function wordSlug(word: string): string {
  return word.toLowerCase().replace(/\s+/g, '-');
}

export function wordPngUrl(word: string): string {
  return `/assets/word-img/${wordSlug(word)}.png`;
}

/** 词卡插图候选路径（仅 PNG；缺失时由组件回退程序化 SVG） */
export function wordIllustrationCandidates(word: string): string[] {
  return [wordPngUrl(word)];
}
