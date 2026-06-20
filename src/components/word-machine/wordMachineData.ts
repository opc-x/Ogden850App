export type Combo = {
  result: string;
  cn: string;
  replaces: string;
  desc: string;
};

// Authoritative database of valid spatial phrasal verb combinations in Basic English
export const VALID_COMBOS: Record<string, Combo> = {
  // get
  "get up": { result: "get up", cn: "起床 / 站起", replaces: "rise / awaken", desc: "从平躺或坐姿垂直向上升起，进入站立或清醒状态。" },
  "get off": { result: "get off", cn: "下车 / 离开", replaces: "alight / depart", desc: "从交通工具（车、马等）或某个特定高处向下脱离。" },
  "get on": { result: "get on", cn: "上车 / 进展", replaces: "board / proceed", desc: "踏上交通工具表面，或在某项工作事务中向前进展。" },
  "get back": { result: "get back", cn: "取回 / 返回", replaces: "recover / return", desc: "主体移回原处，或者将失去的所有权重新拿回到手中。" },
  "get out": { result: "get out", cn: "出去 / 逃脱", replaces: "exit / escape", desc: "从封闭的容器或受限的物理空间内移动到外部。" },
  "get in": { result: "get in", cn: "进入 / 到达", replaces: "enter / arrive", desc: "由外部空间进入到某个封闭的容器、房间或车内。" },
  "get over": { result: "get over", cn: "克服 / 痊愈", replaces: "surmount / recover", desc: "越过某道物理障碍或心理关卡，从疾病或痛苦中康复。" },
  "get down": { result: "get down", cn: "趴下 / 降下", replaces: "crouch / descend", desc: "高度变低，降至地面或趴下以躲避。" },
  "get through": { result: "get through", cn: "通过 / 完成", replaces: "finish / pass", desc: "顺利通过物理通道，或完成一项艰难的任务。" },

  // put
  "put off": { result: "put off", cn: "推迟 / 延期", replaces: "postpone / delay", desc: "将待办事项在时间轴上向后移开，使之延期。" },
  "put on": { result: "put on", cn: "穿上 / 戴上", replaces: "don / wear", desc: "将覆盖物（衣服、鞋帽）放置并贴合到主体表面。" },
  "put out": { result: "put out", cn: "熄灭 / 出版", replaces: "extinguish / publish", desc: "使火焰或光亮移向外部（消失），或者把书籍向外推送（出版）。" },
  "put up": { result: "put up", cn: "竖起 / 建造", replaces: "erect / construct", desc: "将支柱、帐篷或看板垂直向上立起，并使之稳固。" },
  "put down": { result: "put down", cn: "放下 / 记下", replaces: "lower / record", desc: "将手中的物品朝地面方向放低，或者把文字向下写在纸上。" },
  "put together": { result: "put together", cn: "组装 / 组建", replaces: "assemble / compile", desc: "将零散的构件从四周向中心靠拢，融合成一个整体。" },
  "put in": { result: "put in", cn: "放进", replaces: "insert", desc: "将物品塞入到容器内部。" },
  "put back": { result: "put back", cn: "放回", replaces: "replace", desc: "把物品放回到原先放置的位置。" },

  // take
  "take off": { result: "take off", cn: "脱衣 / 起飞", replaces: "remove / depart", desc: "将覆盖物从主体表面拿开（脱衣），或飞机脱离地面飞向空中。" },
  "take in": { result: "take in", cn: "吸收 / 欺骗", replaces: "absorb / deceive", desc: "把外部的东西拿进内部（吸收），或者把别人带入圈套（欺骗）。" },
  "take up": { result: "take up", cn: "开始做 / 占据", replaces: "commence / occupy", desc: "开始从事某项活动，或将某物移入并充满特定的空间。" },
  "take over": { result: "take over", cn: "接管 / 接收", replaces: "assume control", desc: "越过原管理者的界限，把控制权或业务拿过来。" },
  "take back": { result: "take back", cn: "退回 / 收回", replaces: "retract / return", desc: "把已送出的物品退回，或把已说出口的话重新收回。" },
  "take away": { result: "take away", cn: "拿走 / 减去", replaces: "remove / subtract", desc: "把物品移离当前的视线或区域，在数学中表示减去。" },
  "take out": { result: "take out", cn: "取出", replaces: "extract", desc: "将容器内部 of 物品拿到外部来。" },
  "take down": { result: "take down", cn: "拆卸 / 记下", replaces: "dismantle / record", desc: "拆卸竖立的结构，或把听到的话记录下来。" },

  // give
  "give up": { result: "give up", cn: "放弃 / 投降", replaces: "surrender / abandon", desc: "把手松开、把东西向上交出，不再继续坚持持有。" },
  "give in": { result: "give in", cn: "屈服 / 妥协", replaces: "yield / submit", desc: "向压力低头，主动走入对方限定的意志范围。" },
  "give back": { result: "give back", cn: "归还", replaces: "return / restore", desc: "将拿到的物品送回到原主人的手中。" },
  "give out": { result: "give out", cn: "分发 / 耗尽", replaces: "distribute / exhaust", desc: "由中心向四周发放（分发），或力量向外散尽（耗尽）。" },
  "give away": { result: "give away", cn: "赠送 / 泄露", replaces: "donate / reveal", desc: "将物品无偿赠予他人，或无意中透露了秘密。" },

  // go
  "go on": { result: "go on", cn: "继续 / 发生", replaces: "continue / proceed", desc: "沿着已有的轨迹持续前行，或者事件在进行中。" },
  "go through": { result: "go through", cn: "穿过 / 经历", replaces: "penetrate / undergo", desc: "从通道、管道的入口进入并从出口穿出，隐喻经历磨难。" },
  "go out": { result: "go out", cn: "出去 / 熄灭", replaces: "exit / extinguish", desc: "自主移出屋子，或火焰/灯光熄灭（走到外部边界之外）。" },
  "go off": { result: "go off", cn: "爆炸 / 响铃", replaces: "explode / ring", desc: "主体突然向四面八方崩开（爆炸），或警报器响起发射声波。" },
  "go back": { result: "go back", cn: "回去", replaces: "return", desc: "调转运动方向，朝最初的起点或后方行进。" },
  "go down": { result: "go down", cn: "下降 / 沉没", replaces: "descend / sink", desc: "高度由高变低，或船只落入水面之下。" },
  "go up": { result: "go up", cn: "上涨 / 上升", replaces: "rise / ascend", desc: "价格上涨或高度向天空攀升。" },
  "go in": { result: "go in", cn: "进入", replaces: "enter", desc: "向屋子或容器内部移动。" },

  // come
  "come in": { result: "come in", cn: "进来 / 抵达", replaces: "enter", desc: "朝向说话者的封闭空间内部移入。" },
  "come out": { result: "come out", cn: "出来 / 显现", replaces: "emerge / appear", desc: "从封闭的背景中移出，显露到外部视野中。" },
  "come back": { result: "come back", cn: "回来", replaces: "return", desc: "主体重新朝向原有的说话者或起点位置移回。" },
  "come up": { result: "come up", cn: "走近 / 浮现", replaces: "approach / arise", desc: "在高度上向上浮出，或在物理距离上逐渐贴近。" },
  "come about": { result: "come about", cn: "发生", replaces: "happen / occur", desc: "事情绕着中心点运转并逐渐发生（产生结果）。" },
  "come from": { result: "come from", cn: "来自 / 源于", replaces: "originate", desc: "主体源自于某个特定的地点或家庭背景。" },
  "come down": { result: "come down", cn: "降下 / 传下", replaces: "descend", desc: "从高位落到低位，或传统代代相传。" },

  // keep
  "keep on": { result: "keep on", cn: "持续坚持", replaces: "persist / continue", desc: "把既定的行动维持在线路上，不偏离，不停止。" },
  "keep off": { result: "keep off", cn: "避开 / 勿入", replaces: "avoid / prevent", desc: "使主体与指定表面（如草坪）保持距离，防止接触。" },
  "keep up": { result: "keep up", cn: "维持高度/速度", replaces: "maintain", desc: "维持高位或快节奏，不让它跌落下去。" },
  "keep in": { result: "keep in", cn: "限制 / 关在里", replaces: "confine / trap", desc: "强行使某物滞留在界限内部，不允许其走到外侧。" },
  "keep back": { result: "keep back", cn: "阻挡 / 扣留", replaces: "hold back / retain", desc: "限制主体前行，让它在防线或后方维持原有距离。" },
  "keep out": { result: "keep out", cn: "留在外面 / 勿入", replaces: "exclude", desc: "阻止外部物体进入内部界限。" },

  // send
  "send out": { result: "send out", cn: "散发 / 发送", replaces: "emit / distribute", desc: "向外部四周推出信号、光波或派发物品。" },
  "send off": { result: "send off", cn: "寄出 / 驱逐", replaces: "dispatch / dismiss", desc: "使物品或人在推力下脱离当前位置，发往远方。" },
  "send back": { result: "send back", cn: "送回 / 退还", replaces: "return", desc: "给物体一个反向推力，将其送回到原点。" },
  "send away": { result: "send away", cn: "送走 / 遣送", replaces: "dismiss / banish", desc: "将人或物驱逐到外侧区域。" },

  // make
  "make up": { result: "make up", cn: "编造 / 组装", replaces: "invent / compose", desc: "把分散的细节黏合组装成一个新的故事或形象。" },
  "make out": { result: "make out", cn: "看清 / 辨认", replaces: "discern / decipher", desc: "让视线或思维穿透迷雾，梳理出清晰的内容结构。" },
  "make off": { result: "make off", cn: "溜走 / 逃跑", replaces: "flee / depart", desc: "在不引起注意的情况下，快速离开特定地方。" },

  // see
  "see through": { result: "see through", cn: "看穿 / 识破", replaces: "discern / detect", desc: "视线或心智穿透遮挡物或伪装，直达事物的真实内部。" },
  "see about": { result: "see about", cn: "考虑 / 安排", replaces: "consider / arrange", desc: "目光围绕某件事打转，进行打理、考虑和妥善安排。" },

  // let
  "let out": { result: "let out", cn: "放出 / 泄露", replaces: "release / reveal", desc: "允许滞留内部的主体移到容器外部，或泄露秘密。" },
  "let in": { result: "let in", cn: "放进", replaces: "admit / enter", desc: "撤销边界防线，允许外部主体进入内部。" },
  "let go": { result: "let go", cn: "松手 / 释放", replaces: "release / drop", desc: "放手松开抓握，任由物体依靠重力或惯性离去。" },

  // do
  "do with": { result: "do with", cn: "处理 / 需要", replaces: "handle / need", desc: "对事物进行处置，或表达对某种事物的迫切需要。" },
  "do without": { result: "do without", cn: "没有...也行", replaces: "manage without", desc: "在缺少某件物品的前提下，依然维持现有事务运行。" },

  // say
  "say against": { result: "say against", cn: "反对 / 指责", replaces: "oppose / criticize", desc: "发表言论指责或反对某人或某观点。" },

  // be
  "be back": { result: "be back", cn: "回来了 / 返回", replaces: "return", desc: "主体已经回到了原处状态。" },
  "be in": { result: "be in", cn: "在里面 / 参与", replaces: "inside / present", desc: "主体处于某容器、房间内部或加入了活动。" },
  "be out": { result: "be out", cn: "在外面 / 熄灭", replaces: "outside / extinguished", desc: "主体处于外部边界，或火焰/灯火已经灭去。" },
  "be up": { result: "be up", cn: "到期 / 起床", replaces: "expired / risen", desc: "时间已经用尽到期，或人已经起床。" },
  "be down": { result: "be down", cn: "情绪低落 / 降下", replaces: "sad / lowered", desc: "主体处于低矮位置，或情绪处于消沉状态。" },
  "be over": { result: "be over", cn: "结束了", replaces: "finished / ended", desc: "时间跨过了终点界限，事件宣告彻底结束。" },

  // have
  "have on": { result: "have on", cn: "穿着 / 戴着", replaces: "wear", desc: "身体表面当前正维持着衣物鞋帽的覆盖状态。" },

  // seem
  "seem like": { result: "seem like", cn: "好像 / 似乎是", replaces: "resemble", desc: "折射呈现出某种特定的特征，看起来像某物。" }
};

export const OPERATORS = [
  "come", "go", "put", "take", "give", "get", "send", "keep", "let", "make", "do", "see", "say", "be", "have", "seem", "may", "will"
];

export const DIRECTIONS = [
  "about", "across", "after", "against", "among", "at", "before", "between", "by", "down",
  "from", "in", "off", "on", "over", "through", "to", "under", "up", "with"
];
