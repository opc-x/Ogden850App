/**
 * 全库内容合法性审计 — scenes · dialogues · turns · 故事匹配 · 中文 · 条数
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { getSceneStory, SCENE_STORY_SCRIPTS, slugifySceneKey } from '../../src/data/sceneStoryScripts';
import { getStoryNarrative } from '../../src/data/storyNarrative';
import {
  auditDialogueLines,
  validateDialogueBatch,
  type AuditedLine,
  type QualityIssue,
} from './dialogueQuality';
import { validateOgdenSentence } from './ogdenValidate';
import type { SceneMetadata } from '../../src/types/scene';

export interface SceneRowAudit {
  sceneKey: string;
  slug: string;
  sceneId: string;
  titleZh: string;
  tier: string;
  freqRank: number;
  turnCount: number;
  ok: boolean;
  sceneIssues: QualityIssue[];
  dialogueIssues: QualityIssue[];
  lineIssues: AuditedLine[];
  flaggedLineCount: number;
}

export interface FullDbAuditReport {
  completedAt: string;
  source: 'supabase';
  sceneCount: number;
  scenesWithTurns: number;
  scenesOk: number;
  scenesFail: number;
  totalTurns: number;
  flaggedLines: number;
  issuesByKind: Record<string, number>;
  scenes: SceneRowAudit[];
}

const NARRATIVE_KEYS = ['when', 'where', 'who', 'how', 'method', 'event'] as const;
const COUNT_RULES: Record<string, { min: number; max: number }> = {
  P0: { min: 28, max: 56 },
  P1: { min: 20, max: 72 },
  P2: { min: 16, max: 96 },
};

function issue(kind: QualityIssue['kind'], message: string): QualityIssue {
  return { kind, message };
}

export function validateSceneMetadata(
  sceneKey: string,
  slug: string,
  tier: string,
  freqRank: number,
  metadata: SceneMetadata | null,
): QualityIssue[] {
  const issues: QualityIssue[] = [];
  const script = getSceneStory(sceneKey);
  const expectedSlug = slugifySceneKey(sceneKey);

  if (!script) {
    issues.push(issue('story', `未知 sceneKey: ${sceneKey}`));
    return issues;
  }
  if (slug !== expectedSlug) {
    issues.push(issue('story', `slug 不匹配: ${slug} ≠ ${expectedSlug}`));
  }
  if (tier !== script.tier) {
    issues.push(issue('story', `tier 与目录不一致: DB=${tier} 目录=${script.tier}`));
  }
  if (freqRank !== script.freqRank) {
    issues.push(issue('story', `freq_rank 与目录不一致: DB=${freqRank} 目录=${script.freqRank}`));
  }
  if (!metadata?.storyHook?.trim()) {
    issues.push(issue('story', 'metadata.storyHook 缺失'));
  }
  if (!metadata?.storyOutline?.length) {
    issues.push(issue('story', 'metadata.storyOutline 缺失'));
  }
  const narrative = metadata?.narrative ?? getStoryNarrative(sceneKey);
  for (const k of NARRATIVE_KEYS) {
    const v = narrative[k as keyof typeof narrative];
    if (!v || String(v).trim().length < 2) {
      issues.push(issue('story', `六要素缺失: ${k}`));
    }
  }
  return issues;
}

export function validateTurnCount(tier: string, count: number): QualityIssue[] {
  const rule = COUNT_RULES[tier] ?? COUNT_RULES.P2;
  const issues: QualityIssue[] = [];
  if (count === 0) {
    issues.push(issue('structure', '场景无对话'));
  } else if (count < rule.min) {
    issues.push(issue('structure', `对话过短（${count} 句），${tier} 建议 ≥${rule.min}`));
  } else if (count > rule.max) {
    issues.push(issue('structure', `对话过长（${count} 句），${tier} 建议 ≤${rule.max}`));
  }
  return issues;
}

export function auditTurnRows(
  sceneKey: string,
  turns: Array<{ seq: number; speaker: string; en: string; zh: string; beat?: string }>,
): {
  sceneIssues: QualityIssue[];
  dialogueIssues: QualityIssue[];
  lineIssues: AuditedLine[];
} {
  const sceneIssues: QualityIssue[] = [];
  const sorted = [...turns].sort((a, b) => a.seq - b.seq);

  for (let i = 0; i < sorted.length; i++) {
    const t = sorted[i]!;
    if (t.seq !== i + 1) {
      sceneIssues.push(issue('structure', `seq 不连续: 期望 ${i + 1} 实际 ${t.seq}`));
      break;
    }
    if (t.speaker !== 'A' && t.speaker !== 'B') {
      sceneIssues.push(issue('en', `第 ${t.seq} 句 speaker 非法: ${t.speaker}`));
    }
    if (!['开场', '进行', '收束'].includes(t.beat ?? '')) {
      sceneIssues.push(issue('structure', `第 ${t.seq} 句 beat 非法: ${t.beat}`));
    }
    const og = validateOgdenSentence(t.en);
    if (!og.ok) {
      sceneIssues.push(issue('en', `第 ${t.seq} 句非 Ogden: ${og.unknown.join(', ')}`));
    }
    if (!t.zh?.trim()) {
      sceneIssues.push(issue('zh', `第 ${t.seq} 句中文缺失`));
    }
  }

  const batchIssues = validateDialogueBatch(
    sceneKey,
    sorted.map((t) => ({ en: t.en, zh: t.zh ?? '', speaker: t.speaker, beat: t.beat })),
  );
  const lineIssues = auditDialogueLines(sceneKey, sorted);
  const flagged = lineIssues.filter((l) => l.issues.length > 0);

  return {
    sceneIssues,
    dialogueIssues: batchIssues,
    lineIssues: flagged,
  };
}

export async function runFullDbAudit(supabase: SupabaseClient): Promise<FullDbAuditReport> {
  const { data: scenes, error: sceneErr } = await supabase
    .from('scenes')
    .select('id, slug, title_zh, tier, freq_rank, metadata, status')
    .order('freq_rank', { ascending: true });
  if (sceneErr) throw new Error(`scenes: ${sceneErr.message}`);

  const catalogKeys = new Set(SCENE_STORY_SCRIPTS.map((s) => s.sceneKey));
  const sceneAudits: SceneRowAudit[] = [];
  const issuesByKind: Record<string, number> = {};

  const bump = (issues: QualityIssue[]) => {
    for (const i of issues) {
      issuesByKind[i.kind] = (issuesByKind[i.kind] ?? 0) + 1;
    }
  };

  for (const row of scenes ?? []) {
    const metadata = (row.metadata ?? {}) as SceneMetadata;
    const sceneKey = metadata.sceneKey ?? row.slug;
    const script = getSceneStory(sceneKey);
    const titleZh = script?.titleZh ?? (row.title_zh as string);
    const tier = (row.tier as string) ?? script?.tier ?? 'P2';
    const freqRank = (row.freq_rank as number) ?? script?.freqRank ?? 999;

    const sceneIssues = validateSceneMetadata(
      sceneKey,
      row.slug as string,
      tier,
      freqRank,
      metadata,
    );
    if (!catalogKeys.has(sceneKey)) {
      sceneIssues.push(issue('story', `不在 50 场景目录中: ${sceneKey}`));
    }

    const { data: dialogues } = await supabase
      .from('dialogues')
      .select('id')
      .eq('scene_id', row.id)
      .order('created_at', { ascending: false })
      .limit(1);
    const dialogueId = dialogues?.[0]?.id as string | undefined;

    let turns: Array<{ seq: number; speaker: string; en: string; zh: string; beat?: string }> = [];
    if (dialogueId) {
      const { data: turnRows, error: turnErr } = await supabase
        .from('dialogue_turns')
        .select('seq, speaker, en, zh, speech_act')
        .eq('dialogue_id', dialogueId)
        .order('seq', { ascending: true });
      if (turnErr) throw new Error(`dialogue_turns: ${turnErr.message}`);
      turns = (turnRows ?? []).map((t) => ({
        seq: t.seq as number,
        speaker: t.speaker as string,
        en: t.en as string,
        zh: (t.zh as string) ?? '',
        beat: (t.speech_act as string) ?? '进行',
      }));
    }

    sceneIssues.push(...validateTurnCount(tier, turns.length));
    const { sceneIssues: turnMetaIssues, dialogueIssues, lineIssues } = auditTurnRows(sceneKey, turns);
    sceneIssues.push(...turnMetaIssues);

    const allIssues = [...sceneIssues, ...dialogueIssues, ...lineIssues.flatMap((l) => l.issues)];
    bump(allIssues);

    sceneAudits.push({
      sceneKey,
      slug: row.slug as string,
      sceneId: row.id as string,
      titleZh,
      tier,
      freqRank,
      turnCount: turns.length,
      ok: allIssues.length === 0,
      sceneIssues,
      dialogueIssues,
      lineIssues,
      flaggedLineCount: lineIssues.length,
    });
  }

  const scenesOk = sceneAudits.filter((s) => s.ok).length;
  const flaggedLines = sceneAudits.reduce((n, s) => n + s.flaggedLineCount, 0);

  return {
    completedAt: new Date().toISOString(),
    source: 'supabase',
    sceneCount: sceneAudits.length,
    scenesWithTurns: sceneAudits.filter((s) => s.turnCount > 0).length,
    scenesOk,
    scenesFail: sceneAudits.length - scenesOk,
    totalTurns: sceneAudits.reduce((n, s) => n + s.turnCount, 0),
    flaggedLines,
    issuesByKind,
    scenes: sceneAudits,
  };
}
