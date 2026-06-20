/** 对话数据质量门禁 — 故事对齐 + 中文人话 + 英中语义 + 连贯性 + 850词覆盖 */

import { bareToken, roleOfBare } from '../../src/data/ogdenGrammar';
import { validateOgdenSentence, expandContractions } from './ogdenValidate';

const BAD_ZH_PATTERNS = [
  /一衣/,
  /一裤/,
  /一物/,
  /的的+/,
  /[a-zA-Z]/,
];

/** 中文引入的概念须在英文中有落点 */
const ZH_CONCEPT_REQUIRES_EN: Array<{ zh: RegExp; enWords: RegExp; label: string }> = [
  { zh: /采购/, enWords: /\b(store|shop|buy|get|take|money|bag|food)\b/i, label: '「采购」' },
  { zh: /顺利/, enWords: /\b(good|well|right|fine|easy)\b/i, label: '「顺利」' },
  { zh: /便宜|太贵|贵了/, enWords: /\b(price|high|low|money|enough|cheap|expensive|cost|more)\b/i, label: '价格相关' },
  { zh: /医生|诊所|牙科/, enWords: /\b(doctor|health|pain|body|mouth|tooth|office)\b/i, label: '就医相关' },
  { zh: /公交|地铁/, enWords: /\b(bus|train|road|station|ticket)\b/i, label: '交通相关' },
];

const EN_TIME = /\b(morning|afternoon|evening|night|today|tomorrow)\b/i;
const ZH_TIME = /(早上|上午|中午|下午|傍晚|晚上|夜里|今早|今晚|明天)/;

export interface QualityIssue {
  kind: 'zh' | 'story' | 'en' | 'align' | 'continuity' | 'structure' | 'vocabCoverage' | 'closingPhrase' | 'duplicateLine';
  message: string;
}

