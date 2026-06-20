/**
 * 从 Supabase ogden_word_guides 读写 guide 数据（脚本层唯一数据源）
 */
import { createSupabaseAdmin } from './syncDialoguesToDb';
import { wordsData } from '../../src/data/wordsList';
import type { WordGuideRow } from '../../src/types/vocab';
import type { WordGuide } from './guideQuality';
import { normalizeGuidePartsFromEn } from './guidePrompt';

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export function rowToWordGuide(row: WordGuideRow): WordGuide {
  return {
    hook: row.hook ?? undefined,
    concept: row.concept ?? undefined,
    equation: row.equation ?? undefined,
    combine: row.combine ?? undefined,
    ogdenTip: row.ogden_tip ?? undefined,
    sentences: (row.guide_sentences ?? []).map((s) => ({
      en: s.en,
      cn: s.cn,
      parts: s.parts,
    })),
  };
}

function normalizeGuideParts(parts: unknown): { surface: string; word_id: string | null; role: string }[] {
  if (!Array.isArray(parts)) return [];
  return parts.map((p) => {
    if (Array.isArray(p)) {
      const [surface, role] = p;
      const bare = String(surface).toLowerCase().replace(/[.,!?]/g, '');
      const word = wordsData.find((w) => w.id === bare || w.word.toLowerCase() === bare);
      return { surface: String(surface), word_id: word?.id ?? null, role: String(role) };
    }
    if (p && typeof p === 'object' && 'surface' in p) {
      return {
        surface: String((p as { surface: string }).surface),
        word_id: (p as { word_id?: string | null }).word_id ?? null,
        role: String((p as { role?: string }).role ?? 'misc'),
      };
    }
    return { surface: '', word_id: null, role: 'misc' };
  });
}

export function wordGuideToRow(id: string, guide: WordGuide): Partial<WordGuideRow> & { id: string; updated_at: string } {
  return {
    id: id.toLowerCase(),
    hook: guide.hook ?? null,
    concept: guide.concept ?? null,
    equation: guide.equation ?? null,
    combine: guide.combine ?? null,
    ogden_tip: guide.ogdenTip ?? null,
    guide_sentences: (guide.sentences ?? []).map((s) => ({
      en: s.en,
      cn: s.cn,
      parts: normalizeGuideParts(s.parts ?? normalizeGuidePartsFromEn(s.en)),
    })),
    updated_at: new Date().toISOString(),
  };
}

export async function loadAllGuidesFromSupabase(): Promise<Map<string, WordGuide>> {
  const supabase = createSupabaseAdmin();
  const map = new Map<string, WordGuide>();
  const pageSize = 200;
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from('ogden_word_guides')
      .select('*')
      .order('id')
      .range(from, from + pageSize - 1);
    if (error) throw new Error(`ogden_word_guides load: ${error.message}`);
    if (!data?.length) break;
    for (const row of data as WordGuideRow[]) {
      map.set(row.id, rowToWordGuide(row));
    }
    if (data.length < pageSize) break;
    from += pageSize;
  }

  return map;
}

export async function loadGuidesRecordForScripts(): Promise<
  Record<string, { method?: string; hook?: string; concept?: string; opposite?: string; sentences?: Array<{ en: string; cn?: string }> }>
> {
  const map = await loadAllGuidesFromSupabase();
  const out: Record<string, { method?: string; hook?: string; concept?: string; sentences?: Array<{ en: string; cn?: string }> }> = {};
  for (const [id, guide] of map) {
    out[id] = {
      hook: guide.hook,
      concept: guide.concept,
      sentences: guide.sentences,
    };
  }
  return out;
}

export async function saveGuidePatchesToSupabase(patches: Record<string, WordGuide>): Promise<void> {
  const supabase = createSupabaseAdmin();
  const rows = Object.entries(patches).map(([id, guide]) => wordGuideToRow(id, guide));

  for (const batch of chunk(rows, 50)) {
    const { error } = await supabase.from('ogden_word_guides').upsert(batch, { onConflict: 'id' });
    if (error) throw new Error(`ogden_word_guides upsert: ${error.message}`);
  }
}
