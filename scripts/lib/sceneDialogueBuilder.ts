/**
 * 场景对话组装 — 整篇一次性 LLM 生成，禁止分幕拼接
 */
import type { StoryBeat } from './sceneGenConfig';
import { scenePromptFor } from './sceneGenConfig';
import { curatedSeedLines } from './curatedSceneDialogues';
import { validateDialogueBatch, validateDuplicateClosingPhrases } from './dialogueQuality';
import { generateSceneOneShot, polishZhLines, type DialogueProvider } from './llmDialogue';
import type { GeneratedLine } from './proceduralDialogue';

const BEATS: StoryBeat[] = ['开场', '进行', '收束'];
const MAX_ONE_SHOT_ATTEMPTS = 8;
const MIN_LINES = 28;

function countBeats(lines: GeneratedLine[]): Record<StoryBeat, number> {
  const c: Record<StoryBeat, number> = { 开场: 0, 进行: 0, 收束: 0 };
  for (const l of lines) c[l.beat] = (c[l.beat] ?? 0) + 1;
  return c;
}

function toGeneratedLines(
  polished: Array<{ speaker: string; en: string; zh: string; beat: string }>,
): GeneratedLine[] {
  return polished.map((l) => ({
    speaker: l.speaker,
    en: l.en,
    zh: l.zh,
    beat: (['开场', '进行', '收束'].includes(l.beat) ? l.beat : '进行') as StoryBeat,
  }));
}

/** 整场景一次性 LLM 生成 — 不达标整篇重试，禁止分幕拼接或 rebalance */
async function generateFullScene(opts: {
  sceneKey: string;
  target: number;
  provider: DialogueProvider;
  onProgress?: (n: number) => void;
}): Promise<{ lines: GeneratedLine[]; llmGenerated: number; qualityIssues: string[] }> {
  const prompt = scenePromptFor(opts.sceneKey);
  let lastLines: GeneratedLine[] = [];
  let lastIssues: string[] = [];
  let bestLines: GeneratedLine[] = [];
  let bestIssues: string[] = [];
  let bestIssueCount = Infinity;

  const curated = curatedSeedLines(opts.sceneKey);
  const seedLines = curated.map((l) => ({ speaker: l.speaker, en: l.en }));
  const seedBlock =
    curated.length > 0
      ? `\nREFERENCE STORY (Ogden-compliant curated seed — rewrite as ONE ${opts.target}-line play with the SAME plot, do NOT copy verbatim, expand naturally):\n${curated.map((l, i) => `${i + 1}. ${l.speaker}: ${l.en}`).join('\n')}`
      : undefined;

  for (let attempt = 0; attempt < MAX_ONE_SHOT_ATTEMPTS; attempt++) {
    const raw = await generateSceneOneShot({
      provider: opts.provider,
      sceneKey: opts.sceneKey,
      titleZh: prompt.titleZh,
      titleEn: prompt.titleEn,
      storyHook: prompt.storyHook,
      storyOutline: prompt.storyOutline,
      target: opts.target,
      existingEn: new Set<string>(),
      seedLines: undefined,
      styleReference: seedBlock,
      onProgress: opts.onProgress,
    });
    const polished = await polishZhLines(raw, opts.provider);
    const lines = toGeneratedLines(polished).slice(0, opts.target);

    const issues = validateDialogueBatch(
      opts.sceneKey,
      lines.map((l) => ({ en: l.en, zh: l.zh, speaker: l.speaker, beat: l.beat })),
    );
    const closingIssues = validateDuplicateClosingPhrases(lines.map((l) => ({ en: l.en })));
    const allIssues = [...issues, ...closingIssues];
    lastLines = lines;
    lastIssues = allIssues.map((i) => i.message);

    const score = allIssues.length + (lines.length < MIN_LINES ? 100 : 0);
    const bestScore = bestIssueCount + (bestLines.length < MIN_LINES ? 100 : 0);
    if (
      score < bestScore ||
      (score === bestScore && lines.length > bestLines.length)
    ) {
      bestIssueCount = allIssues.length;
      bestLines = lines;
      bestIssues = lastIssues;
    }

    if (allIssues.length === 0 && lines.length >= MIN_LINES) {
      return { lines, llmGenerated: lines.length, qualityIssues: [] };
    }
  }

  const finalLines = bestLines.length > 0 ? bestLines : lastLines;
  return {
    lines: finalLines,
    llmGenerated: finalLines.length,
    qualityIssues: bestLines.length > 0 ? bestIssues : lastIssues,
  };
}

export async function buildSceneDialogues(opts: {
  sceneKey: string;
  target: number;
  provider: DialogueProvider;
  onProgress?: (n: number) => void;
}): Promise<{ lines: GeneratedLine[]; curated: number; llmGenerated: number; qualityIssues: string[] }> {
  const { lines, llmGenerated, qualityIssues } = await generateFullScene({
    sceneKey: opts.sceneKey,
    target: opts.target,
    provider: opts.provider,
    onProgress: opts.onProgress,
  });
  return { lines, curated: 0, llmGenerated, qualityIssues };
}

export { countBeats, BEATS };
