import { useState } from "react";
import { speakText } from "../data/speak";

type AffixResult = {
  result: string;
  cn: string;
  desc: string;
};

// Database of valid affix combinations
const VALID_AFFIXES: Record<string, AffixResult> = {
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

type CompoundWord = {
  a: string;
  b: string;
  result: string;
  cn: string;
  desc: string;
};

// Database of standard accepted compounds
const COMPOUNDS_DB: CompoundWord[] = [
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

type BypassingCase = {
  suffix: string;
  replaces: string;
  rootWord: string;
  formula: string;
  allowed: string;
  cn: string;
};

// Defined properly to prevent runtime ReferenceErrors
const BYPASS_CASES: BypassingCase[] = [
  { suffix: "-ify", replaces: "beautify", rootWord: "beauty", formula: "make + beautiful", allowed: "make beautiful", cn: "美化" },
  { suffix: "-ness", replaces: "sadness", rootWord: "sad", formula: "state of being + sad", allowed: "state of being sad", cn: "悲伤" },
  { suffix: "-ment", replaces: "movement", rootWord: "move", formula: "act of + moving", allowed: "act of moving", cn: "移动/运动" },
  { suffix: "-less", replaces: "homeless", rootWord: "home", formula: "without + home", allowed: "without a home", cn: "无家可归" },
  { suffix: "-ize", replaces: "memorize", rootWord: "memory", formula: "keep in + memory", allowed: "keep in memory", cn: "记住 / 熟记" },
];

// Visual SVG generator for Affixes and Compounds
function VectorGraphic({ word }: { word: string }) {
  const strokeColor = "var(--accent)";
  const strokeWarm = "var(--accent-warm)";
  const mainColor = "var(--ink)";
  const faintColor = "var(--border)";
  const fillAccentSoft = "var(--accent-soft)";

  const styleTag = `
    .stroke-main { stroke: ${mainColor}; fill: none; stroke-width: 2.2; stroke-linecap: round; }
    .stroke-accent { stroke: ${strokeColor}; fill: none; stroke-width: 2.2; stroke-linecap: round; }
    .fill-soft { fill: ${fillAccentSoft}; fill-opacity: 0.4; }
    
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-12px); }
    }
    .ani-bounce { animation: bounce 1.8s infinite ease-in-out; }
    
    @keyframes spin {
      100% { transform: rotate(360deg); }
    }
    .ani-spin { transform-origin: 50px 50px; animation: spin 4s infinite linear; }
    
    @keyframes ripple {
      0% { r: 5px; opacity: 0.8; }
      100% { r: 25px; opacity: 0; }
    }
    .ani-ripple { transform-origin: 50px 50px; animation: ripple 2s infinite ease-out; }
  `;

  let scene = null;

  switch (word) {
    // Affixes
    case "worker":
      scene = (
        <g>
          <circle cx="50" cy="50" r="14" stroke={mainColor} strokeWidth="2" fill="none" className="ani-spin" strokeDasharray="6 3" />
          <circle cx="50" cy="50" r="6" fill={strokeColor} />
          <line x1="30" y1="50" x2="70" y2="50" stroke={strokeWarm} strokeWidth="1.8" className="ani-spin" />
        </g>
      );
      break;
    case "working":
      scene = (
        <g>
          <circle cx="50" cy="50" r="18" stroke={faintColor} strokeWidth="1.5" fill="none" />
          <path d="M50 32 A18 18 0 0 1 68 50" stroke={strokeColor} strokeWidth="3.5" fill="none" strokeLinecap="round" className="ani-spin" />
          <circle cx="50" cy="50" r="4" fill={mainColor} />
        </g>
      );
      break;
    case "worked":
      scene = (
        <g>
          <rect x="25" y="25" width="50" height="50" rx="6" className="stroke-main fill-soft" />
          <path d="M38 52 L46 60 L62 42" stroke="#10b981" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      );
      break;
    case "works":
      scene = (
        <g>
          <path d="M20 70 V45 L35 55 V45 L50 55 V45 L65 55 V70 Z" className="stroke-main fill-soft" />
          <line x1="20" y1="70" x2="80" y2="70" stroke={mainColor} strokeWidth="2.5" />
          <path d="M72 40 V70" stroke={strokeColor} strokeWidth="4" />
        </g>
      );
      break;
    case "player":
      scene = (
        <g>
          <path d="M35 30 H65 V45 C65 55, 35 55, 35 45 Z" className="stroke-main fill-soft" />
          <path d="M50 53 V68 M40 68 H60" stroke={mainColor} strokeWidth="2.5" />
          <circle cx="50" cy="38" r="4" fill={strokeWarm} />
        </g>
      );
      break;
    case "playing":
      scene = (
        <g>
          <line x1="20" y1="75" x2="80" y2="75" stroke={mainColor} strokeWidth="2.5" />
          <g className="ani-bounce">
            <circle cx="50" cy="45" r="8.5" fill={strokeColor} />
          </g>
        </g>
      );
      break;
    case "played":
      scene = (
        <g>
          <circle cx="50" cy="50" r="16" fill={fillAccentSoft} />
          <path d="M50 34 A16 16 0 1 0 66 50" stroke={strokeColor} strokeWidth="2" fill="none" />
          <path d="M46 30 L50 34 L46 38" stroke={strokeColor} strokeWidth="2" fill="none" />
          <circle cx="50" cy="50" r="3" fill={mainColor} />
        </g>
      );
      break;
    case "plays":
      scene = (
        <g>
          <rect x="22" y="25" width="56" height="50" className="stroke-main fill-soft" />
          <path d="M22 25 Q35 55, 50 25 Q65 55, 78 25" stroke={strokeColor} strokeWidth="2.2" fill="none" />
        </g>
      );
      break;
    case "happily":
      scene = (
        <g>
          <circle cx="50" cy="50" r="20" className="stroke-main fill-soft" />
          <circle cx="42" cy="45" r="2.5" fill={mainColor} />
          <circle cx="58" cy="45" r="2.5" fill={mainColor} />
          <path d="M38 56 Q50 68, 62 56" stroke={strokeColor} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </g>
      );
      break;
    case "unhappy":
      scene = (
        <g>
          <circle cx="50" cy="50" r="20" className="stroke-main fill-soft" />
          <circle cx="42" cy="45" r="2.5" fill={mainColor} />
          <circle cx="58" cy="45" r="2.5" fill={mainColor} />
          <path d="M38 62 Q50 50, 62 62" stroke="#dc2626" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </g>
      );
      break;
    case "quickly":
      scene = (
        <g>
          <path d="M60 40 L40 60" stroke={strokeColor} strokeWidth="3.5" strokeLinecap="round" />
          <path d="M50 30 L65 35 L70 50" stroke={strokeColor} strokeWidth="2" fill="none" />
          <path d="M30 70 L35 65" stroke={strokeWarm} strokeWidth="2" strokeDasharray="3 2" />
        </g>
      );
      break;
    case "stopper":
      scene = (
        <g>
          <path d="M35 30 H65 V45 L70 70 H30 L35 45 Z" stroke={mainColor} strokeWidth="2.2" fill="none" />
          <rect x="42" y="32" width="16" height="15" rx="2" fill={strokeColor} />
        </g>
      );
      break;
    case "stopping":
      scene = (
        <g>
          <polygon points="50,22 69,31 69,53 50,62 31,53 31,31" className="stroke-main fill-soft" />
          <circle cx="50" cy="42" r="10" stroke="#dc2626" strokeWidth="2" fill="none" />
        </g>
      );
      break;
    case "stopped":
      scene = (
        <g>
          <polygon points="50,20 71,29 71,55 50,64 29,55 29,29" fill="#dc2626" stroke="#fff" strokeWidth="1.5" />
          <line x1="42" y1="36" x2="58" y2="48" stroke="#fff" strokeWidth="3" />
          <line x1="58" y1="36" x2="42" y2="48" stroke="#fff" strokeWidth="3" />
        </g>
      );
      break;
    case "changing":
      scene = (
        <g>
          <circle cx="50" cy="50" r="18" stroke={strokeColor} strokeWidth="2.2" strokeDasharray="25 10" fill="none" className="ani-spin" />
          <path d="M62 38 L68 44 L60 48" stroke={strokeColor} strokeWidth="2" fill="none" />
          <path d="M38 62 L32 56 L40 52" stroke={strokeColor} strokeWidth="2" fill="none" />
        </g>
      );
      break;
    case "changed":
      scene = (
        <g>
          <rect x="28" y="28" width="44" height="44" rx="10" className="stroke-main fill-soft" />
          <circle cx="50" cy="50" r="14" stroke={strokeColor} strokeWidth="2.2" fill="none" />
        </g>
      );
      break;
    case "safely":
      scene = (
        <g>
          <path d="M30 30 C30 30, 50 22, 50 22 C50 22, 70 30, 70 30 C70 50, 50 68, 50 68 C50 68, 30 50, 30 30 Z" className="stroke-accent fill-soft" />
          <path d="M42 46 L47 51 L58 38" stroke="#10b981" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      );
      break;
    case "sadly":
      scene = (
        <g>
          <circle cx="50" cy="50" r="20" className="stroke-main fill-soft" />
          <circle cx="42" cy="45" r="2.5" fill={mainColor} />
          <circle cx="58" cy="45" r="2.5" fill={mainColor} />
          <path d="M38 62 Q50 52, 62 62" stroke={mainColor} strokeWidth="2" fill="none" />
          <path d="M42 50 C40 53, 44 55, 42 58 C40 55, 44 53, 42 50" fill={strokeColor} />
        </g>
      );
      break;
    case "opening":
      scene = (
        <g>
          <path d="M30 50 H70 V75 H30 Z" className="stroke-main fill-soft" />
          <path d="M30 50 L20 38 M70 50 L80 38" stroke={strokeColor} strokeWidth="2.2" />
        </g>
      );
      break;
    case "closed":
      scene = (
        <g>
          <rect x="32" y="48" width="36" height="26" rx="4" className="stroke-main fill-soft" />
          <path d="M40 48 V36 C40 28, 60 28, 60 36 V48" stroke={strokeColor} strokeWidth="3" fill="none" />
        </g>
      );
      break;
    case "folded":
      scene = (
        <g>
          <rect x="25" y="32" width="50" height="36" rx="3" className="stroke-main fill-soft" />
          <path d="M25 32 L50 52 L75 32" stroke={strokeColor} strokeWidth="2" fill="none" />
        </g>
      );
      break;
    case "unfold":
      scene = (
        <g>
          <rect x="22" y="32" width="56" height="36" rx="2" className="stroke-main fill-soft" />
          <circle cx="34" cy="50" r="4" fill={strokeWarm} />
          <circle cx="66" cy="50" r="4" fill={strokeWarm} />
          <line x1="42" y1="50" x2="58" y2="50" stroke={strokeColor} strokeWidth="2.5" />
        </g>
      );
      break;

    // Compounds
    case "milkman":
      scene = (
        <g>
          <path d="M25 32 H45 V68 H25 Z" className="stroke-main fill-soft" />
          <line x1="35" y1="32" x2="35" y2="68" stroke={mainColor} strokeWidth="1.2" strokeDasharray="3 2" />
          <path d="M31 32 V25 H39 V32" stroke={mainColor} strokeWidth="2" fill="none" />
          <circle cx="65" cy="38" r="8" fill={strokeWarm} />
          <path d="M55 70 V52 C55 48, 75 48, 75 52 V70" stroke={strokeColor} strokeWidth="3" />
        </g>
      );
      break;
    case "postman":
      scene = (
        <g>
          <rect x="20" y="42" width="30" height="20" rx="2" className="stroke-main fill-soft" />
          <path d="M20 42 L35 52 L50 42" stroke={mainColor} strokeWidth="1.5" fill="none" />
          <circle cx="68" cy="38" r="7" fill={strokeColor} />
          <path d="M58 70 V50 C58 46, 78 46, 78 50 V70" stroke={mainColor} strokeWidth="2" />
        </g>
      );
      break;
    case "raincoat":
      scene = (
        <g>
          <path d="M30 35 L42 22 L58 22 L70 35 L62 42 L58 35 V75 H42 V35 L38 42 Z" className="stroke-accent fill-soft" />
          <line x1="25" y1="12" x2="20" y2="18" stroke={strokeWarm} strokeWidth="1.5" />
          <line x1="45" y1="10" x2="40" y2="16" stroke={strokeWarm} strokeWidth="1.5" />
          <line x1="65" y1="12" x2="60" y2="18" stroke={strokeWarm} strokeWidth="1.5" />
        </g>
      );
      break;
    case "sunlight":
      scene = (
        <g>
          <circle cx="50" cy="50" r="14" fill={strokeWarm} />
          <path d="M50 20 V30 M50 70 V80 M20 50 H30 M70 50 H80" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" />
          <path d="M29 29 L36 36 M64 64 L71 71 M29 71 L36 64 M64 29 L71 36" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
        </g>
      );
      break;
    case "bedroom":
      scene = (
        <g>
          <rect x="30" y="32" width="14" height="8" rx="1" stroke={mainColor} strokeWidth="1.5" fill="none" />
          <path d="M25 40 H75 V62 M75 48 H25 V68" stroke={strokeColor} strokeWidth="3.2" fill="none" strokeLinecap="round" />
          <rect x="25" y="45" width="50" height="18" fill={fillAccentSoft} />
        </g>
      );
      break;
    case "railway":
      scene = (
        <g>
          <line x1="22" y1="25" x2="22" y2="75" stroke={mainColor} strokeWidth="3" />
          <line x1="78" y1="25" x2="78" y2="75" stroke={mainColor} strokeWidth="3" />
          <line x1="22" y1="35" x2="78" y2="35" stroke={strokeWarm} strokeWidth="2" />
          <line x1="22" y1="50" x2="78" y2="50" stroke={strokeWarm} strokeWidth="2" />
          <line x1="22" y1="65" x2="78" y2="65" stroke={strokeWarm} strokeWidth="2" />
        </g>
      );
      break;
    case "sundown":
      scene = (
        <g>
          <path d="M15 70 Q50 50, 85 70" stroke={mainColor} strokeWidth="2.5" fill="none" />
          <circle cx="50" cy="52" r="10" fill={strokeWarm} />
          <path d="M50 18 V34 M46 30 L50 34 L54 30" stroke={strokeColor} strokeWidth="1.5" fill="none" />
        </g>
      );
      break;
    case "daylight":
      scene = (
        <g>
          <circle cx="50" cy="45" r="15" fill={strokeWarm} />
          <path d="M50 15 V25 M20 45 H30 M80 45 H70 M50 75 V65" stroke={strokeColor} strokeWidth="2.2" />
          <circle cx="50" cy="45" r="28" stroke={strokeColor} strokeWidth="1" strokeDasharray="3 3" fill="none" className="ani-ring" />
        </g>
      );
      break;
    case "backbone":
      scene = (
        <g>
          <circle cx="50" cy="22" r="4.5" fill={strokeColor} />
          <circle cx="50" cy="34" r="5" fill={strokeColor} />
          <circle cx="50" cy="46" r="5.5" fill={strokeColor} />
          <circle cx="50" cy="58" r="6" fill={strokeColor} />
          <circle cx="50" cy="70" r="6.5" fill={strokeColor} />
          <line x1="50" y1="18" x2="50" y2="75" stroke={mainColor} strokeWidth="2" strokeDasharray="2 2" />
        </g>
      );
      break;
    case "footstep":
      scene = (
        <g>
          <ellipse cx="38" cy="35" rx="5" ry="8" fill={strokeWarm} transform="rotate(-15 38 35)" />
          <ellipse cx="62" cy="55" rx="5" ry="8" fill={strokeColor} transform="rotate(15 62 55)" />
        </g>
      );
      break;
    case "input":
      scene = (
        <g>
          <rect x="42" y="30" width="38" height="40" rx="3" className="stroke-main fill-soft" />
          <g className="ani-through">
            <path d="M12 50 H42" stroke={strokeColor} strokeWidth="2.5" />
            <path d="M36 45 L42 50 L36 55" stroke={strokeColor} strokeWidth="2.5" fill="none" />
          </g>
        </g>
      );
      break;
    case "output":
      scene = (
        <g>
          <rect x="20" y="30" width="38" height="40" rx="3" className="stroke-main fill-soft" />
          <g className="ani-through">
            <path d="M38 50 H78" stroke={strokeColor} strokeWidth="2.5" />
            <path d="M72 45 L78 50 L72 55" stroke={strokeColor} strokeWidth="2.5" fill="none" />
          </g>
        </g>
      );
      break;
    case "someone":
      scene = (
        <g>
          <circle cx="50" cy="38" r="10" fill={strokeColor} />
          <path d="M32 72 V60 C32 54, 68 54, 68 60 V72" stroke={mainColor} strokeWidth="2.5" className="fill-soft" />
        </g>
      );
      break;
    case "anything":
      scene = (
        <g>
          <rect x="30" y="35" width="40" height="40" rx="4" className="stroke-main fill-soft" />
          <text x="50" y="60" fill={strokeColor} fontSize="20" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">?</text>
        </g>
      );
      break;
    case "everywhere":
      scene = (
        <g>
          <circle cx="50" cy="50" r="22" className="stroke-main fill-soft" />
          <ellipse cx="50" cy="50" rx="22" ry="8" stroke={mainColor} strokeWidth="1" fill="none" />
          <circle cx="34" cy="46" r="3.5" fill="#dc2626" />
          <circle cx="66" cy="54" r="3.5" fill="#dc2626" />
          <circle cx="50" cy="30" r="3.5" fill="#dc2626" />
        </g>
      );
      break;
    case "weekend":
      scene = (
        <g>
          <rect x="26" y="28" width="48" height="46" rx="4" className="stroke-main fill-soft" />
          <line x1="26" y1="42" x2="74" y2="42" stroke={mainColor} strokeWidth="2" />
          <rect x="36" y="48" width="28" height="18" fill={strokeColor} />
          <text x="50" y="61" fill="#fff" fontSize="8" fontWeight="bold" textAnchor="middle">S-S</text>
        </g>
      );
      break;
    case "yesterday":
      scene = (
        <g>
          <circle cx="50" cy="50" r="20" className="stroke-main fill-soft" />
          <path d="M50 34 V50 L38 50" stroke={strokeColor} strokeWidth="2.2" strokeLinecap="round" />
          <path d="M34 50 A16 16 0 1 1 50 66" stroke={strokeWarm} strokeWidth="1.5" strokeDasharray="3 2" fill="none" />
        </g>
      );
      break;

    default:
      scene = (
        <g>
          <circle cx="50" cy="50" r="16" fill={fillAccentSoft} className="ani-ripple" />
          <circle cx="50" cy="50" r="6" fill={strokeColor} />
        </g>
      );
  }

  return (
    <svg viewBox="0 0 100 100" className="vector-svg" width="100%" height="100%" style={{ maxWidth: "160px", maxHeight: "160px" }}>
      <style>{styleTag}</style>
      {scene}
    </svg>
  );
}

export default function MultiplyMore({ mode = "affixes" }: { mode?: "affixes" | "compounds" }) {
  // Affixes states
  const [activeRoot, setActiveRoot] = useState("work");
  const [activeAffix, setActiveAffix] = useState("-ER");
  const [bypassIdx, setBypassIdx] = useState(0);

  // Compounds states
  const [activeA, setActiveA] = useState("milk");
  const [activeB, setActiveB] = useState("man");

  const affixKey = `${activeRoot} ${activeAffix}`;
  const validAffixEntry = VALID_AFFIXES[affixKey];

  // Dynamically generate unique Word A and Word B lists for Compounds from database
  const wordAList = Array.from(new Set(COMPOUNDS_DB.map(c => c.a))).sort();
  const wordBList = Array.from(new Set(COMPOUNDS_DB.map(c => c.b))).sort();

  const selectedCompound = COMPOUNDS_DB.find(c => c.a === activeA && c.b === activeB);

  const handleSpeak = (text: string) => {
    void speakText(text);
  };

  const getInvalidAffixDetails = (root: string, affix: string) => {
    const isQuality = ["quick", "happy", "sad", "safe"].includes(root);
    if (isQuality && (affix === "-ER" || affix === "-ED" || affix === "-ING" || affix === "-S")) {
      return `⚠️ 不合规派生：\n性质词（形容词如 "${root}"）不支持动作专属后缀（-ER/-ED/-ING/-S）。在基本英语中，性质词的比较级禁止加 -er/-est，必须在词前添加 More/Most 表示（例如：more ${root}），以维持规则高度一致。`;
    }
    if (root === "quick" && affix === "UN-") {
      return `⚠️ 不合规派生：\n性质词 quick 在官方词表中对应的反义词直接收录为 slow，因此严禁派生 unquick。`;
    }
    return `⚠️ 组合不合法：\n词根 "${root}" 无法与词缀 "${affix}" 进行形态拼装。请参照法定派生机制选择合规组合。`;
  };

  const getInvalidCompoundDetails = (a: string, b: string) => {
    return `🚫 非标准复合词：\n虽然 "${a}" 和 "${b}" 都是 Basic English 850 词表中的单词，但它们拼接成的 "${a}${b}" 并不属于标准英语已接受的熟词。基本英语禁止捏造自定义词汇，必须是标准字典里已广泛使用的复合词（例如：bedroom, raincoat, input）。`;
  };

  const inlineStyles = `
    .multiply-dashboard {
      background: var(--bg-card);
      border: 1px solid var(--border-soft);
      border-radius: var(--radius);
      padding: 1.5rem;
      box-shadow: var(--shadow-sm);
      margin-top: 1rem;
    }
    .multiply-stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.75rem;
      margin: 1.25rem 0;
    }
    .multiply-stat-card {
      background: var(--bg-card);
      border: 1px solid var(--border-soft);
      border-radius: 8px;
      padding: 0.75rem 0.5rem;
      text-align: center;
      box-shadow: var(--shadow-sm);
    }
    .multiply-stat-val {
      font-size: 1.4rem;
      font-weight: 800;
      color: var(--accent-deep);
      line-height: 1.2;
    }
    .multiply-stat-val-warm {
      color: var(--accent-warm);
    }
    .multiply-stat-val-gold {
      color: #b45309;
    }
    .multiply-stat-lbl {
      font-size: 0.72rem;
      color: var(--ink-muted);
      margin-top: 0.25rem;
    }
    .morph-visualizer-container {
      display: grid;
      grid-template-columns: 1.2fr 1.8fr;
      gap: 1.5rem;
      align-items: center;
      margin-top: 1.5rem;
      background: var(--bg-card);
      border: 1px solid var(--border-soft);
      border-radius: var(--radius);
      padding: 1.5rem;
      box-shadow: var(--shadow-sm);
    }
    .morph-graphic-box {
      background: linear-gradient(135deg, var(--bg) 0%, rgba(254,243,199,0.06) 100%);
      border: 1px solid var(--border-soft);
      border-radius: 12px;
      display: grid;
      place-items: center;
      padding: 1rem;
      aspect-ratio: 1 / 1;
      animation: tabFadeIn 0.3s ease-out;
    }
    @keyframes tabFadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .morph-word-row {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 1.35rem;
      font-family: var(--mono);
      font-weight: bold;
    }
    .speak-btn {
      background: var(--accent-soft);
      border: 1px solid var(--accent);
      color: var(--accent-deep);
      border-radius: 50%;
      width: 28px;
      height: 28px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      margin-left: 0.5rem;
      padding: 0;
      transition: all 0.2s;
    }
    .speak-btn:hover {
      background: var(--accent);
      color: #fff;
      transform: scale(1.1);
    }
    .bypassing-box {
      margin-top: 2rem;
      border-top: 1px solid var(--border-soft);
      padding-top: 1.5rem;
    }
    .bypassing-dashboard {
      background: linear-gradient(135deg, var(--bg-elevated) 0%, rgba(220,38,38,0.02) 100%);
      border: 1px solid var(--border-soft);
      border-radius: 8px;
      padding: 1rem;
      margin-top: 1rem;
      animation: tabFadeIn 0.3s ease-out;
    }
    @media (max-width: 768px) {
      .morph-visualizer-container {
        grid-template-columns: 1fr;
      }
      .morph-graphic-box {
        aspect-ratio: 1.8 / 1;
        max-height: 160px;
      }
      .multiply-stats-grid {
        grid-template-columns: 1fr 1fr;
      }
    }
  `;

  return (
    <div className="multiply">
      <style>{inlineStyles}</style>

      {/* ============================== */}
      {/* CASE 1: AFFIXES (词缀派生)     */}
      {/* ============================== */}
      {mode === "affixes" && (
        <div className="multiply-dashboard">
          <span className="multiply-kicker" style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--accent)", letterSpacing: "0.06em", fontWeight: "600" }}>
            1. 词缀派生实验室 (Affix Derivation Lab)
          </span>
          <h3 style={{ margin: "0.25rem 0 0.5rem 0" }}>词缀拼装：以动作变形实操为核心</h3>
          
          {/* Stats Header for Affixes - 精确对应可选内容 */}
          <div className="multiply-stats-grid">
            <div className="multiply-stat-card">
              <div className="multiply-stat-val">11</div>
              <div className="multiply-stat-lbl">实验室词根 (Active Roots)</div>
            </div>
            <div className="multiply-stat-card">
              <div className="multiply-stat-val multiply-stat-val-warm">6</div>
              <div className="multiply-stat-lbl">法定词缀 (Approved Affixes)</div>
            </div>
            <div className="multiply-stat-card">
              <div className="multiply-stat-val multiply-stat-val-gold">66</div>
              <div className="multiply-stat-lbl">组合测试可能 (Total Combos)</div>
            </div>
            <div className="multiply-stat-card">
              <div className="multiply-stat-val" style={{ color: "#10b981" }}>35</div>
              <div className="multiply-stat-lbl">成功组装派生词</div>
            </div>
          </div>

          <p style={{ fontSize: "0.82rem", color: "var(--ink-muted)", marginBottom: "1.25rem", lineHeight: "1.5" }}>
            通过严格限定的 6 个词缀派生变形。在下方选择词根和词缀拼装实操，并观察相应的拼写突变规则：
          </p>

          {/* 选词根 */}
          <span style={{ fontSize: "0.78rem", color: "var(--ink-secondary)", fontWeight: "600", display: "block", marginBottom: "0.45rem" }}>
            第一步：选择拼装词根 (11 Roots)
          </span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", marginBottom: "1rem" }}>
            {["work", "play", "quick", "happy", "stop", "change", "safe", "sad", "open", "close", "fold"].map((r) => (
              <button
                key={r}
                type="button"
                style={{
                  background: r === activeRoot ? "var(--accent)" : "var(--bg-elevated)",
                  color: r === activeRoot ? "#fff" : "var(--ink-secondary)",
                  border: "1px solid var(--border-soft)",
                  borderRadius: "5px",
                  padding: "0.25rem 0.55rem",
                  fontSize: "0.8rem",
                  fontFamily: "var(--mono)",
                  cursor: "pointer"
                }}
                onClick={() => setActiveRoot(r)}
              >
                {r}
              </button>
            ))}
          </div>

          {/* 选对应词缀 */}
          <span style={{ fontSize: "0.78rem", color: "var(--ink-secondary)", fontWeight: "600", display: "block", marginBottom: "0.45rem" }}>
            第二步：选择要加的词缀 (6 Affixes)
          </span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", marginBottom: "1.25rem" }}>
            {["-S", "-ER", "-ING", "-ED", "-LY", "UN-"].map((a) => (
              <button
                key={a}
                type="button"
                style={{
                  background: a === activeAffix ? "var(--accent-warm)" : "var(--bg-elevated)",
                  color: a === activeAffix ? "#fff" : "var(--ink-secondary)",
                  border: "1px solid var(--border-soft)",
                  borderRadius: "5px",
                  padding: "0.25rem 0.55rem",
                  fontSize: "0.8rem",
                  fontFamily: "var(--mono)",
                  cursor: "pointer"
                }}
                onClick={() => setActiveAffix(a)}
              >
                {a}
              </button>
            ))}
          </div>

          {/* 拼装实操结果 */}
          <div className="morph-visualizer-container">
            <div className="morph-graphic-box" key={`affix-img-${activeRoot}-${activeAffix}`}>
              <VectorGraphic word={validAffixEntry ? validAffixEntry.result : ""} />
            </div>

            <div className="morph-result" style={{ width: "100%", margin: 0 }} key={`affix-res-${activeRoot}-${activeAffix}`}>
              {validAffixEntry ? (
                <>
                  <div className="morph-word-row">
                    {activeAffix === "UN-" ? (
                      <>
                        <span className="morph-highlight">un</span>
                        <span>+</span>
                        <span>{activeRoot}</span>
                      </>
                    ) : (
                      <>
                        <span>{activeRoot}</span>
                        <span>+</span>
                        <span className="morph-highlight">{activeAffix.replace("-", "").toLowerCase()}</span>
                      </>
                    )}
                    <span>→</span>
                    <span style={{ background: "var(--accent-soft)", padding: "0.2rem 0.5rem", borderRadius: "5px", display: "inline-flex", alignItems: "center" }}>
                      <span style={{ color: "var(--accent-deep)", fontWeight: "bold" }}>{validAffixEntry.result}</span>
                      <button className="speak-btn" onClick={() => handleSpeak(validAffixEntry.result)} title="播放发音" type="button">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                        </svg>
                      </button>
                    </span>
                  </div>
                  
                  <div style={{ marginTop: "0.75rem", fontSize: "0.95rem", color: "var(--ink)" }}>
                    中文释义：<strong>{validAffixEntry.cn}</strong>
                  </div>
                  <p style={{ marginTop: "0.5rem", fontSize: "0.85rem", color: "var(--ink-secondary)", lineHeight: "1.4" }}>
                    {validAffixEntry.desc}
                  </p>
                </>
              ) : (
                <div style={{ color: "#dc2626", fontSize: "0.85rem", background: "rgba(220,38,38,0.04)", border: "1px dashed rgba(220,38,38,0.15)", padding: "1rem", borderRadius: "8px", lineHeight: "1.5", whiteSpace: "pre-line" }}>
                  {getInvalidAffixDetails(activeRoot, activeAffix)}
                </div>
              )}
            </div>
          </div>

          {/* 禁用词缀拆解模拟器 */}
          <div className="bypassing-box">
            <span className="multiply-kicker" style={{ fontSize: "0.72rem", textTransform: "uppercase", color: "#dc2626", letterSpacing: "0.05em", fontWeight: "600" }}>
              💡 词缀禁令拆解模拟器 (Suffix Bypassing Simulator)
            </span>
            <p style={{ fontSize: "0.8rem", color: "var(--ink-muted)", margin: "0.25rem 0 0.75rem 0", lineHeight: "1.4" }}>
              基本英语中禁止使用任何复杂的英语后缀。点击下方查看它们如何用意译在 850 词内实现替换：
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", marginBottom: "0.85rem" }}>
              {BYPASS_CASES.map((b, i) => (
                <button
                  key={b.suffix}
                  type="button"
                  style={{
                    background: i === bypassIdx ? "#dc2626" : "var(--bg-elevated)",
                    color: i === bypassIdx ? "#fff" : "var(--ink-secondary)",
                    border: "1px solid var(--border-soft)",
                    borderRadius: "5px",
                    padding: "0.25rem 0.5rem",
                    fontSize: "0.8rem",
                    fontFamily: "var(--mono)",
                    cursor: "pointer"
                  }}
                  onClick={() => setBypassIdx(i)}
                >
                  {b.suffix} ({b.replaces})
                </button>
              ))}
            </div>

            <div className="bypassing-dashboard" key={`bypass-${bypassIdx}`}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", fontSize: "0.95rem" }}>
                <span style={{ color: "#dc2626", fontWeight: "bold", textDecoration: "line-through" }}>{BYPASS_CASES[bypassIdx].replaces}</span>
                <span style={{ color: "var(--ink-faint)" }}>➔</span>
                <span style={{ color: "var(--ink-muted)", fontSize: "0.8rem" }}>拆为 {BYPASS_CASES[bypassIdx].rootWord} + 禁用 {BYPASS_CASES[bypassIdx].suffix} ➔</span>
                
                <span style={{ background: "rgba(16,185,129,0.08)", color: "#10b981", border: "1px solid rgba(16,185,129,0.15)", padding: "0.15rem 0.5rem", borderRadius: "5px", fontFamily: "var(--mono)", fontWeight: "bold", display: "inline-flex", alignItems: "center" }}>
                  {BYPASS_CASES[bypassIdx].allowed}
                  <button className="speak-btn" onClick={() => handleSpeak(BYPASS_CASES[bypassIdx].allowed)} title="播放发音" type="button" style={{ background: "rgba(16,185,129,0.12)", border: "1px solid #10b981", color: "#10b981" }}>
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                    </svg>
                  </button>
                </span>
              </div>
              <div style={{ fontSize: "0.78rem", color: "var(--ink-faint)", marginTop: "0.5rem" }}>
                * 以 <strong>{BYPASS_CASES[bypassIdx].formula}</strong> 的结构，直接拆解替代普通英语中的名词/动词后缀，完美合规。
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================== */}
      {/* CASE 2: COMPOUNDS (复合词装配器) */}
      {/* ============================== */}
      {mode === "compounds" && (
        <div className="multiply-dashboard">
          <span className="multiply-kicker" style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--accent-warm)", letterSpacing: "0.06em", fontWeight: "600" }}>
            2. 复合词拼接线 (Compound Word Assembler)
          </span>
          <h3 style={{ margin: "0.25rem 0 0.5rem 0" }}>词根拼接：以物理粘合实操为核心</h3>

          {/* Stats Header for Compounds - 完美匹配可选列表 */}
          <div className="multiply-stats-grid">
            <div className="multiply-stat-card">
              <div className="multiply-stat-val">16</div>
              <div className="multiply-stat-lbl">组装左词根 (Word A)</div>
            </div>
            <div className="multiply-stat-card">
              <div className="multiply-stat-val multiply-stat-val-warm">13</div>
              <div className="multiply-stat-lbl">组装右词根 (Word B)</div>
            </div>
            <div className="multiply-stat-card">
              <div className="multiply-stat-val multiply-stat-val-gold">208</div>
              <div className="multiply-stat-lbl">组合测试可能 (Possible Combos)</div>
            </div>
            <div className="multiply-stat-card">
              <div className="multiply-stat-val" style={{ color: "#10b981" }}>17</div>
              <div className="multiply-stat-lbl">合规输出复合词</div>
            </div>
          </div>

          <p style={{ fontSize: "0.82rem", color: "var(--ink-muted)", marginBottom: "1.25rem", lineHeight: "1.5" }}>
            将两个 850 基础词根进行物理粘合。在下方选择左、右构件，进行实时拼接实操测试：
          </p>

          {/* 选择 Word A */}
          <span style={{ fontSize: "0.78rem", color: "var(--ink-secondary)", fontWeight: "600", display: "block", marginBottom: "0.45rem" }}>
            第一步：选择左词根 (Word A)
          </span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", marginBottom: "1rem" }}>
            {wordAList.map((a) => (
              <button
                key={a}
                type="button"
                style={{
                  background: a === activeA ? "var(--accent)" : "var(--bg-elevated)",
                  color: a === activeA ? "#fff" : "var(--ink-secondary)",
                  border: "1px solid var(--border-soft)",
                  borderRadius: "5px",
                  padding: "0.25rem 0.5rem",
                  fontSize: "0.78rem",
                  fontFamily: "var(--mono)",
                  cursor: "pointer"
                }}
                onClick={() => setActiveA(a)}
              >
                {a}
              </button>
            ))}
          </div>

          {/* 选择 Word B */}
          <span style={{ fontSize: "0.78rem", color: "var(--ink-secondary)", fontWeight: "600", display: "block", marginBottom: "0.45rem" }}>
            第二步：选择右词根 (Word B)
          </span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", marginBottom: "1.25rem" }}>
            {wordBList.map((b) => (
              <button
                key={b}
                type="button"
                style={{
                  background: b === activeB ? "var(--accent-warm)" : "var(--bg-elevated)",
                  color: b === activeB ? "#fff" : "var(--ink-secondary)",
                  border: "1px solid var(--border-soft)",
                  borderRadius: "5px",
                  padding: "0.25rem 0.5rem",
                  fontSize: "0.78rem",
                  fontFamily: "var(--mono)",
                  cursor: "pointer"
                }}
                onClick={() => setActiveB(b)}
              >
                {b}
              </button>
            ))}
          </div>

          {/* 拼接动画及展示 */}
          <div className="morph-visualizer-container">
            <div className="morph-graphic-box" key={`comp-img-${activeA}-${activeB}`}>
              <VectorGraphic word={selectedCompound ? selectedCompound.result : ""} />
            </div>

            <div className="morph-result" style={{ width: "100%", margin: 0 }} key={`comp-res-${activeA}-${activeB}`}>
              {selectedCompound ? (
                <>
                  <div className="morph-word-row" style={{ fontSize: "1.25rem" }}>
                    <span className="ani-merge-box-l" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", padding: "0.15rem 0.45rem", borderRadius: "5px" }}>{selectedCompound.a}</span>
                    <span style={{ color: "var(--ink-faint)" }}>+</span>
                    <span className="ani-merge-box-r" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", padding: "0.15rem 0.45rem", borderRadius: "5px" }}>{selectedCompound.b}</span>
                    <span style={{ color: "var(--ink-faint)" }}>→</span>
                    <span style={{ color: "var(--accent-warm)", background: "var(--accent-soft)", padding: "0.2rem 0.6rem", borderRadius: "5px", display: "inline-flex", alignItems: "center" }}>
                      <span style={{ fontWeight: "bold" }}>{selectedCompound.result}</span>
                      <button className="speak-btn" onClick={() => handleSpeak(selectedCompound.result)} title="播放发音" type="button" style={{ background: "rgba(180,83,9,0.12)", border: "1px solid var(--accent-warm)", color: "var(--accent-warm)" }}>
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                        </svg>
                      </button>
                    </span>
                  </div>
                  
                  <div style={{ marginTop: "0.75rem", fontSize: "0.95rem", color: "var(--ink)" }}>
                    中文释义：<strong>{selectedCompound.cn}</strong>
                  </div>
                  <p style={{ marginTop: "0.5rem", fontSize: "0.85rem", color: "var(--ink-secondary)", lineHeight: "1.4" }}>
                    {selectedCompound.desc}
                  </p>
                </>
              ) : (
                <div style={{ color: "#dc2626", fontSize: "0.85rem", background: "rgba(220,38,38,0.04)", border: "1px dashed rgba(220,38,38,0.15)", padding: "1rem", borderRadius: "8px", lineHeight: "1.5", whiteSpace: "pre-line" }}>
                  {getInvalidCompoundDetails(activeA, activeB)}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
