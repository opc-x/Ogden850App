import { useState } from "react";

type Operator = {
  op: string;
  cn: string;
  vector: string;
  concept: string;
  equation: string;
  examples: string[];
  svgType: string;
};

type OpGroup = {
  name: string;
  desc: string;
  ops: Operator[];
};

const OP_GROUPS: OpGroup[] = [
  {
    name: "空间位移 (Movement)",
    desc: "身体在物理空间中的位移移动",
    ops: [
      {
        op: "come", cn: "来 (移向观察点)", vector: "→ ⬤ (朝向自己)",
        concept: "身体朝说话人或当前观察点移动。物理动作为『朝向中心点靠近的物理位移』。",
        equation: "come + in = 进来 (enter)",
        examples: ["come in (进来)", "come back (回来)", "come out (出来)"],
        svgType: "come"
      },
      {
        op: "go", cn: "去 (移离观察点)", vector: "⬤ → (背离自己)",
        concept: "身体离开当前位置向外移动。物理动作为『背离中心点离去的物理位移』。",
        equation: "go + out = 出去 (exit)",
        examples: ["go in (进去)", "go out (出去)", "go back (回去)"],
        svgType: "go"
      }
    ]
  },
  {
    name: "手部操作 (Hand Action)",
    desc: "手对物体的物理放开与抓取",
    ops: [
      {
        op: "put", cn: "放 (松手放下安置)", vector: "↓ (手部松开并放下)",
        concept: "手持物体并使其受重力作用而在某处下落、安放。物理动作为『松开双手以安置物体』。",
        equation: "put + down = 放下 (deposit)",
        examples: ["put in (放进去)", "put on (穿上)", "put down (放下)"],
        svgType: "put"
      },
      {
        op: "take", cn: "拿 (伸手抓取移位)", vector: "↑ (手部握住并拿起)",
        concept: "伸手握住物体并使之脱离原位。物理动作为『抓取并移位，使物体向人靠近』。",
        equation: "take + down = 拿下来 (remove)",
        examples: ["take in (拿进来)", "take out (拿出去)", "take down (拿下来)"],
        svgType: "take"
      }
    ]
  },
  {
    name: "人际传递 (Transfer)",
    desc: "所有权或物品在人与人之间的流动",
    ops: [
      {
        op: "give", cn: "给 (物品向外转移)", vector: "→ (物品交出去)",
        concept: "将自己持有的东西手递手传递给对方。物理动作为『物品所有权或位置的向外转移』。",
        equation: "give + back = 归还 (return)",
        examples: ["give back (归还)", "give out (分发)", "give to (给...)"],
        svgType: "give"
      },
      {
        op: "get", cn: "得 (物品向内获取)", vector: "← (物品拿进来)",
        concept: "接收、得到、拿到某物，或者状态移动到某处。物理动作为『物品所有权或位置的向内获取』。",
        equation: "get + in = 进来 (enter)",
        examples: ["get in (进来)", "get out (出去)", "get back (取回/回来)"],
        svgType: "get"
      },
      {
        op: "send", cn: "送 (远程传递)", vector: "➦ (远程送出)",
        concept: "无需自己手递手交付，借助媒介、投递或推力将物品送往远处。物理动作为『远程位移传递』。",
        equation: "send + out = 发出 (emit)",
        examples: ["send out (发出)", "send back (退回)", "send away (送走)"],
        svgType: "send"
      }
    ]
  },
  {
    name: "状态控制 (Control)",
    desc: "维持原样不动或任其移动的控制收放",
    ops: [
      {
        op: "keep", cn: "保持 (留在边界内)", vector: "↺ (锁在边界里)",
        concept: "锁住或抓住人/物，维持其现有位置或状态不跑掉。物理动作为『守在封闭的空间或状态边界内』。",
        equation: "keep + out = 挡在外面 (exclude)",
        examples: ["keep in (留在里面)", "keep out (留在外面)", "keep back (阻挡)"],
        svgType: "keep"
      },
      {
        op: "let", cn: "让 (移开屏障放行)", vector: "⇢ (撤销边界放行)",
        concept: "撤销拦截阻碍，松开控制屏障，放任通行。物理动作为『移开障碍物使物理通道开放』。",
        equation: "let + in = 放进来 (admit)",
        examples: ["let in (放进来)", "let out (放出去)", "let go (放手/松开)"],
        svgType: "let"
      }
    ]
  },
  {
    name: "创制与执行 (Action)",
    desc: "对现实物理世界的改变与纯动作执行",
    ops: [
      {
        op: "make", cn: "做/造 (塑形产出新物)", vector: "⚒ (无中生有制成)",
        concept: "动手改造原材料，从而塑造出或生产出一个新形态。物理动作为『对物理材料进行加工塑形』。",
        equation: "make + ready = 准备好 (prepare)",
        examples: ["make ready (准备好)", "make clean (弄干净)", "make a hole (打洞)"],
        svgType: "make"
      },
      {
        op: "do", cn: "做/执行 (侧重过程的动)", vector: "⚙ (动作过程旋转)",
        concept: "执行某项活动的过程，不强调最终产物，只关注『动起来的物理动作本身』。",
        equation: "do + again = 再做一次 (repeat)",
        examples: ["do work (做工作)", "do well (做好)", "do again (再做一次)"],
        svgType: "do"
      }
    ]
  },
  {
    name: "感知与交流 (Perception)",
    desc: "物理信息的获取与语言输出",
    ops: [
      {
        op: "see", cn: "看/明白 (接收光线)", vector: "👁 (接收光线/看清)",
        concept: "光线照进眼睛接收到画面。物理动作为『视觉器官接收并处理外界光波信号』。",
        equation: "see + clearly = 看得清 (discern)",
        examples: ["see clearly (看清)", "see a picture (看画)", "see a friend (见朋友)"],
        svgType: "see"
      },
      {
        op: "say", cn: "说 (单向发声传播)", vector: "🗣 (发出声音传播)",
        concept: "嘴部发声，将脑中的思想转化为声波的单向输出。物理动作为『声带震动并发射空气波』。",
        equation: "say + again = 再说一次 (repeat)",
        examples: ["say yes (说好)", "say again (再说一次)", "say a word (说个词)"],
        svgType: "say"
      }
    ]
  },
  {
    name: "存在与所有 (State)",
    desc: "静态不动的存在关系与客观状态",
    ops: [
      {
        op: "be", cn: "是/在 (处于静止原点)", vector: "⬤ (静止原点)",
        concept: "静态地存在于某处，或处于某种性质中。物理动作为『静止在时空坐标原点』。",
        equation: "be + in = 在里面/在家 (present)",
        examples: ["be in (在里面)", "be out (在外面)", "be back (回来了)"],
        svgType: "be"
      },
      {
        op: "have", cn: "有/持有", vector: "⎔ (占有线框)",
        concept: "自己持有或静态占有某物，或者身体正经历某种状态。",
        equation: "have + a look = 看一眼 (glance)",
        examples: ["have a book (有书)", "have a look (看一眼)", "have a talk (谈话)"],
        svgType: "have"
      },
      {
        op: "seem", cn: "似乎", vector: "░ (折射虚像)",
        concept: "感官呈现出的样子，类似于镜子里反射出的投影（不代表实情）。",
        equation: "seem + like = 好像 (resemble)",
        examples: ["seem like (看起来像)", "seem good (看似不错)"],
        svgType: "seem"
      }
    ]
  },
  {
    name: "时态与许可 (Auxiliary)",
    desc: "时空的推手，表示可能性与将来时间线",
    ops: [
      {
        op: "may", cn: "也许/可以", vector: "⤳ (可能的分支)",
        concept: "表示许可（你可以做）或者推测事情也许会发生。",
        equation: "may + do = 也许/可以做",
        examples: ["may be (也许是/可能)", "may do (可以做)"],
        svgType: "may"
      },
      {
        op: "will", cn: "将要/愿意", vector: "➔ (指向未来的推力)",
        concept: "表示将要发生的主观意愿，或者客观时间线上的将来状态。",
        equation: "will + do = 将要做",
        examples: ["will go (将去)", "will do (将做)"],
        svgType: "will"
      }
    ]
  }
];

