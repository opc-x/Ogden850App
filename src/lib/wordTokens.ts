import {
  bareToken,
  roleOfBare,
  buildInflectionMap,
  OP_INFLECTION_TO_LEMMA,
  type GrammarRole,
} from '../data/ogdenGrammar';
import type { SentenceToken } from '../types/vocab';

const BASE_LEMMA_IDS = new Set<string>(['i']);

let lemmaIds = new Set<string>(BASE_LEMMA_IDS);
let inflectionMap = buildInflectionMap(BASE_LEMMA_IDS);
let extraInflections: Map<string, string> = new Map();

export function setLemmaIds(ids: Set<string>): void {
  lemmaIds = ids;
  inflectionMap = buildInflectionMap(ids);
}

export function setInflectionOverrides(map: Map<string, string>): void {
  extraInflections = map;
}

function resolveLemmaId(bare: string): string | null {
  if (!bare) return null;
  const lower = bare.toLowerCase();
  if (lower === 'i') return 'i';
  if (lemmaIds.has(lower)) return lower;
  const opLemma = OP_INFLECTION_TO_LEMMA[lower];
  if (opLemma && lemmaIds.has(opLemma)) return opLemma;
  const infl = extraInflections.get(lower) ?? inflectionMap.get(lower);
  if (infl && lemmaIds.has(infl)) return infl;
  const singular = lower.replace(/ies$/, 'y').replace(/s$/, '');
  if (singular !== lower && lemmaIds.has(singular)) return singular;
  return null;
}

export function tokenizeSentence(sentence: string): SentenceToken[] {
  return sentence.split(/(\s+)/).map((surface) => {
    if (/^\s+$/.test(surface)) {
      return { surface, bare: '', wordId: null, role: 'misc', isWhitespace: true };
    }
    const bare = bareToken(surface);
    const wordId = resolveLemmaId(bare);
    const role: GrammarRole = wordId ? roleOfBare(bare) : roleOfBare(bare);
    return { surface, bare, wordId, role, isWhitespace: false };
  });
}

export function wordIdFromBare(bare: string): string | null {
  return resolveLemmaId(bare);
}

export function hasClickableWord(token: SentenceToken): boolean {
  return !token.isWhitespace && token.wordId !== null;
}

/** Image path from word row visual_ref — no static JSON */
export function staticImageForWord(wordId: string, visualRef?: string | null): string | null {
  return visualRef ?? null;
}
