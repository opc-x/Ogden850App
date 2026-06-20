import type { StoryBeat } from './sceneGenConfig';
import type { SceneGenProfile } from './sceneGenConfig';
import { validateOgdenSentence } from './ogdenValidate';

export interface GeneratedLine {
  en: string;
  zh: string;
  beat: StoryBeat;
  speaker: 'A' | 'B';
}

interface Pattern {
  en: string;
  zh: string;
  beat: StoryBeat;
  speaker: 'A' | 'B';
}

function fill(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? `{${k}}`);
}

/** Curated Ogden-only dialogue patterns — every line validated against 850 lemmas */
const PATTERNS: Pattern[] = [
  // ── 开场 ──
  { beat: '开场', speaker: 'A', en: 'I go to the {place}.', zh: '我去{placeZh}。' },
  { beat: '开场', speaker: 'B', en: 'Good morning. How may I help you?', zh: '早上好，有什么能帮您的？' },
  { beat: '开场', speaker: 'A', en: 'I desire to see the {noun}.', zh: '我想看看{nounZh}。' },
  { beat: '开场', speaker: 'B', en: 'The {noun} is on the {noun2}.', zh: '{nounZh}在{noun2Zh}上。' },
  { beat: '开场', speaker: 'A', en: 'This is my first time here.', zh: '这是我第一次来这里。' },
  { beat: '开场', speaker: 'B', en: 'Please come in.', zh: '请进。' },
  { beat: '开场', speaker: 'A', en: 'I have a {adj} {noun} in my house.', zh: '我家里有一个{adjZh}{nounZh}。' },
  { beat: '开场', speaker: 'B', en: 'Do you need some help?', zh: '你需要帮助吗？' },
  { beat: '开场', speaker: 'A', en: 'Yes, I need some help with the {noun}.', zh: '是的，我需要关于{nounZh}的帮助。' },
  { beat: '开场', speaker: 'B', en: 'I will take you to the {place}.', zh: '我带你去{placeZh}。' },
  { beat: '开场', speaker: 'A', en: 'I go to the {place} every day.', zh: '我每天去{placeZh}。' },
  { beat: '开场', speaker: 'B', en: 'The {place} is near the {noun2}.', zh: '{placeZh}离{noun2Zh}不远。' },
  { beat: '开场', speaker: 'A', en: 'I see a {adj} {noun} through the window.', zh: '我透过窗户看见一个{adjZh}{nounZh}。' },
  { beat: '开场', speaker: 'B', en: 'That {noun} is for you.', zh: '那个{nounZh}是给你的。' },
  { beat: '开场', speaker: 'A', en: 'I come here with my friend.', zh: '我和朋友一起来这里。' },
  { beat: '开场', speaker: 'A', en: 'I am at the {place} now.', zh: '我现在在{placeZh}。' },
  { beat: '开场', speaker: 'B', en: 'You are at the right place.', zh: '你来对地方了。' },

  // ── 进行 ──
  { beat: '进行', speaker: 'A', en: 'How much is the price of this {noun}?', zh: '这个{nounZh}多少钱？' },
  { beat: '进行', speaker: 'B', en: 'The price is not high.', zh: '价格不高。' },
  { beat: '进行', speaker: 'A', en: 'I take the {noun} from the {noun2}.', zh: '我从{noun2Zh}上拿这个{nounZh}。' },
  { beat: '进行', speaker: 'B', en: 'Do you desire this {adj} {noun}?', zh: '你想要这个{adjZh}{nounZh}吗？' },
  { beat: '进行', speaker: 'A', en: 'Yes, I desire the {adj} {noun}.', zh: '是的，我想要这个{adjZh}{nounZh}。' },
  { beat: '进行', speaker: 'B', en: 'I will put it on the {noun2}.', zh: '我把它放在{noun2Zh}上。' },
  { beat: '进行', speaker: 'A', en: 'May I see the {noun} again?', zh: '我能再看一下{nounZh}吗？' },
  { beat: '进行', speaker: 'B', en: 'Here it is.', zh: '给你。' },
  { beat: '进行', speaker: 'A', en: 'I give you the money.', zh: '我把钱给你。' },
  { beat: '进行', speaker: 'B', en: 'Thank you. I give you the {noun}.', zh: '谢谢。我把{nounZh}给你。' },
  { beat: '进行', speaker: 'A', en: 'I put the {noun} in my bag.', zh: '我把{nounZh}放进包里。' },
  { beat: '进行', speaker: 'B', en: 'Do you have more time?', zh: '你还有时间吗？' },
  { beat: '进行', speaker: 'A', en: 'Yes, I have a little more time.', zh: '是的，我还有一点时间。' },
  { beat: '进行', speaker: 'B', en: 'Let us do the work together.', zh: '我们一起做这件事吧。' },
  { beat: '进行', speaker: 'A', en: 'I do my work with my hands.', zh: '我用手做工作。' },
  { beat: '进行', speaker: 'B', en: 'That is the right way.', zh: '那是正确的方法。' },
  { beat: '进行', speaker: 'A', en: 'I have a pain in my {noun}.', zh: '我的{nounZh}痛。' },
  { beat: '进行', speaker: 'B', en: 'You have to keep warm and go to bed.', zh: '你必须保暖并上床休息。' },
  { beat: '进行', speaker: 'A', en: 'I take the {noun} with water.', zh: '我用水服用{nounZh}。' },
  { beat: '进行', speaker: 'B', en: 'You will be well in a short time.', zh: '你很快就会好起来。' },
  { beat: '进行', speaker: 'A', en: 'The man gives us work.', zh: '那个人给我们布置作业。' },
  { beat: '进行', speaker: 'B', en: 'I do the work on the {noun2}.', zh: '我在{noun2Zh}上做作业。' },
  { beat: '进行', speaker: 'A', en: 'I say the word again.', zh: '我再把这个词说一遍。' },
  { beat: '进行', speaker: 'B', en: 'That is good. Say the word again.', zh: '很好。再说一遍。' },
  { beat: '进行', speaker: 'A', en: 'I get on the {noun} at the {noun2}.', zh: '我在{noun2Zh}上{nounZh}。' },
  { beat: '进行', speaker: 'B', en: 'I give my ticket to the man.', zh: '我把票给那个人。' },
  { beat: '进行', speaker: 'A', en: 'The {noun} goes through the country.', zh: '{nounZh}穿过乡间。' },
  { beat: '进行', speaker: 'B', en: 'I see the towns through the window.', zh: '我透过窗户看见城镇。' },
  { beat: '进行', speaker: 'A', en: 'We talk about the {noun}.', zh: '我们谈论{nounZh}。' },
  { beat: '进行', speaker: 'B', en: 'I have the same idea.', zh: '我有同样的想法。' },
  { beat: '进行', speaker: 'A', en: 'The {noun} is not the same as before.', zh: '这个{nounZh}和以前不一样了。' },
  { beat: '进行', speaker: 'B', en: 'Let me see it.', zh: '让我看看。' },
  { beat: '进行', speaker: 'A', en: 'I keep the {noun} in my room.', zh: '我把{nounZh}放在房间里。' },
  { beat: '进行', speaker: 'B', en: 'That is a good place for it.', zh: '那是个放它的好地方。' },
  { beat: '进行', speaker: 'A', en: 'I send a letter to my friend.', zh: '我给朋友寄了一封信。' },
  { beat: '进行', speaker: 'B', en: 'My friend will get it in a short time.', zh: '我的朋友很快就会收到。' },
  { beat: '进行', speaker: 'A', en: 'I make a request for more time.', zh: '我请求更多时间。' },
  { beat: '进行', speaker: 'B', en: 'I will see.', zh: '我看看。' },
  { beat: '进行', speaker: 'A', en: 'The {adj} {noun} is on the {noun2}.', zh: '{adjZh}{nounZh}在{noun2Zh}上。' },
  { beat: '进行', speaker: 'B', en: 'Take it if you like it.', zh: '如果你喜欢就拿走吧。' },
  { beat: '进行', speaker: 'A', en: 'I get the {noun} from the man.', zh: '我从那个人那里拿到{nounZh}。' },
  { beat: '进行', speaker: 'B', en: 'He gives you a good price.', zh: '他给了你一个好价格。' },
  { beat: '进行', speaker: 'A', en: 'I put the money in my bag.', zh: '我把钱放进包里。' },
  { beat: '进行', speaker: 'B', en: 'Now we may go on.', zh: '现在我们可以继续了。' },
  { beat: '进行', speaker: 'A', en: 'Where is the {noun2}?', zh: '{noun2Zh}在哪里？' },
  { beat: '进行', speaker: 'B', en: 'It is over there by the door.', zh: '在那边，门旁边。' },

  // ── 收束 ──
  { beat: '收束', speaker: 'A', en: 'I say that is all for this day.', zh: '我说今天就到这里。' },
  { beat: '收束', speaker: 'B', en: 'Good. I will see you again.', zh: '好的。我们再见。' },
  { beat: '收束', speaker: 'A', en: 'I go back to my house now.', zh: '我现在回家。' },
  { beat: '收束', speaker: 'B', en: 'Have a good day.', zh: '祝你今天愉快。' },
  { beat: '收束', speaker: 'A', en: 'I put the {noun} on the {noun2} in my house.', zh: '我把{nounZh}放在家里的{noun2Zh}上。' },
  { beat: '收束', speaker: 'B', en: 'That was a good time.', zh: '那是段愉快的时光。' },
  { beat: '收束', speaker: 'A', en: 'I will come here again tomorrow.', zh: '我明天会再来这里。' },
  { beat: '收束', speaker: 'B', en: 'We will be here.', zh: '我们会在这里。' },
  { beat: '收束', speaker: 'A', en: 'Thank you for your help.', zh: '谢谢你的帮助。' },
  { beat: '收束', speaker: 'B', en: 'That is good.', zh: '很好。' },
  { beat: '收束', speaker: 'A', en: 'I get off at the {noun2}.', zh: '我在{noun2Zh}下车。' },
  { beat: '收束', speaker: 'B', en: 'Take your bag with you.', zh: '带上你的包。' },
  { beat: '收束', speaker: 'A', en: 'I go to bed early this night.', zh: '我今晚早点上床。' },
  { beat: '收束', speaker: 'B', en: 'Have a good sleep.', zh: '睡个好觉。' },
  { beat: '收束', speaker: 'A', en: 'The work is done for this day.', zh: '今天的工作做完了。' },
  { beat: '收束', speaker: 'B', en: 'Good night.', zh: '晚安。' },
  { beat: '收束', speaker: 'A', en: 'I say good night to my friend.', zh: '我和朋友说晚安。' },
  { beat: '收束', speaker: 'B', en: 'I will see you again.', zh: '我们会再见面。' },
];

