export type RewriteChallenge = {
  id: string;
  hard: string;
  hardZh: string;
  models: string[];
  operators: string[];
  note?: string;
};

/** 降维改写 · 对照 begr-1937 Translation + 常见动词消除 */
export const REWRITE_CHALLENGES: RewriteChallenge[] = [
  {
    id: "r1",
    hard: "I decided to enter the room.",
    hardZh: "我决定走进房间。",
    models: ["I made a decision to go into the room.", "I went into the room."],
    operators: ["go", "make"],
    note: "enter → go in / go into",
  },
  {
    id: "r2",
    hard: "Please postpone the meeting.",
    hardZh: "请推迟会议。",
    models: ["Please put the meeting off.", "Put off the meeting, please."],
    operators: ["put"],
    note: "postpone → put off",
  },
  {
    id: "r3",
    hard: "She removed her coat and sat down.",
    hardZh: "她脱掉外套坐下了。",
    models: ["She took her coat off and went down on the seat.", "She took off her coat and went to the seat."],
    operators: ["take", "go"],
    note: "remove → take off",
  },
  {
    id: "r4",
    hard: "They continued working after lunch.",
    hardZh: "他们午饭后继续工作。",
    models: ["They went on with work after the meal.", "After the meal they went on working."],
    operators: ["go"],
    note: "continue → go on",
  },
  {
    id: "r5",
    hard: "I want to understand this book.",
    hardZh: "我想看懂这本书。",
    models: ["I have a desire to get knowledge of this book.", "I want to get knowledge of this book."],
    operators: ["get", "have"],
    note: "understand → get/have knowledge of",
  },
  {
    id: "r6",
    hard: "He arrived at the station quickly.",
    hardZh: "他很快到了车站。",
    models: ["He came to the station quickly.", "He got to the station quickly."],
    operators: ["come", "get"],
    note: "arrive → come to / get to",
  },
  {
    id: "r7",
    hard: "Open the window and let the air in.",
    hardZh: "打开窗户让空气进来。",
    models: ["Make the window open and let the air come in.", "Put the window open and let air come in."],
    operators: ["make", "let", "come"],
    note: "open → make open",
  },
  {
    id: "r8",
    hard: "My books are on the narrow table between the bed and the door.",
    hardZh: "我的书在床和门之间那张窄桌上。",
    models: ["My books are on that narrow table between the bed and the door."],
    operators: ["are"],
    note: "Basic Teacher · My Room 原句——你已能说出这段。",
  },
];
