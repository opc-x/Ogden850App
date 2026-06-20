/**
 * LLM 语义评审 — 第二道门禁：图标是否一眼能对上单词义 + 是否有动效。
 * 不通过则打回重生，禁止入库。
 */
import OpenAI from 'openai';
import { GoogleGenAI } from '@google/genai';
import {
  DEEPSEEK_API_BASE,
  DEEPSEEK_DIALOGUE_MODEL,
  resolveDeepSeekApiKey,
} from './deepseekDialogue';
import { resolveGeminiApiKey } from './geminiDialogue';
import type { WordSvgProvider } from './llmWordSvg';

export const MIN_SEMANTIC_SCORE = 8;

export interface SemanticReview {
  pass: boolean;
  score: number;
  issues: string[];
  animated: boolean;
}

function buildReviewPrompt(word: string, translation: string, category: string, svg: string): string {
  return `Strict QA for an English vocabulary flashcard icon.

Word: ${word}
Chinese: ${translation}
Category: ${category}

SVG code:
${svg.slice(0, 3500)}

Score 1-10: Would a Chinese beginner INSTANTLY recognize this drawing as "${word}" (${translation})?
Automatic FAIL (score <= 5):
- Generic circle / line / box that could mean dozens of other words
- Wrong object (depicts something else)
- Static dead icon with zero motion when motion would help (e.g. animals, liquids, vehicles)
- English/Chinese text baked into the graphic

PASS only if score >= ${MIN_SEMANTIC_SCORE} AND the icon is clearly the correct object/concept.

Return JSON:
{
  "score": number,
  "pass": boolean,
  "animated": boolean,
  "issues": ["..."]
}`;
}

function parseReview(raw: string): SemanticReview | null {
  try {
    const p = JSON.parse(raw) as SemanticReview;
    if (typeof p.score !== 'number') return null;
    return {
      score: p.score,
      pass: Boolean(p.pass) && p.score >= MIN_SEMANTIC_SCORE,
      animated: Boolean(p.animated),
      issues: Array.isArray(p.issues) ? p.issues.map(String) : [],
    };
  } catch {
    return null;
  }
}

async function reviewDeepSeek(prompt: string): Promise<string> {
  const apiKey = resolveDeepSeekApiKey();
  if (!apiKey) throw new Error('DEEPSEEK_API_KEY not set');
  const client = new OpenAI({ apiKey, baseURL: DEEPSEEK_API_BASE });
  const response = await client.chat.completions.create({
    model: DEEPSEEK_DIALOGUE_MODEL,
    thinking: { type: 'disabled' },
    messages: [
      {
        role: 'system',
        content: 'You are a harsh icon QA reviewer for language apps. Be strict. JSON only.',
      },
      { role: 'user', content: prompt },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.2,
  } as Parameters<typeof client.chat.completions.create>[0]);
  return response.choices[0]?.message?.content ?? '{}';
}

async function reviewGemini(prompt: string): Promise<string> {
  const apiKey = resolveGeminiApiKey();
  if (!apiKey) throw new Error('GEMINI_API_KEY not set');
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      temperature: 0.2,
      responseMimeType: 'application/json',
      systemInstruction: 'Strict vocabulary icon QA. JSON only.',
    },
  });
  return response.text ?? '{}';
}

export async function reviewWordSvgSemantics(opts: {
  word: string;
  translation: string;
  category: string;
  svg: string;
  provider: WordSvgProvider;
}): Promise<SemanticReview> {
  const engine =
    opts.provider === 'gemini'
      ? 'gemini'
      : opts.provider === 'deepseek'
        ? 'deepseek'
        : resolveDeepSeekApiKey()
          ? 'deepseek'
          : 'gemini';

  const prompt = buildReviewPrompt(opts.word, opts.translation, opts.category, opts.svg);
  const raw = engine === 'deepseek' ? await reviewDeepSeek(prompt) : await reviewGemini(prompt);
  const parsed = parseReview(raw);
  if (!parsed) {
    return { pass: false, score: 0, animated: false, issues: ['语义评审 JSON 解析失败'] };
  }
  if (!parsed.pass) {
    parsed.issues.unshift(`语义分 ${parsed.score}/${MIN_SEMANTIC_SCORE} 未达标`);
  }
  return parsed;
}
