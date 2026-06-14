export type ScenarioChallenge = {
  id: string;
  title: string;
  titleZh: string;
  source: string;
  promptZh: string;
  hint: string;
  modelSentences: string[];
  mustUse?: string[];
};

export const SCENARIO_CHALLENGES: ScenarioChallenge[] = [
  {
    id: "room",
    title: "My Room",
    titleZh: "我的房间",
    source: "Basic Teacher Step 2",
    promptZh: "用 2–3 句描述：书在哪？床在哪？",
    hint: "用 on / between / against / under",
    modelSentences: [
      "My books are on the narrow table between the bed and the door.",
      "My bed is against the wall under the window.",
    ],
    mustUse: ["book", "table", "bed"],
  },
  {
    id: "station",
    title: "At the Station",
    titleZh: "在车站",
    source: "Basic Teacher Step 4",
    promptZh: "用 2–3 句说：你怎么去办公室？票放哪？",
    hint: "用 train / ticket / pocket / with",
    modelSentences: [
      "I go to my office in a train.",
      "I give a ticket to my friend and put the other in my pocket.",
    ],
    mustUse: ["train", "ticket"],
  },
  {
    id: "body",
    title: "The Body",
    titleZh: "身体",
    source: "Basic Step by Step §1",
    promptZh: "用 put / take 描述手与头的关系（至少 2 句）",
    hint: "I put my hand on my head. I take my hand off my head.",
    modelSentences: [
      "I put my right hand on my head.",
      "I take my right hand off my head.",
    ],
    mustUse: ["put", "take", "hand"],
  },
  {
    id: "meal",
    title: "At a Meal",
    titleZh: "吃饭",
    source: "Basic Step by Step §2",
    promptZh: "描述一顿饭：桌上有什么？你怎么喝汤？",
    hint: "food / table / spoon / mouth",
    modelSentences: [
      "Some food is on the table.",
      "I take my spoon in my hand and put the soup in my mouth.",
    ],
    mustUse: ["food", "table"],
  },
  {
    id: "weather",
    title: "Rainy Day",
    titleZh: "下雨天",
    source: "Basic Step by Step §4",
    promptZh: "下雨时你怎么保持衣服干燥？",
    hint: "umbrella / over / wet / dry",
    modelSentences: [
      "In wet weather I get an umbrella and put it over my head.",
      "Only my umbrella will be wet. My coat will be dry.",
    ],
    mustUse: ["umbrella"],
  },
  {
    id: "family",
    title: "The Baby",
    titleZh: "宝宝",
    source: "Basic Step by Step §5",
    promptZh: "说两句关于 baby brother：他有什么？你要给他拿什么？",
    hint: "baby / milk / brother",
    modelSentences: [
      "My brother is very young. He is still a baby.",
      "I will get some milk for my baby brother.",
    ],
    mustUse: ["baby"],
  },
];
