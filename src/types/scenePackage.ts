import type { SceneCharacters, SceneIllustrationMeta, SceneTier, StoryBeat, StoryChapter, StoryNarrative } from './scene';

/** 一场景一整包 — 故事脚本 + 对话，静态 JSON 唯一真相源 */
export interface SceneTurnPackage {
  seq: number;
  speaker: 'A' | 'B';
  en: string;
  zh: string;
  beat: StoryBeat;
  legacyId?: number;
}

export interface ScenePackage {
  slug: string;
  sceneKey: string;
  titleZh: string;
  titleEn: string;
  tier: SceneTier;
  freqRank: number;
  emoji: string;
  gradient: string;
  storyHook: string;
  storyOutline: StoryChapter[];
  illustration: SceneIllustrationMeta;
  narrative: StoryNarrative;
  /** 看图讲故事 — 场景详情页展示用，1–2 句秒懂开场 */
  storyBlurb?: string;
  /** 完整故事母本 — 供 LLM 扩写 turns，开发模式可折叠查看 */
  storyScript?: string;
  /** 角色身份 — A/B 各自的简称，用于对话气泡头像 */
  characters?: SceneCharacters;
  /** 目标句数（默认 110） */
  targetTurns: number;
  turns: SceneTurnPackage[];
}
