/**
 * Ogden BE850 grammar constants — shared by WordAssembler, tokenizer, import scripts.
 */
import { WORDS } from './words850Legacy';
import { isOperator } from './words850Legacy';
import { SUPPORTED_DIRECTION_WORDS } from '../components/DirectionsVisual';

export const OP_ORDER = [
  'put', 'take', 'go', 'come', 'get', 'give', 'make', 'keep', 'send',
  'let', 'see', 'have', 'do', 'be', 'seem', 'say', 'may', 'will',
] as const;

export const OP_FORMS = new Set<string>([
  ...OP_ORDER,
  'puts', 'putting', 'takes', 'took', 'taken', 'taking', 'goes', 'went', 'gone', 'going',
  'comes', 'came', 'coming', 'gets', 'got', 'gotten', 'getting', 'gives', 'gave', 'given', 'giving',
  'makes', 'made', 'making', 'keeps', 'kept', 'keeping', 'sends', 'sent', 'sending',
  'lets', 'letting', 'sees', 'saw', 'seen', 'seeing', 'has', 'had', 'having',
  'does', 'did', 'done', 'doing', 'is', 'are', 'am', 'was', 'were', 'been', 'being',
  'seems', 'seemed', 'says', 'said', 'saying', 'would', 'might',
]);

/** Operator verb surface forms → lemma (irregular + regular) */
export const OP_INFLECTION_TO_LEMMA: Record<string, string> = {
  puts: 'put', putting: 'put',
  takes: 'take', took: 'take', taken: 'take', taking: 'take',
  goes: 'go', went: 'go', gone: 'go', going: 'go',
  comes: 'come', came: 'come', coming: 'come',
  gets: 'get', got: 'get', gotten: 'get', getting: 'get',
  gives: 'give', gave: 'give', given: 'give', giving: 'give',
  makes: 'make', made: 'make', making: 'make',
  keeps: 'keep', kept: 'keep', keeping: 'keep',
  sends: 'send', sent: 'send', sending: 'send',
  lets: 'let', letting: 'let',
  sees: 'see', saw: 'see', seen: 'see', seeing: 'see',
  has: 'have', had: 'have', having: 'have',
  does: 'do', did: 'do', done: 'do', doing: 'do',
  is: 'be', are: 'be', am: 'be', was: 'be', were: 'be', been: 'be', being: 'be',
  seems: 'seem', seemed: 'seem',
  says: 'say', said: 'say', saying: 'say',
  would: 'will', might: 'may',
};

export const DIRECTIVES = new Set<string>([
  'about', 'across', 'after', 'against', 'among', 'at', 'before', 'between',
  'by', 'down', 'from', 'in', 'off', 'on', 'over', 'through', 'to', 'under',
  'up', 'with', 'as', 'for', 'of', 'till', 'than', 'out', 'forward', 'back',
  'away', 'apart', 'aside', 'along', 'together', 'without', 'round', 'near',
]);

export const PRONOUNS = new Set<string>([
  'i', 'he', 'she', 'it', 'we', 'you', 'they', 'who',
  'him', 'her', 'them', 'his', 'my', 'your', 'our', 'their', 'its', 'me', 'us',
]);

export const DETERMINERS = new Set<string>([
  'a', 'an', 'the', 'this', 'that', 'these', 'those', 'some', 'any', 'every', 'all', 'no', 'another', 'other',
]);

const TIER_ROLE: Record<string, 'n' | 'adj'> = {};
for (const w of WORDS) {
  if (w.t === 'pic' || w.t === 'things') TIER_ROLE[w.w] = 'n';
  else if (w.t === 'qual' || w.t === 'opp') TIER_ROLE[w.w] = 'adj';
}

export type GrammarRole = 'op' | 'dir' | 'n' | 'adj' | 'pron' | 'det' | 'misc';

export function bareToken(surface: string): string {
  return surface.toLowerCase().replace(/^[("'[]+|[)"'\],.!?;:]+$/g, '');
}

export function roleOfBare(bare: string): GrammarRole {
  if (OP_FORMS.has(bare)) return 'op';
  if (DIRECTIVES.has(bare)) return 'dir';
  if (PRONOUNS.has(bare)) return 'pron';
  if (DETERMINERS.has(bare)) return 'det';
  const t = TIER_ROLE[bare] ?? TIER_ROLE[bare.replace(/s$/, '')];
  if (t) return t;
  return 'misc';
}

/** Inflection surface → lemma for import + runtime lookup */
export function buildInflectionMap(lemmaIds: Set<string>): Map<string, string> {
  const map = new Map<string, string>();
  for (const id of lemmaIds) {
    if (id.endsWith('y') && id.length > 2) {
      map.set(id.slice(0, -1) + 'ies', id);
    }
    if (!id.endsWith('s') && id.length > 1) {
      map.set(id + 's', id);
    }
  }
  // Operator verb forms last — override noun-plural collisions (e.g. is→be not is→i)
  for (const [surface, lemma] of Object.entries(OP_INFLECTION_TO_LEMMA)) {
    if (lemmaIds.has(lemma) && surface !== lemma) map.set(surface, lemma);
  }
  return map;
}

export function resolveVisualType(category: string, word: string): {
  visual_type: 'operator' | 'direction' | 'grammar' | 'picturable' | 'general' | 'quality' | 'opposite';
  visual_ref: string | null;
} {
  if (category === 'operators') {
    return { visual_type: 'operator', visual_ref: word.toLowerCase() };
  }
  if (category === 'actions') {
    if (SUPPORTED_DIRECTION_WORDS.includes(word)) {
      return { visual_type: 'direction', visual_ref: word.toLowerCase() };
    }
    return { visual_type: 'grammar', visual_ref: word };
  }
  if (category === 'picturables') {
    return { visual_type: 'picturable', visual_ref: word.toLowerCase() };
  }
  if (category === 'generals') {
    return { visual_type: 'general', visual_ref: word.toLowerCase() };
  }
  if (category === 'qualities') {
    return { visual_type: 'quality', visual_ref: word.toLowerCase() };
  }
  if (category === 'opposites') {
    return { visual_type: 'opposite', visual_ref: word.toLowerCase() };
  }
  return { visual_type: 'grammar', visual_ref: word };
}

export function audioUrlForWord(word: string): string {
  const slug = word.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'word';
  return `/audio/${slug}.mp3`;
}

export { isOperator };
