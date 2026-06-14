/** 18 Operator 物理模型 — OperatorsGrid / WordDetail 共用 */
export type OperatorEntry = {
  op: string;
  cn: string;
  vector: string;
  concept: string;
  equation: string;
  examples: string[];
  svgType: string;
};

export type OpGroup = {
  name: string;
  desc: string;
  ops: OperatorEntry[];
};

export const OP_GROUPS: OpGroup[] = [
  {
    name: "空间位移 (Movement)",
    desc: "身体在物理空间中的位移移动",
    ops: [
      {
        op: "come", cn: "来 (移向观察点)", vector: "→ ⬤ (朝向自己)",
        concept: "身体朝说话人或当前观察点移动。",
        equation: "come + in = 进来",
        examples: ["come in (进来)", "come back (回来)", "come out (出来)"],
        svgType: "come",
      },
      {
        op: "go", cn: "去 (移离观察点)", vector: "⬤ → (背离自己)",
        concept: "身体离开当前位置向外移动。",
        equation: "go + out = 出去",
        examples: ["go in (进去)", "go out (出去)", "go back (回去)"],
        svgType: "go",
      },
    ],
  },
  {
    name: "手部操作 (Hand Action)",
    desc: "手对物体的物理放开与抓取",
    ops: [
      {
        op: "put", cn: "放 (松手放下安置)", vector: "↓ (手部松开并放下)",
        concept: "手持物体并使其在某处安放。",
        equation: "put + down = 放下",
        examples: ["put in (放进去)", "put on (穿上)", "put down (放下)"],
        svgType: "put",
      },
      {
        op: "take", cn: "拿 (伸手抓取移位)", vector: "↑ (手部握住并拿起)",
        concept: "伸手握住物体并使之脱离原位。",
        equation: "take + out = 拿出去",
        examples: ["take in (拿进来)", "take out (拿出去)", "take down (拿下来)"],
        svgType: "take",
      },
    ],
  },
  {
    name: "人际传递 (Transfer)",
    desc: "所有权或物品在人与人之间的流动",
    ops: [
      {
        op: "give", cn: "给 (物品向外转移)", vector: "→ (物品交出去)",
        concept: "将自己持有的东西传递给对方。",
        equation: "give + back = 归还",
        examples: ["give back (归还)", "give out (分发)", "give to (给…)"],
        svgType: "give",
      },
      {
        op: "get", cn: "得 (物品向内获取)", vector: "← (物品拿进来)",
        concept: "接收、得到某物，或进入某种状态。",
        equation: "get + in = 进来",
        examples: ["get in (进来)", "get out (出去)", "get back (取回)"],
        svgType: "get",
      },
      {
        op: "send", cn: "送 (远程传递)", vector: "➦ (远程送出)",
        concept: "借助媒介将物品或信息送往远处。",
        equation: "send + out = 发出",
        examples: ["send out (发出)", "send back (退回)", "send away (送走)"],
        svgType: "send",
      },
    ],
  },
  {
    name: "状态控制 (Control)",
    desc: "维持原样不动或任其移动",
    ops: [
      {
        op: "keep", cn: "保持 (留在边界内)", vector: "↺ (锁在边界里)",
        concept: "维持其现有位置或状态不跑掉。",
        equation: "keep + out = 挡在外面",
        examples: ["keep in (留在里面)", "keep out (留在外面)"],
        svgType: "keep",
      },
      {
        op: "let", cn: "让 (移开屏障放行)", vector: "⇢ (撤销边界放行)",
        concept: "撤销阻碍，放任通行。",
        equation: "let + in = 放进来",
        examples: ["let in (放进来)", "let out (放出去)", "let go (放手)"],
        svgType: "let",
      },
    ],
  },
  {
    name: "创制与执行 (Action)",
    desc: "对现实世界的改变与动作执行",
    ops: [
      {
        op: "make", cn: "做/造 (塑形产出)", vector: "⚒ (塑形)",
        concept: "动手改造原材料，塑造出新形态。",
        equation: "make + ready = 准备好",
        examples: ["make ready (准备好)", "make clean (弄干净)"],
        svgType: "make",
      },
      {
        op: "do", cn: "做/执行 (侧重过程)", vector: "⚙ (动作过程)",
        concept: "执行活动过程，关注动作本身。",
        equation: "do + again = 再做一次",
        examples: ["do work (做工作)", "do well (做好)"],
        svgType: "do",
      },
    ],
  },
  {
    name: "感知与交流 (Perception)",
    desc: "物理信息的获取与语言输出",
    ops: [
      {
        op: "see", cn: "看/明白 (接收光线)", vector: "👁 (接收光线)",
        concept: "视觉器官接收外界光波信号。",
        equation: "see + clearly = 看清",
        examples: ["see clearly (看清)", "see a picture (看画)"],
        svgType: "see",
      },
      {
        op: "say", cn: "说 (单向发声)", vector: "🗣 (发声传播)",
        concept: "将思想转化为声波输出。",
        equation: "say + again = 再说一次",
        examples: ["say yes (说好)", "say again (再说)"],
        svgType: "say",
      },
    ],
  },
  {
    name: "存在与所有 (State)",
    desc: "静态存在与占有关系",
    ops: [
      {
        op: "be", cn: "是/在 (静止原点)", vector: "⬤ (静止原点)",
        concept: "静态地存在于某处或某种性质中。",
        equation: "be + in = 在里面",
        examples: ["be in (在里面)", "be out (在外面)"],
        svgType: "be",
      },
      {
        op: "have", cn: "有/持有", vector: "⎔ (占有线框)",
        concept: "占有某物或正经历某种状态。",
        equation: "have + a look = 看一眼",
        examples: ["have a book (有书)", "have a look (看一眼)"],
        svgType: "have",
      },
      {
        op: "seem", cn: "似乎", vector: "░ (折射虚像)",
        concept: "感官呈现的样子，不一定是实情。",
        equation: "seem + like = 好像",
        examples: ["seem like (看起来像)", "seem good (看似不错)"],
        svgType: "seem",
      },
    ],
  },
  {
    name: "时态与许可 (Auxiliary)",
    desc: "可能性与将来时间线",
    ops: [
      {
        op: "may", cn: "也许/可以", vector: "⤳ (可能分支)",
        concept: "表示许可或推测可能发生。",
        equation: "may + be = 也许是",
        examples: ["may be (也许是)", "may do (可以做)"],
        svgType: "may",
      },
      {
        op: "will", cn: "将要/愿意", vector: "➔ (未来推力)",
        concept: "表示将要发生或主观意愿。",
        equation: "will + go = 将去",
        examples: ["will go (将去)", "will do (将做)"],
        svgType: "will",
      },
    ],
  },
];

const OP_MAP = new Map(OP_GROUPS.flatMap((g) => g.ops.map((o) => [o.op, { ...o, group: g.name }])));

export function getOperatorEntry(op: string): (OperatorEntry & { group: string }) | undefined {
  return OP_MAP.get(op);
}
