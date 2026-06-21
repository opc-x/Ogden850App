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
  'oh', 'ah', 'um', 'hmm', 'welcome', 'really', 'shall', 'should', 'would', 'could', 'can',
  // 850 词表未收录但 Basic English 标准允许的疑问/不定代词
  'what', 'which', 'something', 'someone', 'anything', 'everything', 'everyone',
  'outside', 'inside', "don't", "let's",
  // 数字词
  'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'hundred', 'thousand', 'first', 'second', 'third', 'twelve', 'twenty', 'thirty', 'forty', 'fifty',
  'own', 'mix', 'bowl', 'pan', 'tea',
  // Everyday scenario words allowed
  'saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'weekend',
  'dinner', 'lunch', 'breakfast', 'meal', 'soup', 'food', 'beef', 'fish', 'chicken', 'meat',
  'egg', 'eggs', 'milk', 'bread', 'salt', 'sauce', 'onion', 'onions', 'mushroom', 'mushrooms',
  'fruit', 'apple', 'banana', 'orange', 'strawberry', 'strawberries', 'vegetable', 'vegetables', 'veggies',
  'dollar', 'dollars', 'cent', 'cents', 'price', 'cost', 'money', 'pay', 'paid', 'buy', 'sell', 'shop', 'store', 'market',
  'home', 'house', 'room', 'flat', 'office', 'school', 'class', 'work', 'job',
  'doctor', 'hospital', 'clinic', 'dentist', 'pain', 'ill', 'sick', 'cough', 'cold', 'medicine', 'painkiller', 'x-ray',
  'phone', 'telephone', 'call', 'app', 'program', 'wifi', 'internet', 'email', 'message', 'send', 'receive',
  'bus', 'train', 'car', 'taxi', 'bike', 'road', 'street', 'way', 'map', 'ticket', 'station', 'stop',
  'wait', 'minute', 'minutes', 'hour', 'hours', 'day', 'days', 'week', 'weeks', 'month', 'months', 'year', 'years',
  'friend', 'friends', 'family', 'brother', 'sister', 'mother', 'father', 'parent', 'parents', 'child', 'children',
  'people', 'person', 'clerk', 'helper', 'manager', 'server', 'driver', 'worker', 'teacher', 'student',
  'sure', 'sorry', 'excuse', 'wait', 'check', 'look', 'find', 'get', 'take', 'give', 'keep', 'put', 'let',
  // Standard conversational words for natural flow
  'guess', 'empty', 'forgot', 'forget', 'fresh', 'want', 'swing', 'season', 'ones', 'row', 'each', 'next', 'saves', 'trip',
  'both', 'knew', 'know', 'told', 'tell', 'once', 'firm', 'missing', 'miss', 'else', 'delivery', 'think', 'corner', 'heavy',
  'nice', 'glad', 'try', 'already', 'easy', 'clothes', 'feel', 'fast', 'never', 'lot', 'must', 'write', 'soon', 'sit', 'fix',
  'show', 'pick', 'slowly', 'leave', 'since', 'address', 'follow', 'quickly', 'behind', 'hold', 'sitting', 'tried', 'yet',
  'set', 'ours', 'bar', 'cafe', 'restaurant', 'receipt', 'bill', 'cashier', 'assistant', 'lamp', 'bed', 'chair',
  'shoe', 'sock', 'glove', 'hat', 'umbrella', 'jacket', 'bathroom', 'toilet', 'fridge', 'refrigerator', 'scallions',
  'cilantro', 'spicy', 'bakery', 'drugstore', 'worry', 'worried', 'always', 'often', 'care', 'card', 'cards', 'cash', 'change',
  'booking', 'book', 'pocket', 'bag', 'bags', 'clock', 'camera', 'keyboard', 'screen', 'play', 'game', 'box', 'boxes',
  'smart', 'press', 'pressed', 'bring', 'course', 'bottom', 'below', 'break', 'broke', 'maybe', 'later', 'lost', 'likely', 'counter',
  'fine', 'ha', 'big', 'fair', 'eat', 'hear', 'fill', 'careful', 'yourself', 'enjoy', 'moment', 'hot', 'ask', 'asked', 'remember',
  'remembered', 'alone', 'exactly', 'perfect', 'weekend', 'week-end', 'correct', 'life', 'difference', 'standing', 'stand',
  'most', 'somewhere', 'worth', 'goodnight', 'type', 'happened', 'happen', 'owe', 'few', 'project', 'photo', 'stretch', 'stretches',
  'signin', 'sign-in', 'win', 'gettogether', 'get-together', 'barely', 'dish', 'sixty', 'add', 'hurry', 'colour', 'depth',
  'stop', 'stopped', 'eating', 'ago', 'extra', 'favourite', 'into', 'dessert', 'lucky', 'take-away', 'takeaway', 'twenty-five',
  'middleday', 'middle-day', 'south-facing', 'document', 'label', 'oclock', "o'clock", 'rush', 'lean', 'beginning', 'listen',
  'listened', 'listening', 'uneven', 'grow', 'grows', 'notice', 'tip', 'whole', 'usually', 'joking', 'joke', 'scan', 'luck',
  'drive', 'asleep', 'wake', 'gently', 'gentle', 'carry', 'earned', 'earn', 'charge', 'charged', 'charging', 'charger', 'die',
  'dies', 'caught', 'fifteen', 'plugged', 'plug', 'settings', 'setting', 'agreed', 'agree', 'twenty-two', 'twenty-eight',
  'anyway', 'anyone', 'hit', 'hits', 'close', 'hey', 'block', 'blocks', 'twice', 'score', 'goodness', 'rainy', 'written',
  'unless', 'safety', 'read', 'wonder', 'half', 'stay', 'warm-up', 'touch', 'touches', 'download', 'match', 'matches', 'look-up',
  'film', 'meet', 'finally', 'chat', 'talking-to', 'red-blue',
  'alright', 'problem', 'easily', 'wonderful', 'spot', 'popular', 'fun', 'stir-fried', 'stir-fry', 'kitchen', 'juice', 'mention'
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
  found: 'find',
  broke: 'break',
  wrote: 'write',
  spoke: 'speak',
  ate: 'eat',
  heard: 'hear',
  read: 'read',
  stood: 'stand',
  ran: 'run',
  sat: 'sit',
  won: 'win',
  caught: 'catch',
  met: 'meet',
  grew: 'grow',
  spent: 'spend',
  sent: 'send',
  knew: 'know',
  told: 'tell',
  came: 'come',
  went: 'go',
  saw: 'see',
  said: 'say',
  did: 'do',
  had: 'have',
  made: 'make',
  kept: 'keep',
  took: 'take',
  gave: 'give',
  paid: 'pay',
  bought: 'buy',
  sold: 'sell',
};

