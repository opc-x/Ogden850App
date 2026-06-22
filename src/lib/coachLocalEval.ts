import type { CoachEvalResult, CoachEvaluatePayload } from '../types/coach';

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(text: string): string[] {
  return normalize(text).split(' ').filter(Boolean);
}

function wordSet(text: string): Set<string> {
  return new Set(tokenize(text));
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 1;
  let inter = 0;
  for (const w of a) {
    if (b.has(w)) inter++;
  }
  const union = new Set([...a, ...b]).size;
  return union === 0 ? 0 : inter / union;
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  const row = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= n; j++) {
      const tmp = row[j];
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + cost);
      prev = tmp;
    }
  }
  return row[n];
}

function similarityRatio(a: string, b: string): number {
  const na = normalize(a);
  const nb = normalize(b);
  if (!na || !nb) return 0;
  if (na === nb) return 1;
  const maxLen = Math.max(na.length, nb.length);
  return 1 - levenshtein(na, nb) / maxLen;
}

function contentWordCoverage(attempt: string, expected: string): number {
  const exp = tokenize(expected).filter((w) => w.length > 2);
  if (exp.length === 0) return tokenize(attempt).length > 0 ? 1 : 0;
  const att = wordSet(attempt);
  const hit = exp.filter((w) => att.has(w)).length;
  return hit / exp.length;
}

function pick<T>(items: T[], seed: number): T {
  return items[Math.abs(seed) % items.length];
}

const ENCOURAGE_GREAT = [
  '太棒了！这句和参考台词非常接近，语感很自然。',
  '说得真好！你已经能把这句在情境里流利说出来了。',
  '出色！发音和用词都很到位，继续保持这份自信。',
];

const ENCOURAGE_GOOD = [
  '不错！意思传达到了，再练几遍会更顺口。',
  '很好，核心意思对了，离流利只差一点点。',
  '进步明显！这句你已经基本掌握了。',
];

const ENCOURAGE_RETRY = [
  '别灰心，对照参考台词再试一次，你已经迈出很重要的一步。',
  '没关系，口语就是多练几遍，注意关键词的顺序。',
  '差一点就对了，听一遍标准发音再跟读试试。',
];

const TIPS = [
  '先听陪练朗读，抓住句首两三个关键词再说。',
  '不必一字不差，同义词可以，但核心意思要对。',
  '放慢语速，把每个词说清楚比说得快更重要。',
  '对照中文提示，先在脑子里想英文再开口。',
];

const ANALYSIS_PASS = [
  '与参考台词语义匹配良好，用词在 Ogden 基础范围内。',
  '表达准确，语序自然，可以继续推进下一句。',
  '关键信息都覆盖到了，这句可以过关。',
];

const ANALYSIS_RETRY = [
  '与参考台词还有差距，注意动词和关键词是否齐全。',
  '部分关键词缺失或顺序不对，对照更佳表达再练。',
  '意思可能偏了，先确认这句在剧情里要表达什么。',
];

export function evaluateCoachLocally(payload: CoachEvaluatePayload): CoachEvalResult {
  const attempt = payload.userAttempt.trim();
  const expected = payload.expectedLine.en.trim();
  const normAttempt = normalize(attempt);
  const normExpected = normalize(expected);

  let score: number;
  if (normAttempt === normExpected) {
    score = 98;
  } else {
    const jac = jaccard(wordSet(attempt), wordSet(expected));
    const lev = similarityRatio(attempt, expected);
    const cover = contentWordCoverage(attempt, expected);
    const blended = jac * 0.35 + lev * 0.35 + cover * 0.3;
    score = Math.round(Math.min(97, Math.max(0, blended * 100)));
    if (normExpected.includes(normAttempt) && normAttempt.length >= 8) {
      score = Math.max(score, 82);
    }
  }

  const passed = score >= 70;
  const mood: CoachEvalResult['mood'] =
    score >= 85 ? 'great' : score >= 70 ? 'good' : 'retry';

  const seed = score + attempt.length;
  const encouragement = pick(
    mood === 'great' ? ENCOURAGE_GREAT : mood === 'good' ? ENCOURAGE_GOOD : ENCOURAGE_RETRY,
    seed,
  );
  const analysis = pick(passed ? ANALYSIS_PASS : ANALYSIS_RETRY, seed + 1);
  const tip = pick(TIPS, seed + 2);

  return {
    score,
    passed,
    encouragement,
    correction: passed ? null : expected,
    analysis,
    tip,
    mood,
    offlineFallback: true,
  };
}
