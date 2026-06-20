import fs from 'fs';

const src = fs.readFileSync('src/data/words850Legacy.ts', 'utf8');
const qualMatch = src.match(/const QUAL_WORDS =\s*\n\s*"([^"]+)"/);
const oppMatch = src.match(/const OPP_WORDS =\s*\n\s*"([^"]+)"/);
if (!qualMatch || !oppMatch) throw new Error('word lists not found');

const qual = qualMatch[1].split(',').map((s) => s.trim());
const opp = oppMatch[1].split(',').map((s) => s.trim());

const qualRules: Record<string, string[]> = {
  color: ['black', 'brown', 'grey', 'red', 'yellow'],
  temperature: ['warm', 'boiling', 'wet'],
  emotion: ['angry', 'happy', 'violent', 'sudden', 'tired'],
  texture: ['smooth', 'sharp', 'sticky', 'stiff', 'elastic', 'hard', 'cut'],
  magnitude: ['great', 'tall', 'long', 'wide', 'thick', 'deep', 'high', 'fat', 'full'],
  shape: ['round', 'flat', 'hollow', 'straight', 'parallel', 'hanging', 'open', 'fixed', 'tight'],
  speed: ['quick', 'quiet'],
  time: ['early', 'first', 'second', 'new', 'young', 'past', 'present'],
  positive: ['good', 'able', 'clean', 'clear', 'healthy', 'kind', 'wise', 'true', 'important', 'free', 'beautiful', 'bright', 'fertile', 'living', 'ready', 'responsible', 'right', 'strong', 'sweet', 'normal', 'necessary', 'possible', 'probable', 'regular', 'serious', 'conscious', 'equal', 'frequent', 'same'],
  negative: ['poor', 'broken', 'dependent', 'complex', 'acid', 'cheap'],
  social: ['chief', 'common', 'general', 'medical', 'military', 'political', 'physical', 'natural', 'material', 'male', 'married', 'private', 'separate', 'automatic', 'chemical', 'like', 'waiting', 'electric'],
};

const oppRules: Record<string, string[]> = {
  temperature: ['cold'],
  light: ['dark'],
  size: ['small', 'short', 'thin', 'narrow', 'low'],
  truth: ['false', 'certain', 'wrong'],
  safety: ['safe'],
  texture: ['rough', 'soft'],
  sound: ['loud'],
  position: ['left', 'bent', 'loose', 'shut'],
  time: ['late', 'last', 'future', 'old', 'awake', 'dead'],
  color: ['blue', 'green', 'white'],
  state: ['bad', 'ill', 'feeble', 'foolish', 'cruel', 'sad', 'bitter', 'dirty', 'dry', 'mixed', 'strange', 'special', 'simple', 'slow', 'solid', 'secret', 'public', 'opposite', 'different', 'complete', 'delicate', 'dear', 'female'],
};

function buildMap(words: string[], rules: Record<string, string[]>) {
  const map: Record<string, string> = {};
  for (const [motif, list] of Object.entries(rules)) {
    for (const w of list) {
      if (words.includes(w)) map[w] = motif;
    }
  }
  for (const w of words) {
    if (!map[w]) map[w] = 'default';
  }
  return map;
}

function writeFile(
  path: string,
  words: string[],
  map: Record<string, string>,
  typeName: string,
) {
  const motifs = [...new Set([...Object.values(map), 'default'])].sort();
  const lines = words.map((w) => `  ${JSON.stringify(w)}: '${map[w]}',`).join('\n');
  const motifUnion = motifs.map((m) => `  | '${m}'`).join('\n');
  const out = `/** Motif groups for ${words.length} ${typeName} words */\nexport const ${typeName.toUpperCase()}_WORDS = [\n  ${words.map((w) => `'${w}'`).join(', ')}\n] as const;\n\nexport type ${typeName}Motif =\n${motifUnion};\n\nconst MOTIF_MAP: Record<string, ${typeName}Motif> = {\n${lines}\n};\n\nexport function get${typeName}Motif(word: string): ${typeName}Motif {\n  return MOTIF_MAP[word] ?? 'default';\n}\n\nexport function is${typeName}Word(word: string): boolean {\n  return (${typeName.toUpperCase()}_WORDS as readonly string[]).includes(word);\n}\n`;
  fs.writeFileSync(path, out);
}

const qmap = buildMap(qual, qualRules);
const omap = buildMap(opp, oppRules);
writeFile('src/data/qualityWordMotifs.ts', qual, qmap, 'Quality');
writeFile('src/data/oppositeWordMotifs.ts', opp, omap, 'Opposite');
console.log('quality default:', qual.filter((w) => qmap[w] === 'default').length);
console.log('opposite default:', opp.filter((w) => omap[w] === 'default').length);
