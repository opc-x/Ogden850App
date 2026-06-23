import { tokenizeSentence } from './wordTokens';
import type { OgdenCategory } from '../types/vocab';

/** 造句动词等语法词 — 不算「命中850词」撒花 */
const GRAMMAR_ROLES = new Set(['op', 'dir', 'pron', 'det']);

const CELEBRATE_CATEGORIES = new Set<OgdenCategory>([
  'actions',
  'picturables',
  'generals',
  'qualities',
  'opposites',
]);

/** 语法/虚词 lemma — 即便入库也不撒花 */
const GRAMMAR_LEMMAS = new Set([
  'if', 'right', 'all', 'one', 'not', 'yes', 'no', 'or', 'and', 'but', 'so',
  'when', 'where', 'what', 'who', 'how', 'why', 'which', 'this', 'that',
  'here', 'there', 'now', 'then', 'very', 'too', 'also', 'only', 'just',
]);

/**
 * 用户台词里真正命中的 Ogden 850 实义词（去重）。
 * 排除代词/介词/冠词/造句动词，避免每句都误撒花。
 */
export function getOgdenLemmaHits(text: string): string[] {
  const seen = new Set<string>();
  for (const tok of tokenizeSentence(text)) {
    if (tok.isWhitespace || !tok.wordId) continue;
    if (GRAMMAR_ROLES.has(tok.role)) continue;
    if (tok.category === 'operators') continue;
    if (tok.category && !CELEBRATE_CATEGORIES.has(tok.category)) continue;
    if (GRAMMAR_LEMMAS.has(tok.wordId)) continue;
    seen.add(tok.wordId);
  }
  return [...seen];
}

export function formatLemmaHitWords(hits: string[]): string {
  if (!hits.length) return '';
  return hits.join(' · ');
}

/** @deprecated use formatLemmaHitWords */
export function formatOgdenHitLabel(hits: string[]): string {
  return formatLemmaHitWords(hits);
}
