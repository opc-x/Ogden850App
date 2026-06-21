import { getStoryNarrative } from '../../src/data/storyNarrative';
import { SCENE_TOPIC_WORDS, validateZhLine } from './dialogueQuality';
import type { StoryBeat } from './sceneGenConfig';

export interface DialogueLine {
  speaker: 'A' | 'B';
  en: string;
  zh: string;
  beat: StoryBeat;
}

function beatNarrativeHint(beat: StoryBeat): string {
  switch (beat) {
    case '开场':
      return '本段必须交代：几点/哪天（时间）、在哪里（地点）、谁和谁（人物）、为何而来（事件起因）。';
    case '进行':
      return '本段必须展开：怎么做（方法）、怎样进行（方式），并出现一个小状况或选择（如找不到货、价格、付款）。';
    case '收束':
      return '本段必须收尾：事件是否解决、结果如何、人物怎样离开或结束。';
  }
}

export function buildDialoguePrompt(opts: {
  sceneKey: string;
  titleZh: string;
  titleEn: string;
  storyHook: string;
  storyOutline: Array<{ beat: StoryBeat; title: string; goal: string }>;
  beat: StoryBeat;
  chapterTitle?: string;
  chapterGoal?: string;
  count: number;
  priorLines: Array<{ speaker: string; en: string }>;
}): string {
  const narrative = getStoryNarrative(opts.sceneKey);
  const prior =
    opts.priorLines.length > 0
      ? `Story so far — every line already said, IN ORDER (continue naturally, do NOT restart, do NOT repeat or paraphrase any of these):\n${opts.priorLines
          .map((l, i) => `${i + 1}. ${l.speaker}: ${l.en}`)
          .join('\n')}`
      : 'Start the story from the beginning.';

  const outlineText = opts.storyOutline
    .map((c) => `- [${c.beat}] ${c.title}: ${c.goal}`)
    .join('\n');

  const chapterHint =
    opts.chapterTitle && opts.chapterGoal
      ? `\nCurrent chapter: "${opts.chapterTitle}" — ${opts.chapterGoal}`
      : '';

  const topic = SCENE_TOPIC_WORDS[opts.sceneKey];
  const topicBlock = topic
    ? `\nTOPIC LOCK:
- Scene: ${opts.titleZh} — ${opts.storyHook}
- Prefer: ${topic.mustRelate.join(', ')}
- Avoid: ${topic.avoid.join(', ')}`
    : '';

  const narrativeBlock = `NARRATIVE FRAME (every line must serve this story — not isolated phrases):
- 时间 when: ${narrative.when}
- 地点 where: ${narrative.where}
- 人物 who: ${narrative.who}
- 方式 how: ${narrative.how}
- 方法 method: ${narrative.method}
- 事件 event: ${narrative.event}`;

  return `Write ${opts.count} lines of a RICH continuous story dialogue (like a short play scene, NOT a word list).
Scene: "${opts.sceneKey}" / ${opts.titleZh} (${opts.titleEn})

${narrativeBlock}
${topicBlock}

Story script:
${outlineText}
${chapterHint}

Current beat: ${opts.beat}
${beatNarrativeHint(opts.beat)}

${prior}

STRICT RULES:
1. Write standard, natural American English. Use Ogden Basic English as the core vocabulary, but allow essential real-life scene words when they are the natural word a person would say (phone, app, WiFi, email, password, bus, train, gas, menu, ticket, doctor, file, download).
   Do not force awkward substitutes like "machine" for phone/car/computer when the scene would sound unnatural.
2. Each line is something a real person would SAY in this situation — with context, not textbook drills.
2b. Each new line MUST introduce a NEW fact, action, or development. NEVER repeat or paraphrase the meaning of any earlier line (in either language).
3. Speakers A and B alternate. A = learner/甲, B = local helper/乙.
4. Lines MUST connect: reference time, place, people, or what just happened.
5. Max 20 words per line. Include at least one concrete detail (time, place, food, money, problem) every 2 lines.
6. Chinese (zh): natural spoken Mandarin. No fragments like 一衣. Match the emotion and situation.
7. beat field: 开场 | 进行 | 收束

Return JSON: {"lines":[{"speaker":"A","en":"...","zh":"...","beat":"开场"}]}`;
}

