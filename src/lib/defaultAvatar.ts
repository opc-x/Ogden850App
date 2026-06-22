/** Gender- and age-neutral DiceBear styles only. */
const NEUTRAL_STYLES = ['notionists-neutral', 'bottts-neutral', 'shapes', 'thumbs'] as const;

function hashIndex(seed: string, mod: number): number {
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) {
    h = (h * 31 + seed.charCodeAt(i)) | 0;
  }
  return Math.abs(h) % mod;
}

function pickStyle(seed: string): (typeof NEUTRAL_STYLES)[number] {
  return NEUTRAL_STYLES[hashIndex(seed, NEUTRAL_STYLES.length)];
}

/** Deterministic neutral avatar URL for email/guest users without OAuth picture. */
export function defaultAvatarUrl(seed: string): string {
  const style = pickStyle(seed);
  return `https://api.dicebear.com/9.x/${style}/svg?seed=${encodeURIComponent(seed)}`;
}
