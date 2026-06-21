import { GoogleGenAI, Type } from '@google/genai';
import { buildDialoguePrompt, buildFullScenePrompt, normalizeDialogueLineLoose, normalizeDialogueLine, isNearDuplicate, type DialogueLine } from './dialoguePrompt';
import { validateZhLine } from './dialogueQuality';
import {
  generateBatchWithDeepSeek,
  polishZhWithDeepSeek,
  resolveDeepSeekApiKey,
} from './deepseekDialogue';
import type { StoryBeat } from './sceneGenConfig';

export const GEMINI_DIALOGUE_MODEL = 'gemini-2.5-flash';
export const GEMINI_DIALOGUE_FALLBACK = 'gemini-3.5-flash';

export type GeminiDialogueLine = DialogueLine;

export function resolveGeminiApiKey(): string | null {
  return process.env.GEMINI_API_KEY?.trim() || process.env.VITE_GEMINI_API_KEY?.trim() || null;
}

export function resolveDialogueLlm(): 'gemini' | 'deepseek' | null {
  if (resolveGeminiApiKey()) return 'gemini';
  if (resolveDeepSeekApiKey()) return 'deepseek';
  return null;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function callGemini(
  ai: GoogleGenAI,
  model: string,
  prompt: string,
): Promise<GeminiDialogueLine[]> {
  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      temperature: 0.55,
      systemInstruction: `You write short play-like dialogues in standard, natural American English for Chinese learners. Use Ogden Basic English as the core vocabulary, but keep the dialogue human and scene-real. Every scene must feel like a real story with time, place, people, method, and a clear event — never dry word drills. Chinese must sound spoken and natural.`,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          lines: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                speaker: { type: Type.STRING },
                en: { type: Type.STRING },
                zh: { type: Type.STRING },
                beat: { type: Type.STRING },
              },
              required: ['speaker', 'en', 'zh', 'beat'],
            },
          },
        },
        required: ['lines'],
      },
    },
  });

  const parsed = JSON.parse(response.text || '{"lines":[]}') as { lines: GeminiDialogueLine[] };
  return parsed.lines ?? [];
}

/** 仅润色中文译文，保持英文不变 */
export async function polishZhLines(
  lines: GeminiDialogueLine[],
): Promise<GeminiDialogueLine[]> {
  if (lines.length === 0) return lines;

  const apiKey = resolveGeminiApiKey();
  if (apiKey) {
    const ai = new GoogleGenAI({ apiKey });
    const payload = lines.map((l, i) => ({ i, en: l.en, zh: l.zh }));
    try {
      const response = await ai.models.generateContent({
        model: GEMINI_DIALOGUE_MODEL,
        contents: `Polish zh to natural spoken Simplified Chinese. Keep en unchanged. Fix fragments like 一衣→外套. JSON array {i, zh}.\n${JSON.stringify(payload)}`,
        config: {
          temperature: 0.3,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              rows: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: { i: { type: Type.INTEGER }, zh: { type: Type.STRING } },
                  required: ['i', 'zh'],
                },
              },
            },
            required: ['rows'],
          },
        },
      });
      const parsed = JSON.parse(response.text || '{}') as { rows: Array<{ i: number; zh: string }> };
      const map = new Map(parsed.rows?.map((r) => [r.i, r.zh.trim()]) ?? []);
      return lines.map((l, i) => {
        const zh = map.get(i) ?? l.zh;
        return validateZhLine(zh) ? l : { ...l, zh };
      });
    } catch {
      /* fall through to DeepSeek */
    }
  }

  return polishZhWithDeepSeek(lines);
}

