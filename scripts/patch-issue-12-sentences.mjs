/**
 * Issue #12: add 3rd sentence to 30 words in word-guides.json
 * Run: node scripts/patch-issue-12-sentences.mjs
 */
import { readFileSync, writeFileSync } from 'fs';

const path = 'src/data/word-guides.json';
const data = JSON.parse(readFileSync(path, 'utf8'));

/** @type {Record<string, { en: string; cn: string; parts: [string, string][] }>} */
const additions = {
  so: {
    en: 'She is happy, so she smiles.',
    cn: '她很开心，所以笑了。',
    parts: [
      ['She', 'pron'],
      ['is', 'op'],
      ['happy,', 'adj'],
      ['so', 'conj'],
      ['she', 'pron'],
      ['smiles.', 'op'],
    ],
  },
  very: {
    en: 'The water is very cold.',
    cn: '水非常冷。',
    parts: [
      ['The water', 'n'],
      ['is', 'op'],
      ['very', 'misc'],
      ['cold.', 'adj'],
    ],
  },
  tomorrow: {
    en: 'We will go tomorrow.',
    cn: '我们明天走。',
    parts: [
      ['We', 'pron'],
      ['will', 'op'],
      ['go', 'op'],
      ['tomorrow.', 'misc'],
    ],
  },
  yesterday: {
    en: 'I saw him yesterday.',
    cn: '我昨天看见他了。',
    parts: [
      ['I', 'pron'],
      ['saw', 'op'],
      ['him', 'pron'],
      ['yesterday.', 'misc'],
    ],
  },
  north: {
    en: 'The river runs north.',
    cn: '河往北流。',
    parts: [
      ['The river', 'n'],
      ['runs', 'op'],
      ['north.', 'dir'],
    ],
  },
  south: {
    en: 'The birds fly south.',
    cn: '鸟儿往南飞。',
    parts: [
      ['The birds', 'n'],
      ['fly', 'op'],
      ['south.', 'dir'],
    ],
  },
  east: {
    en: 'The window faces east.',
    cn: '窗户朝东。',
    parts: [
      ['The window', 'n'],
      ['faces', 'op'],
      ['east.', 'dir'],
    ],
  },
  west: {
    en: 'The hill is to the west.',
    cn: '山在西边。',
    parts: [
      ['The hill', 'n'],
      ['is', 'op'],
      ['to', 'dir'],
      ['the west.', 'dir'],
    ],
  },
  please: {
    en: 'Please sit down.',
    cn: '请坐下。',
    parts: [
      ['Please', 'misc'],
      ['sit', 'op'],
      ['down.', 'dir'],
    ],
  },
  yes: {
    en: 'Yes, I will come.',
    cn: '好的，我会来。',
    parts: [
      ['Yes,', 'misc'],
      ['I', 'pron'],
      ['will', 'op'],
      ['come.', 'op'],
    ],
  },
  awake: {
    en: 'The baby is awake.',
    cn: '宝宝醒着。',
    parts: [
      ['The baby', 'n'],
      ['is', 'op'],
      ['awake.', 'adj'],
    ],
  },
  bad: {
    en: 'The food is bad.',
    cn: '这食物不好。',
    parts: [
      ['The food', 'n'],
      ['is', 'op'],
      ['bad.', 'adj'],
    ],
  },
  bent: {
    en: 'The wire is bent.',
    cn: '铁丝弯了。',
    parts: [
      ['The wire', 'n'],
      ['is', 'op'],
      ['bent.', 'adj'],
    ],
  },
  bitter: {
    en: 'The medicine is bitter.',
    cn: '药很苦。',
    parts: [
      ['The medicine', 'n'],
      ['is', 'op'],
      ['bitter.', 'adj'],
    ],
  },
  blue: {
    en: 'The sky is blue.',
    cn: '天是蓝的。',
    parts: [
      ['The sky', 'n'],
      ['is', 'op'],
      ['blue.', 'adj'],
    ],
  },
  certain: {
    en: 'I am certain of it.',
    cn: '我对此很确定。',
    parts: [
      ['I', 'pron'],
      ['am', 'op'],
      ['certain', 'adj'],
      ['of', 'misc'],
      ['it.', 'pron'],
    ],
  },
  cold: {
    en: 'My hands are cold.',
    cn: '我的手很冷。',
    parts: [
      ['My hands', 'n'],
      ['are', 'op'],
      ['cold.', 'adj'],
    ],
  },
  complete: {
    en: 'The work is complete.',
    cn: '工作完成了。',
    parts: [
      ['The work', 'n'],
      ['is', 'op'],
      ['complete.', 'adj'],
    ],
  },
  cruel: {
    en: 'That was a cruel act.',
    cn: '那是很残忍的行为。',
    parts: [
      ['That', 'pron'],
      ['was', 'op'],
      ['a cruel', 'adj'],
      ['act.', 'n'],
    ],
  },
  dark: {
    en: 'The room is dark.',
    cn: '房间很暗。',
    parts: [
      ['The room', 'n'],
      ['is', 'op'],
      ['dark.', 'adj'],
    ],
  },
  dead: {
    en: 'The tree is dead.',
    cn: '这棵树枯死了。',
    parts: [
      ['The tree', 'n'],
      ['is', 'op'],
      ['dead.', 'adj'],
    ],
  },
  dear: {
    en: 'She is dear to me.',
    cn: '她对我很重要。',
    parts: [
      ['She', 'pron'],
      ['is', 'op'],
      ['dear', 'adj'],
      ['to', 'dir'],
      ['me.', 'pron'],
    ],
  },
  delicate: {
    en: 'Be careful, it is delicate.',
    cn: '小心，它很精细。',
    parts: [
      ['Be', 'op'],
      ['careful,', 'adj'],
      ['it', 'pron'],
      ['is', 'op'],
      ['delicate.', 'adj'],
    ],
  },
  different: {
    en: 'They are very different.',
    cn: '它们很不一样。',
    parts: [
      ['They', 'pron'],
      ['are', 'op'],
      ['very', 'misc'],
      ['different.', 'adj'],
    ],
  },
  dirty: {
    en: 'Your hands are dirty.',
    cn: '你的手脏了。',
    parts: [
      ['Your hands', 'n'],
      ['are', 'op'],
      ['dirty.', 'adj'],
    ],
  },
  dry: {
    en: 'The ground is dry.',
    cn: '地面是干的。',
    parts: [
      ['The ground', 'n'],
      ['is', 'op'],
      ['dry.', 'adj'],
    ],
  },
  false: {
    en: 'That story is false.',
    cn: '那个故事是假的。',
    parts: [
      ['That story', 'n'],
      ['is', 'op'],
      ['false.', 'adj'],
    ],
  },
  feeble: {
    en: 'He feels feeble today.',
    cn: '他今天没什么力气。',
    parts: [
      ['He', 'pron'],
      ['feels', 'op'],
      ['feeble', 'adj'],
      ['today.', 'misc'],
    ],
  },
  female: {
    en: 'It is a female cat.',
    cn: '是只母猫。',
    parts: [
      ['It', 'pron'],
      ['is', 'op'],
      ['a female', 'adj'],
      ['cat.', 'n'],
    ],
  },
  foolish: {
    en: 'That was a foolish idea.',
    cn: '那是个愚蠢的主意。',
    parts: [
      ['That', 'pron'],
      ['was', 'op'],
      ['a foolish', 'adj'],
      ['idea.', 'n'],
    ],
  },
};

