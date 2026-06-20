export type AffixResult = {
  result: string;
  cn: string;
  desc: string;
};

// Database of valid affix combinations
export const VALID_AFFIXES: Record<string, AffixResult> = {
  "work -S": { result: "works", cn: "著作 / 工厂 / 作品", desc: "名词加复数 -s。在基本英语中，works 也可特指工厂或著作。" },
  "work -ER": { result: "worker", cn: "工人 / 劳动者", desc: "名词加 -er 变动作执行人。无拼写变化。" },
  "work -ING": { result: "working", cn: "工作中的 / 动名词", desc: "名词加 -ing 变主动进行分词或动名词形式。" },
  "work -ED": { result: "worked", cn: "已工作的 / 加工过的", desc: "名词加 -ed 变被动或已完成状态。" },

  "play -S": { result: "plays", cn: "剧本 / 戏剧 / 游戏", desc: "名词加复数 -s。" },
  "play -ER": { result: "player", cn: "运动员 / 播放器", desc: "名词加 -er 变运动员或工具。" },
  "play -ING": { result: "playing", cn: "在玩 / 进行中", desc: "名词加 -ing 变进行时态分词。" },
  "play -ED": { result: "played", cn: "玩过的 / 发生过的", desc: "名词加 -ed 变过去完成状态。" },

  "quick -LY": { result: "quickly", cn: "快速地", desc: "性质词（形容词）加 -ly 变副词，修饰动作。" },
  
  "happy UN-": { result: "unhappy", cn: "不快乐的", desc: "性质词前加 un- 表示相反状态的否定前缀。" },
  "happy -LY": { result: "happily", cn: "快乐地", desc: "辅音字母 + y 结尾，变 y 为 i，再加 -ly 变副词。" },
  
  "stop -ER": { result: "stopper", cn: "塞子 / 阻挡物", desc: "重读闭音节以单辅音结尾，双写末尾辅音 p，加 -er。" },
  "stop -ING": { result: "stopping", cn: "中止中 / 停下", desc: "双写末尾辅音 p，加 -ing。" },
  "stop -ED": { result: "stopped", cn: "已停止的 / 被阻挡的", desc: "双写末尾辅音 p，加 -ed 变完成/被动状态。" },
  "stop -S": { result: "stops", cn: "停止点 / 车站", desc: "直接加 -s 变复数名词。" },

  "change -ING": { result: "changing", cn: "改变中 / 变化中的", desc: "词尾是不发音的哑 e，去掉哑 e 再加 -ing。" },
  "change -ED": { result: "changed", cn: "已被改变的", desc: "去掉哑 e，加 -ed 变被动或完成状态。" },
  "change -S": { result: "changes", cn: "变化 (复数)", desc: "名词变复数直接加 -s。" },

  "safe -LY": { result: "safely", cn: "安全地", desc: "性质词直接加 -ly 变副词，保留哑 e（无须去掉，因为 -ly 是辅音开头）。" },
  "safe UN-": { result: "unsafe", cn: "不安全的", desc: "前缀 un- 表示否定的性质词。" },

  "sad -LY": { result: "sadly", cn: "悲伤地", desc: "性质词直接加 -ly 变副词。" },
  "sad UN-": { result: "unsad", cn: "不悲伤的 (常用于口语)", desc: "加 un- 表示相反情绪。" },

  "open -ING": { result: "opening", cn: "开口 / 孔 / 开始", desc: "直接加 -ing 变表示空间的名称或动作进行。" },
  "open -ED": { result: "opened", cn: "已打开的", desc: "直接加 -ed 变状态分词。" },
  "open -S": { result: "opens", cn: "打开点 (复数)", desc: "名词复数形式。" },

  "close -ED": { result: "closed", cn: "关闭的", desc: "以哑 e 结尾，去 e 加 -ed 变状态分词。" },
  "close -S": { result: "closes", cn: "关闭点 (复数)", desc: "名词复数形式。" },

  "fold -ED": { result: "folded", cn: "已折叠的", desc: "直接加 -ed 变完成分词。" },
  "fold UN-": { result: "unfold", cn: "展开 / 展现", desc: "加 un- 表达折叠的反向动作（展开）。" },
  "fold -S": { result: "folds", cn: "折皱 / 折痕", desc: "名词复数形式。" }
};

