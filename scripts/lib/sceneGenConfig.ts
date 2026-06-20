/** Per-scene vocabulary + story settings for dialogue generation */

import {
  DIALOGUE_TARGET_COUNT,
  DIALOGUE_MARKETING_LABEL,
  SCENE_TARGET_COUNT,
  getSceneStory,
  listTop50SceneKeys,
  type StoryBeat,
} from '../../src/data/sceneStoryScripts';

export const DIALOGUE_TARGET_TOTAL = DIALOGUE_TARGET_COUNT;
export { DIALOGUE_MARKETING_LABEL };
export const SCENE_TARGET_PER = Math.ceil(DIALOGUE_TARGET_TOTAL / SCENE_TARGET_COUNT);
export type { StoryBeat };

export interface SceneGenProfile {
  sceneKey: string;
  place: string;
  placeZh: string;
  nouns: Array<{ en: string; zh: string }>;
  adjs: Array<{ en: string; zh: string }>;
  storyTitle: string;
}

const N = (en: string, zh: string) => ({ en, zh });

/** Theme word pools — all lemmas verified against Ogden 850 */
const POOLS = {
  retail: [
    N('store', '商店'), N('money', '钱'), N('price', '价格'), N('bag', '袋子'),
    N('food', '食物'), N('bread', '面包'), N('milk', '牛奶'), N('shelf', '货架'),
    N('fruit', '水果'), N('table', '柜台'),
  ],
  office: [
    N('office', '办公室'), N('work', '工作'), N('paper', '纸'), N('table', '桌子'),
    N('pen', '笔'), N('letter', '信'), N('money', '钱'), N('time', '时间'),
    N('friend', '朋友'), N('man', '男人'), N('woman', '女人'),
  ],
  food: [
    N('food', '食物'), N('meal', '饭'), N('water', '水'), N('bread', '面包'),
    N('milk', '牛奶'), N('table', '桌子'), N('money', '钱'), N('man', '男人'),
    N('woman', '女人'), N('room', '房间'),
  ],
  health: [
    N('body', '身体'), N('head', '头'), N('hand', '手'), N('water', '水'),
    N('bed', '床'), N('room', '房间'), N('food', '食物'), N('time', '时间'),
    N('pain', '痛'), N('cold', '感冒'),
  ],
  school: [
    N('school', '学校'), N('book', '书'), N('pen', '笔'), N('paper', '纸'),
    N('work', '工作'), N('word', '词'), N('table', '桌子'), N('room', '房间'),
    N('boy', '男孩'), N('girl', '女孩'),
  ],
  home: [
    N('house', '房子'), N('room', '房间'), N('door', '门'), N('window', '窗户'),
    N('bed', '床'), N('table', '桌子'), N('garden', '花园'), N('wall', '墙'),
    N('floor', '地板'), N('roof', '屋顶'),
  ],
  travel: [
    N('train', '火车'), N('station', '车站'), N('ticket', '票'), N('road', '路'),
    N('town', '城镇'), N('country', '国家'), N('bag', '包'), N('money', '钱'),
    N('time', '时间'), N('map', '地图'),
  ],
  social: [
    N('friend', '朋友'), N('food', '食物'), N('music', '音乐'), N('time', '时间'),
    N('house', '房子'), N('room', '房间'), N('drink', '饮料'), N('event', '聚会'),
    N('man', '男人'), N('woman', '女人'),
  ],
  tech: [
    N('machine', '机器'), N('instrument', '工具'), N('letter', '信'), N('word', '词'),
    N('picture', '图片'), N('book', '书'), N('paper', '纸'), N('time', '时间'),
    N('money', '钱'), N('work', '工作'),
  ],
  nature: [
    N('sun', '太阳'), N('sky', '天空'), N('tree', '树'), N('flower', '花'),
    N('water', '水'), N('wind', '风'), N('rain', '雨'), N('cloud', '云'),
    N('bird', '鸟'), N('garden', '花园'),
  ],
  animal: [
    N('dog', '狗'), N('cat', '猫'), N('bird', '鸟'), N('horse', '马'),
    N('food', '食物'), N('water', '水'), N('garden', '花园'), N('house', '房子'),
    N('leg', '腿'), N('tail', '尾巴'),
  ],
  emotion: [
    N('friend', '朋友'), N('time', '时间'), N('work', '工作'), N('food', '食物'),
    N('heart', '心'), N('face', '脸'), N('hand', '手'), N('word', '词'),
    N('music', '音乐'), N('story', '故事'),
  ],
};

const ADJS = [
  N('good', '好'), N('new', '新'), N('old', '旧'), N('long', '长'),
  N('short', '短'), N('great', '棒'), N('right', '对'), N('wrong', '错'),
  N('warm', '暖'), N('cold', '冷'), N('clean', '干净'), N('full', '满'),
];

