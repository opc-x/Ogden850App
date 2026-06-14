import { useState } from "react";

type GrammarRule = {
  id: number;
  title: string;
  cn: string;
  concept: string;
  examples: { en: string; cn: string; desc?: string }[];
  svgType: string;
};

const RULES: GrammarRule[] = [
  {
    id: 1,
    title: "Plural: -S / -ES / -IES",
    cn: "复数变化规则",
    concept: "与普通英语一致：一般名词加 -s；以咝音（s/sh/ch/x/o）结尾加 -es；辅音 + y 结尾变 y 为 -ies；另有 knife/leaf/shelf 变 -ves，以及 men/feet 等不规则词。",
    examples: [
      { en: "dog → dogs", cn: "狗 → 狗（复数，直接加 -s）" },
      { en: "glass → glasses", cn: "玻璃杯 → 玻璃杯（复数，以咝音结尾加 -es）" },
      { en: "story → stories", cn: "故事 → 故事（复数，辅音+y 变 -ies）" },
      { en: "leaf → leaves / foot → feet", cn: "叶子 → 叶子 / 脚 → 脚（特殊变形）" }
    ],
    svgType: "plural"
  },
  {
    id: 2,
    title: "Noun Derivation: -ER / -ING / -ED",
    cn: "名词派生四种形式",
    concept: "允许在 300 个核心名词（表示动作/过程）后添加后缀派生出：-er（动作执行者/工具）、-ing（动名词）、-ing（形容词，表示主动/进行）、-ed（形容词，表示被动/完成），这些词不占 850 词限额。",
    examples: [
      { en: "work → worker", cn: "工作 → 工人 / 劳动者 (-er 派生)" },
      { en: "work → working (noun)", cn: "工作 → 劳动 / 运作行为 (-ing 名词)" },
      { en: "work → working (adj)", cn: "工作 → 工作中的 (a working man，-ing 形容词)" },
      { en: "work → worked (adj)", cn: "工作 → 经过加工的 (worked metal，-ed 形容词)" }
    ],
    svgType: "derivation"
  },
  {
    id: 3,
    title: "Adverbs: Qualifier + -LY",
    cn: "性质词变副词",
    concept: "性质词（形容词）加 -ly 即可变成修饰状态的副词。拼写注意：以 y 结尾变 y 为 i 再加 -ly；以 le 结尾去 e 变 y（即变整个词尾为 -ly）。",
    examples: [
      { en: "quick → quickly", cn: "快的 → 快地 (直接加 -ly)" },
      { en: "happy → happily", cn: "快乐的 → 快乐地 (y 变 i 加 -ly)" },
      { en: "simple → simply", cn: "简单的 → 简单地 (le 去 e 变 y)" }
    ],
    svgType: "adverb"
  },
  {
    id: 4,
    title: "Comparison: MORE / MOST",
    cn: "比较级与最高级",
    concept: "BE850 默认使用 more (更...) 和 most (最...) 来统一进行比较，避免繁琐词尾。单音节短词口语中也可用 -er/-est，好/坏保留不规则变化 (better/best, worse/worst)。",
    examples: [
      { en: "more complex / most complex", cn: "更复杂 / 最复杂 (标准 degree 表达)" },
      { en: "longer / longest (nearer / nearest)", cn: "更长 / 最长 (短词口语常用例外)" },
      { en: "good → better → best", cn: "好 → 更好 → 最好 (不规则变化例外)" }
    ],
    svgType: "comparison"
  },
  {
    id: 5,
    title: "Opposite: UN- / Antonyms",
    cn: "反义词与 UN- 前缀",
    concept: "可在性质词前加 un- 表示相反概念。若词表里已有成对的反义词（如 good/bad，clean/dirty），应优先使用已有的词以保证纯正。",
    examples: [
      { en: "happy → unhappy", cn: "快乐的 → 不快乐的 (加 un- 反义)" },
      { en: "wise → unwise", cn: "聪明的 → 愚蠢的" },
      { en: "good / bad (clean / dirty)", cn: "好 / 坏 (优先使用词表本身自带的反义词)" }
    ],
    svgType: "opposite"
  },
  {
    id: 6,
    title: "Questions & Negatives: DO",
    cn: "疑问与否定句式",
    concept: "疑问句将 be 动词/情态动词倒装，或插入助动词 do/does/did 引导；否定句在 be 动词后加 not，或在动作词前插入 do not / does not / did not。",
    examples: [
      { en: "Do you see the dog? / Did he go?", cn: "你看见这只狗了吗？ / 他走了吗？(助动词 do 引导疑问)" },
      { en: "I do not see it. / He is not here.", cn: "我看不见它。 / 他不在这里。(否定句结构)" }
    ],
    svgType: "questions"
  },
  {
    id: 7,
    title: "Operator Conjugation",
    cn: "动作词与代词变位",
    concept: "18 个核心 Operator（be, have, do, go 等）随人称和时态标准变位（详见语法表）。Pronouns（代词）拥有标准英语的格变化（I/me/my/mine/myself）。",
    examples: [
      { en: "I go / He goes / They went / She has gone", cn: "我走 / 他走 / 他们走了 / 她已经走了 (go 的人称与时态变位)" },
      { en: "I (主格) → me (宾格) → my (所有格)", cn: "我 → 我 → 我的 (代词格变化)" }
    ],
    svgType: "conjugation"
  },
  {
    id: 8,
    title: "Compound Words",
    cn: "复合词组合规则",
    concept: "允许组合两个已有的 850 词来表达新概念。常见有：名词+名词（milkman）、名词+方向（sundown）、不定代词（someone、anything）。",
    examples: [
      { en: "milk + man → milkman", cn: "牛奶 + 男人 → 送奶工" },
      { en: "sun + down → sundown", cn: "太阳 + 向下 → 日落" },
      { en: "any + thing → anything", cn: "任何 + 东西 → 任何事" }
    ],
    svgType: "compounds"
  },
  {
    id: 9,
    title: "Numbers, Dates & Measures",
    cn: "数字、度量与日期",
    concept: "数字（one, second...）、星期月份（Monday, June...）、货币（dollar...）、度量单位（mile, gram, hour...）直接使用标准英语形式，不占 850 词额度。",
    examples: [
      { en: "One, Two, Three, 100th", cn: "一、二、三、第一百" },
      { en: "Monday, June, 2026", cn: "星期一、六月、2026年" },
      { en: "Mile, Foot, Pound, Dollar", cn: "英里、英尺、磅、美元" }
    ],
    svgType: "measures"
  },
  {
    id: 10,
    title: "International Words",
    cn: "国际通用词与专有名词",
    concept: "包含约 50 个国际通用词（radio, hotel, taxi...）、专有名词（London, George, China...）以及必要行业专业词汇（如医学 penicillin），均直接采用英语常见形式。",
    examples: [
      { en: "hotel, taxi, telephone, radio, police", cn: "旅馆、出租车、电话、收音机、警察 (国际通用词)" },
      { en: "London, George, China", cn: "伦敦、乔治、中国 (专有名词)" },
      { en: "penicillin, bacteria", cn: "青霉素、细菌 (行业/特定任务专业词)" }
    ],
    svgType: "international"
  }
];

