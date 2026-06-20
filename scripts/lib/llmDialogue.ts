/**
 * LLM 对话生成统一入口 — Gemini / DeepSeek 可切换
 */
import {
  generateBatchWithGemini,
  generateFullSceneWithGemini,
  polishZhLines as polishGemini,
  type GeminiDialogueLine,
} from './geminiDialogue';
import {
  generateBatchWithDeepSeek,
  generateFullSceneWithDeepSeek,
  resolveDeepSeekApiKey,
} from './deepseekDialogue';
import { resolveGeminiApiKey } from './geminiDialogue';
import type { StoryBeat } from './sceneGenConfig';

export type DialogueProvider = 'auto' | 'gemini' | 'deepseek';

export type DialogueLine = GeminiDialogueLine;

export function resolveDialogueProvider(argv = process.argv): DialogueProvider {
  const flag = argv.find((a, i) => argv[i - 1] === '--provider');
  if (flag === 'deepseek' || flag === 'gemini') return flag;
  if (process.env.DIALOGUE_PROVIDER === 'deepseek') return 'deepseek';
  if (process.env.DIALOGUE_PROVIDER === 'gemini') return 'gemini';
  return 'auto';
}

export function pickProvider(preferred: DialogueProvider): 'gemini' | 'deepseek' | null {
  if (preferred === 'deepseek') {
    return resolveDeepSeekApiKey() ? 'deepseek' : null;
  }
  if (preferred === 'gemini') {
    return resolveGeminiApiKey() ? 'gemini' : null;
  }
  if (resolveGeminiApiKey()) return 'gemini';
  if (resolveDeepSeekApiKey()) return 'deepseek';
  return null;
}

type SceneOpts = {
  sceneKey: string;
  titleZh: string;
  titleEn: string;
  storyHook: string;
  storyOutline: Array<{ beat: StoryBeat; title: string; goal: string }>;
  target: number;
  existingEn: Set<string>;
  seedLines?: Array<{ speaker: string; en: string }>;
  styleReference?: string;
  onProgress?: (n: number) => void;
};

/** 整场景一次性生成入口 — 单次 LLM 请求写完整故事，不达标由上层整篇重试 */
export async function generateSceneOneShot(opts: SceneOpts & { provider: DialogueProvider }): Promise<DialogueLine[]> {
  const engine = pickProvider(opts.provider);
  if (!engine) return [];

  const base = {
    sceneKey: opts.sceneKey,
    titleZh: opts.titleZh,
    titleEn: opts.titleEn,
    storyHook: opts.storyHook,
    storyOutline: opts.storyOutline,
  };

  let out =
    engine === 'gemini'
      ? await generateFullSceneWithGemini({ ...base, target: opts.target, seedLines: opts.seedLines ?? [], startBeat: '开场', styleReference: opts.styleReference })
      : await generateFullSceneWithDeepSeek({ ...base, target: opts.target, seedLines: opts.seedLines ?? [], startBeat: '开场', styleReference: opts.styleReference });
  if (out.length === 0 && resolveDeepSeekApiKey()) {
    out = await generateFullSceneWithDeepSeek({ ...base, target: opts.target, seedLines: opts.seedLines ?? [], startBeat: '开场', styleReference: opts.styleReference });
  }
  opts.onProgress?.(out.length);

  return out.slice(0, opts.target);
}

/** 仅在「进行」段扩展，用于精修种子已讲完三幕时的中间加句 */
export async function generateMiddleExtension(
  opts: SceneOpts & { provider: DialogueProvider; count: number },
): Promise<DialogueLine[]> {
  const engine = pickProvider(opts.provider);
  if (!engine || opts.count <= 0) return [];

  const chapters =
    opts.storyOutline.filter((c) => c.beat === '进行').length > 0
      ? opts.storyOutline.filter((c) => c.beat === '进行')
      : [{ beat: '进行' as StoryBeat, title: '发展', goal: opts.storyHook }];

  const all: DialogueLine[] = [];
  const prior = [...opts.priorLines];
  const batchSize = 14;
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  for (const chapter of chapters) {
    let chapterCount = 0;
    const perChapter = Math.max(4, Math.ceil(opts.count / chapters.length));
    while (chapterCount < perChapter && all.length < opts.count) {
      const need = Math.min(batchSize, perChapter - chapterCount, opts.count - all.length);
      let batch: DialogueLine[] = [];
      if (engine === 'gemini') {
        batch = await generateBatchWithGemini({
          sceneKey: opts.sceneKey,
          titleZh: opts.titleZh,
          titleEn: opts.titleEn,
          storyHook: opts.storyHook,
          storyOutline: opts.storyOutline,
          beat: '进行',
          chapterTitle: chapter.title,
          chapterGoal: chapter.goal,
          count: need,
          priorLines: prior,
          existingEn: opts.existingEn,
        });
      } else {
        batch = await generateBatchWithDeepSeek({
          sceneKey: opts.sceneKey,
          titleZh: opts.titleZh,
          titleEn: opts.titleEn,
          storyHook: opts.storyHook,
          storyOutline: opts.storyOutline,
          beat: '进行',
          chapterTitle: chapter.title,
          chapterGoal: chapter.goal,
          count: need,
          priorLines: prior,
          existingEn: opts.existingEn,
        });
      }
      if (batch.length === 0) break;
      for (const line of batch) {
        const beat: StoryBeat = line.beat === '开场' || line.beat === '收束' ? '进行' : '进行';
        all.push({ ...line, beat });
        prior.push({ speaker: line.speaker, en: line.en });
        chapterCount++;
      }
      opts.onProgress?.(all.length);
      await sleep(600);
    }
  }

  const last = chapters[chapters.length - 1]!;
  while (all.length < opts.count) {
    const need = Math.min(batchSize, opts.count - all.length);
    let batch: DialogueLine[] = [];
    if (engine === 'gemini') {
      batch = await generateBatchWithGemini({
        sceneKey: opts.sceneKey,
        titleZh: opts.titleZh,
        titleEn: opts.titleEn,
        storyHook: opts.storyHook,
        storyOutline: opts.storyOutline,
        beat: '进行',
        chapterTitle: last.title,
        chapterGoal: last.goal,
        count: need,
        priorLines: prior,
        existingEn: opts.existingEn,
      });
    } else {
      batch = await generateBatchWithDeepSeek({
        sceneKey: opts.sceneKey,
        titleZh: opts.titleZh,
        titleEn: opts.titleEn,
        storyHook: opts.storyHook,
        storyOutline: opts.storyOutline,
        beat: '进行',
        chapterTitle: last.title,
        chapterGoal: last.goal,
        count: need,
        priorLines: prior,
        existingEn: opts.existingEn,
      });
    }
    if (batch.length === 0) break;
    for (const line of batch) {
      all.push({ ...line, beat: '进行' as StoryBeat });
      prior.push({ speaker: line.speaker, en: line.en });
    }
    opts.onProgress?.(all.length);
    await sleep(600);
  }

  return all.slice(0, opts.count);
}

export async function polishZhLines(
  lines: DialogueLine[],
  provider: DialogueProvider,
): Promise<DialogueLine[]> {
  return polishGemini(lines);
}

export { generateBatchWithGemini, generateBatchWithDeepSeek };
