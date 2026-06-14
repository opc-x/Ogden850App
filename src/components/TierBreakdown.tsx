import { useState } from "react";

type Subclass = {
  name: string;
  count: number;
  desc: string;
};

type SentenceInfo = {
  template: string;
  hover: Record<string, string>;
};

type Tier = {
  id: string;
  name: string;
  en: string;
  count: number;
  color: string;
  what: string;
  examples: string[];
  priority: string;
  subclasses: Subclass[];
  sentence: SentenceInfo;
};

const TIERS: Tier[] = [
  {
    id: "ops",
    name: "运作词",
    en: "Operations",
    count: 100,
    color: "#b45309",
    what: "包含 18 个核心动词构件（Operators）、代词、介词、连词——造起基本英语句子的骨架与杠杆。它们是全站最核心、杠杆率最高、需要最先掌握的板块。",
    examples: ["come", "get", "put", "I", "you", "the", "in", "on", "and", "not"],
    priority: "最先学习 · 杠杆最高",
    subclasses: [
      { name: "核心动作词 (Operators)", count: 18, desc: "come, get, put, take, be, do..." },
      { name: "方向词与介词 (Directions)", count: 20, desc: "up, down, in, on, through..." },
      { name: "代词与格变位 (Pronouns)", count: 12, desc: "I, he, she, you, who..." },
      { name: "限定/连接词 (Logical)", count: 50, desc: "the, a, and, because, of, not..." }
    ],
    sentence: {
      template: "[I] [go] [to] [the] [house].",
      hover: {
        "[I]": "代词 (Pronoun) — 第一人称单数主格",
        "[go]": "核心 Operator — 物理空间位移",
        "[to]": "方向词 (Direction) — 指向终点矢量",
        "[the]": "限定词 (Determiner) — 定冠词特指",
        "[house]": "具体名词 (来自第 2 层 Picturable 形象层)"
      }
    }
  },
  {
    id: "pic",
    name: "看得见的物",
    en: "Picturable",
    count: 200,
    color: "#15803d",
    what: "具体名词（动物、日常工具、身体部位、环境实物等）。这类词的特点是可以在现实物理世界中找到具体实物，实现“一个词配一张图”的直观映射，极易记忆。",
    examples: ["dog", "hand", "door", "tree", "foot", "eye", "ship", "house"],
    priority: "尽早掌握 · 视觉映射",
    subclasses: [
      { name: "身体与感官 (Body parts)", count: 35, desc: "hand, foot, eye, mouth, hair..." },
      { name: "动物与植物 (Life forms)", count: 30, desc: "dog, cat, bee, bird, tree, leaf..." },
      { name: "日常器物 (Household)", count: 75, desc: "bag, basket, bed, bottle, box, key..." },
      { name: "环境与建筑 (Environment)", count: 60, desc: "house, door, window, wall, street..." }
    ],
    sentence: {
      template: "The [dog] is in the [house].",
      hover: {
        "The": "Operations 层特指冠词",
        "[dog]": "看得见的物 (Animal) — 具体形象名词",
        "is": "Operations 层系动词变位",
        "in": "Operations 层方向词 — 容纳状态",
        "the": "Operations 层冠词",
        "[house]": "看得见的物 (Building) — 具体建筑名词"
      }
    }
  },
  {
    id: "gen",
    name: "抽象一般物",
    en: "General things",
    count: 400,
    color: "#1d6fa5",
    what: "数量最大、也是最花时间的一块，代表各种抽象概念、状态、社会关系等。掌握这一层能让你实现“名词化”，用 Operator + 抽象名词组合成任何高级动词。",
    examples: ["reason", "system", "idea", "fact", "way", "part", "act", "view"],
    priority: "稳步推进 · 词汇量最大",
    subclasses: [
      { name: "动作与行为 (Activities & Acts)", count: 120, desc: "act, attack, discussion, work..." },
      { name: "思想与概念 (Abstract Concepts)", count: 110, desc: "idea, reason, fact, system, rule..." },
      { name: "自然与物质 (Materials & States)", count: 100, desc: "air, metal, ice, weather, fire..." },
      { name: "社会与关系 (Social & Relations)", count: 70, desc: "family, country, peace, agreement..." }
    ],
    sentence: {
      template: "We have an [agreement] on this [system].",
      hover: {
        "We": "Operations 层代词",
        "have": "Operations 核心 Operator — 持有/经历",
        "an": "Operations 层不定冠词",
        "[agreement]": "抽象一般物 (Social) — 表示多方达成的契约合意",
        "on": "Operations 层介词 — 关于/处于轨道",
        "this": "Operations 层指示限定词",
        "[system]": "抽象一般物 (Concept) — 规律/架构体系"
      }
    }
  },
  {
    id: "qual",
    name: "一般性质词",
    en: "Qualities",
    count: 100,
    color: "#7e22ce",
    what: "即形容词，用于修饰名词以表达事物的特征或状态。语法上允许加 -ly 变为副词，或使用 more/most 表示比较级，与名词共同构成修饰结构。",
    examples: ["good", "long", "clear", "new", "true", "open", "free", "wise"],
    priority: "与名词结合 · 性质修饰",
    subclasses: [
      { name: "主观/基本状态 (Core States)", count: 65, desc: "good, beautiful, new, open, free..." },
      { name: "物理与感官 (Physical Qualities)", count: 35, desc: "cold, warm, sweet, red, wide, tall..." }
    ],
    sentence: {
      template: "This is a [beautiful] and [clean] town.",
      hover: {
        "This": "Operations 层代词",
        "is": "Operations 层系动词",
        "a": "Operations 层冠词",
        "[beautiful]": "性质词 (Quality) — 描述主观审美感受",
        "and": "Operations 层并列连词",
        "[clean]": "性质词 (Quality) — 描述客观卫生状态",
        "town": "Picturable 层具体名词"
      }
    }
  },
  {
    id: "opp",
    name: "反义性质词",
    en: "Opposites",
    count: 50,
    color: "#be123c",
    what: "是性质词对应的相反词。通过成对对比记忆（例如 good 对 bad），可以大幅削减单词在大脑中的存储碎片，提高词汇联想与检索速度。",
    examples: ["good / bad", "long / short", "awake / asleep", "true / false"],
    priority: "成对记忆 · 反义关联",
    subclasses: [
      { name: "对应反义词 (Antonym Qualities)", count: 50, desc: "bad, short, dark, wrong, dry, small..." }
    ],
    sentence: {
      template: "A [foolish] man makes [dirty] water clean.",
      hover: {
        "A": "Operations 层冠词",
        "[foolish]": "反义性质词 (Opposite of wise) — 愚蠢的",
        "man": "General Things 层名词",
        "makes": "Operations 核心 Operator — 造成/改变状态",
        "[dirty]": "反义性质词 (Opposite of clean) — 脏的",
        "water": "General Things 层名词",
        "clean": "Qualities 层性质词 — 干净的"
      }
    }
  }
];