export type CompoundWord = {
  a: string;
  b: string;
  result: string;
  cn: string;
  desc: string;
};

// Database of standard accepted compounds
export const COMPOUNDS_DB: CompoundWord[] = [
  { a: "milk", b: "man", result: "milkman", cn: "送奶工", desc: "牛奶 + 男人 ➔ 特指挨家挨户递送牛奶的职业工人。" },
  { a: "post", b: "man", result: "postman", cn: "邮递员", desc: "邮政 + 男人 ➔ 传递信件的信使、邮递员。" },
  { a: "rain", b: "coat", result: "raincoat", cn: "雨衣", desc: "雨 + 外套 ➔ 挡雨的防护性外套。" },
  { a: "sun", b: "light", result: "sunlight", cn: "阳光", desc: "太阳 + 光 ➔ 太阳发射的光芒。" },
  { a: "bed", b: "room", result: "bedroom", cn: "卧室", desc: "床 + 房间 ➔ 放置床铺用于睡觉的居室。" },
  { a: "rail", b: "way", result: "railway", cn: "铁路", desc: "铁轨 + 道路 ➔ 铺设铁轨供火车通行的道路。" },
  { a: "sun", b: "down", result: "sundown", cn: "日落", desc: "太阳 + 向下 ➔ 太阳下落的时刻，即黄昏。" },
  { a: "day", b: "light", result: "daylight", cn: "日光 / 白天", desc: "白天 + 光 ➔ 白昼的自然光线。" },
  { a: "back", b: "bone", result: "backbone", cn: "脊梁骨 / 骨干", desc: "背部 + 骨头 ➔ 支撑身体的脊椎骨，引申为团队的骨干力量。" },
  { a: "foot", b: "step", result: "footstep", cn: "脚步声 / 足迹", desc: "脚 + 步伐 ➔ 踩在地面上的脚印或发出的声音。" },
  { a: "in", b: "put", result: "input", cn: "输入", desc: "进入 + 放置 ➔ 向内部灌注数据、资源或能量。" },
  { a: "out", b: "put", result: "output", cn: "输出 / 产量", desc: "往外 + 放置 ➔ 从生产线产出并推向外部的物资或产量。" },
  { a: "some", b: "one", result: "someone", cn: "某人", desc: "一些 + 一个 ➔ 模糊指代的某个人。" },
  { a: "any", b: "thing", result: "anything", cn: "任何事物", desc: "任何 + 事情 ➔ 指代任意物体或事件。" },
  { a: "every", b: "where", result: "everywhere", cn: "到处 / 处处", desc: "每一个 + 哪里 ➔ 指代一切空间位置。" },
  { a: "week", b: "end", result: "weekend", cn: "周末", desc: "星期 + 结束 ➔ 一周结束的两天（星期六、星期日）。" },
  { a: "yester", b: "day", result: "yesterday", cn: "昨天", desc: "先前 + 白天 ➔ 当前日期的前一天。" }
];

export type BypassingCase = {
  suffix: string;
  replaces: string;
  rootWord: string;
  formula: string;
  allowed: string;
  cn: string;
};

// Defined properly to prevent runtime ReferenceErrors
export const BYPASS_CASES: BypassingCase[] = [
  { suffix: "-ify", replaces: "beautify", rootWord: "beauty", formula: "make + beautiful", allowed: "make beautiful", cn: "美化" },
  { suffix: "-ness", replaces: "sadness", rootWord: "sad", formula: "state of being + sad", allowed: "state of being sad", cn: "悲伤" },
  { suffix: "-ment", replaces: "movement", rootWord: "move", formula: "act of + moving", allowed: "act of moving", cn: "移动/运动" },
  { suffix: "-less", replaces: "homeless", rootWord: "home", formula: "without + home", allowed: "without a home", cn: "无家可归" },
  { suffix: "-ize", replaces: "memorize", rootWord: "memory", formula: "keep in + memory", allowed: "keep in memory", cn: "记住 / 熟记" },
];