function RuleGraphic({ type }: { type: string }) {
  const strokeColor = "var(--accent)";
  const strokeWarm = "var(--accent-warm)";
  const mainColor = "var(--ink)";
  const faintColor = "var(--border)";
  const fillAccentSoft = "var(--accent-soft)";

  const styleTag = `
    .stroke-main { stroke: ${mainColor}; fill: none; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; }
    .stroke-accent { stroke: ${strokeColor}; fill: none; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; }
    .stroke-warm { stroke: ${strokeWarm}; fill: none; stroke-width: 1.8; stroke-linecap: round; }
    .fill-accent { fill: ${strokeColor}; }
    .fill-soft { fill: ${fillAccentSoft}; fill-opacity: 0.45; }
    .text-mono { font-family: var(--mono); font-size: 6.5px; fill: ${mainColor}; text-anchor: middle; }
    .text-mono-accent { font-family: var(--mono); font-size: 6.5px; fill: ${strokeColor}; font-weight: bold; text-anchor: middle; }
    .text-mono-warm { font-family: var(--mono); font-size: 6px; fill: ${strokeWarm}; text-anchor: middle; }

    /* Keyframes */
    @keyframes plural-pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.06); }
    }
    .ani-plural-s {
      transform-origin: 160px 40px;
      animation: plural-pulse 2.2s infinite ease-in-out;
    }

    @keyframes branch-grow {
      0% { stroke-dashoffset: 40; opacity: 0; }
      30% { opacity: 1; }
      70%, 100% { stroke-dashoffset: 0; opacity: 1; }
    }
    .ani-branch {
      stroke-dasharray: 40;
      stroke-dashoffset: 40;
      animation: branch-grow 3s infinite ease-in-out;
    }

    @keyframes ly-drop {
      0% { transform: translateY(-20px); opacity: 0; }
      20% { opacity: 1; }
      50%, 80% { transform: translateY(0); opacity: 1; }
      100% { opacity: 0; }
    }
    .ani-ly {
      animation: ly-drop 2.5s infinite ease-in-out;
    }

    @keyframes bar-grow {
      0% { transform: scaleY(0.15); }
      70%, 100% { transform: scaleY(1); }
    }
    .ani-bar {
      transform-origin: bottom;
      animation: bar-grow 2.5s infinite cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes un-slide {
      0% { transform: translateX(-20px); opacity: 0; }
      20% { opacity: 1; }
      70%, 100% { transform: translateX(0); opacity: 1; }
    }
    .ani-un {
      animation: un-slide 2.8s infinite ease-in-out;
    }

    @keyframes block-slide-q {
      0% { transform: translateX(-40px); opacity: 0; }
      15% { opacity: 1; }
      60%, 100% { transform: translateX(0); opacity: 1; }
    }
    .ani-slide-q {
      animation: block-slide-q 3s infinite ease-in-out;
    }

    @keyframes link-dash {
      0% { stroke-dashoffset: 24; }
      100% { stroke-dashoffset: 0; }
    }
    .ani-link {
      stroke-dasharray: 6 3;
      animation: link-dash 1.5s infinite linear;
    }

    @keyframes merge-left {
      0% { transform: translateX(-10px); }
      50%, 100% { transform: translateX(12px); }
    }
    @keyframes merge-right {
      0% { transform: translateX(10px); }
      50%, 100% { transform: translateX(-12px); }
    }
    .ani-merge-l { animation: merge-left 3s infinite ease-in-out; }
    .ani-merge-r { animation: merge-right 3s infinite ease-in-out; }

    @keyframes clock-spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .ani-clock-hand {
      transform-origin: 165px 40px;
      animation: clock-spin 12s infinite linear;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-4px); }
    }
    .ani-float {
      animation: float 4s infinite ease-in-out;
    }
  `;

  const baseSvgProps = {
    viewBox: "0 0 220 100",
    width: "100%",
    height: "100%",
    className: "vector-svg",
    style: { maxWidth: "280px", maxHeight: "130px" }
  };

  switch (type) {
    case "plural":
      return (
        <svg {...baseSvgProps}>
          <style>{styleTag}</style>
          
          {/* Column 1: -S (dog -> dogs) */}
          <g transform="translate(10, 5)">
            <rect x="5" y="25" width="18" height="18" rx="3" className="stroke-main fill-soft" />
            <circle cx="14" cy="34" r="2.5" fill={mainColor} />
            <text x="14" y="54" className="text-mono">dog</text>

            <path d="M28 34 H36" stroke={faintColor} strokeWidth="1.2" />
            <path d="M33 31 L37 34 L33 37" stroke={faintColor} strokeWidth="1.2" fill="none" />

            <g className="ani-plural-s">
              <rect x="42" y="25" width="18" height="18" rx="3" className="stroke-accent fill-soft" />
              <circle cx="49" cy="31" r="2" fill={strokeColor} />
              <circle cx="53" cy="37" r="2" fill={strokeColor} />
              <circle cx="9" cy="-9" r="6.5" fill={strokeWarm} transform="translate(48, 25)" />
              <text x="57" y="20" fontSize="7px" fontFamily="var(--mono)" fill="#fff" fontWeight="bold" textAnchor="middle">s</text>
            </g>
            <text x="52" y="54" className="text-mono-accent">dogs</text>
          </g>

          {/* Divider */}
          <line x1="82" y1="10" x2="82" y2="90" stroke={faintColor} strokeWidth="1" strokeDasharray="3 3" />

          {/* Column 2: -ES (glass -> glasses) */}
          <g transform="translate(80, 5)">
            <rect x="10" y="25" width="18" height="18" rx="3" className="stroke-main fill-soft" />
            <path d="M14 29 L24 29 L22 40 L16 40 Z" fill="none" stroke={mainColor} strokeWidth="1.5" />
            <text x="19" y="54" className="text-mono">glass</text>

            <path d="M33 34 H41" stroke={faintColor} strokeWidth="1.2" />
            <g className="ani-plural-s" style={{ animationDelay: "0.4s" }}>
              <rect x="46" y="25" width="18" height="18" rx="3" className="stroke-accent fill-soft" />
              <circle cx="9" cy="-9" r="7.5" fill={strokeWarm} transform="translate(51, 25)" />
              <text x="60" y="20.5" fontSize="6.5px" fontFamily="var(--mono)" fill="#fff" fontWeight="bold" textAnchor="middle">es</text>
            </g>
            <text x="56" y="54" className="text-mono-accent">glasses</text>
          </g>

          {/* Divider */}
          <line x1="148" y1="10" x2="148" y2="90" stroke={faintColor} strokeWidth="1" strokeDasharray="3 3" />

          {/* Column 3: -IES (story -> stories) */}
          <g transform="translate(145, 5)">
            <text x="18" y="36" className="text-mono">stor<tspan fill={strokeColor} fontWeight="bold">y</tspan></text>
            <text x="18" y="54" className="text-mono">story</text>

            <path d="M33 34 H41" stroke={faintColor} strokeWidth="1.2" />
            <g className="ani-plural-s" style={{ animationDelay: "0.8s" }}>
              <circle cx="9" cy="-9" r="8.5" fill={strokeWarm} transform="translate(43, 30)" />
              <text x="52" y="25.5" fontSize="6px" fontFamily="var(--mono)" fill="#fff" fontWeight="bold" textAnchor="middle">ies</text>
            </g>
            <text x="52" y="54" className="text-mono-accent">stories</text>
          </g>
        </svg>
      );

    case "derivation":
      return (
        <svg {...baseSvgProps}>
          <style>{styleTag}</style>
          
          {/* Central Root: work */}
          <rect x="96" y="38" width="28" height="24" rx="5" className="stroke-main fill-soft" />
          <text x="110" y="53" className="text-mono" fontWeight="bold">work</text>

          {/* Top-Left Branch: -ER (Noun) */}
          <path d="M96 46 C80 34, 65 30, 48 30" className="stroke-warm ani-branch" />
          <rect x="16" y="20" width="30" height="16" rx="3" className="stroke-accent" />
          <text x="31" y="30" className="text-mono-accent">-er</text>
          <text x="31" y="44" fontSize="5px" fill={strokeColor} textAnchor="middle" fontFamily="var(--sans)">worker (名词)</text>

          {/* Bottom-Left Branch: -ING (Noun) */}
          <path d="M96 54 C80 66, 65 70, 48 70" className="stroke-warm ani-branch" style={{ animationDelay: "0.5s" }} />
          <rect x="16" y="62" width="30" height="16" rx="3" className="stroke-accent" />
          <text x="31" y="72" className="text-mono-accent">-ing</text>
          <text x="31" y="86" fontSize="5px" fill={strokeColor} textAnchor="middle" fontFamily="var(--sans)">working (行为/名)</text>

          {/* Top-Right Branch: -ING (Adj) */}
          <path d="M124 46 C140 34, 155 30, 172 30" className="stroke-warm ani-branch" style={{ animationDelay: "1s" }} />
          <rect x="174" y="20" width="30" height="16" rx="3" className="stroke-accent" />
          <text x="189" y="30" className="text-mono-accent">-ing</text>
          <text x="189" y="44" fontSize="5px" fill={strokeColor} textAnchor="middle" fontFamily="var(--sans)">working (进行/形)</text>

          {/* Bottom-Right Branch: -ED (Adj) */}
          <path d="M124 54 C140 66, 155 70, 172 70" className="stroke-warm ani-branch" style={{ animationDelay: "1.5s" }} />
          <rect x="174" y="62" width="30" height="16" rx="3" className="stroke-accent" />
          <text x="189" y="72" className="text-mono-accent">-ed</text>
          <text x="189" y="86" fontSize="5px" fill={strokeColor} textAnchor="middle" fontFamily="var(--sans)">worked (完成/形)</text>
        </svg>
      );

    case "adverb":
      return (
        <svg {...baseSvgProps}>
          <style>{styleTag}</style>
          
          {/* Example 1: quick + ly -> quickly */}
          <g transform="translate(10, 0)">
            <rect x="5" y="15" width="28" height="18" rx="3" className="stroke-main fill-soft" />
            <text x="19" y="26" className="text-mono">quick</text>
            <text x="39" y="27" fontSize="10px" fill={faintColor} fontWeight="bold" textAnchor="middle">+</text>
            
            <g className="ani-ly">
              <rect x="47" y="15" width="16" height="18" rx="3" className="stroke-accent" />
              <text x="55" y="26" className="text-mono-accent" fill="#fff">ly</text>
            </g>

            <path d="M68 24 H76" stroke={faintColor} strokeWidth="1.2" />
            <text x="88" y="26" className="text-mono-accent" textAnchor="start">quickly</text>
          </g>

          {/* Example 2: happy -> happily (y -> i + ly) */}
          <g transform="translate(10, 42)">
            <rect x="5" y="15" width="28" height="18" rx="3" className="stroke-main fill-soft" />
            <text x="19" y="26" className="text-mono">happ<tspan fill={strokeColor} fontWeight="bold">y</tspan></text>
            <text x="39" y="27" fontSize="10px" fill={faintColor} fontWeight="bold" textAnchor="middle">→</text>
            
            <g className="ani-ly" style={{ animationDelay: "0.8s" }}>
              <text x="56" y="26" className="text-mono-accent">happ<tspan fill={strokeWarm} fontWeight="bold">i</tspan> + ly</text>
            </g>

            <path d="M82 24 H88" stroke={faintColor} strokeWidth="1.2" />
            <text x="96" y="26" className="text-mono-accent" textAnchor="start">happily</text>
          </g>

          {/* Speed line vectors on bottom */}
          <path d="M15 90 H205" stroke={strokeWarm} strokeWidth="1" strokeDasharray="3 3" />
        </svg>
      );

    case "comparison":
      return (
        <svg {...baseSvgProps}>
          <style>{styleTag}</style>
          
          {/* Bar 1: Base */}
          <g className="ani-bar">
            <rect x="25" y="45" width="18" height="35" rx="2" className="stroke-main fill-soft" />
            <text x="34" y="92" className="text-mono">sharp</text>
            <text x="34" y="40" fontSize="5.5px" fill={mainColor} textAnchor="middle">原级</text>
          </g>

          {/* Bar 2: More */}
          <g className="ani-bar" style={{ animationDelay: "0.3s" }}>
            <rect x="65" y="25" width="18" height="55" rx="2" className="stroke-accent" />
            <text x="74" y="92" className="text-mono-accent">more sharp</text>
            <text x="74" y="20" fontSize="5.5px" fill={strokeColor} fontWeight="bold" textAnchor="middle">比较级</text>
          </g>

          {/* Bar 3: Most */}
          <g className="ani-bar" style={{ animationDelay: "0.6s" }}>
            <rect x="115" y="10" width="18" height="70" rx="2" stroke={strokeWarm} strokeWidth="1.8" fill="none" />
            <text x="124" y="92" className="text-mono-warm">most sharp</text>
            <text x="124" y="5" fontSize="5.5px" fill={strokeWarm} fontWeight="bold" textAnchor="middle">最高级</text>
          </g>

          {/* Note Box for Exceptions on the right */}
          <g transform="translate(150, 10)">
            <rect x="0" y="0" width="60" height="70" rx="4" fill="var(--bg)" stroke={faintColor} strokeWidth="1" />
            <text x="30" y="12" fontSize="5.5px" fontWeight="bold" fill={strokeColor} textAnchor="middle" fontFamily="var(--sans)">例外 (Exceptions)</text>
            <text x="30" y="24" fontSize="5px" fill={mainColor} textAnchor="middle" fontFamily="var(--mono)">longer / longest</text>
            <text x="30" y="34" fontSize="5px" fill={mainColor} textAnchor="middle" fontFamily="var(--mono)">nearer / nearest</text>
            <text x="30" y="44" stroke={strokeWarm} strokeWidth="0.3" fontSize="5px" fill={strokeWarm} textAnchor="middle" fontFamily="var(--mono)">--- 不规则 ---</text>
            <text x="30" y="54" fontSize="5px" fontWeight="bold" fill={mainColor} textAnchor="middle" fontFamily="var(--mono)">good → better → best</text>
            <text x="30" y="64" fontSize="5px" fontWeight="bold" fill={mainColor} textAnchor="middle" fontFamily="var(--mono)">bad → worse → worst</text>
          </g>
        </svg>
      );

    case "opposite":
      return (
        <svg {...baseSvgProps}>
          <style>{styleTag}</style>
          
          {/* Part A: UN- prefix morphing */}
          <g transform="translate(10, 5)">
            <rect x="5" y="15" width="30" height="20" rx="3" className="stroke-main fill-soft" />
            <text x="20" y="27" className="text-mono">happy</text>
            
            <g className="ani-un">
              <rect x="42" y="15" width="16" height="20" rx="3" className="stroke-accent" />
              <text x="50" y="27" className="text-mono-accent" fill="#fff">un-</text>
            </g>

            <path d="M64 25 H72" stroke={faintColor} strokeWidth="1.2" />
            <text x="76" y="27" className="text-mono-accent" textAnchor="start">unhappy</text>
          </g>

          {/* Part B: Existing Antonym Pairs */}
          <g transform="translate(10, 48)">
            <rect x="5" y="10" width="32" height="18" rx="3" className="stroke-main fill-soft" />
            <text x="21" y="21" className="text-mono">good</text>

            {/* Bidirectional Arrow */}
            <path d="M44 19 H58" stroke={strokeWarm} strokeWidth="1.5" />
            <path d="M48 15 L43 19 L48 23" stroke={strokeWarm} strokeWidth="1.5" fill="none" />
            <path d="M54 15 L59 19 L54 23" stroke={strokeWarm} strokeWidth="1.5" fill="none" />
            <text x="51" y="12" fontSize="5px" fill={strokeWarm} textAnchor="middle" fontFamily="var(--sans)">反义</text>

            <rect x="65" y="10" width="32" height="18" rx="3" className="stroke-accent fill-soft" />
            <text x="81" y="21" className="text-mono-accent">bad</text>
          </g>

          {/* Antonym Clean/Dirty */}
          <g transform="translate(118, 48)">
            <rect x="5" y="10" width="32" height="18" rx="3" className="stroke-main fill-soft" />
            <text x="21" y="21" className="text-mono">clean</text>

            <path d="M44 19 H58" stroke={strokeWarm} strokeWidth="1.5" />
            <path d="M48 15 L43 19 L48 23" stroke={strokeWarm} strokeWidth="1.5" fill="none" />
            <path d="M54 15 L59 19 L54 23" stroke={strokeWarm} strokeWidth="1.5" fill="none" />

            <rect x="65" y="10" width="32" height="18" rx="3" className="stroke-accent fill-soft" />
            <text x="81" y="21" className="text-mono-accent">dirty</text>
          </g>
        </svg>
      );

    case "questions":
      return (
        <svg {...baseSvgProps}>
          <style>{styleTag}</style>
          
          {/* Question structure */}
          <g transform="translate(5, 5)">
            <text x="10" y="14" fontSize="6px" fontWeight="bold" fill={strokeWarm} fontFamily="var(--sans)">疑问句 (Interrogative):</text>
            
            {/* Sliding Do block */}
            <g className="ani-slide-q">
              <rect x="10" y="20" width="16" height="20" rx="3" className="stroke-accent" />
              <text x="18" y="32" className="text-mono-accent" fill="#fff">Do</text>
            </g>

            <g transform="translate(30, 0)">
              <rect x="0" y="20" width="16" height="20" rx="3" className="stroke-main fill-soft" />
              <text x="8" y="32" className="text-mono">you</text>
            </g>

            <g transform="translate(50, 0)">
              <rect x="0" y="20" width="16" height="20" rx="3" className="stroke-main fill-soft" />
              <text x="8" y="32" className="text-mono">see</text>
            </g>

            <g transform="translate(70, 0)">
              <rect x="0" y="20" width="18" height="20" rx="3" className="stroke-main fill-soft" />
              <text x="9" y="32" className="text-mono">the dog?</text>
            </g>
          </g>

          {/* Negative structure */}
          <g transform="translate(5, 50)">
            <text x="10" y="14" fontSize="6px" fontWeight="bold" fill={strokeWarm} fontFamily="var(--sans)">否定句 (Negative):</text>

            <g transform="translate(10, 0)">
              <rect x="0" y="20" width="14" height="20" rx="3" className="stroke-main fill-soft" />
              <text x="7" y="32" className="text-mono">I</text>
            </g>

            {/* Helper do not inserted */}
            <g transform="translate(28, 0)" className="ani-slide-q" style={{ animationDelay: "0.6s" }}>
              <rect x="0" y="20" width="28" height="20" rx="3" className="stroke-accent" />
              <text x="14" y="32" className="text-mono-accent" fill="#fff">do not</text>
            </g>

            <g transform="translate(60, 0)">
              <rect x="0" y="20" width="16" height="20" rx="3" className="stroke-main fill-soft" />
              <text x="8" y="32" className="text-mono">see</text>
            </g>

            <g transform="translate(80, 0)">
              <rect x="0" y="20" width="14" height="20" rx="3" className="stroke-main fill-soft" />
              <text x="7" y="32" className="text-mono">it.</text>
            </g>
          </g>
        </svg>
      );

    case "conjugation":
      return (
        <svg {...baseSvgProps}>
          <style>{styleTag}</style>
          
          {/* Verb conjugations (go) */}
          <g transform="translate(10, 5)">
            <text x="15" y="12" fontSize="5.5px" fontWeight="bold" fill={strokeColor} fontFamily="var(--sans)">Operators 变位 (e.g. go)</text>
            <text x="15" y="26" className="text-mono" textAnchor="start">I / You / We → <tspan fill={strokeColor} fontWeight="bold">go</tspan></text>
            <text x="15" y="38" className="text-mono" textAnchor="start">He / She / It → <tspan fill={strokeColor} fontWeight="bold">goes</tspan></text>
            <text x="15" y="50" className="text-mono" textAnchor="start">过去 (Past) → <tspan fill={strokeWarm} fontWeight="bold">went</tspan></text>
            <text x="15" y="62" className="text-mono" textAnchor="start">分词 (Participle) → <tspan fill={strokeWarm} fontWeight="bold">gone / going</tspan></text>
          </g>

          {/* Divider */}
          <line x1="120" y1="10" x2="120" y2="90" stroke={faintColor} strokeWidth="1" strokeDasharray="3 3" />

          {/* Pronoun Cases */}
          <g transform="translate(130, 5)">
            <text x="40" y="12" fontSize="5.5px" fontWeight="bold" fill={strokeColor} textAnchor="middle" fontFamily="var(--sans)">代词格变化 (Pronouns)</text>
            
            <rect x="5" y="20" width="70" height="12" rx="2" className="stroke-main fill-soft" />
            <text x="40" y="28" fontSize="5.5px" fontFamily="var(--mono)" fill={mainColor} textAnchor="middle">I (主) → me (宾)</text>
            
            <rect x="5" y="38" width="70" height="12" rx="2" className="stroke-main fill-soft" />
            <text x="40" y="46" fontSize="5.5px" fontFamily="var(--mono)" fill={mainColor} textAnchor="middle">my (形容词主) → mine (代)</text>
            
            <rect x="5" y="56" width="70" height="12" rx="2" className="stroke-accent fill-soft" />
            <text x="40" y="64" fontSize="5.5px" fontFamily="var(--mono)" fill={strokeColor} fontWeight="bold" textAnchor="middle">myself (反身)</text>
          </g>
        </svg>
      );

    case "compounds":
      return (
        <svg {...baseSvgProps}>
          <style>{styleTag}</style>
          
          {/* Compound Example 1 */}
          <g transform="translate(5, 5)">
            <g className="ani-merge-l">
              <rect x="10" y="10" width="22" height="18" rx="3" className="stroke-main fill-soft" />
              <text x="21" y="21" className="text-mono">milk</text>
            </g>
            <text x="39" y="22" fontSize="8px" fill={faintColor} textAnchor="middle">+</text>
            <g className="ani-merge-r">
              <rect x="47" y="10" width="20" height="18" rx="3" className="stroke-main fill-soft" />
              <text x="57" y="21" className="text-mono">man</text>
            </g>
            <text x="73" y="22" fontSize="8px" fill={faintColor} textAnchor="middle">=</text>
            <rect x="80" y="10" width="34" height="18" rx="3" className="stroke-accent fill-soft" />
            <text x="97" y="21" className="text-mono-accent">milkman</text>
          </g>

          {/* Compound Example 2 */}
          <g transform="translate(5, 36)">
            <g className="ani-merge-l" style={{ animationDelay: "0.5s" }}>
              <rect x="10" y="10" width="22" height="18" rx="3" className="stroke-main fill-soft" />
              <text x="21" y="21" className="text-mono">sun</text>
            </g>
            <text x="39" y="22" fontSize="8px" fill={faintColor} textAnchor="middle">+</text>
            <g className="ani-merge-r" style={{ animationDelay: "0.5s" }}>
              <rect x="47" y="10" width="20" height="18" rx="3" className="stroke-main fill-soft" />
              <text x="57" y="21" className="text-mono">down</text>
            </g>
            <text x="73" y="22" fontSize="8px" fill={faintColor} textAnchor="middle">=</text>
            <rect x="80" y="10" width="34" height="18" rx="3" className="stroke-accent fill-soft" />
            <text x="97" y="21" className="text-mono-accent">sundown</text>
          </g>

          {/* Compound Example 3 */}
          <g transform="translate(5, 67)">
            <g className="ani-merge-l" style={{ animationDelay: "1s" }}>
              <rect x="10" y="10" width="22" height="18" rx="3" className="stroke-main fill-soft" />
              <text x="21" y="21" className="text-mono">some</text>
            </g>
            <text x="39" y="22" fontSize="8px" fill={faintColor} textAnchor="middle">+</text>
            <g className="ani-merge-r" style={{ animationDelay: "1s" }}>
              <rect x="47" y="10" width="20" height="18" rx="3" className="stroke-main fill-soft" />
              <text x="57" y="21" className="text-mono">one</text>
            </g>
            <text x="73" y="22" fontSize="8px" fill={faintColor} textAnchor="middle">=</text>
            <rect x="80" y="10" width="34" height="18" rx="3" className="stroke-accent fill-soft" />
            <text x="97" y="21" className="text-mono-accent">someone</text>
          </g>
        </svg>
      );

    case "measures":
      return (
        <svg {...baseSvgProps}>
          <style>{styleTag}</style>
          
          {/* Ruler on bottom */}
          <g transform="translate(10, 65)">
            <path d="M0 10 H130 V18 H0 Z" stroke={mainColor} strokeWidth="1.5" fill="none" />
            <path d="M10 10 V14 M20 10 V14 M30 10 V14 M40 10 V14 M50 10 V14 M60 10 V14 M70 10 V14 M80 10 V14 M90 10 V14 M100 10 V14 M110 10 V14 M120 10 V14" stroke={mainColor} strokeWidth="1" />
            <text x="65" y="6" fontSize="5.5px" fontFamily="var(--mono)" fill={mainColor} textAnchor="middle">1 inch / 1 mile</text>
          </g>

          {/* Calendar page on left */}
          <g transform="translate(15, 10)">
            <rect x="0" y="0" width="30" height="34" rx="2" stroke={faintColor} strokeWidth="1.2" fill="none" />
            <path d="M0 10 H30" stroke={faintColor} strokeWidth="1.2" />
            <rect x="0" y="0" width="30" height="10" fill={strokeWarm} />
            <text x="15" y="28" fontSize="13px" fontFamily="var(--serif)" fill={strokeColor} fontWeight="bold" textAnchor="middle">7</text>
            <text x="15" y="7" fontSize="5px" fontFamily="var(--sans)" fill="#fff" textAnchor="middle">JUNE</text>
          </g>

          {/* Clock in center */}
          <g transform="translate(70, 0)">
            <circle cx="15" cy="24" r="14" stroke={faintColor} strokeWidth="1.5" fill="none" />
            <line x1="15" y1="24" x2="15" y2="15" stroke={strokeColor} strokeWidth="1.8" strokeLinecap="round" className="ani-clock-hand" transform="translate(-150, -16)" />
            <line x1="15" y1="24" x2="21" y2="24" stroke={strokeColor} strokeWidth="1.2" strokeLinecap="round" />
            <circle cx="15" cy="24" r="1.5" fill={strokeColor} />
            <text x="15" y="44" fontSize="5px" fontFamily="var(--mono)" fill={mainColor} textAnchor="middle">12:15 PM</text>
          </g>

          {/* Currency / Numbers on the right */}
          <g transform="translate(145, 12)">
            <rect x="0" y="0" width="55" height="63" rx="3" fill="var(--bg)" stroke={faintColor} strokeWidth="1" />
            <text x="27.5" y="12" fontSize="5.5px" fontWeight="bold" fill={strokeColor} textAnchor="middle" fontFamily="var(--sans)">数字与货币</text>
            <text x="27.5" y="24" fontSize="5px" fill={mainColor} textAnchor="middle" fontFamily="var(--mono)">1, 2, 3, 100</text>
            <text x="27.5" y="34" fontSize="5px" fill={mainColor} textAnchor="middle" fontFamily="var(--mono)">first, second</text>
            <text x="27.5" y="46" stroke={strokeWarm} strokeWidth="0.3" fontSize="5px" fill={strokeWarm} textAnchor="middle" fontFamily="var(--mono)">--- 钱币 ---</text>
            <text x="27.5" y="56" fontSize="6px" fontWeight="bold" fill={strokeColor} textAnchor="middle" fontFamily="var(--mono)">$ 10.50 / £ 5</text>
          </g>
        </svg>
      );

    case "international":
      return (
        <svg {...baseSvgProps}>
          <style>{styleTag}</style>
          
          {/* Central Globe */}
          <g className="ani-float" transform="translate(90, 42)">
            <circle cx="20" cy="20" r="18" className="stroke-main fill-soft" />
            <path d="M20 2 C10 8, 10 32, 20 38 C30 32, 30 8, 20 2" stroke={mainColor} strokeWidth="1.2" fill="none" />
            <path d="M2 20 H38" stroke={mainColor} strokeWidth="1.2" fill="none" />
            <text x="20" y="22" fontSize="4.5px" fontWeight="bold" fill={strokeColor} textAnchor="middle" fontFamily="var(--sans)">GLOBAL</text>
          </g>

          {/* Surrounding word bubbles with orbit links */}
          {/* Bubble 1: taxi (International) */}
          <g className="ani-plural-s" style={{ transformOrigin: "40px 20px" }}>
            <rect x="15" y="10" width="22" height="12" rx="3" stroke={strokeWarm} strokeWidth="1.2" fill="none" />
            <text x="26" y="18" fontSize="5.5px" fontFamily="var(--mono)" fill={strokeColor} textAnchor="middle">taxi</text>
          </g>

          {/* Bubble 2: hotel (International) */}
          <g className="ani-plural-s" style={{ animationDelay: "0.5s", transformOrigin: "185px 15px" }}>
            <rect x="160" y="8" width="24" height="12" rx="3" stroke={strokeWarm} strokeWidth="1.2" fill="none" />
            <text x="172" y="16" fontSize="5.5px" fontFamily="var(--mono)" fill={strokeColor} textAnchor="middle">hotel</text>
          </g>

          {/* Bubble 3: radio (International) */}
          <g className="ani-plural-s" style={{ animationDelay: "1s", transformOrigin: "180px 75px" }}>
            <rect x="155" y="68" width="24" height="12" rx="3" stroke={strokeWarm} strokeWidth="1.2" fill="none" />
            <text x="167" y="76" fontSize="5.5px" fontFamily="var(--mono)" fill={strokeColor} textAnchor="middle">radio</text>
          </g>

          {/* Bubble 4: London (Proper Name) */}
          <g className="ani-plural-s" style={{ animationDelay: "1.5s", transformOrigin: "35px 75px" }}>
            <rect x="10" y="68" width="28" height="12" rx="3" stroke={strokeColor} strokeWidth="1.2" fill="none" />
            <text x="24" y="76" fontSize="5.5px" fontFamily="var(--mono)" fill={strokeColor} textAnchor="middle">London</text>
          </g>

          {/* Bubble 5: penicillin (Technical Word) */}
          <g className="ani-plural-s" style={{ animationDelay: "0.8s", transformOrigin: "110px 10px" }}>
            <rect x="85" y="2" width="36" height="12" rx="3" stroke={strokeColor} strokeWidth="1.2" fill="none" strokeDasharray="2 2" />
            <text x="103" y="10" fontSize="5px" fontFamily="var(--mono)" fill={mainColor} textAnchor="middle">penicillin</text>
          </g>
        </svg>
      );

    default:
      return null;
  }
}

