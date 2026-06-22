import type {
  DialogueTurn,
  SceneAggregateStats,
  SceneCatalogItem,
  SceneCharacter,
  SceneCharacters,
  StoryNarrative,
} from '../types/scene';
import {
  COVERAGE_CLAIM,
  DIALOGUE_MARKETING_LABEL,
  DIALOGUE_TARGET_COUNT,
  SCENE_TARGET_COUNT,
  WORD_COUNT,
} from '../data/marketing';
import { SCENE_STORY_SCRIPTS, slugifySceneKey } from '../data/sceneStoryScripts';
import { getScenePackageBySlug } from '../data/scenes/loadScenes';
import { getStoryNarrative } from '../data/storyNarrative';
import {
  countTurnsBySceneKey,
  getDialogueRowsBySceneKey,
  getTotalDialogueCount,
  type SceneDialogueRow,
} from '../data/loadSceneDialogues';

function getSceneStoryBySlug(slug: string) {
  return SCENE_STORY_SCRIPTS.find((s) => slugifySceneKey(s.sceneKey) === slug);
}

function scriptToCatalogItem(script: (typeof SCENE_STORY_SCRIPTS)[number]): SceneCatalogItem {
  const turnCount = countTurnsBySceneKey(script.sceneKey);
  return {
    slug: slugifySceneKey(script.sceneKey),
    sceneKey: script.sceneKey,
    titleZh: script.titleZh,
    titleEn: script.titleEn,
    tier: script.tier,
    emoji: script.emoji,
    freqRank: script.freqRank,
    gradient: script.gradient,
    storyHook: script.storyHook,
    illustrationLabel: script.illustration.label,
    storyOutline: script.storyOutline,
    sentenceCount: turnCount,
    status: turnCount > 0 ? 'ready' : 'building',
  };
}

function normalizeCharacter(raw: string | SceneCharacter, speaker: 'A' | 'B'): SceneCharacter {
  if (typeof raw === 'string') {
    return { name: raw, emoji: speaker === 'A' ? '👤' : '👥' };
  }
  return raw;
}

function normalizeCharacters(raw?: Partial<Record<'A' | 'B', string | SceneCharacter>>): SceneCharacters | undefined {
  if (!raw?.A && !raw?.B) return undefined;
  return {
    A: normalizeCharacter(raw.A ?? '甲', 'A'),
    B: normalizeCharacter(raw.B ?? '乙', 'B'),
  };
}

function mapRow(row: SceneDialogueRow, characters?: SceneCharacters): DialogueTurn {
  const speaker = row.speaker;
  const character = characters?.[speaker] ?? normalizeCharacter(speaker === 'A' ? '甲' : '乙', speaker);
  return {
    id: row.id,
    seq: row.seq,
    speaker,
    speakerZh: character.name,
    speakerEmoji: character.emoji,
    en: row.sentence,
    zh: row.zh,
    audio: `/audio/sentences/${row.id}.mp3`,
    storyBeat: row.beat,
  };
}

export const SceneService = {
  async fetchCatalog(): Promise<SceneCatalogItem[]> {
    return [...SCENE_STORY_SCRIPTS]
      .sort((a, b) => a.freqRank - b.freqRank)
      .map(scriptToCatalogItem);
  },

  async buildAggregateStats(catalog: SceneCatalogItem[]): Promise<SceneAggregateStats> {
    const dialogueReady = getTotalDialogueCount();
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
    const script = getSceneStoryBySlug(slug);
    if (!script) return null;
    return getStoryNarrative(script.sceneKey);
  },

  async fetchStoryBlurbBySlug(slug: string): Promise<string | null> {
    const script = getSceneStoryBySlug(slug);
    if (!script) return null;
    const narrative = getStoryNarrative(script.sceneKey);
    return narrative.event?.trim() || script.storyHook;
  },

  async fetchStoryScriptBySlug(_slug: string): Promise<string | null> {
    return null;
  },

  async fetchNarrative(sceneKey: string): Promise<StoryNarrative | null> {
    return getStoryNarrative(sceneKey);
  },

  async fetchDialogueTurnsBySlug(slug: string): Promise<DialogueTurn[]> {
    const script = getSceneStoryBySlug(slug);
    if (!script) return [];
    const pkg = getScenePackageBySlug(slug);
    const characters = normalizeCharacters(pkg?.characters);
    return getDialogueRowsBySceneKey(script.sceneKey).map((row) => mapRow(row, characters));
  },

  async fetchDialogueTurnsBySceneKey(sceneKey: string): Promise<DialogueTurn[]> {
    const slug = slugifySceneKey(sceneKey);
    const pkg = getScenePackageBySlug(slug);
    const characters = normalizeCharacters(pkg?.characters);
    return getDialogueRowsBySceneKey(sceneKey).map((row) => mapRow(row, characters));
  },

  async fetchCharactersBySlug(slug: string): Promise<SceneCharacters | null> {
    const pkg = getScenePackageBySlug(slug);
    return normalizeCharacters(pkg?.characters) ?? null;
  },
};