/** @type {Record<string, string>} */
const hookUpdates = {
  very: '加强程度：非常（very）。',
  tomorrow: '说时间：明天（tomorrow）。',
  yesterday: '说时间：昨天（yesterday）。',
  north: '方位：北方（north）。',
  south: '方位：南方（south）。',
  east: '方位：东方（east）。',
  west: '方位：西方（west）。',
  please: '礼貌用语：请（please）。',
  bent: '形状弯了：弯曲的（bent）。',
  bitter: '味道苦：苦的（bitter）。',
  blue: '颜色蓝：蓝色的（blue）。',
  certain: '心里有数：确定的（certain）。',
  complete: '全部搞定：完整的（complete）。',
  cruel: '心肠狠：残忍的（cruel）。',
  dark: '没光线：黑暗的（dark）。',
  dear: '很亲近：亲爱的（dear）。',
  delicate: '很精细：精细的（delicate）。',
  dirty: '有污渍：脏的（dirty）。',
  feeble: '没力气：无力的（feeble）。',
  foolish: '不明智：愚蠢的（foolish）。',
};

const words = Object.keys(additions);
let patched = 0;
let hooksUpdated = 0;

for (const w of words) {
  if (!data[w]) throw new Error(`Missing word: ${w}`);
  if (!data[w].sentences) throw new Error(`Missing sentences for: ${w}`);
  if (data[w].sentences.length >= 3) {
    console.log(`skip ${w}: already ${data[w].sentences.length} sentences`);
  } else {
    data[w].sentences.push(additions[w]);
    patched++;
  }
  if (hookUpdates[w]) {
    data[w].hook = hookUpdates[w];
    hooksUpdated++;
  }
}

writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
console.log(`Patched ${patched} words, updated ${hooksUpdated} hooks in ${path}`);