// Validate all static patterns at load time
for (const p of PATTERNS) {
  const testEn = p.en
    .replace(/\{place\}/g, 'store')
    .replace(/\{noun\}/g, 'book')
    .replace(/\{noun2\}/g, 'table')
    .replace(/\{adj\}/g, 'good');
  const v = validateOgdenSentence(testEn);
  if (!v.ok) {
    throw new Error(`Invalid pattern: "${p.en}" → [${v.unknown.join(', ')}]`);
  }
}

function varsFor(profile: SceneGenProfile, i: number): Record<string, string> {
  const nouns = profile.nouns;
  const adjs = profile.adjs;
  const n = nouns[i % nouns.length]!;
  const n2 = nouns[(i + 3) % nouns.length]!;
  const adj = adjs[i % adjs.length]!;
  return {
    place: profile.place,
    placeZh: profile.placeZh,
    noun: n.en,
    nounZh: n.zh,
    noun2: n2.en,
    noun2Zh: n2.zh,
    adj: adj.en,
    adjZh: adj.zh,
  };
}

export function generateSceneLines(
  _profile: SceneGenProfile,
  _count: number,
  _existingEn: Set<string>,
): GeneratedLine[] {
  throw new Error(
    '程序模板生成已禁用（llm-first-content 规则）。请使用 LLM：npm run pilot:scene 或 npm run repair:dialogues',
  );
}

