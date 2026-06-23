/** Marketing copy — UI skin only */
export const WORD_COUNT = 850;
export const COVERAGE_CLAIM = 90;
/** 对外展示用，避免过于精确 */
export const COVERAGE_MARKETING_LABEL = '90%+';
export const SCENE_TARGET_COUNT = 50;
export const DIALOGUE_TARGET_COUNT = 5410;
export const DIALOGUE_MARKETING_LABEL = '5410+';
export const DIALOGUE_PROGRESS_LABEL = '对话入库进度';

/** App logo 品牌渐变 — 120° 深绿 → 浅绿 */
export const BRAND_GRADIENT = 'linear-gradient(120deg, #1f6b3f 0%, #2f7d4f 45%, #5cb377 100%)';
export const BRAND_GRADIENT_HOVER =
  'linear-gradient(120deg, #1a5e36 0%, #286942 45%, #52a86c 100%)';

/** Landing 浮层底 — 与薄荷背景同调、略浅，非纯白 */
export const LANDING_SURFACE_BG = '#f6fbf8';
/** Landing 浮层边框 — logo 色系极浅渐变，若有若无 */
export const LANDING_BORDER_GRADIENT =
  'linear-gradient(120deg, rgba(31, 107, 63, 0.1) 0%, rgba(47, 125, 79, 0.06) 45%, rgba(92, 179, 119, 0.1) 100%)';

/** 卡片底：logo 同色标，左深右浅（可见渐变，非纯色） */
export const BRAND_GRADIENT_CARD =
  'linear-gradient(to right, #b5d4c3 0%, #c9e2d4 42%, #e0f0e8 100%)';

/** 场景练完进度条 — 暖色，与绿色卡片区隔 */
export const SCENE_PROGRESS_GRADIENT = 'linear-gradient(to right, #c2710a, #f59e0b)';

/** 底部导航与页头品牌 — 统一用「场景口语」，避免与造词纺旧称混用 */
export const ASSEMBLER_NAV_LABEL = '场景口语';
export const ASSEMBLER_NAV_HINT = '850 词 · 50 场景';
export const ASSEMBLER_PAGE_BRAND = ASSEMBLER_NAV_LABEL;

export const MARKETING_HEADLINE = '850 词通关 90% 生活口语';
export const MARKETING_SUBHEADLINE =
  '像追剧一样练英语——每个场景是一部迷你剧，练完今天就能张嘴说';
export const MARKETING_COVERAGE_TAGLINE =
  '不背词表 · 进剧情开口 · 生词一点就懂 · 练完立刻能用';
export const MARKETING_HERO_BADGE = 'Ogden Basic English · 始于 1930 · 一壶老酒，越陈越香';

export interface MarketingValueProp {
  emoji: string;
  title: string;
  desc: string;
}

export const MARKETING_VALUE_PROPS: MarketingValueProp[] = [
  { emoji: '⚡', title: '3 周开口', desc: '每天 1 场景，高频生活全覆盖' },
  { emoji: '🎯', title: '850 词够用', desc: '告别万词焦虑，90% 对话够用' },
  { emoji: '🎬', title: '追剧式练', desc: '连续故事有起伏，记句型不记单词' },
];

export const MARKETING_BEFORE_AFTER = {
  before: '背了 3000 English words，点餐还是愣住',
  after: '练完超市场景，问价结账脱口而出',
} as const;

export interface LandingFeatureCopy {
  title: string;
  desc: string;
}

/** Landing 页卖点 — 顺序即展示优先级 */
export const LANDING_FEATURES: LandingFeatureCopy[] = [
  { title: 'AI 陪练', desc: '仅用 850 词根畅聊' },
  { title: '看图说话', desc: '每张词配图，抽象词一点就秒懂' },
  { title: '场景里学', desc: '追剧式练，不背单词' },
  { title: '跟读模仿', desc: '逐句练到脱口而出' },
];

export const FORMULA_RULE_LABEL = '句型规则';
export const SCENE_LIST_TITLE = '全部场景';
export const SCENE_LIST_SUBTITLE = '按使用频率排序 · 点进即可练对话';

/** 场景效果感知文案 — 按 sceneKey 映射 */
export const SCENE_OUTCOME_LINES: Record<string, string> = {
  Shopping: '逛超市问价结账，全程不卡壳',
  Restaurant: '入座点菜买单，像本地人一样自然',
  'Making a Phone Call': '电话预约挂号，开口就有底气',
  Health: '跟医生描述症状，不再只会指身体',
  Transport: '坐车问路转车，到站心里有数',
  Travel: '购票进站乘车，旅途全程能交流',
  Work: '办公室寒暄协作，职场不再沉默',
  'At School': '课堂提问作业，学校场景全覆盖',
  'Asking Directions': '街头问路指路，迷路也能自救',
  'Going to the Store': '便利店速购速走，日常零压力',
  'The Family': '晚饭桌边聊天，家人话题接得住',
  Social: '朋友聚会寒暄，社交不再尬场',
  'The Weather': '聊天气定穿搭，寒暄开场很自然',
  Time: '约时间对地点，计划说得清清楚楚',
  'Online Shopping': '网购下单收货，线上生活无障碍',
  Banking: '银行办业务，柜台对话不慌张',
  'Renting a Room': '看房谈租金，租房全程自己搞定',
  Emergency: '紧急求助报警，关键时刻能救命',
  'The House': '居家各房间活动，生活英语全覆盖',
  Mailing: '邮局寄包裹，填单付款一次过',
  Haircut: '理发店沟通发型，想要的说得清',
  'Gas Station': '加油付款继续走，自驾出行无忧',
  'Moving House': '搬家打包搬运，大件小事都能聊',
  Smartphone: '手机拍照发消息，数字生活会用英语',
  WiFi: '连 WiFi 排故障，网络问题自己解决',
  'Video Call': '视频通话寒暄，远程见面不尴尬',
  Email: '读信写回复，职场邮件能应付',
  'Online Banking': '网银转账缴费，线上金融说得明白',
  Internet: '上网搜资料，信息获取不靠猜',
  'Social Media': '发帖互动回复，社交媒体能参与',
  'My Room': '整理房间休息，个人空间能描述',
  Sports: '运动健身聊天，操场球场都能融入',
  'The Body': '指认身体说感受，看病运动都管用',
  'Tech Support': '报修描述故障，技术支持能沟通',
  Password: '找回重置密码，账号安全自己搞定',
  App: '下载注册用应用，新软件快速上手',
  Download: '下载打开文件，资料获取无障碍',
  Search: '搜索筛选信息，遇到问题自己查',
  Streaming: '选片观看讨论，娱乐休闲能参与',
  Gaming: '联机协作通关，游戏社交两不误',
  Feelings: '说出内心感受，情绪表达更真实',
  Happy: '分享开心事，好消息说得生动',
  Sad: '倾诉难过事，低谷时有人能听懂',
  Angry: '表达不满和解，冲突沟通不升级',
  Nervous: '考前紧张缓解，重要时刻能镇定',
  Surprised: '意外惊喜反应，真实情绪说得出口',
  Disappointed: '失望后调整计划，挫折面前不沉默',
  Animals: '看动物喂食互动，宠物话题接得住',
  Nature: '户外漫步聊自然，风景天气都能说',
  Dancing: '学舞步上台表演，兴趣社交两不误',
};

export function getSceneOutcomeLine(sceneKey: string, titleZh: string): string {
  return SCENE_OUTCOME_LINES[sceneKey] ?? `练完「${titleZh}」，出国也能张嘴说`;
}
