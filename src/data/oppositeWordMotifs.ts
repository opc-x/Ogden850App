/** Motif groups for 50 Opposite words */
export const OPPOSITE_WORDS = [
  'awake', 'bad', 'bent', 'bitter', 'blue', 'certain', 'cold', 'complete', 'cruel', 'dark', 'dead', 'dear', 'delicate', 'different', 'dirty', 'dry', 'false', 'feeble', 'female', 'foolish', 'future', 'green', 'ill', 'last', 'late', 'left', 'loose', 'loud', 'low', 'mixed', 'narrow', 'old', 'opposite', 'public', 'rough', 'sad', 'safe', 'secret', 'short', 'shut', 'simple', 'slow', 'small', 'soft', 'solid', 'special', 'strange', 'thin', 'white', 'wrong'
] as const;

export type OppositeMotif =
  | 'color'
  | 'default'
  | 'light'
  | 'position'
  | 'safety'
  | 'size'
  | 'sound'
  | 'state'
  | 'temperature'
  | 'texture'
  | 'time'
  | 'truth';

const MOTIF_MAP: Record<string, OppositeMotif> = {
  "awake": 'time',
  "bad": 'state',
  "bent": 'position',
  "bitter": 'state',
  "blue": 'color',
  "certain": 'truth',
  "cold": 'temperature',
  "complete": 'state',
  "cruel": 'state',
  "dark": 'light',
  "dead": 'time',
  "dear": 'state',
  "delicate": 'state',
  "different": 'state',
  "dirty": 'state',
  "dry": 'state',
  "false": 'truth',
  "feeble": 'state',
  "female": 'state',
  "foolish": 'state',
  "future": 'time',
  "green": 'color',
  "ill": 'state',
  "last": 'time',
  "late": 'time',
  "left": 'position',
  "loose": 'position',
  "loud": 'sound',
  "low": 'size',
  "mixed": 'state',
  "narrow": 'size',
  "old": 'time',
  "opposite": 'state',
  "public": 'state',
  "rough": 'texture',
  "sad": 'state',
  "safe": 'safety',
  "secret": 'state',
  "short": 'size',
  "shut": 'position',
  "simple": 'state',
  "slow": 'state',
  "small": 'size',
  "soft": 'texture',
  "solid": 'state',
  "special": 'state',
  "strange": 'state',
  "thin": 'size',
  "white": 'color',
  "wrong": 'truth',
};

export function getOppositeMotif(word: string): OppositeMotif {
  return MOTIF_MAP[word] ?? 'default';
}

export function isOppositeWord(word: string): boolean {
  return (OPPOSITE_WORDS as readonly string[]).includes(word);
}