/** @deprecated 仅保留类型与历史引用 — 不得用于生成 */
export function _generateSceneLinesLegacy(
  profile: SceneGenProfile,
  count: number,
  existingEn: Set<string>,
): GeneratedLine[] {
  const out: GeneratedLine[] = [];
  let pi = 0;
  let attempts = 0;
  const maxAttempts = count * 40;

  while (out.length < count && attempts < maxAttempts) {
    attempts++;
    const pattern = PATTERNS[pi % PATTERNS.length]!;
    pi++;
    const vars = varsFor(profile, out.length + pi);
    const en = fill(pattern.en, vars);
    const zh = fill(pattern.zh, vars);

    if (existingEn.has(en.toLowerCase())) continue;
    const v = validateOgdenSentence(en);
    if (!v.ok) continue;

    existingEn.add(en.toLowerCase());
    out.push({ en, zh, beat: pattern.beat, speaker: pattern.speaker });
  }

  return out;
}

/** Order lines into a continuous story: 开场 → 进行 → 收束 */
export function orderStoryLines(
  existing: Array<{ en: string; zh?: string }>,
  generated: GeneratedLine[],
): GeneratedLine[] {
  const beatOrder: StoryBeat[] = ['开场', '进行', '收束'];
  const existingLines: GeneratedLine[] = existing.map((s, i) => ({
    en: s.en,
    zh: s.zh ?? '',
    beat: beatOrder[Math.min(2, Math.floor((i / Math.max(existing.length, 1)) * 3))]!,
    speaker: (i % 2 === 0 ? 'A' : 'B') as 'A' | 'B',
  }));

  const byBeat: Record<StoryBeat, GeneratedLine[]> = {
    开场: [],
    进行: [],
    收束: [],
  };
  for (const g of generated) byBeat[g.beat].push(g);

  const merged: GeneratedLine[] = [];
  for (const beat of beatOrder) {
    const ex = existingLines.filter((l) => l.beat === beat);
    const gen = byBeat[beat];
    const combined = [...ex];
    for (let i = 0; i < gen.length; i++) {
      const insertAt = Math.min(
        combined.length,
        Math.floor(((i + 1) / (gen.length + 1)) * combined.length) + i,
      );
      combined.splice(insertAt, 0, gen[i]!);
    }
    merged.push(...combined);
  }
  return merged;
}
