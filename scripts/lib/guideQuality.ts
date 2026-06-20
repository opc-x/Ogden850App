/** 单词详情例句质量门禁 — 检测模板病句与中英错位 */
import { wordsData } from '../../src/data/wordsList';
import { buildInflectionMap, OP_FORMS, bareToken } from '../../src/data/ogdenGrammar';
import { validateOgdenSentence } from './ogdenValidate';
import { validateZhLine } from './dialogueQuality';

const LEMMA_IDS = new Set(wordsData.map((w) => w.id));
const INFLECTION_MAP = buildInflectionMap(LEMMA_IDS);

function sentenceContainsTarget(wordId: string, en: string): boolean {
  const bare = wordId.toLowerCase();
  const enLower = en.toLowerCase();
  if (bare !== 'i' && (enLower.includes(bare) || enLower.includes(`${bare}'`) || enLower.includes(`${bare}s`))) {
    return true;
  }
  for (const surface of en.split(/\s+/)) {
    const t = bareToken(surface);
    if (!t) continue;
    if (t === bare) return true;
    if (INFLECTION_MAP.get(t) === bare) return true;
    if (OP_FORMS.has(t) && bare === 'be' && ['is', 'are', 'am', 'was', 'were', 'been', 'being'].includes(t)) {
      return true;
    }
  }
  return false;
}

export interface GuideSentence {
  en: string;
  cn?: string;
  parts?: unknown;
}

export interface WordGuide {
  hook?: string;
  concept?: string;
  equation?: string;
  combine?: string;
  ogdenTip?: string;
  sentences?: GuideSentence[];
}

export interface GuideQualityIssue {
  kind: 'template' | 'count' | 'ogden' | 'zh' | 'missing_target' | 'duplicate';
  message: string;
  sentenceIndex?: number;
}

const TEMPLATE_PATTERNS: Array<{ re: RegExp; label: string }> = [
  { re: /^I have [a-z]+\.$/i, label: '模板句 I have N.' },
  { re: /^Give [a-z]+ to /i, label: '模板句 Give N to…' },
  { re: /^This [a-z]+ is important\.$/i, label: '模板句 This N is important.' },
  { re: /^I take [a-z]+\.$/i, label: '模板句 I take N.' },
  { re: /^Make [a-z]+\.$/i, label: '模板句 Make N.' },
];

export function auditGuideSentence(
  wordId: string,
  sentence: GuideSentence,
  index: number,
): GuideQualityIssue[] {
  const issues: GuideQualityIssue[] = [];
  const en = sentence.en?.trim() ?? '';
  const cn = sentence.cn?.trim() ?? '';
  const bare = wordId.toLowerCase();

  for (const { re, label } of TEMPLATE_PATTERNS) {
    if (re.test(en)) {
      issues.push({ kind: 'template', message: label, sentenceIndex: index });
      break;
    }
  }

  const ogden = validateOgdenSentence(en);
  if (!ogden.ok) {
    issues.push({
      kind: 'ogden',
      message: `非 Ogden 词: ${ogden.unknown.join(', ')}`,
      sentenceIndex: index,
    });
  }

  const zhIssue = cn ? validateZhLine(cn) : { kind: 'zh' as const, message: '缺少中文' };
  if (zhIssue) {
    issues.push({ kind: 'zh', message: zhIssue.message, sentenceIndex: index });
  }

  if (!sentenceContainsTarget(wordId, en)) {
    issues.push({
      kind: 'missing_target',
      message: `例句未包含目标词 ${wordId}`,
      sentenceIndex: index,
    });
  }

  return issues;
}

export function auditWordGuide(wordId: string, guide: WordGuide): GuideQualityIssue[] {
  const issues: GuideQualityIssue[] = [];
  const sentences = guide.sentences ?? [];

  if (sentences.length !== 3) {
    issues.push({
      kind: 'count',
      message: `例句数量应为 3，当前 ${sentences.length}`,
    });
  }

  const enSet = new Set<string>();
  sentences.forEach((s, i) => {
    const sentIssues = auditGuideSentence(wordId, s, i);
    issues.push(...sentIssues);
    const key = s.en?.trim().toLowerCase();
    if (key) {
      if (enSet.has(key)) {
        issues.push({ kind: 'duplicate', message: '重复例句', sentenceIndex: i });
      }
      enSet.add(key);
    }
  });

  return issues;
}

export function guideNeedsRepair(issues: GuideQualityIssue[]): boolean {
  return issues.length > 0;
}
