/** Shared vocabulary types — dictionary tab + 造词纺 */

export type OgdenCategory =
  | 'operators'
  | 'actions'
  | 'picturables'
  | 'generals'
  | 'qualities'
  | 'opposites';

export type VisualType = 'operator' | 'direction' | 'grammar' | 'image' | 'fallback';

export type TokenRole = 'op' | 'dir' | 'n' | 'adj' | 'pron' | 'det' | 'misc';

export interface OgdenWordRow {
  id: string;
  word: string;
  category: OgdenCategory;
  translation: string;
  ipa: string | null;
  definition_en: string | null;
  visual_type: VisualType;
  visual_ref: string | null;
  audio_url: string | null;
  is_operator: boolean;
  sort_order: number;
}

export interface WordGuideRow {
  id: string;
  hook: string | null;
  concept: string | null;
  equation: string | null;
  combine: string | null;
  ogden_tip: string | null;
  guide_sentences: GuideSentence[];
}

export interface GuideSentencePart {
  surface: string;
  word_id: string | null;
  role: TokenRole | string;
}

export interface GuideSentence {
  en: string;
  cn?: string;
  parts: GuideSentencePart[];
}

export interface SentenceToken {
  surface: string;
  bare: string;
  wordId: string | null;
  role: TokenRole;
  isWhitespace: boolean;
}

export interface SceneRow {
  id: string;
  slug: string;
  title_en: string;
  title_zh: string;
  tier: 'P0' | 'P1' | 'P2';
  freq_rank: number;
  icon: string | null;
  status: string;
  metadata?: import('./scene').SceneMetadata | null;
}

export interface DialogueTurnRow {
  id: string;
  dialogue_id: string;
  seq: number;
  speaker: string;
  speaker_zh: string | null;
  en: string;
  zh: string | null;
  speech_act: string | null;
  audio_url: string | null;
  legacy_turn_id?: number | null;
  tokens?: SentenceToken[];
}

export interface TurnTokenRow {
  turn_id: string;
  idx: number;
  surface: string;
  word_id: string | null;
  token_role: string | null;
}
