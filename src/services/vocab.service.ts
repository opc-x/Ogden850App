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

  async fetchGuide(wordId: string): Promise<WordGuideRow | null> {
    const id = wordId.toLowerCase();
    const { data, error } = await supabase
      .from('ogden_word_guides')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw new Error(`ogden_word_guides: ${error.message}`);
    if (!data) return null;
    return data as WordGuideRow;
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