function VectorGraphic({ type }: { type: string }) {
  const strokeColor = "var(--accent)";
  const mainColor = "var(--ink)";
  const faintColor = "var(--border)";

  switch (type) {
    case "come":
      return (
        <svg viewBox="0 0 100 100" width="100%" height="100%" className="vector-svg">
          <circle cx="70" cy="50" r="16" stroke={strokeColor} strokeWidth="2" strokeDasharray="4 4" fill="none" className="anim-pulse-ring" />
          <circle cx="70" cy="50" r="8" fill={mainColor} />
          <g className="anim-drift-in-r">
            <path d="M15 50 H60" stroke={strokeColor} strokeWidth="4" strokeLinecap="round" />
            <path d="M50 40 L60 50 L50 60" stroke={strokeColor} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </g>
        </svg>
      );
    case "go":
      return (
        <svg viewBox="0 0 100 100" width="100%" height="100%" className="vector-svg">
          <circle cx="30" cy="50" r="8" fill={mainColor} />
          <g className="anim-drift-out-r">
            <path d="M30 50 H85" stroke={strokeColor} strokeWidth="4" strokeLinecap="round" />
            <path d="M75 40 L85 50 L75 60" stroke={strokeColor} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </g>
        </svg>
      );
    case "put":
      return (
        <svg viewBox="0 0 100 100" width="100%" height="100%" className="vector-svg">
          {/* Box outline */}
          <path d="M30 65 H70 V85 H30 Z" stroke={faintColor} strokeWidth="3" fill="none" className="anim-glow-box" />
          {/* Arrow pointing down */}
          <g className="anim-drop">
            <path d="M50 20 V60" stroke={strokeColor} strokeWidth="4" strokeLinecap="round" />
            <path d="M42 52 L50 60 L58 52" stroke={strokeColor} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </g>
          {/* Hand abstract */}
          <path d="M35 15 H50" stroke={mainColor} strokeWidth="4" strokeLinecap="round" />
        </svg>
      );
    case "take":
      return (
        <svg viewBox="0 0 100 100" width="100%" height="100%" className="vector-svg">
          {/* Box outline */}
          <path d="M30 65 H70 V85 H30 Z" stroke={faintColor} strokeWidth="3" fill="none" />
          {/* Arrow pointing up */}
          <g className="anim-lift">
            <path d="M50 70 V30" stroke={strokeColor} strokeWidth="4" strokeLinecap="round" />
            <path d="M42 38 L50 30 L58 38" stroke={strokeColor} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </g>
          {/* Hand grasping */}
          <path d="M40 20 C40 20, 50 15, 60 20" stroke={mainColor} strokeWidth="4" strokeLinecap="round" fill="none" />
        </svg>
      );
    case "give":
      return (
        <svg viewBox="0 0 100 100" width="100%" height="100%" className="vector-svg">
          {/* Sender */}
          <circle cx="25" cy="55" r="8" fill={mainColor} />
          {/* Receiver */}
          <circle cx="75" cy="55" r="8" fill={faintColor} className="anim-pulse-receive" />
          {/* Transfer path */}
          <path d="M35 50 C45 40, 55 40, 65 50" stroke={strokeColor} strokeWidth="2" strokeDasharray="3 3" fill="none" opacity="0.4" />
          {/* Travelling parcel */}
          <circle cx="0" cy="0" r="5" fill={strokeColor} className="anim-travel-r" />
        </svg>
      );
    case "get":
      return (
        <svg viewBox="0 0 100 100" width="100%" height="100%" className="vector-svg">
          {/* Target (self) */}
          <circle cx="75" cy="55" r="8" fill={mainColor} className="anim-pulse-receive" />
          {/* Source */}
          <circle cx="25" cy="55" r="8" fill={faintColor} />
          {/* Transfer path */}
          <path d="M35 50 C45 40, 55 40, 65 50" stroke={strokeColor} strokeWidth="2" strokeDasharray="3 3" fill="none" opacity="0.4" />
          {/* Travelling parcel moving toward self */}
          <circle cx="0" cy="0" r="5" fill={strokeColor} className="anim-travel-l" />
        </svg>
      );
    case "send":
      return (
        <svg viewBox="0 0 100 100" width="100%" height="100%" className="vector-svg">
          <circle cx="30" cy="50" r="10" fill={mainColor} />
          {/* Multi-arrows pointing away, firing in sequence */}
          <g className="anim-launch anim-delay-0">
            <path d="M45 40 L75 25" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />
            <path d="M68 23 L75 25 L72 32" stroke={strokeColor} strokeWidth="3" fill="none" />
          </g>
          <g className="anim-launch anim-delay-1">
            <path d="M48 50 L80 50" stroke={strokeColor} strokeWidth="4" strokeLinecap="round" />
            <path d="M72 44 L80 50 L72 56" stroke={strokeColor} strokeWidth="4" fill="none" />
          </g>
          <g className="anim-launch anim-delay-2">
            <path d="M45 60 L75 75" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />
            <path d="M72 68 L75 75 L68 77" stroke={strokeColor} strokeWidth="3" fill="none" />
          </g>
        </svg>
      );
    case "keep":
      return (
        <svg viewBox="0 0 100 100" width="100%" height="100%" className="vector-svg">
          <circle cx="50" cy="50" r="12" fill={mainColor} className="anim-breathe" />
          {/* Circular bounding arrow, slowly orbiting */}
          <g className="anim-spin-slow">
            <path d="M50 25 A25 25 0 1 1 49.9 25" stroke={strokeColor} strokeWidth="4" strokeLinecap="round" strokeDasharray="140 20" fill="none" />
            <path d="M45 20 L55 25 L45 30" stroke={strokeColor} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </g>
        </svg>
      );
    case "let":
      return (
        <svg viewBox="0 0 100 100" width="100%" height="100%" className="vector-svg">
          {/* Barrier with a gap */}
          <path d="M50 15 V40" stroke={mainColor} strokeWidth="4" strokeLinecap="round" />
          <path d="M50 60 V85" stroke={mainColor} strokeWidth="4" strokeLinecap="round" />
          {/* Flow passing through gap */}
          <path d="M20 50 H80" stroke={strokeColor} strokeWidth="4" strokeLinecap="round" strokeDasharray="8 6" className="anim-dash-flow" />
          <g className="anim-drift-out-r">
            <path d="M70 42 L80 50 L70 58" stroke={strokeColor} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </g>
        </svg>
      );
    case "make":
      return (
        <svg viewBox="0 0 100 100" width="100%" height="100%" className="vector-svg">
          {/* Blocks stacking up */}
          <rect x="25" y="65" width="50" height="15" rx="3" fill={faintColor} stroke={mainColor} strokeWidth="2" />
          <rect x="35" y="45" width="30" height="15" rx="3" fill="none" stroke={strokeColor} strokeWidth="3" className="anim-build" />
          <g className="anim-lift">
            <path d="M50 15 V35" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />
            <path d="M45 25 L50 35 L55 25" stroke={strokeColor} strokeWidth="3" fill="none" />
          </g>
        </svg>
      );
    case "do":
      return (
        <svg viewBox="0 0 100 100" width="100%" height="100%" className="vector-svg">
          {/* Counter-rotating gears */}
          <g className="anim-spin-slow">
            <circle cx="40" cy="40" r="16" stroke={mainColor} strokeWidth="3" strokeDasharray="6 4" fill="none" />
            <circle cx="40" cy="40" r="4" fill={mainColor} />
          </g>
          <g className="anim-spin-reverse">
            <circle cx="64" cy="64" r="12" stroke={strokeColor} strokeWidth="3" strokeDasharray="4 4" fill="none" />
            <circle cx="64" cy="64" r="3" fill={strokeColor} />
          </g>
        </svg>
      );
    case "see":
      return (
        <svg viewBox="0 0 100 100" width="100%" height="100%" className="vector-svg">
          {/* Eye outline */}
          <path d="M15 50 C30 25, 70 25, 85 50 C70 75, 30 75, 15 50 Z" stroke={mainColor} strokeWidth="4" strokeLinejoin="round" fill="none" />
          <g className="anim-look">
            <circle cx="50" cy="50" r="10" fill={strokeColor} />
          </g>
          {/* Vision rays */}
          <path d="M65 35 L80 25" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" className="anim-blink anim-delay-0" />
          <path d="M65 65 L80 75" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" className="anim-blink anim-delay-1" />
        </svg>
      );
    case "say":
      return (
        <svg viewBox="0 0 100 100" width="100%" height="100%" className="vector-svg">
          {/* Speech bubble */}
          <path d="M20 25 H80 V65 H45 L25 80 V65 H20 Z" stroke={mainColor} strokeWidth="4" strokeLinejoin="round" fill="none" />
          {/* Audio bars */}
          <path d="M35 50 V40" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" className="anim-eq anim-delay-0" />
          <path d="M45 50 V35" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" className="anim-eq anim-delay-1" />
          <path d="M55 50 V38" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" className="anim-eq anim-delay-2" />
          <path d="M65 50 V44" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" className="anim-eq anim-delay-0" />
        </svg>
      );
    case "be":
      return (
        <svg viewBox="0 0 100 100" width="100%" height="100%" className="vector-svg">
          {/* Anchor solid state */}
          <circle cx="50" cy="50" r="20" fill="none" stroke={strokeColor} strokeWidth="5" />
          <circle cx="50" cy="50" r="20" fill="none" stroke={strokeColor} strokeWidth="2" className="anim-ripple" />
          <circle cx="50" cy="50" r="8" fill={mainColor} />
          <path d="M20 50 H80" stroke={faintColor} strokeWidth="2" strokeDasharray="4 4" />
          <path d="M50 20 V80" stroke={faintColor} strokeWidth="2" strokeDasharray="4 4" />
        </svg>
      );
    case "have":
      return (
        <svg viewBox="0 0 100 100" width="100%" height="100%" className="vector-svg">
          {/* Closed possession frame */}
          <rect x="25" y="25" width="50" height="50" rx="6" stroke={mainColor} strokeWidth="4" fill="none" className="anim-glow-box" />
          <circle cx="50" cy="50" r="10" fill={strokeColor} className="anim-breathe" />
        </svg>
      );
    case "seem":
      return (
        <svg viewBox="0 0 100 100" width="100%" height="100%" className="vector-svg">
          {/* Mirror / refraction line */}
          <path d="M50 15 V85" stroke={mainColor} strokeWidth="3" strokeDasharray="6 4" />
          {/* Real object vs wavering reflection */}
          <circle cx="28" cy="50" r="10" fill={mainColor} />
          <circle cx="72" cy="50" r="10" stroke={strokeColor} strokeWidth="3" fill="none" strokeDasharray="3 3" className="anim-flicker" />
        </svg>
      );
    case "may":
      return (
        <svg viewBox="0 0 100 100" width="100%" height="100%" className="vector-svg">
          {/* Branching possibilities */}
          <path d="M15 50 H45" stroke={mainColor} strokeWidth="4" strokeLinecap="round" />
          <circle cx="15" cy="50" r="5" fill={mainColor} />
          <path d="M45 50 C55 35, 65 30, 80 30" stroke={strokeColor} strokeWidth="4" strokeLinecap="round" fill="none" className="anim-dash-flow-soft" strokeDasharray="6 5" />
          <path d="M72 23 L80 30 L72 35" stroke={strokeColor} strokeWidth="4" strokeLinejoin="round" fill="none" className="anim-flicker" />
          <path d="M45 50 C55 65, 65 70, 80 70" stroke={faintColor} strokeWidth="3" strokeLinecap="round" fill="none" strokeDasharray="4 4" opacity="0.5" />
        </svg>
      );
    case "will":
      return (
        <svg viewBox="0 0 100 100" width="100%" height="100%" className="vector-svg">
          {/* Velocity lines streaming past */}
          <path d="M20 40 L8 50 L20 60" stroke={faintColor} strokeWidth="2" fill="none" className="anim-streak anim-delay-0" />
          <path d="M32 40 L20 50 L32 60" stroke={faintColor} strokeWidth="2" fill="none" className="anim-streak anim-delay-1" />
          {/* Forward arrow */}
          <g className="anim-nudge">
            <path d="M15 50 H80" stroke={strokeColor} strokeWidth="4" strokeLinecap="round" />
            <path d="M70 40 L80 50 L70 60" stroke={strokeColor} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </g>
        </svg>
      );
    default:
      return null;
  }
}

