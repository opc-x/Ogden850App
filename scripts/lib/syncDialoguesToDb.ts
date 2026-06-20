/**
 * Sync scene dialogues (JSON / pilot output) → Supabase scenes + dialogues + turns + tokens
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { SceneDialogueRecord } from '../../src/types/sceneDialogue';
import { getSceneStory, slugifySceneKey, SCENE_STORY_SCRIPTS } from '../../src/data/sceneStoryScripts';
import { getStoryNarrative } from '../../src/data/storyNarrative';
import type { SceneMetadata } from '../../src/types/scene';
import { resolveSupabaseEnv } from '../../src/lib/supabaseConfig';
import { tokenizeSentence } from '../../src/lib/wordTokens';

export interface SyncSceneResult {
  sceneKey: string;
  slug: string;
  sceneId: string;
  dialogueId: string;
  turns: number;
  tokens: number;
  status: 'published' | 'draft';
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export function createSupabaseAdmin(): SupabaseClient {
  const { url, serviceRoleKey, anonKey } = resolveSupabaseEnv();
  const key = serviceRoleKey || anonKey;
  if (!url || !key) {
    throw new Error('Missing Supabase URL or API key. Set SUPABASE_SERVICE_ROLE_KEY in .env.local');
  }
  if (!serviceRoleKey) {
    console.warn('[sync] Using anon key — writes may fail without service role.');
  }
  return createClient(url, key);
}

async function upsertSceneRow(
  supabase: SupabaseClient,
  sceneKey: string,
): Promise<{ id: string; slug: string }> {
  const script = getSceneStory(sceneKey);
  if (!script) throw new Error(`Unknown scene: ${sceneKey}`);

  const slug = slugifySceneKey(sceneKey);
  const metadata: SceneMetadata = {
    sceneKey,
    titleEn: script.titleEn,
    gradient: script.gradient,
    storyHook: script.storyHook,
    storyOutline: script.storyOutline,
    illustration: script.illustration,
    narrative: getStoryNarrative(sceneKey),
  };

  const { data, error } = await supabase
    .from('scenes')
    .upsert(
      {
        slug,
        title_en: script.titleEn,
        title_zh: script.titleZh,
        tier: script.tier,
        freq_rank: script.freqRank,
        icon: script.emoji,
        status: 'published',
        metadata,
      },
      { onConflict: 'slug' },
    )
    .select('id, slug')
    .single();

  if (error || !data) throw new Error(`scenes upsert (${sceneKey}): ${error?.message ?? 'no row'}`);
  return { id: data.id as string, slug: data.slug as string };
}

export async function syncSceneDialoguesToDb(
  sceneKey: string,
  records: SceneDialogueRecord[],
  opts?: { status?: 'published' | 'draft'; verbose?: boolean },
): Promise<SyncSceneResult> {
  const supabase = createSupabaseAdmin();
  const script = getSceneStory(sceneKey);
  if (!script) throw new Error(`Unknown scene: ${sceneKey}`);

  const rows = records
    .filter((r) => r.scene === sceneKey)
    .sort((a, b) => a.seq - b.seq);

  const status = opts?.status ?? (rows.length > 0 ? 'published' : 'draft');
  const { id: sceneId, slug } = await upsertSceneRow(supabase, sceneKey);

  const source = rows.some((r) => r.source === 'curated') ? 'curated' : 'generated';

  const { data: existingDialogue } = await supabase
    .from('dialogues')
    .select('id')
    .eq('scene_id', sceneId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  let dialogueId = existingDialogue?.id as string | undefined;

  if (dialogueId) {
    const { error: updErr } = await supabase
      .from('dialogues')
      .update({
        title: script.titleZh,
        turn_count: rows.length,
        difficulty: 1,
        status,
        source,
      })
      .eq('id', dialogueId);
    if (updErr) throw new Error(`dialogues update: ${updErr.message}`);

    const { error: delErr } = await supabase.from('dialogue_turns').delete().eq('dialogue_id', dialogueId);
    if (delErr) throw new Error(`dialogue_turns delete: ${delErr.message}`);
  } else {
    const { data: created, error: insErr } = await supabase
      .from('dialogues')
      .insert({
        scene_id: sceneId,
        title: script.titleZh,
        turn_count: rows.length,
        difficulty: 1,
        status,
        source,
      })
      .select('id')
      .single();
    if (insErr || !created) throw new Error(`dialogues insert: ${insErr?.message ?? 'no row'}`);
    dialogueId = created.id as string;
  }

  let tokenCount = 0;

  for (const batch of chunk(rows, 40)) {
    const turnPayload = batch.map((r) => ({
      dialogue_id: dialogueId!,
      seq: r.seq,
      speaker: r.speaker,
      speaker_zh: r.speaker === 'A' ? '甲' : '乙',
      en: r.sentence,
      zh: r.zh,
      speech_act: r.beat,
      legacy_turn_id: r.id,
    }));

    const { data: insertedTurns, error: turnErr } = await supabase
      .from('dialogue_turns')
      .insert(turnPayload)
      .select('id, seq, legacy_turn_id, en');

    if (turnErr || !insertedTurns) {
      throw new Error(`dialogue_turns insert: ${turnErr?.message ?? 'no rows'}`);
    }

    const tokenRows: Array<{
      turn_id: string;
      idx: number;
      surface: string;
      word_id: string | null;
      token_role: string;
    }> = [];

    for (const turn of insertedTurns) {
      const row = batch.find((r) => r.seq === turn.seq);
      const sentence = (turn.en as string) ?? row?.sentence ?? '';
      const tokens = tokenizeSentence(sentence);
      let idx = 0;
      for (const tok of tokens) {
        if (tok.isWhitespace) continue;
        tokenRows.push({
          turn_id: turn.id as string,
          idx,
          surface: tok.surface,
          word_id: tok.wordId,
          token_role: tok.role,
        });
        idx += 1;
      }
    }

    for (const tokBatch of chunk(tokenRows, 200)) {
      const { error: tokErr } = await supabase.from('turn_tokens').insert(tokBatch);
      if (tokErr) throw new Error(`turn_tokens insert: ${tokErr.message}`);
      tokenCount += tokBatch.length;
    }
  }

  if (opts?.verbose) {
    console.log(`  DB ✓ ${slug}: ${rows.length} turns, ${tokenCount} tokens (${status})`);
  }

  return {
    sceneKey,
    slug,
    sceneId,
    dialogueId: dialogueId!,
    turns: rows.length,
    tokens: tokenCount,
    status,
  };
}

export async function syncAllScenesFromRecords(
  allRecords: SceneDialogueRecord[],
  opts?: { verbose?: boolean; sceneKeys?: string[] },
): Promise<SyncSceneResult[]> {
  const keys =
    opts?.sceneKeys ??
    [...new Set(allRecords.map((r) => r.scene))].sort((a, b) => {
      const ra = getSceneStory(a)?.freqRank ?? 999;
      const rb = getSceneStory(b)?.freqRank ?? 999;
      return ra - rb;
    });

  const results: SyncSceneResult[] = [];
  for (const sceneKey of keys) {
    const sceneRows = allRecords.filter((r) => r.scene === sceneKey);
    if (!sceneRows.length) continue;
    results.push(await syncSceneDialoguesToDb(sceneKey, sceneRows, opts));
  }
  return results;
}

/** Ensure all 50 scene rows exist (no dialogue turns). */
export async function upsertAllSceneCatalog(): Promise<number> {
  const supabase = createSupabaseAdmin();
  let n = 0;
  for (const script of SCENE_STORY_SCRIPTS) {
    await upsertSceneRow(supabase, script.sceneKey);
    n += 1;
  }
  return n;
}