export default function GrammarVisual() {
  const [selectedRule, setSelectedRule] = useState<GrammarRule>(RULES[0]);

  return (
    <div className="operators-visualizer directions-visualizer">
      <div className="visualizer-header">
        <span className="machine-kicker">规则卡可视化</span>
        <h3>BE850 语法规则卡：图解 10 条核心语法</h3>
        <p>
          Ogden 设计的基本英语，<strong>其语法和普通英语完全一样</strong>，只是通过消除普通动词简化了结构。
          以下是这 10 条基本语法规则的图解说明。
        </p>
      </div>

      <div className="visualizer-body">
        {/* 左侧：10条规则列表 */}
        <div className="operators-grid-panel" style={{ gap: "0.6rem" }}>
          <div className="op-group-section" style={{ background: "transparent", border: "none", padding: 0 }}>
            <div className="op-group-chips">
              {RULES.map((rule) => {
                const isSelected = selectedRule.id === rule.id;
                return (
                  <button
                    key={rule.id}
                    type="button"
                    className={`op-chip${isSelected ? " active" : ""}`}
                    onClick={() => setSelectedRule(rule)}
                    style={{ width: "100%", justifyContent: "flex-start", padding: "0.45rem 0.75rem" }}
                  >
                    <span className="op-chip-en" style={{ fontSize: "0.85rem", fontWeight: "bold" }}>
                      {rule.id}. {rule.title}
                    </span>
                    <span className="op-chip-cn" style={{ opacity: isSelected ? 0.9 : 0.65 }}>
                      ({rule.cn})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 右侧：图解细节展示卡片 */}
        <div className="operator-vector-card" key={selectedRule.id}>
          <div className="vector-card-head">
            <div className="vector-card-title-row">
              <span className="card-op-en" style={{ fontSize: "1.4rem", fontFamily: "var(--sans)", fontWeight: "bold" }}>
                {selectedRule.title}
              </span>
            </div>
            <div className="vector-card-tag" style={{ background: "var(--accent-soft)", color: "var(--accent-deep)", fontWeight: "bold" }}>
              {selectedRule.cn}
            </div>
          </div>

          {/* SVG 图解区域 */}
          <div className="vector-card-graphic" style={{ background: "linear-gradient(135deg, var(--bg) 0%, rgba(254,243,199,0.06) 100%)", minHeight: "160px" }}>
            <RuleGraphic type={selectedRule.svgType} />
          </div>

          {/* 规则文本说明 */}
          <div className="vector-card-info">
            <div className="vector-info-section">
              <h5 style={{ fontSize: "0.75rem", color: "var(--ink-faint)", fontWeight: "600", letterSpacing: "0.06em", margin: "0 0 0.25rem 0" }}>
                规则定义说明 (Rule Concept)
              </h5>
              <p style={{ fontSize: "0.85rem", color: "var(--ink-muted)", lineHeight: "1.6", margin: "0" }}>
                {selectedRule.concept}
              </p>
            </div>

            <div className="vector-info-section">
              <h5 style={{ fontSize: "0.75rem", color: "var(--ink-faint)", fontWeight: "600", letterSpacing: "0.06em", margin: "0 0 0.25rem 0" }}>
                规则应用实例 (Examples)
              </h5>
              <ul className="vector-example-list" style={{ fontSize: "0.85rem", color: "var(--ink-muted)", margin: "0", paddingLeft: "1.1rem" }}>
                {selectedRule.examples.map((ex, i) => (
                  <li key={i} style={{ marginBottom: "0.35rem" }}>
                    <strong style={{ fontFamily: "var(--mono)", color: "var(--ink)" }}>{ex.en}</strong>
                    <span style={{ margin: "0 0.35rem", color: "var(--ink-faint)" }}>—</span>
                    <span style={{ fontSize: "0.8rem", color: "var(--ink-secondary)" }}>{ex.cn}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