/** 单次请求生成整场景，保最强连贯性 */
export async function generateFullSceneWithGemini(opts: {
  sceneKey: string;
  titleZh: string;
  titleEn: string;
  storyHook: string;
  storyOutline: Array<{ beat: StoryBeat; title: string; goal: string }>;
  target: number;
  seedLines?: Array<{ speaker: string; en: string }>;
  startBeat?: StoryBeat;
  styleReference?: string;
}): Promise<GeminiDialogueLine[]> {
  const apiKey = resolveGeminiApiKey();
  if (!apiKey) return [];

  const ai = new GoogleGenAI({ apiKey });
  const prompt = buildFullScenePrompt(opts);
  const startBeat = opts.startBeat ?? '开场';
  const models = [GEMINI_DIALOGUE_MODEL, GEMINI_DIALOGUE_FALLBACK];

  for (const model of models) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const raw = await callGemini(ai, model, prompt);
        const existingEn = new Set<string>((opts.seedLines ?? []).map((l) => l.en.toLowerCase()));
        const out: GeminiDialogueLine[] = [];
        let lastBeat: StoryBeat = startBeat;
        for (const line of raw) {
          const norm = normalizeDialogueLineLoose(line, lastBeat);
          if (!norm) continue;
          lastBeat = norm.beat;
          const key = norm.en.toLowerCase();
          if (existingEn.has(key) || isNearDuplicate(norm.en, existingEn)) continue;
          existingEn.add(key);
          out.push(norm);
        }
        if (out.length > 0) return out;
      } catch (err: unknown) {
        const msg = String(err instanceof Error ? err.message : err);
        if (msg.includes('429') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED')) {
          return [];
        }
        await sleep(1500 * (attempt + 1));
      }
    }
  }
  return [];
}

type BatchOpts = {
  sceneKey: string;
  titleZh: string;
  titleEn: string;
  storyHook: string;
  storyOutline: Array<{ beat: StoryBeat; title: string; goal: string }>;
  beat: StoryBeat;
  chapterTitle?: string;
  chapterGoal?: string;
  count: number;
  priorLines: Array<{ speaker: string; en: string }>;
  existingEn: Set<string>;
};

function collectLines(raw: GeminiDialogueLine[], beat: StoryBeat, existingEn: Set<string>, count: number) {
  const out: GeminiDialogueLine[] = [];
  for (const line of raw) {
    const norm = normalizeDialogueLine(line, beat);
    if (!norm) continue;
    const key = norm.en.toLowerCase();
    if (existingEn.has(key) || isNearDuplicate(norm.en, existingEn)) continue;
    existingEn.add(key);
    out.push(norm);
    if (out.length >= count) break;
  }
  return out;
}

export async function generateBatchWithGemini(opts: BatchOpts): Promise<GeminiDialogueLine[]> {
  const apiKey = resolveGeminiApiKey();
  if (!apiKey) return [];

  const ai = new GoogleGenAI({ apiKey });
  const prompt = buildDialoguePrompt(opts);
  const models = [GEMINI_DIALOGUE_MODEL, GEMINI_DIALOGUE_FALLBACK];
  let quotaExhausted = false;

  for (const model of models) {
    for (let attempt = 0; attempt < 4; attempt++) {
      try {
        const raw = await callGemini(ai, model, prompt);
        const out = collectLines(raw, opts.beat, opts.existingEn, opts.count);
        if (out.length > 0) return out;
      } catch (err: unknown) {
        const msg = String(err instanceof Error ? err.message : err);
        const wait = 2000 * (attempt + 1);
        if (msg.includes('429') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED')) {
          quotaExhausted = true;
          break;
        }
        if (msg.includes('503') || msg.includes('UNAVAILABLE')) {
          await sleep(wait);
          continue;
        }
        if (attempt === 3) break;
        await sleep(wait);
      }
    }
    if (quotaExhausted) break;
  }

  if (resolveDeepSeekApiKey()) {
    if (quotaExhausted) {
      console.warn('  Gemini quota hit — falling back to DeepSeek');
    }
    try {
      return await generateBatchWithDeepSeek(opts);
    } catch (err) {
      console.warn('  DeepSeek batch failed:', err instanceof Error ? err.message : err);
    }
  }

  return [];
}