/** 比对用：去首尾空白与标点，小写 */
function normalizeSentenceForDuplicate(en: string): string {
  return en
    .trim()
    .replace(/^[\s.,!?;:'"…\-]+|[\s.,!?;:'"…\-]+$/g, '')
    .toLowerCase();
}

/** 同一 scene 内不同 seq 的 sentence 逐字相同（忽略首尾标点/空格）→ 违规；长度 <10 的极短应答除外 */
export function validateExactDuplicateLines(
  lines: Array<{ seq?: number; en: string }>,
): QualityIssue[] {
  const issues: QualityIssue[] = [];
  const buckets = new Map<string, Array<{ seq: number; index: number; en: string }>>();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    const normalized = normalizeSentenceForDuplicate(line.en);
    if (normalized.length < 10) continue;

    const seq = line.seq ?? i + 1;
    const bucket = buckets.get(normalized) ?? [];
    bucket.push({ seq, index: i, en: line.en });
    buckets.set(normalized, bucket);
  }

  for (const hits of buckets.values()) {
    if (hits.length < 2) continue;
    const seqs = [...new Set(hits.map((h) => h.seq))];
    if (seqs.length < 2) continue;

    issues.push({
      kind: 'duplicateLine',
      message: `逐字重复台词（seq ${seqs.join(' / ')}）: ${hits[0]!.en.slice(0, 72)}`,
    });
  }

  return issues;
}

/** 收尾/告别类表达 — 全篇只能出现一次，且必须在最后 3 句内 */
const CLOSING_PHRASE_PATTERNS: Array<{ re: RegExp; label: string }> = [
  { re: /\bgoodbye\b/i, label: 'goodbye' },
  { re: /\bbye\b/i, label: 'bye' },
  { re: /\bsee you\b/i, label: 'see you' },
  { re: /\bgood night\b/i, label: 'good night' },
  { re: /\bsleep well\b/i, label: 'sleep well' },
  { re: /\brest well\b/i, label: 'rest well' },
  { re: /\btake care\b(?!\s+of\b)/i, label: 'take care' },
  { re: /\bthank you\b[^.!?]{0,40}\bgoodbye\b/i, label: 'thank you…goodbye' },
  { re: /\bthanks\b[^.!?]{0,40}\bgoodbye\b/i, label: 'thanks…goodbye' },
];

/** 「see you」作视觉感知（非告别）时不计为收尾语 */
function isPerceptionSeeYou(en: string): boolean {
  return /\b(?:I|we|they|he|she|it|you)\s+see you\b/i.test(en);
}

export function findClosingPhraseHits(en: string): string[] {
  const hits: string[] = [];
  for (const { re, label } of CLOSING_PHRASE_PATTERNS) {
    if (!re.test(en)) continue;
    if (label === 'see you' && isPerceptionSeeYou(en)) continue;
    hits.push(label);
  }
  return hits;
}

/** 扫描场景：告别语只能出现 1 次，且位置必须在全场最后 3 句内 */
export function validateDuplicateClosingPhrases(
  lines: Array<{ en: string }>,
): QualityIssue[] {
  const issues: QualityIssue[] = [];
  const hits: Array<{ index: number; labels: string[]; en: string }> = [];

  for (let i = 0; i < lines.length; i++) {
    const labels = findClosingPhraseHits(lines[i]!.en);
    if (labels.length > 0) hits.push({ index: i, labels, en: lines[i]!.en });
  }

  if (hits.length === 0) return issues;

  const lastAllowed = lines.length - 3;
  for (const hit of hits) {
    if (hit.index < lastAllowed) {
      issues.push({
        kind: 'closingPhrase',
        message: `第 ${hit.index + 1} 句出现收尾语（${hit.labels.join('/')}），但不在最后 3 句内：${hit.en.slice(0, 60)}`,
      });
    }
  }

  if (hits.length > 1) {
    issues.push({
      kind: 'closingPhrase',
      message: `收尾语重复 ${hits.length} 次（全篇只能告别一次）：${hits.map((h) => `#${h.index + 1}`).join(', ')}`,
    });
  }

  return issues;
}

/** 实词中非850词占比超过阈值则标记 — 语法闭集词（冠词/代词/be/介词/数词）不计入分母 */
export function validateVocabCoverage(en: string, maxOffRatio = 0.15): QualityIssue | null {
  const tokens = expandContractions(en).split(/\s+/).filter(Boolean);
  let contentCount = 0;
  const offenders: string[] = [];

  for (const surface of tokens) {
    const bare = bareToken(surface);
    if (!bare) continue;
    const role = roleOfBare(bare);
    if (role === 'op' || role === 'dir' || role === 'pron' || role === 'det') continue;
    if (/^\d[\d:./-]*$/.test(bare)) continue;

    contentCount++;
    if (!validateOgdenSentence(surface).ok) offenders.push(surface);
  }

  if (contentCount === 0) return null;
  const ratio = offenders.length / contentCount;
  if (ratio > maxOffRatio) {
    return {
      kind: 'vocabCoverage',
      message: `850词覆盖率不足：${offenders.length}/${contentCount} 实词超纲 (${Math.round(ratio * 100)}%) → ${offenders.join(', ')}`,
    };
  }
  return null;
}

export interface AuditedLine {
  seq: number;
  speaker: string;
  en: string;
  zh: string;
  beat?: string;
  issues: QualityIssue[];
}

export function validateZhLine(zh: string): QualityIssue | null {
  const t = zh.trim();
  if (t.length < 2) return { kind: 'zh', message: '译文过短' };
  if (t.length > 80) return { kind: 'zh', message: '译文过长' };
  for (const p of BAD_ZH_PATTERNS) {
    if (p.test(t)) return { kind: 'zh', message: `译文异常: ${t}` };
  }
  return null;
}

export function validateEnZhAlignment(en: string, zh: string): QualityIssue[] {
  const issues: QualityIssue[] = [];
  for (const rule of ZH_CONCEPT_REQUIRES_EN) {
    if (rule.zh.test(zh) && !rule.enWords.test(en)) {
      issues.push({
        kind: 'align',
        message: `中英错位：中文有${rule.label}，英文无对应 (${en.slice(0, 40)}…)`,
      });
    }
  }

  const enTimes = en.match(new RegExp(EN_TIME.source, 'gi')) ?? [];
  const zhTimes = zh.match(ZH_TIME) ?? [];
  if (enTimes.some((t) => /night/i.test(t)) && zhTimes.some((t) => /早上|上午|今早/.test(t)) && !/晚上|夜里|今晚|昨晚/.test(zh)) {
    issues.push({ kind: 'align', message: '时间错位：英文 night 与中文早上冲突' });
  }
  if (enTimes.some((t) => /morning/i.test(t)) && zhTimes.some((t) => /晚上|夜里|今晚/.test(t)) && !/早上|上午|今早/.test(zh)) {
    issues.push({ kind: 'align', message: '时间错位：英文 morning 与中文晚上冲突' });
  }

  return issues;
}

const HOME_EN = /\b(go to my house|go home|in my house|at my house|to my house)\b/i;
const HOME_ZH = /(到家|摆在桌上|回家(了|后)?)/;
const STORE_EN = /\b(at the store|in the store|the store)\b/i;

/** 上句已回家，下句店员仍在店里说话 → 连贯性断裂 */
export function validateContinuity(
  prev: { speaker: string; en: string; zh: string } | undefined,
  curr: { speaker: string; en: string; zh: string },
): QualityIssue[] {
  if (!prev) return [];
  const issues: QualityIssue[] = [];
  const prevAtHome =
    (HOME_EN.test(prev.en) && /\b(put|go|am|was|come back)\b/i.test(prev.en)) || HOME_ZH.test(prev.zh);
  const currAtStore = STORE_EN.test(curr.en) || /商店|超市|店里/.test(curr.zh);
  if (prevAtHome && curr.speaker === 'B' && currAtStore && prev.speaker === 'A') {
    issues.push({
      kind: 'continuity',
      message: '连贯断裂：顾客已到家，店员仍在说店里的事',
    });
  }
  return issues;
}

const OPENING_RESTART_EN =
  /\b(good morning|good afternoon|i (am|will go) to the (store|shop)|i have (a|my) list|at the store|in the store)\b/i;
const OPENING_RESTART_ZH = /(早上好|进店|进超市|购物清单|列清单)/;

/** 收束开始后不得再出现开场/进店类台词 */
export function validateBeatOrder(
  lines: Array<{ beat?: string; en: string; zh: string }>,
): QualityIssue[] {
  const issues: QualityIssue[] = [];
  const closingStart = lines.findIndex((l) => l.beat === '收束');
  if (closingStart < 0) return issues;

  for (let i = closingStart + 1; i < lines.length; i++) {
    const line = lines[i]!;
    if (line.beat === '开场') {
      issues.push({
        kind: 'structure',
        message: `第 ${i + 1} 句：收束后又出现「开场」分幕，故事顺序错乱`,
      });
    }
    if (OPENING_RESTART_EN.test(line.en) || OPENING_RESTART_ZH.test(line.zh)) {
      issues.push({
        kind: 'structure',
        message: `第 ${i + 1} 句：收束后重复开场（如进店/问候），故事重启`,
      });
    }
  }

  let sawClosing = false;
  for (let i = 0; i < lines.length; i++) {
    const beat = lines[i]?.beat;
    if (beat === '收束') sawClosing = true;
    if (sawClosing && beat === '开场') {
      issues.push({ kind: 'structure', message: `第 ${i + 1} 句：开场出现在收束之后` });
      break;
    }
  }
  return issues;
}

/** 三幕句数与总量是否足以讲完六要素故事 */
export function validateStoryStructure(
  lines: Array<{ beat?: string }>,
  minTotal = 28,
): QualityIssue[] {
  const issues: QualityIssue[] = [];
  const counts = { 开场: 0, 进行: 0, 收束: 0 };
  for (const l of lines) {
    if (l.beat === '开场' || l.beat === '进行' || l.beat === '收束') {
      counts[l.beat]++;
    }
  }
  if (lines.length < minTotal) {
    issues.push({
      kind: 'structure',
      message: `对话过短（${lines.length} 句），难以讲完完整场景故事（建议 ≥${minTotal}）`,
    });
  }
  if (counts.开场 < 4) {
    issues.push({ kind: 'structure', message: `开场过短（${counts.开场} 句），六要素铺垫不足` });
  }
  if (counts.进行 < 12) {
    issues.push({ kind: 'structure', message: `进行过短（${counts.进行} 句），故事主体展开不足` });
  }
  if (counts.收束 < 3) {
    issues.push({ kind: 'structure', message: `收束过短（${counts.收束} 句），结局交代不足` });
  }
  return issues;
}

/** LLM 生成后按位置重标三幕 — 仅改 beat 元数据，不改台词内容 */
export function rebalanceStoryBeats<T extends { beat?: string }>(
  lines: T[],
  minOpen = 4,
  minMid = 12,
  minClose = 3,
): T[] {
  const n = lines.length;
  if (n < minOpen + minMid + minClose) return lines;

  let openCount = minOpen;
  let closeCount = minClose;
  let midCount = n - openCount - closeCount;
  if (midCount < minMid) {
    midCount = minMid;
    const extra = openCount + midCount + closeCount - n;
    if (extra > 0) closeCount = Math.max(minClose, closeCount - extra);
  }

  return lines.map((line, i) => {
    let beat: string;
    if (i < openCount) beat = '开场';
    else if (i < openCount + midCount) beat = '进行';
    else beat = '收束';
    return { ...line, beat };
  });
}

function countTopicHits(text: string, words: string[]): number {
  const lower = text.toLowerCase();
  return words.filter((w) => lower.includes(w)).length;
}

export function validateStoryAlignment(
  sceneKey: string,
  lines: Array<{ en: string }>,
): QualityIssue | null {
  const rules = SCENE_TOPIC_WORDS[sceneKey];
  if (!rules || lines.length === 0) return null;

  const allEn = lines.map((l) => l.en).join(' ');
  const relateHits = countTopicHits(allEn, rules.mustRelate);
  const avoidHits = countTopicHits(allEn, rules.avoid);

  if (avoidHits >= 2) {
    return { kind: 'story', message: `故事偏离（禁用词 ${avoidHits} 次）` };
  }
  if (relateHits < Math.min(3, Math.ceil(lines.length * 0.12))) {
    return { kind: 'story', message: `未覆盖场景主题（命中 ${relateHits}）` };
  }
  return null;
}

export function auditDialogueLines(
  sceneKey: string,
  lines: Array<{ seq: number; speaker: string; en: string; zh: string; beat?: string }>,
): AuditedLine[] {
  const storyIssue = validateStoryAlignment(sceneKey, lines);
  const out: AuditedLine[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const issues: QualityIssue[] = [];
    const zhIssue = validateZhLine(line.zh);
    if (zhIssue) issues.push(zhIssue);
    const vocabIssue = validateVocabCoverage(line.en);
    if (vocabIssue) issues.push(vocabIssue);
    issues.push(...validateEnZhAlignment(line.en, line.zh));
    issues.push(...validateContinuity(i > 0 ? lines[i - 1] : undefined, line));
    out.push({ ...line, issues });
  }
  if (storyIssue) {
    out[0].issues.push(storyIssue);
  }
  return out;
}

export function validateDialogueBatch(
  sceneKey: string,
  lines: Array<{ en: string; zh: string; speaker?: string; beat?: string }>,
): QualityIssue[] {
  const audited = auditDialogueLines(
    sceneKey,
    lines.map((l, i) => ({
      seq: i + 1,
      speaker: l.speaker ?? (i % 2 === 0 ? 'A' : 'B'),
      en: l.en,
      zh: l.zh,
      beat: l.beat,
    })),
  );
  const issues: QualityIssue[] = [];
  const seen = new Set<string>();
  for (const row of audited) {
    for (const issue of row.issues) {
      const key = `${issue.kind}:${issue.message}`;
      if (!seen.has(key)) {
        seen.add(key);
        issues.push(issue);
      }
    }
  }
  for (const issue of validateBeatOrder(lines)) {
    const key = `${issue.kind}:${issue.message}`;
    if (!seen.has(key)) {
      seen.add(key);
      issues.push(issue);
    }
  }
  for (const issue of validateStoryStructure(lines)) {
    const key = `${issue.kind}:${issue.message}`;
    if (!seen.has(key)) {
      seen.add(key);
      issues.push(issue);
    }
  }
  for (const issue of validateDuplicateClosingPhrases(lines)) {
    const key = `${issue.kind}:${issue.message}`;
    if (!seen.has(key)) {
      seen.add(key);
      issues.push(issue);
    }
  }
  for (const issue of validateExactDuplicateLines(
    lines.map((l, i) => ({ seq: i + 1, en: l.en })),
  )) {
    const key = `${issue.kind}:${issue.message}`;
    if (!seen.has(key)) {
      seen.add(key);
      issues.push(issue);
    }
  }
  return issues;
}

/** 场景主题词（英文 Ogden 词）— 故事不得偏离 */
export const SCENE_TOPIC_WORDS: Record<string, { mustRelate: string[]; avoid: string[] }> = {
  Shopping: {
    mustRelate: ['food', 'store', 'money', 'price', 'bag', 'bread', 'milk', 'shelf'],
    avoid: ['coat', 'hat', 'dress', 'shoe', 'glove'],
  },
  Restaurant: {
    mustRelate: ['food', 'meal', 'table', 'water', 'money', 'price'],
    avoid: ['coat', 'train', 'school'],
  },
  'Going to the Store': {
    mustRelate: ['store', 'food', 'bread', 'bag', 'money'],
    avoid: ['coat', 'office'],
  },
  Health: {
    mustRelate: ['pain', 'body', 'head', 'bed', 'water'],
    avoid: ['coat', 'store'],
  },
};
