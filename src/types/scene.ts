export type SceneTier = 'P0' | 'P1' | 'P2';
export type StoryBeat = '开场' | '进行' | '收束';

export interface StoryChapter {
  beat: StoryBeat;
  title: string;
  goal: string;
}

export interface SceneIllustrationMeta {
  label: string;
  motifs: string[];
  accent: string;
}

export interface StoryNarrative {
  when: string;
  where: string;
  who: string;
  how: string;
  method: string;
  event: string;
}

export interface SceneCharacter {
  name: string;
  emoji: string;
}

export interface SceneCharacters {
  A: SceneCharacter;
  B: SceneCharacter;
}

export interface SceneMetadata {
  sceneKey: string;
  titleEn?: string;
  gradient?: string;
  storyHook?: string;
  storyOutline?: StoryChapter[];
  illustration?: SceneIllustrationMeta;
  narrative?: StoryNarrative;
  characters?: SceneCharacters;
}

export interface SceneCatalogItem {
  slug: string;
  sceneKey: string;
  titleZh: string;
  titleEn: string;
  tier: SceneTier;
  emoji: string;
  freqRank: number;
  gradient: string;
  storyHook: string;
  illustrationLabel: string;
  storyOutline: StoryChapter[];
  sentenceCount: number;
  status: 'ready' | 'building';
}

export interface DialogueTurn {
  id: number;
  seq: number;
  speaker: 'A' | 'B';
  speakerZh: string;
  speakerEmoji: string;
  en: string;
  zh?: string;
  audio?: string;
  storyBeat: StoryBeat;
}

export interface SceneAggregateStats {
  wordCount: number;
  sceneTarget: number;
  sceneReady: number;
  dialogueTarget: number;
  dialogueReady: number;
  dialogueMarketingLabel: string;
  coverageClaim: number;
  topSceneCount: number;
}
