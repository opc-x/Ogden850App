import { supabase } from '../lib/supabase';
import type { OgdenWordRow, WordGuideRow } from '../types/vocab';
import type { Word } from '../types/word';
import { setInflectionOverrides } from '../lib/wordTokens';

function rowToWord(row: OgdenWordRow): Word {
  return {
    id: row.id,
    word: row.word,
    translation: row.translation,
    category: row.category,
    definition_en: row.definition_en ?? `Basic English word: ${row.word}`,
    ipa: row.ipa ?? undefined,
    visual_type: row.visual_type,
    visual_ref: row.visual_ref,
    audio_url: row.audio_url ?? null,
  };
}

export const VocabService = {
  async fetchWords(params?: {
    category?: string;
    q?: string;
  }): Promise<Word[]> {
    let query = supabase
      .from('ogden_words')
      .select('*')
      .order('sort_order', { ascending: true });

    if (params?.category && params.category !== 'all') {
      query = query.eq('category', params.category);
    }

    const { data, error } = await query;
    if (error) throw new Error(`ogden_words: ${error.message}`);
    if (!data?.length) return [];

    let rows = data as OgdenWordRow[];
    if (params?.q) {
      const q = params.q.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.word.toLowerCase().includes(q) ||
          r.translation.includes(params.q!),
      );
    }
    return rows.map(rowToWord);
  },

  async fetchWordById(id: string): Promise<Word | null> {
    const normalized = id.toLowerCase() === 'i' ? 'i' : id.toLowerCase();
    const { data, error } = await supabase
      .from('ogden_words')
      .select('*')
      .eq('id', normalized)
      .maybeSingle();

    if (error) throw new Error(`ogden_words: ${error.message}`);
    if (!data) return null;
    return rowToWord(data as OgdenWordRow);
  },

  _guideCache: null as Map<string, WordGuideRow> | null,
  _guidePrefetchPromise: null as Promise<void> | null,

  invalidateGuideCache() {
    this._guideCache = null;
    this._guidePrefetchPromise = null;
  },

  async prefetchAllGuides(): Promise<void> {
    if (this._guideCache) return;
    if (this._guidePrefetchPromise) return this._guidePrefetchPromise;
    this._guidePrefetchPromise = (async () => {
      const { data, error } = await supabase
        .from('ogden_word_guides')
        .select('*');
      if (error) throw new Error(`ogden_word_guides prefetch: ${error.message}`);
      const map = new Map<string, WordGuideRow>();
      for (const row of data ?? []) {
        map.set((row as WordGuideRow).id, row as WordGuideRow);
      }
      this._guideCache = map;
    })();
    return this._guidePrefetchPromise;
  },

  getCachedGuide(wordId: string): WordGuideRow | null {
    return this._guideCache?.get(wordId.toLowerCase()) ?? null;
  },

  async fetchGuide(wordId: string): Promise<WordGuideRow | null> {
    const id = wordId.toLowerCase();

    if (this._guidePrefetchPromise) await this._guidePrefetchPromise;
    if (this._guideCache?.has(id)) return this._guideCache.get(id)!;

    const { data, error } = await supabase
      .from('ogden_word_guides')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw new Error(`ogden_word_guides: ${error.message}`);
    if (!data) return null;
    const row = data as WordGuideRow;
    if (this._guideCache) this._guideCache.set(id, row);
    return row;
  },

  async loadInflections(): Promise<void> {
    const { data, error } = await supabase
      .from('word_inflections')
      .select('surface, lemma_id');
    if (error || !data?.length) return;
    const map = new Map<string, string>();
    for (const row of data) {
      map.set(row.surface as string, row.lemma_id as string);
    }
    setInflectionOverrides(map);
  },
};

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    VocabService.invalidateGuideCache();
  });
}
