/** 陪练过关线：语义对即可，不必逐字匹配参考句 */
export const COACH_PASS_THRESHOLD = 60;

export const COACH_GREAT_THRESHOLD = 85;
export const COACH_GOOD_THRESHOLD = COACH_PASS_THRESHOLD;

/** 产品语料边界 — prompt 约束，不整包灌入 token */
export const COACH_CORPUS_BOUNDS = {
  wordCount: 850,
  dialogueLabel: '5410+',
  dialogueCount: 5410,
} as const;