function TierIcon({ id }: { id: string }) {
  switch (id) {
    case "ops":
      return (
        <svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      );
    case "pic":
      return (
        <svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      );
    case "gen":
      return (
        <svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-2.5 2.5" />
          <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 2.5 2.5" />
          <line x1="12" y1="12" x2="21" y2="12" />
          <line x1="12" y1="7" x2="19" y2="7" />
          <line x1="12" y1="17" x2="19" y2="17" />
          <line x1="12" y1="12" x2="3" y2="12" />
          <line x1="12" y1="7" x2="5" y2="7" />
          <line x1="12" y1="17" x2="5" y2="17" />
        </svg>
      );
    case "qual":
      return (
        <svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
        </svg>
      );
    case "opp":
      return (
        <svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 3h5v5" />
          <path d="M8 21H3v-5" />
          <path d="M21 3L12 12" />
          <path d="M3 21l9-9" />
        </svg>
      );
    default:
      return null;
  }
}

export default function TierBreakdown({ compact = false }: { compact?: boolean }) {
  const [active, setActive] = useState("ops");
  const [hoverWord, setHoverWord] = useState<string | null>(null);

  const tier = TIERS.find((t) => t.id === active)!;

  const styleInline = `
    .tier-seg {
      position: relative;
      overflow: hidden;
      transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s;
    }
    .tier-seg:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(26,24,20,0.12);
    }
    .tier-seg.active {
      transform: translateY(-2px);
      box-shadow: 0 0 0 2px #1a1814, 0 6px 18px rgba(26,24,20,0.16);
      z-index: 10;
    }
    .tier-detail-card {
      background: var(--bg-card);
      border: 1px solid var(--border-soft);
      border-radius: var(--radius);
      padding: 1.5rem;
      box-shadow: var(--shadow-sm);
      animation: tabFadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes tabFadeIn {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .grid-subclass {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 0.85rem;
      margin-top: 1.25rem;
    }
    .subclass-item {
      background: var(--bg-elevated);
      border: 1px solid var(--border-soft);
      border-radius: 8px;
      padding: 0.75rem 1rem;
      transition: border-color 0.15s;
    }
    .subclass-item:hover {
      border-color: var(--seg);
    }
    .sentence-block {
      background: rgba(26,24,20,0.03);
      border: 1px dashed var(--border);
      border-radius: 8px;
      padding: 1rem;
      margin-top: 1.5rem;
      font-family: var(--sans);
    }
    .sentence-word-span {
      display: inline-block;
      margin: 0 0.15rem;
      padding: 0.15rem 0.35rem;
      border-radius: 4px;
      cursor: help;
      transition: background 0.15s, color 0.15s;
    }
    .sentence-word-span.highlighted {
      background: var(--seg);
      color: #fff;
      font-weight: bold;
    }
    .sentence-word-span.normal-word {
      opacity: 0.85;
    }
  `;

  return (
    <div className={`tiers${compact ? " tiers--compact" : ""}`}>
      <style>{styleInline}</style>

      {!compact && (
        <div className="tiers-head">
          <span className="tiers-kicker">认知结构图解</span>
          <h3>Ogden Basic English 850 词分层体系</h3>
          <p>
            BE850 的词汇不是杂乱平铺的。条形图的宽度代表了各类词汇在 850 词表中的数量占比。
            点击任意图表块，可探索其在句子中的认知定位与学习优先级。
          </p>
        </div>
      )}

      {/* 比例条网格 */}
      <div className="tier-bar" role="tablist" aria-label="850 词分层比例">
        {TIERS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={t.id === active}
            className={`tier-seg${t.id === active ? " active" : ""}`}
            style={{
              flexGrow: t.count,
              ["--seg" as string]: t.color,
              background: t.color,
              color: "#fff",
              border: "none",
              padding: "0.85rem 0.5rem"
            }}
            onClick={() => setActive(t.id)}
          >
            <span className="tier-seg-count" style={{ fontSize: "1.1rem", fontWeight: "bold" }}>{t.count}</span>
            <span className="tier-seg-name" style={{ fontSize: "0.75rem", opacity: 0.95 }}>{t.name}</span>
          </button>
        ))}
      </div>
      <p className="tier-bar-caption" style={{ marginTop: "0.5rem", fontSize: "0.8rem", color: "var(--ink-muted)" }}>
        * 条形宽度与词数成正比。<strong>抽象名词（400词）</strong>占据了将近一半的比例，是词汇记忆中最需要耐心攻克的重镇。
      </p>

      {/* 详细卡片 */}
      <div className="tier-detail-card" style={{ ["--seg" as string]: tier.color, marginTop: "1.5rem" }}>
        
        {/* 卡片头部 */}
        <div className="tier-detail-head" style={{ display: "flex", gap: "1rem", alignItems: "center", borderBottom: "1px solid var(--border-soft)", paddingBottom: "1rem", marginBottom: "1rem" }}>
          
          {/* 图标 */}
          <div style={{ width: "42px", height: "42px", display: "grid", placeItems: "center", borderRadius: "10px", background: "var(--accent-soft)", color: tier.color, flexShrink: 0 }}>
            <TierIcon id={tier.id} />
          </div>

          <div style={{ flexGrow: 1 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
              <h4 style={{ margin: 0, fontSize: "1.35rem", fontWeight: "bold", color: "var(--ink)" }}>{tier.name}</h4>
              <span style={{ fontSize: "0.9rem", color: "var(--ink-faint)", fontFamily: "var(--mono)" }}>{tier.en} ({tier.count} 词)</span>
            </div>
            <span className="tier-detail-priority" style={{ fontSize: "0.75rem", color: tier.color, fontWeight: "bold", background: "var(--accent-soft)", padding: "0.15rem 0.45rem", borderRadius: "4px", display: "inline-block", marginTop: "0.25rem" }}>
              {tier.priority}
            </span>
          </div>
        </div>

        {/* 详细描述 */}
        <p className="tier-detail-what" style={{ fontSize: "0.88rem", color: "var(--ink-muted)", lineHeight: "1.6", margin: "0 0 1rem 0" }}>
          {tier.what}
        </p>

        {/* 核心示例词汇 */}
        <div style={{ marginBottom: "1.25rem" }}>
          <h5 style={{ fontSize: "0.72rem", textTransform: "uppercase", color: "var(--ink-faint)", letterSpacing: "0.06em", margin: "0 0 0.5rem 0" }}>
            核心词速查 (Key Examples)
          </h5>
          <div className="tier-examples" style={{ display: "flex", flexWrap: "wrap", gap: "0.45rem" }}>
            {tier.examples.map((ex) => (
              <span key={ex} className="tier-example" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-soft)", borderRadius: "6px", padding: "0.2rem 0.5rem", fontSize: "0.78rem", fontFamily: "var(--mono)", color: "var(--ink)" }}>
                {ex}
              </span>
            ))}
          </div>
        </div>

        {/* 子类细分 breakdown */}
        <div style={{ borderTop: "1px solid var(--border-soft)", paddingTop: "1.25rem" }}>
          <h5 style={{ fontSize: "0.72rem", textTransform: "uppercase", color: "var(--ink-faint)", letterSpacing: "0.06em", margin: "0 0 0.75rem 0" }}>
            词汇小类细分 (Sub-classification Breakdown)
          </h5>
          <div className="grid-subclass">
            {tier.subclasses.map((sub) => (
              <div key={sub.name} className="subclass-item">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                  <strong style={{ fontSize: "0.8rem", color: "var(--ink)" }}>{sub.name}</strong>
                  <span style={{ fontSize: "0.75rem", background: "var(--border-soft)", color: "var(--ink-muted)", padding: "0.05rem 0.35rem", borderRadius: "4px", fontWeight: "bold" }}>
                    {sub.count} 词
                  </span>
                </div>
                <p style={{ fontSize: "0.72rem", color: "var(--ink-faint)", margin: 0, lineHeight: "1.4" }}>{sub.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 核心构句模版 */}
        <div className="sentence-block">
          <h5 style={{ fontSize: "0.72rem", textTransform: "uppercase", color: "var(--ink-faint)", letterSpacing: "0.06em", margin: "0 0 0.5rem 0" }}>
            核心构句示范 (Core Sentence Template — 鼠标悬停查看词汇解析)
          </h5>
          <div style={{ fontSize: "1.05rem", fontFamily: "var(--sans)", color: "var(--ink)", padding: "0.25rem 0", lineHeight: "1.8" }}>
            {tier.sentence.template.split(" ").map((word, idx) => {
              const cleanWord = word.replace(/[\[\].?,]/g, "");
              const isTarget = word.startsWith("[") && word.endsWith("]");
              const hoverText = tier.sentence.hover[word] || tier.sentence.hover[`[${cleanWord}]`] || tier.sentence.hover[cleanWord];
              
              if (hoverText) {
                const isHovered = hoverWord === word;
                return (
                  <span
                    key={idx}
                    className={`sentence-word-span${isTarget ? " highlighted" : " normal-word"}`}
                    style={isHovered ? { background: tier.color, color: "#fff" } : { borderBottom: `1px dotted ${tier.color}` }}
                    onMouseEnter={() => setHoverWord(word)}
                    onMouseLeave={() => setHoverWord(null)}
                  >
                    {cleanWord}
                  </span>
                );
              }
              return (
                <span key={idx} className="sentence-word-span normal-word" style={{ cursor: "default" }}>
                  {word}
                </span>
              );
            })}
          </div>
          
          {/* 悬停解析内容 */}
          <div style={{ minHeight: "28px", marginTop: "0.75rem", padding: "0.35rem 0.5rem", background: "var(--bg-card)", borderLeft: `3px solid ${tier.color}`, borderRadius: "4px", fontSize: "0.78rem", color: "var(--ink-muted)" }}>
            {hoverWord ? (
              <span>
                <strong>{hoverWord.replace(/[\[\]]/g, "")}</strong>: {tier.sentence.hover[hoverWord] || tier.sentence.hover[`[${hoverWord.replace(/[\[\]]/g, "")}]`]}
              </span>
            ) : (
              <span style={{ fontStyle: "italic", opacity: 0.7 }}>请将鼠标悬停在上方带虚线或高亮的单词上查看该层在句子中的作用...</span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