const SCENE_POOL_MAP: Record<string, keyof typeof POOLS> = {
  Shopping: 'retail',
  'Going to the Store': 'retail',
  'Online Shopping': 'retail',
  Work: 'office',
  Restaurant: 'food',
  Health: 'health',
  'At School': 'school',
  'The House': 'home',
  'My Room': 'home',
  'Renting a Room': 'home',
  'Moving House': 'home',
  Transport: 'travel',
  Travel: 'travel',
  'Asking Directions': 'travel',
  'Gas Station': 'travel',
  Social: 'social',
  'The Family': 'social',
  Dancing: 'social',
  Internet: 'tech',
  Email: 'tech',
  'Social Media': 'tech',
  'Video Call': 'tech',
  Smartphone: 'tech',
  Download: 'tech',
  WiFi: 'tech',
  Password: 'tech',
  'Online Banking': 'tech',
  Gaming: 'tech',
  Streaming: 'tech',
  App: 'tech',
  Search: 'tech',
  'Tech Support': 'tech',
  'Making a Phone Call': 'tech',
  Mailing: 'office',
  Banking: 'office',
  Nature: 'nature',
  'The Weather': 'nature',
  Animals: 'animal',
  Sports: 'animal',
  Feelings: 'emotion',
  Happy: 'emotion',
  Sad: 'emotion',
  Angry: 'emotion',
  Nervous: 'emotion',
  Disappointed: 'emotion',
  Surprised: 'emotion',
  Time: 'office',
  Haircut: 'social',
  Emergency: 'health',
  'The Body': 'health',
  'At the Office': 'office',
};

const PLACE_MAP: Record<string, { en: string; zh: string }> = {
  Shopping: N('store', '商店'),
  Work: N('office', '办公室'),
  Restaurant: N('building', '餐厅'),
  Health: N('building', '诊所'),
  'At School': N('school', '学校'),
  Emergency: N('street', '街上'),
  Travel: N('station', '车站'),
  Transport: N('station', '车站'),
  'Renting a Room': N('house', '房子'),
  Mailing: N('building', '邮局'),
  Haircut: N('store', '店铺'),
  Social: N('house', '房子'),
  Time: N('office', '办公室'),
  Sports: N('garden', '花园'),
  'My Room': N('room', '房间'),
  'The Body': N('room', '房间'),
  'Going to the Store': N('store', '商店'),
  Dancing: N('room', '房间'),
  'The Weather': N('garden', '花园'),
  'The Family': N('house', '房子'),
  'Asking Directions': N('street', '街上'),
  'The House': N('house', '房子'),
  Animals: N('garden', '花园'),
  Nature: N('garden', '花园'),
  Banking: N('building', '银行'),
  'Gas Station': N('building', '加油站'),
  Feelings: N('room', '房间'),
  'Making a Phone Call': N('room', '房间'),
  'Moving House': N('house', '房子'),
  Internet: N('room', '房间'),
  Email: N('office', '办公室'),
  'Social Media': N('room', '房间'),
  'Online Shopping': N('room', '房间'),
  'Video Call': N('room', '房间'),
  Smartphone: N('room', '房间'),
  Download: N('machine', '机器'),
  WiFi: N('room', '房间'),
  Password: N('machine', '机器'),
  'Online Banking': N('building', '银行'),
  Gaming: N('room', '房间'),
  Streaming: N('room', '房间'),
  App: N('instrument', '工具'),
  Search: N('machine', '机器'),
  'Tech Support': N('office', '办公室'),
  Happy: N('garden', '花园'),
  Sad: N('room', '房间'),
  Angry: N('room', '房间'),
  Nervous: N('office', '办公室'),
  Disappointed: N('room', '房间'),
  Surprised: N('house', '房子'),
};

export interface ScenePromptMeta {
  titleZh: string;
  titleEn: string;
  storyHook: string;
  storyOutline: Array<{ beat: StoryBeat; title: string; goal: string }>;
}

export function scenePromptFor(sceneKey: string): ScenePromptMeta {
  const s = getSceneStory(sceneKey);
  if (!s) {
    return { titleZh: sceneKey, titleEn: sceneKey, storyHook: `${sceneKey} 连续故事对话`, storyOutline: [] };
  }
  return {
    titleZh: s.titleZh,
    titleEn: s.titleEn,
    storyHook: s.storyHook,
    storyOutline: s.storyOutline,
  };
}

/** 现实世界高频 Top50 固定列表 */
export function listSceneKeysForGeneration(): string[] {
  return listTop50SceneKeys();
}

/** 按 tier 权重分配 ~5188 句，P0 场景略多，总数对齐宣传数字 */
export function allocateSceneTargets(sceneKeys: string[]): Record<string, number> {
  const n = sceneKeys.length;
  if (n === 0) return {};
  const base = Math.floor(DIALOGUE_TARGET_TOTAL / n);
  const raw = sceneKeys.map((key) => {
    const tier = getSceneStory(key)?.tier ?? 'P2';
    const tierBonus = tier === 'P0' ? 2 : tier === 'P1' ? 1 : 0;
    return { key, count: base + tierBonus };
  });
  let sum = raw.reduce((s, r) => s + r.count, 0);
  let i = 0;
  while (sum > DIALOGUE_TARGET_TOTAL) {
    const r = raw[i % raw.length]!;
    if (r.count > 85) {
      r.count--;
      sum--;
    }
    i++;
  }
  while (sum < DIALOGUE_TARGET_TOTAL) {
    raw[i % raw.length]!.count++;
    sum++;
    i++;
  }
  const out: Record<string, number> = {};
  for (const r of raw) out[r.key] = r.count;
  return out;
}

export function profileForScene(sceneKey: string): SceneGenProfile {
  const poolKey = SCENE_POOL_MAP[sceneKey] ?? 'office';
  const place = PLACE_MAP[sceneKey] ?? N('place', '地方');
  return {
    sceneKey,
    place: place.en,
    placeZh: place.zh,
    nouns: POOLS[poolKey],
    adjs: ADJS,
    storyTitle: sceneKey,
  };
}
