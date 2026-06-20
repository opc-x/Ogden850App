import type { VercelRequest, VercelResponse } from '@vercel/node';
import { cors, getSupabaseAdmin, handleOptions } from './_lib/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res);
  if (handleOptions(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { id, category, q } = req.query;

    if (typeof id === 'string') {
      const wordId = id.toLowerCase();
      const { data: word, error } = await supabase
        .from('ogden_words')
        .select('*')
        .eq('id', wordId)
        .maybeSingle();
      if (error) return res.status(500).json({ error: error.message });
      if (!word) return res.status(404).json({ error: 'Word not found' });

      const { data: guide } = await supabase
        .from('ogden_word_guides')
        .select('*')
        .eq('id', wordId)
        .maybeSingle();

      return res.json({ word, guide: guide ?? null });
    }

    let query = supabase
      .from('ogden_words')
      .select('*')
      .order('sort_order', { ascending: true });

    if (typeof category === 'string' && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });

    let rows = data ?? [];
    if (typeof q === 'string' && q.trim()) {
      const lower = q.toLowerCase();
      rows = rows.filter(
        (r: { word: string; translation: string }) =>
          r.word.toLowerCase().includes(lower) || r.translation.includes(q),
      );
    }

    return res.json({ words: rows, count: rows.length });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
}
