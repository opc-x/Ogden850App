import { wordsData } from '../../src/data/wordsList';
import {
  bareToken,
  buildInflectionMap,
  DIRECTIVES,
  DETERMINERS,
  OP_FORMS,
  PRONOUNS,
} from '../../src/data/ogdenGrammar';

const LEMMA_IDS = new Set(wordsData.map((w) => w.id));
const INFLECTION_MAP = buildInflectionMap(LEMMA_IDS);

/** Extra closed-class words allowed in Basic English dialogues */
const EXTRA_ALLOWED = new Set([
  'not', 'no', 'yes', 'please', 'thank', 'thanks', 'hello', 'goodbye', 'good',
  'morning', 'afternoon', 'evening', 'night', 'today', 'tomorrow', 'yesterday', 'tonight',
  'here', 'there', 'now', 'then', 'very', 'too', 'also', 'only', 'just',
  'more', 'less', 'much', 'many', 'well', 'ok', 'okay', 'sir', 'miss',
  'oh', 'ah', 'um', 'hmm', 'welcome',
  'can', 'could', 'should', 'would',
  // 850 词表未收录但 Basic English 标准允许的疑问/不定代词
  'what', 'which', 'something', 'someone', 'anything', 'everything',
  'outside', 'inside', "don't", "let's",
  // 数字词（词表用阿拉伯数字，但教学例句常写英文数字）
  'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'hundred', 'thousand', 'first', 'second', 'third', 'twelve', 'twenty', 'thirty', 'forty', 'fifty',
  'own', 'mix', 'bowl', 'pan', 'tea',
]);

const GRAMMAR_FORMS = new Set([
  ...OP_FORMS,
  ...DIRECTIVES,
  ...PRONOUNS,
  ...DETERMINERS,
  ...EXTRA_ALLOWED,
]);

const IRREGULAR: Record<string, string> = {
  better: 'good',
  best: 'good',
  worse: 'bad',
  worst: 'bad',
  farther: 'far',
  further: 'far',
  men: 'man',
  women: 'woman',
  children: 'boy',
  feet: 'foot',
  teeth: 'tooth',
  mice: 'rat',
};

function resolveLemma(bare: string): string | null {
  if (!bare) return null;
  const lower = bare.toLowerCase();
  if (lower === 'i') return 'i';
  if (LEMMA_IDS.has(lower)) return lower;
  const irregular = IRREGULAR[lower];
  if (irregular && LEMMA_IDS.has(irregular)) return irregular;
  const infl = INFLECTION_MAP.get(lower);
  if (infl && LEMMA_IDS.has(infl)) return infl;
  const singular = lower.replace(/ies$/, 'y').replace(/s$/, '');
  if (singular !== lower && LEMMA_IDS.has(singular)) return singular;
  // -ing / -ed on any Ogden lemma: driving → drive, caused → cause
  if (lower.endsWith('ing') && lower.length > 4) {
    const base = lower.slice(0, -3);
    if (LEMMA_IDS.has(base)) return base;
    const baseE = lower.slice(0, -3) + 'e';
    if (LEMMA_IDS.has(baseE)) return baseE;
    const doubled = lower.slice(0, -4);
    if (LEMMA_IDS.has(doubled)) return doubled;
  }
  if (lower.endsWith('ed') && lower.length > 3) {
    const base = lower.slice(0, -2);
    if (LEMMA_IDS.has(base)) return base;
    const baseE = lower.slice(0, -1);
    if (LEMMA_IDS.has(baseE)) return baseE;
    const baseied = lower.slice(0, -3) + 'y';
    if (LEMMA_IDS.has(baseied)) return baseied;
  }
  if (lower.endsWith('iest') && lower.length > 4) {
    const base = lower.slice(0, -3) + 'y';
    if (LEMMA_IDS.has(base)) return base;
    const base2 = lower.slice(0, -3);
    if (LEMMA_IDS.has(base2)) return base2;
  }
  if (lower.endsWith('er') && lower.length > 3) {
    const base = lower.slice(0, -2);
    if (LEMMA_IDS.has(base)) return base;
    const baseY = lower.slice(0, -3) + 'y';
    if (LEMMA_IDS.has(baseY)) return baseY;
  }
  if (lower.endsWith('est') && lower.length > 4) {
    const base = lower.slice(0, -3);
    if (LEMMA_IDS.has(base)) return base;
    const baseY = lower.slice(0, -4) + 'y';
    if (LEMMA_IDS.has(baseY)) return baseY;
  }
  return null;
}

export interface ValidateResult {
  ok: boolean;
  unknown: string[];
  coverage: number;
}

/** 展开常见缩约，避免 I'll / That's 等误判超纲 */
export function expandContractions(sentence: string): string {
  return sentence
    .replace(/\bI'm\b/gi, 'I am')
    .replace(/\bI'll\b/gi, 'I will')
    .replace(/\bI've\b/gi, 'I have')
    .replace(/\bIt's\b/gi, 'it is')
    .replace(/\bThat's\b/gi, 'that is')
    .replace(/\bHere's\b/gi, 'here is')
    .replace(/\bThere's\b/gi, 'there is')
    .replace(/\bDon't\b/gi, 'do not')
    .replace(/\bCan't\b/gi, 'can not')
    .replace(/\bWon't\b/gi, 'will not')
    .replace(/\bLet's\b/gi, 'let us');
}

export function validateOgdenSentence(sentence: string): ValidateResult {
  const tokens = expandContractions(sentence).split(/\s+/).filter(Boolean);
  const unknown: string[] = [];

  for (const surface of tokens) {
    const bare = bareToken(surface);
    if (!bare) continue;
    if (/^\d[\d:./-]*$/.test(bare)) continue;
    if (resolveLemma(bare) || GRAMMAR_FORMS.has(bare)) continue;
    if (/^\d+$/.test(bare)) continue;
    unknown.push(surface);
  }

  const contentTokens = tokens.filter((t) => bareToken(t));
  const known = contentTokens.length - unknown.length;
  const coverage = contentTokens.length ? known / contentTokens.length : 1;

  return { ok: unknown.length === 0, unknown, coverage };
}

export function assertOgden(sentence: string): void {
  const r = validateOgdenSentence(sentence);
  if (!r.ok) {
    throw new Error(`Ogden violation: "${sentence}" → [${r.unknown.join(', ')}]`);
  }
}
