/** Motif groups for 100 Quality words */
export const QUALITY_WORDS = [
  'able', 'acid', 'angry', 'automatic', 'beautiful', 'black', 'boiling', 'bright', 'broken', 'brown', 'cheap', 'chemical', 'chief', 'clean', 'clear', 'common', 'complex', 'conscious', 'cut', 'deep', 'dependent', 'early', 'elastic', 'electric', 'equal', 'fat', 'fertile', 'first', 'fixed', 'flat', 'free', 'frequent', 'full', 'general', 'good', 'great', 'grey', 'hanging', 'happy', 'hard', 'healthy', 'high', 'hollow', 'important', 'kind', 'like', 'living', 'long', 'male', 'married', 'material', 'medical', 'military', 'natural', 'necessary', 'new', 'normal', 'open', 'parallel', 'past', 'physical', 'political', 'poor', 'possible', 'present', 'private', 'probable', 'quick', 'quiet', 'ready', 'red', 'regular', 'responsible', 'right', 'round', 'same', 'second', 'separate', 'serious', 'sharp', 'smooth', 'sticky', 'stiff', 'straight', 'strong', 'sudden', 'sweet', 'tall', 'thick', 'tight', 'tired', 'true', 'violent', 'waiting', 'warm', 'wet', 'wide', 'wise', 'yellow', 'young'
] as const;

export type QualityMotif =
  | 'color'
  | 'default'
  | 'emotion'
  | 'magnitude'
  | 'negative'
  | 'positive'
  | 'shape'
  | 'social'
  | 'speed'
  | 'temperature'
  | 'texture'
  | 'time';

const MOTIF_MAP: Record<string, QualityMotif> = {
  "able": 'positive',
  "acid": 'negative',
  "angry": 'emotion',
  "automatic": 'social',
  "beautiful": 'positive',
  "black": 'color',
  "boiling": 'temperature',
  "bright": 'positive',
  "broken": 'negative',
  "brown": 'color',
  "cheap": 'negative',
  "chemical": 'social',
  "chief": 'social',
  "clean": 'positive',
  "clear": 'positive',
  "common": 'social',
  "complex": 'negative',
  "conscious": 'positive',
  "cut": 'texture',
  "deep": 'magnitude',
  "dependent": 'negative',
  "early": 'time',
  "elastic": 'texture',
  "electric": 'social',
  "equal": 'positive',
  "fat": 'magnitude',
  "fertile": 'positive',
  "first": 'time',
  "fixed": 'shape',
  "flat": 'shape',
  "free": 'positive',
  "frequent": 'positive',
  "full": 'magnitude',
  "general": 'social',
  "good": 'positive',
  "great": 'magnitude',
  "grey": 'color',
  "hanging": 'shape',
  "happy": 'emotion',
  "hard": 'texture',
  "healthy": 'positive',
  "high": 'magnitude',
  "hollow": 'shape',
  "important": 'positive',
  "kind": 'positive',
  "like": 'social',
  "living": 'positive',
  "long": 'magnitude',
  "male": 'social',
  "married": 'social',
  "material": 'social',
  "medical": 'social',
  "military": 'social',
  "natural": 'social',
  "necessary": 'positive',
  "new": 'time',
  "normal": 'positive',
  "open": 'shape',
  "parallel": 'shape',
  "past": 'time',
  "physical": 'social',
  "political": 'social',
  "poor": 'negative',
  "possible": 'positive',
  "present": 'time',
  "private": 'social',
  "probable": 'positive',
  "quick": 'speed',
  "quiet": 'speed',
  "ready": 'positive',
  "red": 'color',
  "regular": 'positive',
  "responsible": 'positive',
  "right": 'positive',
  "round": 'shape',
  "same": 'positive',
  "second": 'time',
  "separate": 'social',
  "serious": 'positive',
  "sharp": 'texture',
  "smooth": 'texture',
  "sticky": 'texture',
  "stiff": 'texture',
  "straight": 'shape',
  "strong": 'positive',
  "sudden": 'emotion',
  "sweet": 'positive',
  "tall": 'magnitude',
  "thick": 'magnitude',
  "tight": 'shape',
  "tired": 'emotion',
  "true": 'positive',
  "violent": 'emotion',
  "waiting": 'social',
  "warm": 'temperature',
  "wet": 'temperature',
  "wide": 'magnitude',
  "wise": 'positive',
  "yellow": 'color',
  "young": 'time',
};

export function getQualityMotif(word: string): QualityMotif {
  return MOTIF_MAP[word] ?? 'default';
}

export function isQualityWord(word: string): boolean {
  return (QUALITY_WORDS as readonly string[]).includes(word);
}
