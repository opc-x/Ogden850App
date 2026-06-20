/** DeepSeek 对话生成 — OpenAI 兼容 API，Gemini 配额用尽时备用 */
import OpenAI from 'openai';
import type { ChatCompletionCreateParamsNonStreaming } from 'openai/resources/chat/completions';
import { validateZhLine } from './dialogueQuality';
import type { GeminiDialogueLine } from './geminiDialogue';
import { buildDialoguePrompt, buildFullScenePrompt, normalizeDialogueLine, normalizeDialogueLineLoose, isNearDuplicate } from './dialoguePrompt';
import type { StoryBeat } from './sceneGenConfig';

/** 官方推荐；deepseek-chat 将于 2026-07 退役 */
export const DEEPSEEK_DIALOGUE_MODEL = 'deepseek-v4-flash';
export const DEEPSEEK_API_BASE = 'https://api.deepseek.com';

type DeepSeekCompletionParams = ChatCompletionCreateParamsNonStreaming & {
  thinking?: { type: 'disabled' | 'enabled' };
};

function deepSeekRequest(
  params: Omit<DeepSeekCompletionParams, 'model'>,
): DeepSeekCompletionParams {
  return {
    model: DEEPSEEK_DIALOGUE_MODEL,
    thinking: { type: 'disabled' },
    ...params,
  };
}

export function resolveDeepSeekApiKey(): string | null {
  return (
    process.env.DEEPSEEK_API_KEY?.trim() ||
    process.env.VITE_DEEPSEEK_API_KEY?.trim() ||
    null
  );
}

function parseLines(content: string): GeminiDialogueLine[] {
  try {
    const parsed = JSON.parse(content) as { lines?: GeminiDialogueLine[] };
    return parsed.lines ?? [];
  } catch {
    return [];
  }
}

export async function callDeepSeek(prompt: string): Promise<GeminiDialogueLine[]> {
  const apiKey = resolveDeepSeekApiKey();
  if (!apiKey) throw new Error('DEEPSEEK_API_KEY not set');

  const client = new OpenAI({ apiKey, baseURL: DEEPSEEK_API_BASE });
  const response = await client.chat.completions.create(
    deepSeekRequest({
      messages: [
        {
          role: 'system',
          content:
            'You write short play-like Ogden English dialogues. Each scene has time, place, people, method, and a clear event. Chinese must be natural spoken Mandarin. CRITICAL: only ONE farewell (goodbye/bye/see you/good night) in the entire scene, placed in the last 3 lines only — never in the middle. Return valid JSON only.',
        },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.55,
      max_tokens: 8192,
    }) as ChatCompletionCreateParamsNonStreaming,
  );

  return parseLines(response.choices[0]?.message?.content ?? '{"lines":[]}');
}

export async function generateBatchWithDeepSeek(opts: {
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
}): Promise<GeminiDialogueLine[]> {
  const out: GeminiDialogueLine[] = [];
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  for (let attempt = 0; attempt < 6 && out.length < opts.count; attempt++) {
    const need = opts.count - out.length;
    const ask = Math.max(need, Math.min(10, need + 2 + attempt));
    const prompt = buildDialoguePrompt({ ...opts, count: ask });
    let raw: GeminiDialogueLine[] = [];
    try {
      raw = await callDeepSeek(prompt);
    } catch {
      await sleep(900 + attempt * 300);
      continue;
    }
    for (const line of raw) {
      const norm = normalizeDialogueLine(line, opts.beat);
      if (!norm) continue;
      const key = norm.en.toLowerCase();
      if (opts.existingEn.has(key) || isNearDuplicate(norm.en, opts.existingEn)) continue;
      opts.existingEn.add(key);
      out.push(norm);
      if (out.length >= opts.count) break;
    }
    if (out.length < opts.count) await sleep(700 + attempt * 250);
  }
  return out;
}

/** 单次请求生成整场景（DeepSeek），保最强连贯性 */
export async function generateFullSceneWithDeepSeek(opts: {
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
  if (!resolveDeepSeekApiKey()) return [];
  const prompt = buildFullScenePrompt(opts);
  const startBeat = opts.startBeat ?? '开场';
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  for (let attempt = 0; attempt < 3; attempt++) {
    let raw: GeminiDialogueLine[] = [];
    try {
      raw = await callDeepSeek(prompt);
    } catch {
      await sleep(1200 * (attempt + 1));
      continue;
    }
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
    await sleep(1200 * (attempt + 1));
  }
  return [];
}

export async function polishZhWithDeepSeek(
  lines: GeminiDialogueLine[],
): Promise<GeminiDialogueLine[]> {
  if (!resolveDeepSeekApiKey() || lines.length === 0) return lines;
  const payload = lines.map((l, i) => ({ i, en: l.en, zh: l.zh }));
  try {
    const client = new OpenAI({
      apiKey: resolveDeepSeekApiKey()!,
      baseURL: DEEPSEEK_API_BASE,
    });
    const response = await client.chat.completions.create(
      deepSeekRequest({
        messages: [
          {
            role: 'user',
            content: `Polish zh to natural spoken Simplified Chinese. Keep en unchanged. Fix fragments like 一衣→外套. Return JSON {"rows":[{"i":0,"zh":"..."}]}\n${JSON.stringify(payload)}`,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      }) as ChatCompletionCreateParamsNonStreaming,
    );
    const parsed = JSON.parse(response.choices[0]?.message?.content ?? '{}') as {
      rows?: Array<{ i: number; zh: string }>;
    };
    const map = new Map(parsed.rows?.map((r) => [r.i, r.zh.trim()]) ?? []);
    return lines.map((l, i) => {
      const zh = map.get(i) ?? l.zh;
      return validateZhLine(zh) ? l : { ...l, zh };
    });
  } catch {
    return lines;
  }
}