export default function OperatorsGrid() {
  const [selectedOp, setSelectedOp] = useState<Operator>(OP_GROUPS[0].ops[0]);

  return (
    <div className="operators-visualizer">
      <div className="visualizer-header">
        <span className="machine-kicker">核心语法构件</span>
        <h3>18 个动作Operator：空间物理模型</h3>
        <p>
          Ogden 的核心理念是：<strong>用物理空间和手势位移来描述世界。</strong>
          英语中本没有复杂的动作动词（如 <i>enter</i>），所有动作都是身体移动（<i>come/go</i>）、手部抓放（<i>put/take</i>）或所有权转移（<i>give/get/send</i>）与方向介词的物理组合。
        </p>
      </div>

      <div className="visualizer-body">
        {/* 左侧：分类网格 */}
        <div className="operators-grid-panel">
          {OP_GROUPS.map((group) => (
            <div key={group.name} className="op-group-section">
              <div className="op-group-title">
                <h4>{group.name}</h4>
                <span className="op-group-subtitle">{group.desc}</span>
              </div>
              <div className="op-group-chips">
                {group.ops.map((item) => {
                  const isSelected = selectedOp.op === item.op;
                  return (
                    <button
                      key={item.op}
                      type="button"
                      className={`op-chip${isSelected ? " active" : ""}`}
                      onClick={() => setSelectedOp(item)}
                    >
                      <span className="op-chip-en">{item.op}</span>
                      <span className="op-chip-cn">{item.cn}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* 右侧：单词的物理矢量卡片 */}
        <div className="operator-vector-card" key={selectedOp.op}>
          <div className="vector-card-head">
            <div className="vector-card-title-row">
              <span className="card-op-en">{selectedOp.op}</span>
              <span className="card-op-cn">{selectedOp.cn}</span>
            </div>
            <div className="vector-card-tag">{selectedOp.vector}</div>
          </div>

          <div className="vector-card-graphic">
            <VectorGraphic type={selectedOp.svgType} />
          </div>

          <div className="vector-card-info">
            <div className="vector-info-section">
              <h5>物理手势模型 (Spatial Concept)</h5>
              <p>{selectedOp.concept}</p>
            </div>

            <div className="vector-info-section">
              <h5>组合乘积公式 (Basic Equation)</h5>
              <code className="vector-formula-code">{selectedOp.equation}</code>
            </div>

            <div className="vector-info-section">
              <h5>核心常用短语 (High Frequency Combinations)</h5>
              <ul className="vector-example-list">
                {selectedOp.examples.map((ex) => (
                  <li key={ex}>{ex}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
