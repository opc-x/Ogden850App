import { COACH_GOOD_THRESHOLD, COACH_GREAT_THRESHOLD, COACH_PASS_THRESHOLD } from './coachConstants.js';
import type { CoachEvalInput, CoachEvalResult } from './coachTypes.js';
import { buildPerfectScriptResult, isExactScriptMatch, normalizeCoachText } from './coachScriptMatch.js';

function normalize(text: string): string {
  return normalizeCoachText(text);
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
  return exp.filter((w) => att.has(w)).length / exp.length;
}

function pick<T>(items: T[], seed: number): T {
  return items[Math.abs(seed) % items.length];
}

const ENCOURAGE_GREAT = [
  '太棒了！意思传达到位，语感很自然。',
  '说得真好！这句在情境里已经很流利了。',
  '出色！核心意思对了，继续保持自信。',
];

const ENCOURAGE_GOOD = [
  '不错！意思对了，再练几遍会更顺口。',
  '很好，语义准确，离流利只差一点点。',
  '进步明显！这句已经可以过关了。',
];

const ENCOURAGE_RETRY = [
  '别灰心，抓住这句要表达的核心意思再试一次。',
  '差一点就对了，不必背原文，想清楚中文意思再说英文。',
  '听一遍参考发音，用你自己的话说出同样意思。',
];

const TIPS = [
  '不必一字不差，同义词可以，核心意思对就行。',
  '先想中文意思，再用简单英文说出来。',
  '放慢语速，把动词和关键词说清楚最重要。',
];

export function evaluateCoachLocally(input: CoachEvalInput): CoachEvalResult {
  const attempt = input.userAttempt.trim();
  const expected = input.expectedLine.en.trim();

  if (isExactScriptMatch(attempt, expected)) {
    return buildPerfectScriptResult({ provider: 'local', offlineFallback: true });
  }

  const normAttempt = normalize(attempt);
  const normExpected = normalize(expected);
  const attemptWords = tokenize(attempt);

  let semantic: number;
  const jac = jaccard(wordSet(attempt), wordSet(expected));
    const lev = similarityRatio(attempt, expected);
    const cover = contentWordCoverage(attempt, expected);
    const blended = jac * 0.3 + lev * 0.25 + cover * 0.45;
    semantic = Math.round(Math.min(97, Math.max(0, blended * 100)));
    if (attemptWords.length >= 3 && cover >= 0.35) {
      semantic = Math.max(semantic, 68);
    }
  if (normExpected.includes(normAttempt) && normAttempt.length >= 6) {
    semantic = Math.max(semantic, 78);
  }

  const vocabulary = attemptWords.length >= 2 ? Math.min(95, semantic + 4) : Math.max(0, semantic - 12);
  const fluency = attemptWords.length >= 4 ? Math.min(92, semantic) : Math.max(0, semantic - 8);
  const score = Math.round(semantic * 0.5 + vocabulary * 0.25 + fluency * 0.25);

  const passed = score >= COACH_PASS_THRESHOLD;
  const mood: CoachEvalResult['mood'] =
    score >= COACH_GREAT_THRESHOLD ? 'great' : score >= COACH_GOOD_THRESHOLD ? 'good' : 'retry';

  const seed = score + attempt.length;
  const encouragement = pick(
    mood === 'great' ? ENCOURAGE_GREAT : mood === 'good' ? ENCOURAGE_GOOD : ENCOURAGE_RETRY,
    seed,
  );

  const analysis = passed
    ? '意思传达到位，可以继续下一句。'
    : `再想想这句要表达什么，用简单英文说出来。`;

  return {
    score,
    passed,
    semantic,
    vocabulary,
    fluency,
    encouragement,
    correction: passed ? null : expected,
    analysis,
    tip: pick(TIPS, seed + 2),
    mood,
    provider: 'local',
    offlineFallback: true,
  };
}