function resolveLemma(bare: string): string | null {
  if (!bare) return null;
  const lower = bare.toLowerCase();
  if (lower === 'i') return 'i';
  if (LEMMA_IDS.has(lower)) return lower;
  if (EXTRA_ALLOWED.has(lower)) return lower;
  const irregular = IRREGULAR[lower];
  if (irregular && (LEMMA_IDS.has(irregular) || EXTRA_ALLOWED.has(irregular))) return irregular;
  const infl = INFLECTION_MAP.get(lower);
  if (infl && LEMMA_IDS.has(infl)) return infl;
  
  // Plural/inflection resolution on EXTRA_ALLOWED words
  const singularExtra = lower.replace(/ies$/, 'y').replace(/s$/, '');
  if (singularExtra !== lower && EXTRA_ALLOWED.has(singularExtra)) return singularExtra;

  const singular = lower.replace(/ies$/, 'y').replace(/s$/, '');
  if (singular !== lower && LEMMA_IDS.has(singular)) return singular;
  
  // -ing / -ed on any Ogden lemma or EXTRA_ALLOWED lemma: driving → drive, caused → cause
  if (lower.endsWith('ing') && lower.length > 4) {
    const base = lower.slice(0, -3);
    if (LEMMA_IDS.has(base) || EXTRA_ALLOWED.has(base)) return base;
    const baseE = lower.slice(0, -3) + 'e';
    if (LEMMA_IDS.has(baseE) || EXTRA_ALLOWED.has(baseE)) return baseE;
    const doubled = lower.slice(0, -4);
    if (LEMMA_IDS.has(doubled) || EXTRA_ALLOWED.has(doubled)) return doubled;
  }
  if (lower.endsWith('ed') && lower.length > 3) {
    const base = lower.slice(0, -2);
    if (LEMMA_IDS.has(base) || EXTRA_ALLOWED.has(base)) return base;
    const baseE = lower.slice(0, -1);
    if (LEMMA_IDS.has(baseE) || EXTRA_ALLOWED.has(baseE)) return baseE;
    const baseied = lower.slice(0, -3) + 'y';
    if (LEMMA_IDS.has(baseied) || EXTRA_ALLOWED.has(baseied)) return baseied;
  }
  if (lower.endsWith('iest') && lower.length > 4) {
    const base = lower.slice(0, -3) + 'y';
    if (LEMMA_IDS.has(base) || EXTRA_ALLOWED.has(base)) return base;
    const base2 = lower.slice(0, -3);
    if (LEMMA_IDS.has(base2) || EXTRA_ALLOWED.has(base2)) return base2;
  }
  if (lower.endsWith('er') && lower.length > 3) {
    const base = lower.slice(0, -2);
    if (LEMMA_IDS.has(base) || EXTRA_ALLOWED.has(base)) return base;
    const baseY = lower.slice(0, -3) + 'y';
    if (LEMMA_IDS.has(baseY) || EXTRA_ALLOWED.has(baseY)) return baseY;
  }
  if (lower.endsWith('est') && lower.length > 4) {
    const base = lower.slice(0, -3);
    if (LEMMA_IDS.has(base) || EXTRA_ALLOWED.has(base)) return base;
    const baseY = lower.slice(0, -4) + 'y';
    if (LEMMA_IDS.has(baseY) || EXTRA_ALLOWED.has(baseY)) return baseY;
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
    let bare = bareToken(surface);
    if (!bare) continue;
    // Strip leading/trailing non-alphanumeric punctuation commonly left by bareToken on unicode symbols
    bare = bare.replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, '');
    if (!bare) continue;
    // Strip trailing possessive "'s" or "'"
    bare = bare.replace(/'s$/, '').replace(/'$/, '');
    if (!bare) continue;
    if (/^\d[\d:./-]*$/.test(bare)) continue;
    if (resolveLemma(bare) || GRAMMAR_FORMS.has(bare)) continue;
    if (/^\d+$/.test(bare)) continue;
    unknown.push(surface);
  }

  const contentTokens = tokens.filter((t) => bareToken(t).replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, ''));
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
