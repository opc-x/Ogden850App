export type DirectionWord = {
  word: string;
  cn: string;
  category: string;
  concept: string;
  equation: string;
  examples: string[];
  svgType: string;
};

export type Group = {
  name: string;
  desc: string;
  words: DirectionWord[];
};

export const GROUPS: Group[] = [
  {
    name: "空间静态位置 (Static Places)",
    desc: "描述物体在物理空间中的静止相对坐标",
    words: [
      {
        word: "at", cn: "在某点", category: "static",
        concept: "确定一个精确的、无空间大小的静止标志点。在时空坐标轴上仅作为定位标记。",
        equation: "be + at = 在……处 (present at)",
        examples: ["be at the door (在门口)", "get at the truth (搞清真相)"],
        svgType: "at"
      },
      {
        word: "in", cn: "在……里", category: "static",
        concept: "物体处于三维或二维闭合边界内部，被容器或空间范围包络。",
        equation: "go + in = 进去 (enter)",
        examples: ["go in (进去)", "keep in mind (记住)", "be in the room (在房间里)"],
        svgType: "in"
      },
      {
        word: "on", cn: "在……上/接触", category: "static",
        concept: "物体与另一个物理表面发生支撑性接触，依靠物理重力和摩擦力停留在表面上。",
        equation: "put + on = 穿上/放上 (wear/place)",
        examples: ["put on the coat (穿上外套)", "go on (继续)", "on the table (在桌上)"],
        svgType: "on"
      },
      {
        word: "under", cn: "在……下方", category: "static",
        concept: "物体处于另一个物体的正下方或被其覆盖的低位空间中。",
        equation: "keep + under = 控制住/压制 (repress)",
        examples: ["be under the bed (在床下)", "keep under control (控制住)"],
        svgType: "under"
      },
      {
        word: "over", cn: "在……上方", category: "static",
        concept: "悬空处于参照物的正上方，越过且不与其表面发生物理接触。",
        equation: "go + over = 越过/翻阅 (examine/cross)",
        examples: ["go over the wall (越过墙壁)", "be over the table (在桌子上方)"],
        svgType: "over"
      },
      {
        word: "by", cn: "在旁/沿着", category: "static",
        concept: "物体处于参照物的邻近切线或贴近的侧旁范围内。",
        equation: "go + by = 路过 (pass)",
        examples: ["go by the window (路过窗户)", "be by his side (在他身旁)"],
        svgType: "by"
      },
      {
        word: "between", cn: "在两者之间", category: "static",
        concept: "物体处于由两个参照物（两点）所隔开的中间缝隙或区域内。",
        equation: "be + between = 夹在中间 (intermediate)",
        examples: ["be between two houses (在两房之间)", "put between (夹在中间)"],
        svgType: "between"
      },
      {
        word: "among", cn: "在……群中", category: "static",
        concept: "物体处于三个及以上的多点（群体）围绕或分布的内部缝隙中。",
        equation: "go + among = 走进……中 (mingle)",
        examples: ["go among the people (走进人群)", "be among friends (在朋友中间)"],
        svgType: "among"
      }
    ]
  },
  {
    name: "空间动态位移 (Movement / Vector)",
    desc: "描述物体在空间中的运动矢量和位移滑轨",
    words: [
      {
        word: "to", cn: "向/到终点", category: "movement",
        concept: "指向终点或目标点，表示带有确定目的地的方向运动矢量。",
        equation: "go + to = 去往 (approach)",
        examples: ["go to school (去学校)", "give it to him (递给他)"],
        svgType: "to"
      },
      {
        word: "from", cn: "从……起点", category: "movement",
        concept: "指向动作或位置的始发源头，表示背离原点的发射矢量。",
        equation: "take + from = 从……拿走 (remove)",
        examples: ["come from (来自)", "take from the shelf (从架子上拿走)"],
        svgType: "from"
      },
      {
        word: "up", cn: "向上", category: "movement",
        concept: "物体逆引力轴指向上方高度攀升的垂直或倾斜位移。",
        equation: "get + up = 起来/站起 (arise)",
        examples: ["go up (上去)", "get up (起来)", "put up (举起/建造)"],
        svgType: "up"
      },
      {
        word: "down", cn: "向下", category: "movement",
        concept: "物体顺引力轴指向下方高度降低的垂直或倾斜位移。",
        equation: "put + down = 放下/写下 (deposit/record)",
        examples: ["go down (下去)", "put down (放下)", "take down (拿下/记录)"],
        svgType: "down"
      },
      {
        word: "through", cn: "穿过", category: "movement",
        concept: "物体从一端进入三维容器或管道内部，穿行一段距离后从另一端穿出。",
        equation: "go + through = 穿过/经历 (experience/penetrate)",
        examples: ["go through the pipe (穿过管道)", "see through it (看穿它)"],
        svgType: "through"
      },
      {
        word: "across", cn: "横过", category: "movement",
        concept: "从一侧到另一侧，横向跨越一个二维平面或线段边界。",
        equation: "go + across = 横渡/穿过 (cross)",
        examples: ["go across the street (过马路)", "put across (跨置/解释清楚)"],
        svgType: "across"
      },
      {
        word: "off", cn: "脱离/断开", category: "movement",
        concept: "物体脱离原有的物理支撑表面，断开物理接触并移走。",
        equation: "take + off = 脱下/起飞 (remove/launch)",
        examples: ["get off the bus (下车)", "take off the coat (脱外套)"],
        svgType: "off"
      },
      {
        word: "about", cn: "围绕/到处", category: "movement",
        concept: "以某一中心物为坐标原点，在其周围做多向分布或环绕轨迹运行。",
        equation: "go + about = 到处走动 (wander)",
        examples: ["go about (到处走动)", "put a cloth about him (围上布)"],
        svgType: "about"
      }
    ]
  },
  {
    name: "相对与伴随关系 (Relationship)",
    desc: "描述物体之间力学、相对位置及时间上的相互关系",
    words: [
      {
        word: "against", cn: "靠着/对抗", category: "relation",
        concept: "物体逆向或贴紧另一个物理表面，产生力学上的相反受力、对抗或支撑接触。",
        equation: "go + against = 反对/逆行 (oppose)",
        examples: ["put against the wall (靠着墙放)", "go against rules (违反规则)"],
        svgType: "against"
      },
      {
        word: "after", cn: "在……之后", category: "relation",
        concept: "物体在时空坐标轴的后方移动或排列，呈现跟随或滞后的坐标。",
        equation: "go + after = 追随/追求 (pursue)",
        examples: ["come after (跟在……后面)", "go after details (追寻细节)"],
        svgType: "after"
      },
      {
        word: "before", cn: "在……前面", category: "relation",
        concept: "物体在时空坐标轴的前方移动或排列，处于引领或超前的位置。",
        equation: "go + before = 走在前面 (precede)",
        examples: ["go before (走在前面)", "come before the judge (呈现在面前)"],
        svgType: "before"
      },
      {
        word: "with", cn: "伴随/协同", category: "relation",
        concept: "物体与另一物体处于同一运动坐标系或包络范围内，并列并行或充当工具附属。",
        equation: "go + with = 伴随/相配 (accompany/match)",
        examples: ["go with me (跟我走)", "cut with a knife (用刀切)"],
        svgType: "with"
      }
    ]
  },
  {
    name: "逻辑与抽象关系 (Logical Relations)",
    desc: "描述事物间的归属、目标、角色等逻辑连接词",
    words: [
      {
        word: "of", cn: "关联/属于", category: "logical",
        concept: "表达整体与部分、归属权、关联性或物质来源，通常是部分的提取。",
        equation: "part + of = ……的一部分",
        examples: ["the top of the box (箱子顶部)", "a cup of water (一杯水)"],
        svgType: "of"
      },
      {
        word: "for", cn: "目标/换取", category: "logical",
        concept: "标明动作的目的、受益人或交换价值的对应性。",
        equation: "do + for = 为……服务 (serve)",
        examples: ["for you (给你/为了你)", "make for (走向/有助于)"],
        svgType: "for"
      },
      {
        word: "as", cn: "作为/等同", category: "logical",
        concept: "将某一物理形态等同于另一角色，表达身份的映射与化身。",
        equation: "go + as = 化装成/扮演",
        examples: ["as a teacher (作为老师)", "do as I do (照我做的做)"],
        svgType: "as"
      },
      {
        word: "till", cn: "直到(边界点)", category: "logical",
        concept: "在时间轴或物理进程中，动作向终点延伸至特定阻挡边界处为止。",
        equation: "keep + till = 保持直到",
        examples: ["till tomorrow (直到明天)", "till the end (直到结束)"],
        svgType: "till"
      },
      {
        word: "than", cn: "相对比较", category: "logical",
        concept: "在两个事物之间建立大小、程度或性质差异的逻辑天平。",
        equation: "more + than = 多于/比……更",
        examples: ["more than (多于/超过)", "greater than this (比这个大)"],
        svgType: "than"
      }
    ]
  }
];

export const SUPPORTED_DIRECTION_WORDS = GROUPS.flatMap((g) => g.words.map((w) => w.word));
