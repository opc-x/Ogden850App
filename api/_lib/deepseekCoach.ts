import OpenAI from 'openai';
import type { ChatCompletionCreateParamsNonStreaming } from 'openai/resources/chat/completions';

export const DEEPSEEK_COACH_MODEL = 'deepseek-v4-flash';
export const DEEPSEEK_API_BASE = 'https://api.deepseek.com';

export function resolveDeepSeekApiKey(): string | null {
  return (
    process.env.DEEPSEEK_API_KEY?.trim() ||
    process.env.VITE_DEEPSEEK_API_KEY?.trim() ||
    null
  );
}

export interface CoachEvalInput {
  sceneTitleZh: string;
  sceneTitleEn: string;
  storyHook?: string;
  userRole: 'A' | 'B';
  expectedLine: { en: string; zh?: string; storyBeat: string };
  userAttempt: string;
  priorContext: Array<{ speaker: 'A' | 'B'; en: string }>;
  referenceSnippet: Array<{ speaker: 'A' | 'B'; en: string }>;
}

export interface CoachEvalResult {
  score: number;
  passed: boolean;
  encouragement: string;
  correction: string | null;
  analysis: string;
  tip: string;
  mood: 'great' | 'good' | 'retry';
}

function deepSeekRequest(
  params: Omit<ChatCompletionCreateParamsNonStreaming, 'model'>,
): ChatCompletionCreateParamsNonStreaming & { thinking?: { type: 'disabled' | 'enabled' } } {
  return {
    model: DEEPSEEK_COACH_MODEL,
    thinking: { type: 'disabled' },
    ...params,
  };
}

export async function evaluateSceneAttempt(input: CoachEvalInput): Promise<CoachEvalResult> {
  const apiKey = resolveDeepSeekApiKey();
  if (!apiKey) {
    throw new Error('DEEPSEEK_API_KEY not configured');
  }

  const client = new OpenAI({ apiKey, baseURL: DEEPSEEK_API_BASE });

  const contextLines = input.priorContext
    .map((t) => `${t.speaker}: ${t.en}`)
    .join('\n');
  const refLines = input.referenceSnippet
    .map((t) => `${t.speaker}: ${t.en}`)
    .join('\n');

  const system = `你是 Ogden850「造词纺」场景的暖心英语陪练裁判。
规则：
1. 陪练范围严格限定在用户选定的场景对话内，禁止扩展到其他话题或自由闲聊。
2. 用户扮演角色 ${input.userRole}，对照参考台词评判其英文尝试（接受同义改写，但须符合 Ogden 基础英语、意思准确）。
3. 语气温暖、鼓励、有情绪价值；先肯定再轻量纠正，避免打击信心。
4. 只输出合法 JSON，字段：score(0-100整数)、passed(≥70为true)、encouragement(中文暖心鼓励)、correction(更佳英文或null)、analysis(中文简短点评)、tip(中文学习小贴士)、mood(great|good|retry)。`;

  const user = `场景：${input.sceneTitleZh} (${input.sceneTitleEn})
${input.storyHook ? `情境：${input.storyHook}\n` : ''}本段剧情参考（仅限此范围）：
${refLines}

已进行对话：
${contextLines || '（刚开始）'}

本轮参考台词（${input.expectedLine.storyBeat}）：
${input.expectedLine.en}
${input.expectedLine.zh ? `中文：${input.expectedLine.zh}` : ''}

用户尝试：
"${input.userAttempt}"`;

  const response = await client.chat.completions.create(
    deepSeekRequest({
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.45,
    }) as ChatCompletionCreateParamsNonStreaming,
  );

  const raw = response.choices[0]?.message?.content ?? '{}';
  const parsed = JSON.parse(raw) as Partial<CoachEvalResult>;

  const score = Math.min(100, Math.max(0, Number(parsed.score) || 0));
  const mood =
    parsed.mood === 'great' || parsed.mood === 'good' || parsed.mood === 'retry'
      ? parsed.mood
      : score >= 85
        ? 'great'
        : score >= 70
          ? 'good'
          : 'retry';

  return {
    score,
    passed: parsed.passed ?? score >= 70,
    encouragement: parsed.encouragement?.trim() || '很棒，继续加油！',
    correction: parsed.correction?.trim() || null,
    analysis: parsed.analysis?.trim() || '表达基本到位，可以再练几遍更流利。',
    tip: parsed.tip?.trim() || '对照参考台词，注意语序和关键词。',
    mood,
  };
}
