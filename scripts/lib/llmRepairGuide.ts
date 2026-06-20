/**
 * LLM 修复单词详情例句 — 必须用模型，禁止程序造句
 */
import OpenAI from 'openai';
import type { ChatCompletionCreateParamsNonStreaming } from 'openai/resources/chat/completions';
import type { Word } from '../../src/types/word';
import {
  auditGuideSentence,
  auditWordGuide,
  type GuideQualityIssue,
  type WordGuide,
} from './guideQuality';
import { buildGuideRepairPrompt, normalizeGuidePartsFromEn, type GuideSentenceDraft } from './guidePrompt';
import { validateZhLine } from './dialogueQuality';
import {
  DEEPSEEK_API_BASE,
  DEEPSEEK_DIALOGUE_MODEL,
  resolveDeepSeekApiKey,
} from './deepseekDialogue';

function deepSeekRequest(
  params: Omit<ChatCompletionCreateParamsNonStreaming, 'model'>,
): ChatCompletionCreateParamsNonStreaming & { thinking?: { type: 'disabled' | 'enabled' } } {
  return {
    model: DEEPSEEK_DIALOGUE_MODEL,
    thinking: { type: 'disabled' },
    ...params,
  };
}

interface LlmGuideWord {
  id: string;
  hook?: string;
  sentences: GuideSentenceDraft[];
}

function collectValidationErrors(wordId: string, draft: LlmGuideWord): string[] {
  const errors: string[] = [];
  if (!draft.sentences || draft.sentences.length !== 3) {
    errors.push(`sentences 数量 ${draft.sentences?.length ?? 0}`);
    return errors;
  }
  const guide: WordGuide = {
    sentences: draft.sentences.map((s) => ({ en: s.en, cn: s.cn })),
  };
  for (const issue of auditWordGuide(wordId, guide)) {
    if (issue.kind === 'template' || issue.kind === 'count' || issue.kind === 'duplicate' || issue.kind === 'missing_target') {
      errors.push(issue.message);
    }
  }
  for (const [i, s] of draft.sentences.entries()) {
    const zh = validateZhLine(s.cn);
    if (zh) errors.push(`句${i + 1} 中文: ${zh.message}`);
    const sentIssues = auditGuideSentence(wordId, s, i).filter((x) => x.kind === 'template');
    if (sentIssues.length) errors.push(`句${i + 1} 仍是模板句`);
  }
  return errors;
}

async function callLlm(
  client: OpenAI,
  prompt: string,
): Promise<LlmGuideWord[]> {
  const response = await client.chat.completions.create(
    deepSeekRequest({
      messages: [
        {
          role: 'system',
          content:
            'You write natural English teaching examples for basic vocabulary learners. JSON only. Natural Mandarin Chinese. Avoid mechanical template sentences.',
        },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.45,
    }) as ChatCompletionCreateParamsNonStreaming,
  );
  const raw = response.choices[0]?.message?.content ?? '{"words":[]}';
  const parsed = JSON.parse(raw) as { words?: LlmGuideWord[] };
  return parsed.words ?? [];
}

export async function repairGuidesBatchWithLlm(opts: {
  items: Array<{
    word: Word;
    guide: WordGuide;
    issues: GuideQualityIssue[];
  }>;
}): Promise<Record<string, WordGuide>> {
  const apiKey = resolveDeepSeekApiKey();
  if (!apiKey) throw new Error('repairGuidesBatchWithLlm 需要 DEEPSEEK_API_KEY');

  const client = new OpenAI({ apiKey, baseURL: DEEPSEEK_API_BASE });
  let words: LlmGuideWord[] = [];

  for (let attempt = 0; attempt < 5; attempt++) {
    const prompt = buildGuideRepairPrompt({
      words: opts.items.map((item) => ({
        word: item.word,
        hook: item.guide.hook,
        issues: item.issues.filter((i) => i.kind === 'template').map((i) => i.message),
        current: item.guide.sentences,
      })),
    });
    words = await callLlm(client, prompt);

    const errors: string[] = [];
    for (const item of opts.items) {
      const id = item.word.id.toLowerCase();
      const draft = words.find((w) => w.id.toLowerCase() === id);
      if (!draft) {
        errors.push(`LLM 未返回 ${id}`);
        continue;
      }
      const ve = collectValidationErrors(id, draft);
      if (ve.length) {
        errors.push(`${id}: ${ve.join('; ')}`);
      }
    }
    if (!errors.length) break;
    if (attempt === 4) throw new Error(errors.join(' | '));
  }

  const out: Record<string, WordGuide> = {};
  for (const item of opts.items) {
    const id = item.word.id.toLowerCase();
    const draft = words.find((w) => w.id.toLowerCase() === id);
    if (!draft) throw new Error(`LLM 未返回 ${id}`);
    out[id] = {
      ...item.guide,
      hook: draft.hook?.trim() || item.guide.hook,
      sentences: draft.sentences.map((s) => ({
        en: s.en.trim(),
        cn: s.cn.trim(),
        parts: normalizeGuidePartsFromEn(s.en),
      })),
    };
  }
  return out;
}
