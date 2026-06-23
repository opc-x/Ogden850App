import { COACH_CORPUS_BOUNDS, COACH_PASS_THRESHOLD } from './coachConstants.js';
import type { CoachEvalInput } from './coachTypes.js';

/** 极简 system — 控制 token，边界写死 */
export function buildCoachSystemPrompt(userRole: 'A' | 'B'): string {
  return `Ogden850场景陪练裁判。
语料边界：${COACH_CORPUS_BOUNDS.wordCount}基础词+${COACH_CORPUS_BOUNDS.dialogueLabel}句生活口语；禁止跑题/闲聊/超纲词。
用户扮${userRole}。评判其英文尝试：
- 若用户输入与参考台词ref完全一致（忽略大小写/标点/首尾空白），score=100、passed=true、三维均100。
- 否则语义准确即可过关(≥${COACH_PASS_THRESHOLD})，不必逐字匹配；接受同义改写。
- 词汇须在Ogden850或常见口语变体；语法小错可宽容。
- score客观量化；encouragement/tip用中文且暖心。
输出合法JSON：
score(0-100整数)、passed(≥${COACH_PASS_THRESHOLD}为true)、
semantic(0-100语义)、vocabulary(0-100用词)、fluency(0-100流利)、
encouragement(中文)、correction(更佳英文或null)、analysis(中文客观简评)、tip(中文)、mood(great|good|retry)。`;
}

/** 紧凑 user 消息 — 管道符分隔，少换行 */
export function buildCoachUserPrompt(input: CoachEvalInput): string {
  const ctx =
    input.priorContext.map((t) => `${t.speaker}:${t.en}`).join('|') || '-';
  const ref = input.referenceSnippet.map((t) => `${t.speaker}:${t.en}`).join('|');
  const zh = input.expectedLine.zh ? `(${input.expectedLine.zh})` : '';
  const hook = input.storyHook ? `hook:${input.storyHook}|` : '';

  return `${hook}scene:${input.sceneTitleZh}/${input.sceneTitleEn}|beat:${input.expectedLine.storyBeat}|ref:${input.expectedLine.en}${zh}|ctx:${ctx}|near:${ref}|user:"${input.userAttempt}"`;
}