const STOPWORDS = new Set(['a','an','the','is','are','was','were','am','be','been','i','you','it','this','that','to','of','in','on','at','and','but','do','did','does','have','has','had','will','would','can','not','no','yes','for','with','my','your','his','her','we','they','he','she','me','him','them','us','so','if','what','how','when','where','why','who']);

function contentTokenSet(s: string): Set<string> {
  return new Set(
    s
      .toLowerCase()
      .replace(/[^a-z\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 0 && !STOPWORDS.has(w)),
  );
}

/** 近义改写去重 — 去掉虚词后词集重合度高才视为重复，避免短句误判 */
export function isNearDuplicate(en: string, existing: Iterable<string>): boolean {
  const a = contentTokenSet(en);
  if (a.size < 3) return false;
  for (const other of existing) {
    const b = contentTokenSet(other);
    if (b.size < 3) continue;
    let inter = 0;
    for (const w of a) if (b.has(w)) inter++;
    const union = a.size + b.size - inter;
    if (union > 0 && inter / union >= 0.65) return true;
  }
  return false;
}

const GOOD_CLOSING_EXAMPLE = `
GOOD EXAMPLE (32-line Shopping — goodbye appears ONLY once, in the final line):
[收束] A: I put the money in. Is it done?
[收束] B: Yes, that is right. Here is your change.
[收束] A: Thank you. I will go to my house and make the soup now.
[收束] B: Good. Your friend will have a good meal at night. Goodbye.
Mid-scene lines use "Thank you" WITHOUT goodbye. The story continues after every line until the final farewell.`;

export function buildFullScenePrompt(opts: {
  sceneKey: string;
  titleZh: string;
  titleEn: string;
  storyHook: string;
  storyOutline: Array<{ beat: StoryBeat; title: string; goal: string }>;
  target: number;
  seedLines?: Array<{ speaker: string; en: string }>;
  startBeat?: StoryBeat;
  styleReference?: string;
}): string {
  const narrative = getStoryNarrative(opts.sceneKey);
  const startBeat = opts.startBeat ?? '开场';
  const remainingActs = opts.storyOutline.filter((_, idx) => {
    const order: Record<StoryBeat, number> = { 开场: 0, 进行: 1, 收束: 2 };
    return order[opts.storyOutline[idx]!.beat] >= order[startBeat];
  });
  const outlineText = opts.storyOutline
    .map((c) => `- [${c.beat}] ${c.title}: ${c.goal}`)
    .join('\n');
  const topic = SCENE_TOPIC_WORDS[opts.sceneKey];
  const topicBlock = topic
    ? `\nTOPIC LOCK:\n- Scene: ${opts.titleZh} — ${opts.storyHook}\n- Prefer: ${topic.mustRelate.join(', ')}\n- Avoid: ${topic.avoid.join(', ')}`
    : '';
  const narrativeBlock = `NARRATIVE FRAME (the ENTIRE scene is ONE single continuous story about this — never branch into a second unrelated event):\n- 时间 when: ${narrative.when}\n- 地点 where: ${narrative.where}\n- 人物 who: ${narrative.who}\n- 方式 how: ${narrative.how}\n- 方法 method: ${narrative.method}\n- 事件 event: ${narrative.event}`;
  const seedBlock =
    opts.seedLines && opts.seedLines.length > 0
      ? `\nOpening lines already written — continue from here, do not repeat:\n${opts.seedLines.map((l, i) => `${i + 1}. ${l.speaker}: ${l.en}`).join('\n')}`
      : '';

  return `Write a SINGLE, FULLY CONTINUOUS play-style dialogue of exactly ${opts.target} lines for ONE scene — like one unbroken short play, not a collection of separate mini-conversations.
Scene: "${opts.sceneKey}" / ${opts.titleZh} (${opts.titleEn})

${narrativeBlock}
${topicBlock}

The story has 3 acts — write them in this exact order, never go back to an earlier act once you move on:
${outlineText}
${startBeat !== '开场' ? `\nThis is a CONTINUATION already in progress. The story already passed act(s) before ${startBeat}. Do NOT write 开场 again — start directly at ${startBeat} and move forward only.` : ''}
${seedBlock}
${opts.styleReference ?? GOOD_CLOSING_EXAMPLE}

STRICT RULES:
1. Write standard, natural American English. Use Ogden Basic English as the core vocabulary, but allow essential real-life scene words when they are the natural word a person would say (phone, app, WiFi, email, password, bus, train, gas, menu, ticket, doctor, file, download).
   Do not force awkward substitutes like "machine" for phone/car/computer when the scene would sound unnatural.
2. ONE continuous event from start to end. Every line must reference something already established (the same people, the same place, the same problem) — never introduce a second unrelated topic or restart the scene.
3. Each new line MUST add a NEW fact, action, or development. NEVER repeat or paraphrase the meaning of any earlier line, in either language.
4. Speakers A and B alternate. A = learner/甲, B = local helper/乙.
5. Max 20 words per line. Include at least one concrete detail (time, place, food, money, problem) every 2 lines.
6. Chinese (zh): natural spoken Mandarin, matching the emotion and situation. No fragments like 一衣.
7. beat field per line: 开场 for act 1 lines, 进行 for act 2 lines, 收束 for act 3 lines — must follow the act order above exactly, in one pass, no jumping back.
8. Output exactly ${opts.target} lines total. MINIMUM beat counts: 开场 ≥4, 进行 ≥12, 收束 ≥3. Assign beats as you write — do NOT tag everything as one act.
9. CLOSING RULE (critical): The entire scene may contain ONLY ONE farewell/closing moment in ONE line only (even within the last 3 lines, never stack goodbye + see you + take care on separate lines). Words like goodbye, bye, see you, good night, sleep well, rest well, have a good day, take care (not "take care of"), or "thank you…goodbye" may appear AT MOST ONCE in the whole scene, and ONLY in the final 1-3 lines. NEVER say goodbye in the middle and then continue the conversation. Never re-ask facts already confirmed earlier in the same scene.
10. COHERENCE (critical): Each concrete action (send a file/paper, open a document, pay, sign, download) must go start → progress → done in ONE arc — never say "I am sending it now" twice without finishing the first send. Thank for help at most ONCE in the whole scene (mid-scene "thanks" is OK once, not four variations of "thanks for your help").
11. Style target: short, smooth, spoken American lines. Avoid robotic repetition, literal word drills, and unnatural Ogden-only wording.
12. NO proper names (no Wang, Li, Aunt Wang). Use friend, mother, man, woman, the helper, A, B only.

Return JSON: {"lines":[{"speaker":"A","en":"...","zh":"...","beat":"开场"}]}`;
}

/** 在保留故事事实的前提下整篇重写，专用于修复中段告别/重复收尾 */
export function buildClosingRewritePrompt(opts: {
  sceneKey: string;
  titleZh: string;
  titleEn: string;
  storyHook: string;
  target: number;
  existing: Array<{ speaker: string; en: string; zh: string; beat?: string }>;
  violationHints?: string[];
}): string {
  const narrative = getStoryNarrative(opts.sceneKey);
  const existingBlock = opts.existing
    .map((l, i) => `${i + 1}. [${l.beat ?? '进行'}] ${l.speaker}: ${l.en} / ${l.zh}`)
    .join('\n');
  const violationBlock =
    opts.violationHints && opts.violationHints.length > 0
      ? `\nPREVIOUS ATTEMPT FAILURES (must not repeat):\n${opts.violationHints.map((h) => `- ${h}`).join('\n')}`
      : '';

  return `Rewrite the ENTIRE scene below as ONE new ${opts.target}-line continuous Ogden dialogue.
Fix the story flow: keep the same facts, people, place, and events, but remove ALL mid-scene goodbyes and duplicate farewells.

Scene: "${opts.sceneKey}" / ${opts.titleZh} (${opts.titleEn})
Story: ${opts.storyHook}
六要素: when ${narrative.when} | where ${narrative.where} | who ${narrative.who} | event ${narrative.event}
${violationBlock}

CURRENT DIALOGUE (has goodbye/farewell problems — rewrite completely):
${existingBlock}

STRICT RULES:
1. Ogden Basic English 850 words only (plus inflections). Use substitutes: gas→oil, car→machine, bus→road vehicle, phone→machine, doctor→man, app→program, game→play.
2. ONE continuous story. Do NOT re-ask facts already established. Do NOT restart the scene after a goodbye.
3. ONLY ONE farewell (goodbye / bye / see you / good night / sleep well / rest well / take care) in the ENTIRE scene, and it MUST be in the last 3 lines only. Mid-scene use "I will go now" or "talk later" instead — NEVER those farewell phrases before the final 3 lines.
4. Do NOT use "I see you" or "we see you" — say "I see your face" or "your picture is clear".
5. Speakers A and B alternate. beat: 开场|进行|收束 in order. MINIMUM: 开场≥4, 进行≥12, 收束≥3, total≥28.
6. Natural spoken Chinese (zh). No proper names.
${GOOD_CLOSING_EXAMPLE}

Return JSON: {"lines":[{"speaker":"A","en":"...","zh":"...","beat":"开场"}]}`;
}

/** 顽固场景整篇换故事 — 不参考旧稿，只保留场景主题与六要素 */
export function buildFreshStoryPrompt(opts: {
  sceneKey: string;
  titleZh: string;
  titleEn: string;
  storyHook: string;
  storyOutline: Array<{ beat: StoryBeat; title: string; goal: string }>;
  target: number;
}): string {
  const noFarewellMidStory = new Set([
    'Time',
    'Work',
    'Download',
    'Streaming',
    'Feelings',
    'Sad',
    'Smartphone',
    'Online Banking',
    'Tech Support',
    'Email',
    'Internet',
    'App',
    'WiFi',
    'Making a Phone Call',
    'Going to the Store',
  ]);
  const extra =
    noFarewellMidStory.has(opts.sceneKey)
      ? `\nSTORY ANGLE: Focus on the task (${opts.titleZh}), NOT on saying goodbye/good night/see you. Use "I will be there at three" / "talk tomorrow" instead of "see you then". The ONLY farewell word in the whole scene goes in the very last line.`
      : '';
  const base = buildFullScenePrompt({
    sceneKey: opts.sceneKey,
    titleZh: opts.titleZh,
    titleEn: opts.titleEn,
    storyHook: opts.storyHook,
    storyOutline: opts.storyOutline,
    target: opts.target,
  });
  return `${base}
${extra}

FRESH STORY (critical): Ignore any previous dialogue drafts. Invent a COMPLETELY NEW plot with different people, problems, and details — still one continuous ${opts.titleZh} scene. Do NOT reuse farewell lines from other versions. Mid-scene lines must NEVER contain goodbye, bye, see you, good night, sleep well, rest well, or take care — save the single farewell for the last 3 lines only. Avoid "I see you" / "we see you" phrasing; use "I see your face" or "your picture is clear" instead.`;
}

const BEAT_ORDER: Record<StoryBeat, number> = { 开场: 0, 进行: 1, 收束: 2 };

/** 整场景一次性生成时使用 — 信任模型自报的 beat，但禁止倒退（弧线只能前进） */
export function normalizeDialogueLineLoose(raw: DialogueLine, lastBeat: StoryBeat): DialogueLine | null {
  const en = raw.en?.trim();
  const zh = raw.zh?.trim();
  if (!en || !zh) return null;
  const speaker = raw.speaker === 'B' ? 'B' : 'A';
  if (validateZhLine(zh)) return null;
  const reported = (['开场', '进行', '收束'].includes(raw.beat) ? raw.beat : lastBeat) as StoryBeat;
  const storyBeat = BEAT_ORDER[reported] >= BEAT_ORDER[lastBeat] ? reported : lastBeat;
  return { speaker, en, zh, beat: storyBeat };
}

export function normalizeDialogueLine(raw: DialogueLine, beat: StoryBeat): DialogueLine | null {
  const en = raw.en?.trim();
  const zh = raw.zh?.trim();
  if (!en || !zh) return null;
  const speaker = raw.speaker === 'B' ? 'B' : 'A';
  if (validateZhLine(zh)) return null;
  const storyBeat = beat;
  return { speaker, en, zh, beat: storyBeat };
}
