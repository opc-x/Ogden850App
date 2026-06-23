import type { VercelRequest, VercelResponse } from '@vercel/node';
import { cors, getSupabaseAdmin, handleOptions } from './_lib/supabase.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res);
  if (handleOptions(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'id query param required' });
  }

  try {
    const supabase = getSupabaseAdmin();

    const { data: dialogue, error } = await supabase
      .from('dialogues')
      .select('*, scenes(slug, title_zh, title_en)')
      .eq('id', id)
      .maybeSingle();
    if (error) return res.status(500).json({ error: error.message });
    if (!dialogue) return res.status(404).json({ error: 'Dialogue not found' });

    const { data: turns, error: turnsErr } = await supabase
      .from('dialogue_turns')
      .select('*')
      .eq('dialogue_id', id)
      .order('seq', { ascending: true });
    if (turnsErr) return res.status(500).json({ error: turnsErr.message });

    const turnIds = (turns ?? []).map((t) => t.id);
    let tokensByTurn: Record<string, unknown[]> = {};
    if (turnIds.length) {
      const { data: tokens } = await supabase
        .from('turn_tokens')
        .select('*')
        .in('turn_id', turnIds)
        .order('idx', { ascending: true });
      for (const tok of tokens ?? []) {
        const tid = tok.turn_id as string;
        if (!tokensByTurn[tid]) tokensByTurn[tid] = [];
        tokensByTurn[tid].push(tok);
      }
    }

    const enriched = (turns ?? []).map((t) => ({
      ...t,
      tokens: tokensByTurn[t.id as string] ?? [],
    }));

    return res.json({ dialogue, turns: enriched });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
}
