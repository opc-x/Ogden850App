export type PracticeQuestion = {
  id: string;
  prompt: string;
  /** 官方参考答案；可多个等价写法 */
  answers: string[];
  hint?: string;
};

export type FillBlank = {
  id: string;
  /** 用 ___ 标空位 */
  template: string;
  blanks: string[];
  hint?: string;
};

export type StepByStepLesson = {
  id: string;
  number: number;
  title: string;
  titleZh: string;
  source: "Ogden · Basic Step by Step (1935)";
  vocab: string[];
  modelSentences: string[];
  questions: PracticeQuestion[];
};

export type BasicTeacherStep = {
  id: string;
  number: number;
  title: string;
  titleZh: string;
  source: "Lockhart · The Basic Teacher (1950)";
  kind: "structure" | "reading";
  vocab: string[];
  /** Structure 课：语法示范句 */
  structureSentences?: string[];
  /** Reading 课：课文段落 */
  readingTitle?: string;
  readingParagraphs?: string[];
  fillBlanks?: FillBlank[];
  questions: PracticeQuestion[];
};
