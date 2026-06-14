export type SourceLink = {
  label: string;
  url: string;
  note?: string;
};

export const GLOBAL_SOURCES: SourceLink[] = [
  { label: "The Basic Teacher（45 课完整训练）", url: "https://zbenglish.net/sites/basic/bt0.html", note: "组句+阅读，首选" },
  { label: "Basic Step by Step（30 主题示范句）", url: "https://zbenglish.net/sites/basic/bsbs.html", note: "跟读造句" },
  { label: "zbenglish.net 镜像总站", url: "https://zbenglish.net/sites/basic/basiceng.html", note: "原 ogden.basic-english.org 替代" },
  { label: "850 词表（Ogden 原序）", url: "https://zbenglish.net/sites/basic/words.html" },
  { label: "Wiktionary 850 词附录", url: "https://en.wiktionary.org/wiki/Appendix:Basic_English_word_list" },
  { label: "出处索引（仓库内）", url: "/doc/sources", note: "完整对照表" },
];

export const PAGE_SOURCES: Record<string, SourceLink[]> = {
  start: [
    { label: "The Basic Teacher（开练入口）", url: "https://zbenglish.net/sites/basic/bt0.html", note: "45 课组句训练" },
    { label: "Basic Step by Step", url: "https://zbenglish.net/sites/basic/bsbs.html", note: "30 主题示范句" },
    { label: "Ogden · General Introduction (1930)", url: "https://onlinebooks.library.upenn.edu/webbin/book/lookupid?key=ha102944655", note: "理论体系原著" },
    { label: "zbenglish 书目目录", url: "https://zbenglish.net/sites/basic/books.html" },
  ],
  operators: [
    { label: "begr-1937 · Verb-Elimination", url: "https://zbenglish.net/sites/basic/begr.html#verb", note: "18 operator 理念出处" },
    { label: "850 词 Operations 类", url: "https://zbenglish.net/sites/basic/words.html" },
  ],
  directions: [{ label: "850 词 Operations", url: "https://zbenglish.net/sites/basic/words.html" }],
  grammar: [
    { label: "rules.html（十条语法原文）", url: "https://zbenglish.net/sites/basic/rules.html", note: "造句基础" },
    { label: "The Basic Teacher · Structure 课", url: "https://zbenglish.net/sites/basic/bt0.html", note: "语法+例句练习" },
    { label: "begr-1937 全文", url: "/assets/begr-1937.html", note: "本仓库镜像" },
    { label: "begr-1937 在线", url: "https://zbenglish.net/sites/basic/begr.html" },
  ],
  "tier-guide": [
    { label: "850 词五类原序", url: "https://zbenglish.net/sites/basic/words.html" },
    { label: "The ABC of Basic English (1932)", url: "https://books.google.com/books?id=Q-AtAAAAYAAJ" },
  ],
  words: [
    { label: "words.html（Ogden 原序）", url: "https://zbenglish.net/sites/basic/words.html" },
    { label: "wordalph.html（字母序）", url: "https://zbenglish.net/sites/basic/wordalph.html" },
    { label: "本仓库 PDF", url: "/assets/ogdens-basic-english-850.pdf" },
  ],
  phrasal: [{ label: "begr-1937 · Verb-Elimination", url: "https://zbenglish.net/sites/basic/begr.html#verb" }],
  affixes: [{ label: "begr-1937 · Orthological Syntax", url: "https://zbenglish.net/sites/basic/begr.html#syntax" }],
  compounds: [{ label: "begr-1937", url: "https://zbenglish.net/sites/basic/begr.html" }],
  "practice-sbs": [
    { label: "Basic Step by Step 原文", url: "https://zbenglish.net/sites/basic/bsbs.html", note: "Ogden 1935" },
    { label: "站内跟读模块", url: "/practice/step-by-step/body", note: "本页交互练习" },
  ],
  "practice-bt": [
    { label: "The Basic Teacher 原文", url: "https://zbenglish.net/sites/basic/bt0.html", note: "Lockhart 1950" },
    { label: "站内系统课", url: "/practice/basic-teacher/bt1", note: "本页交互练习" },
  ],
  practice: [
    { label: "示范句跟读（站内）", url: "/practice/step-by-step/body" },
    { label: "Basic Teacher（站内）", url: "/practice/basic-teacher/bt1" },
    { label: "The Basic Teacher（45 课）", url: "https://zbenglish.net/sites/basic/bt0.html", note: "zbenglish 全文" },
    { label: "Basic Step by Step（30 主题）", url: "https://zbenglish.net/sites/basic/bsbs.html", note: "zbenglish 全文" },
    { label: "begr-1937 · Translation", url: "https://zbenglish.net/sites/basic/begr.html#trans", note: "降维改写范例" },
    { label: "zbenglish 改编读物目录", url: "https://zbenglish.net/sites/basic/books.html", note: "小说/剧本全文" },
    { label: "ETP Book 1 PDF", url: "/assets/english-through-pictures-book1.pdf" },
    { label: "Archive · ETP", url: "https://archive.org/details/EnglishThroughPictures_201901" },
    { label: "Learning Basic English (1945)", url: "https://archive.org/details/in.ernet.dli.2015.166025", note: "Archive 借阅" },
    { label: "Bible in Basic English", url: "https://archive.org/details/BBEFreePDFBibleinBasicEnglish" },
  ],
  distill: [{ label: "manifest.json", url: "https://github.com/opc-x/OgdenBasicEnglish/blob/main/manifest.json", note: "本仓库自编" }],
  begr: [
    { label: "begr-1937 HTML", url: "/assets/begr-1937.html" },
    { label: "zbenglish 镜像", url: "https://zbenglish.net/sites/basic/begr.html" },
  ],
  survey: [{ label: "zbenglish.net", url: "https://zbenglish.net/sites/basic/basiceng.html" }],
  copyright: [{ label: "Penn · Ogden 著作", url: "https://onlinebooks.library.upenn.edu/webbin/who/Ogden%2C%20C.%20K.%20%28Charles%20Kay%29%2C%201889-1957" }],
  sources: GLOBAL_SOURCES,
};

/** 仅在这些页展示侧边栏出处面板（其余页可到 /doc/sources 或首页条带查看） */
export const SOURCE_PANEL_SLUGS = new Set([
  "start",
  "operators",
  "grammar",
  "tier-guide",
  "words",
  "phrasal",
  "affixes",
  "compounds",
  "practice",
  "practice-sbs",
  "practice-bt",
  "begr",
]);

export function getPageSources(slug: string): SourceLink[] {
  return PAGE_SOURCES[slug] ?? [];
}

export function shouldShowSourcesPanel(slug: string): boolean {
  return SOURCE_PANEL_SLUGS.has(slug) && getPageSources(slug).length > 0;
}
