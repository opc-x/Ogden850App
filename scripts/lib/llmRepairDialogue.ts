/**
 * LLM 修复对话 — 发现问题后必须用模型修，禁止程序改写字幕
 */
import OpenAI from 'openai';
import type { ChatCompletionCreateParamsNonStreaming } from 'openai/resources/chat/completions';
import { getStoryNarrative } from '../../src/data/storyNarrative';
import { scenePromptFor } from './sceneGenConfig';
import { buildPilotScene } from './scenePilot';
import { normalizeDialogueLine } from './dialoguePrompt';
import {
  auditDialogueLines,
  validateDialogueBatch,
  type AuditedLine,
  type QualityIssue,
} from './dialogueQuality';
import {
  DEEPSEEK_API_BASE,
  DEEPSEEK_DIALOGUE_MODEL,
  resolveDeepSeekApiKey,
} from './deepseekDialogue';
import { pickProvider, polishZhLines, type DialogueProvider } from './llmDialogue';
import type { SceneDialogueRecord } from '../../src/types/sceneDialogue';
import type { StoryBeat } from './sceneGenConfig';

type TurnInput = { seq: number; speaker: string; en: string; zh: string; beat?: string };

function deepSeekRequest(
  params: Omit<ChatCompletionCreateParamsNonStreaming, 'model'>,
): ChatCompletionCreateParamsNonStreaming & { thinking?: { type: 'disabled' | 'enabled' } } {
  return {
    model: DEEPSEEK_DIALOGUE_MODEL,
    thinking: { type: 'disabled' },
    ...params,
  };
}

/** 结构/条数/故事级问题 → LLM 整场景重生 */
export async function regenerateSceneWithLlm(opts: {
  sceneKey: string;
  target: number;
  provider: DialogueProvider;
  startId: number;
  onProgress?: (n: number) => void;
}): Promise<{ records: SceneDialogueRecord[]; issues: string[] }> {
  const built = await buildPilotScene({
    sceneKey: opts.sceneKey,
    target: opts.target,
    provider: opts.provider,
    startId: opts.startId,
    onProgress: opts.onProgress,
  });
  return { records: built.records, issues: built.report.qualityIssues };
}

