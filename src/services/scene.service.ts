import { supabase } from '../lib/supabase';
import type { SceneRow, DialogueTurnRow } from '../types/vocab';
import { tokenizeSentence } from '../lib/wordTokens';
import type {
  DialogueTurn,
  SceneAggregateStats,
  SceneCatalogItem,
  SceneMetadata,
  StoryBeat,
  StoryNarrative,
} from '../types/scene';
import {
  COVERAGE_CLAIM,
  DIALOGUE_MARKETING_LABEL,
  DIALOGUE_TARGET_COUNT,
  SCENE_TARGET_COUNT,
  WORD_COUNT,
} from '../data/marketing';
import { slugifySceneKey } from '../lib/sceneSlug';

const DEFAULT_GRADIENT = 'linear-gradient(135deg,#f8fafc,#e2e8f0)';

function meta(row: SceneRow): SceneMetadata {
  return (row.metadata ?? {}) as SceneMetadata;
}

function mapDbTurnToDialogueTurn(t: DialogueTurnRow): DialogueTurn {
  const legacyId = t.legacy_turn_id ?? null;
  const speaker = (t.speaker === 'B' ? 'B' : 'A') as 'A' | 'B';
  return {
    id: legacyId ?? t.seq,
    seq: t.seq,
    speaker,
    speakerZh: t.speaker_zh ?? (speaker === 'A' ? '甲' : '乙'),
    en: t.en,
    zh: t.zh ?? undefined,
    audio: legacyId ? `/audio/sentences/${legacyId}.mp3` : undefined,
    storyBeat: (t.speech_act as StoryBeat) ?? '进行',
  };
}

function rowToCatalogItem(row: SceneRow, turnCount: number): SceneCatalogItem {
  const m = meta(row);
  return {
    slug: row.slug,
    sceneKey: m.sceneKey ?? row.slug,
    titleZh: row.title_zh,
    titleEn: m.titleEn ?? row.title_en,
    tier: row.tier,
    emoji: row.icon ?? '📍',
    freqRank: row.freq_rank,
    gradient: m.gradient ?? DEFAULT_GRADIENT,
    storyHook: m.storyHook ?? '',
    illustrationLabel: m.illustration?.label ?? row.title_zh,
    storyOutline: m.storyOutline ?? [],
    sentenceCount: turnCount,
    status: turnCount > 0 ? 'ready' : 'building',
  };
}

export const SceneService = {
  async fetchCatalog(): Promise<SceneCatalogItem[]> {
    const { data: scenes, error } = await supabase
      .from('scenes')
      .select('*')
      .eq('status', 'published')
      .order('freq_rank', { ascending: true });
    if (error) throw new Error(`scenes: ${error.message}`);
    if (!scenes?.length) return [];

    const { data: dialogues } = await supabase
      .from('dialogues')
      .select('scene_id, turn_count')
      .eq('status', 'published');

    const turnsByScene = new Map<string, number>();
    for (const d of dialogues ?? []) {
      turnsByScene.set(d.scene_id as string, (d.turn_count as number) ?? 0);
    }

    return (scenes as SceneRow[]).map((s) =>
      rowToCatalogItem(s, turnsByScene.get(s.id) ?? 0),
    );
  },

  async buildAggregateStats(catalog: SceneCatalogItem[]): Promise<SceneAggregateStats> {
    const dialogueReady = catalog.reduce((sum, s) => sum + s.sentenceCount, 0);
    const sceneReady = catalog.filter((s) => s.status === 'ready').length;

    return {
      wordCount: WORD_COUNT,
      sceneTarget: SCENE_TARGET_COUNT,
      sceneReady,
      dialogueTarget: DIALOGUE_TARGET_COUNT,
      dialogueReady,
      dialogueMarketingLabel: DIALOGUE_MARKETING_LABEL,
      coverageClaim: COVERAGE_CLAIM,
      topSceneCount: Math.min(10, catalog.length),
    };
  },

  async fetchAggregateStats(): Promise<SceneAggregateStats> {
    const catalog = await this.fetchCatalog();
    return this.buildAggregateStats(catalog);
  },

  async fetchNarrativeBySlug(slug: string): Promise<StoryNarrative | null> {
    const { data, error } = await supabase
      .from('scenes')
      .select('metadata')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();
    if (error) throw new Error(`scenes narrative: ${error.message}`);
    const narrative = (data?.metadata as SceneMetadata | null)?.narrative;
    return narrative ?? null;
  },

  async fetchNarrative(sceneKey: string): Promise<StoryNarrative | null> {
    return this.fetchNarrativeBySlug(slugifySceneKey(sceneKey));
  },

  async fetchScenes(tier?: string): Promise<SceneRow[]> {
    let query = supabase
      .from('scenes')
      .select('*')
      .eq('status', 'published')
      .order('freq_rank', { ascending: true });
    if (tier) query = query.eq('tier', tier);
    const { data, error } = await query;
    if (error) throw new Error(`scenes: ${error.message}`);
    return (data ?? []) as SceneRow[];
  },

  async fetchDialogueTurnsBySlug(slug: string): Promise<DialogueTurn[]> {
    const { data: scene, error: sceneErr } = await supabase
      .from('scenes')
      .select('id')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();
    if (sceneErr) throw new Error(`scenes: ${sceneErr.message}`);
    if (!scene) return [];

    const { data: dialogues } = await supabase
      .from('dialogues')
      .select('id')
      .eq('scene_id', scene.id)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(1);
    const dialogueId = dialogues?.[0]?.id as string | undefined;
    if (!dialogueId) return [];

    const { data: turns, error } = await supabase
      .from('dialogue_turns')
      .select('id, dialogue_id, seq, speaker, speaker_zh, en, zh, speech_act, audio_url, legacy_turn_id')
      .eq('dialogue_id', dialogueId)
      .order('seq', { ascending: true });
    if (error) throw new Error(`dialogue_turns: ${error.message}`);
    if (!turns?.length) return [];

    return (turns as DialogueTurnRow[]).map(mapDbTurnToDialogueTurn);
  },

  async fetchDialoguesByScene(slug: string) {
    const { data: scene } = await supabase
      .from('scenes')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();
    if (!scene) return [];

    const { data, error } = await supabase
      .from('dialogues')
      .select('*')
      .eq('scene_id', scene.id)
      .eq('status', 'published');
    if (error) throw new Error(`dialogues: ${error.message}`);
    return data ?? [];
  },

  async fetchDialogueWithTurns(dialogueId: string): Promise<{
    turns: DialogueTurnRow[];
  } | null> {
    const { data: turns, error } = await supabase
      .from('dialogue_turns')
      .select('*')
      .eq('dialogue_id', dialogueId)
      .order('seq', { ascending: true });
    if (error) throw new Error(`dialogue_turns: ${error.message}`);
    if (!turns) return null;

    const enriched: DialogueTurnRow[] = [];
    for (const turn of turns) {
      const { data: tokens } = await supabase
        .from('turn_tokens')
        .select('*')
        .eq('turn_id', turn.id)
        .order('idx', { ascending: true });

      enriched.push({
        ...(turn as DialogueTurnRow),
        tokens:
          tokens?.length
            ? tokens.map((t) => ({
                surface: t.surface as string,
                bare: (t.surface as string).toLowerCase(),
                wordId: (t.word_id as string | null) ?? null,
                role: ((t.token_role as string) || 'misc') as import('../types/vocab').TokenRole,
                isWhitespace: false,
              }))
            : tokenizeSentence(turn.en as string),
      });
    }
    return { turns: enriched };
  },
};
