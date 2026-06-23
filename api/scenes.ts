import type { VercelRequest, VercelResponse } from '@vercel/node';
import { cors, getSupabaseAdmin, handleOptions } from './_lib/supabase.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res);
  if (handleOptions(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { slug, tier } = req.query;

    if (typeof slug === 'string') {
      const { data: scene, error } = await supabase
        .from('scenes')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();
      if (error) return res.status(500).json({ error: error.message });
      if (!scene) return res.status(404).json({ error: 'Scene not found' });

      const { data: sceneWords } = await supabase
        .from('scene_words')
        .select('word_id, role, ogden_words(*)')
        .eq('scene_id', scene.id);

      const { data: dialogues } = await supabase
        .from('dialogues')
        .select('id, title, difficulty, turn_count, status')
        .eq('scene_id', scene.id)
        .eq('status', 'published');

      return res.json({ scene, words: sceneWords ?? [], dialogues: dialogues ?? [] });
    }

    let query = supabase
      .from('scenes')
      .select('*')
      .eq('status', 'published')
      .order('freq_rank', { ascending: true });

    if (typeof tier === 'string') {
      query = query.eq('tier', tier);
    }

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ scenes: data ?? [] });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
}