/** 仅 zh/对齐/连贯性问题 → LLM 逐批修复，保留英文骨架 */
export async function repairLinesWithLlm(opts: {
  sceneKey: string;
  lines: TurnInput[];
  flagged: AuditedLine[];
  provider?: DialogueProvider;
}): Promise<TurnInput[]> {
  const apiKey = resolveDeepSeekApiKey();
  if (!apiKey) throw new Error('repairLinesWithLlm 需要 DEEPSEEK_API_KEY');

  const prompt = scenePromptFor(opts.sceneKey);
  const narrative = getStoryNarrative(opts.sceneKey);
  const bySeq = new Map(opts.lines.map((l) => [l.seq, { ...l }]));
  const batches = chunk(opts.flagged, 6);

  const client = new OpenAI({ apiKey, baseURL: DEEPSEEK_API_BASE });

  for (const batch of batches) {
    const payload = batch.map((row) => ({
      seq: row.seq,
      speaker: row.speaker,
      en: row.en,
      zh: row.zh,
      beat: row.beat,
      problems: row.issues.map((i) => i.message),
    }));

    const context = opts.lines
      .filter((l) => l.seq >= (batch[0]?.seq ?? 1) - 3 && l.seq <= (batch[batch.length - 1]?.seq ?? 1) + 3)
      .map((l) => `${l.seq} ${l.speaker}: ${l.en} / ${l.zh}`)
      .join('\n');

    const response = await client.chat.completions.create(
      deepSeekRequest({
        messages: [
          {
            role: 'system',
            content:
              'You fix Ogden850 scene dialogue lines. English must use Ogden Basic English 850 words only (plus inflections and basic grammar words). Rewrite en when vocabCoverage or Ogden-invalid. Fix Chinese to natural spoken Mandarin. Return JSON only.',
          },
          {
            role: 'user',
            content: `Scene: ${opts.sceneKey} / ${prompt.titleZh}
Story: ${prompt.storyHook}
六要素: ${JSON.stringify(narrative)}

Nearby context:
${context}

Fix ONLY these lines. Rewrite en when Ogden-invalid OR when problems mention 收尾语/goodbye/see you/good night — remove farewell words but keep the story moving:
${JSON.stringify(payload)}

Return {"lines":[{"seq":1,"speaker":"A","en":"...","zh":"...","beat":"进行"}]}`,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.45,
      }) as ChatCompletionCreateParamsNonStreaming,
    );

    const parsed = JSON.parse(response.choices[0]?.message?.content ?? '{"lines":[]}') as {
      lines?: Array<{ seq: number; speaker: string; en: string; zh: string; beat?: string }>;
    };

    for (const raw of parsed.lines ?? []) {
      const beat = (['开场', '进行', '收束'].includes(raw.beat ?? '')
        ? raw.beat
        : bySeq.get(raw.seq)?.beat ?? '进行') as StoryBeat;
      const norm = normalizeDialogueLine(
        { speaker: raw.speaker as 'A' | 'B', en: raw.en, zh: raw.zh, beat },
        beat,
      );
      if (!norm || !bySeq.has(raw.seq)) continue;
      bySeq.set(raw.seq, {
        seq: raw.seq,
        speaker: norm.speaker,
        en: norm.en,
        zh: norm.zh,
        beat: norm.beat,
      });
    }
  }

  return [...bySeq.values()].sort((a, b) => a.seq - b.seq);
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export function needsFullRegeneration(issues: QualityIssue[]): boolean {
  return issues.some(
    (i) =>
      i.kind === 'structure' ||
      i.kind === 'closingPhrase' ||
      i.kind === 'story' ||
      i.message.includes('过短') ||
      i.message.includes('过长') ||
      i.message.includes('故事重启') ||
      i.message.includes('无对话') ||
      i.message.includes('收尾语'),
  );
}

export async function repairSceneWithLlm(opts: {
  sceneKey: string;
  lines: TurnInput[];
  issues: QualityIssue[];
  target: number;
  provider: DialogueProvider;
  startId: number;
  verbose?: boolean;
}): Promise<{ records: SceneDialogueRecord[]; mode: 'regen' | 'patch'; issues: string[] }> {
  const engine = pickProvider(opts.provider);
  if (!engine) throw new Error('需要 DEEPSEEK_API_KEY 或 GEMINI_API_KEY');

  if (needsFullRegeneration(opts.issues) || opts.lines.length < 20) {
    if (opts.verbose) console.log(`  → 整场景 LLM 重生 (${opts.sceneKey})`);
    const { records, issues } = await regenerateSceneWithLlm({
      sceneKey: opts.sceneKey,
      target: opts.target,
      provider: opts.provider,
      startId: opts.startId,
    });
    return { records, mode: 'regen', issues };
  }

  if (opts.verbose) console.log(`  → LLM 逐句修复 (${opts.sceneKey})`);
  const audited = auditDialogueLines(opts.sceneKey, opts.lines);
  const flagged = audited.filter((l) => l.issues.length > 0);
  let fixed = await repairLinesWithLlm({
    sceneKey: opts.sceneKey,
    lines: opts.lines,
    flagged,
    provider: opts.provider,
  });
  const polished = await polishZhLines(
    fixed.map((l) => ({
      speaker: l.speaker as 'A' | 'B',
      en: l.en,
      zh: l.zh,
      beat: (l.beat ?? '进行') as StoryBeat,
    })),
    opts.provider,
  );
  fixed = polished.map((l, i) => ({
    seq: fixed[i]?.seq ?? i + 1,
    speaker: l.speaker,
    en: l.en,
    zh: l.zh,
    beat: l.beat,
  }));

  const remaining = validateDialogueBatch(
    opts.sceneKey,
    fixed.map((l) => ({ en: l.en, zh: l.zh, speaker: l.speaker, beat: l.beat })),
  );
  if (remaining.length > 0) {
    if (opts.verbose) console.log(`  → 补丁后仍有问题，改整场景重生`);
    const { records, issues } = await regenerateSceneWithLlm({
      sceneKey: opts.sceneKey,
      target: opts.target,
      provider: opts.provider,
      startId: opts.startId,
    });
    return { records, mode: 'regen', issues };
  }

  let id = opts.startId;
  const records: SceneDialogueRecord[] = fixed.map((l) => ({
    id: id++,
    scene: opts.sceneKey,
    seq: l.seq,
    speaker: l.speaker as 'A' | 'B',
    sentence: l.en,
    zh: l.zh,
    beat: (l.beat ?? '进行') as StoryBeat,
    source: 'generated' as const,
  }));
  return { records, mode: 'patch', issues: [] };
}
