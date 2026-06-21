export type WordCategory =
  | 'operators'
  | 'actions'
  | 'picturables'
  | 'generals'
  | 'qualities'
  | 'opposites';

export interface Word {
  id: string;
  word: string;
  translation: string;
  category: WordCategory;
  definition_en: string;
  ipa?: string;
  visual_type?: string;
  visual_ref?: string | null;
  audio_url?: string | null;
}

/** UI skin — category chrome only; counts come from DB at runtime */
export const OGDEN_CATEGORY_ORDER = [
  'operators',
  'actions',
  'picturables',
  'generals',
  'qualities',
  'opposites',
] as const satisfies readonly WordCategory[];

export const CATEGORY_LABELS: Record<
  string,
  {
    zh: string;
    en: string;
    icon: string;
    bg: string;
    text: string;
    border: string;
    dot: string;
    sentenceText: string;
    filterActive: string;
    filterIdle: string;
  }
> = {
  operators: {
    zh: '造句动词',
    en: 'Core Operators',
    icon: 'activity',
    bg: 'bg-orange-100',
    text: 'text-orange-700',
    border: 'border-orange-200',
    dot: 'bg-orange-600',
    sentenceText: '!text-orange-700',
    filterActive: 'bg-orange-50 text-orange-700 border-orange-200 shadow-sm',
    filterIdle: 'bg-slate-50/70 text-slate-600 border-slate-200/80 hover:bg-orange-50/60 hover:text-orange-800 hover:border-orange-100',
  },
  actions: {
    zh: '动作·方位·连接',
    en: 'Actions & Function Words',
    icon: 'move',
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    border: 'border-blue-200',
    dot: 'bg-blue-600',
    sentenceText: '!text-blue-700',
    filterActive: 'bg-blue-50 text-blue-700 border-blue-200 shadow-sm',
    filterIdle: 'bg-slate-50/70 text-slate-600 border-slate-200/80 hover:bg-blue-50/60 hover:text-blue-800 hover:border-blue-100',
  },
  picturables: {
    zh: '看得见的物',
    en: 'Concrete Nouns',
    icon: 'eye',
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dot: 'bg-emerald-600',
    sentenceText: '!text-emerald-700',
    filterActive: 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm',
    filterIdle: 'bg-slate-50/70 text-slate-600 border-slate-200/80 hover:bg-emerald-50/60 hover:text-emerald-800 hover:border-emerald-100',
  },
  generals: {
    zh: '抽象的事物',
    en: 'Abstract Nouns',
    icon: 'package',
    bg: 'bg-green-100',
    text: 'text-green-700',
    border: 'border-green-200',
    dot: 'bg-green-600',
    sentenceText: '!text-green-700',
    filterActive: 'bg-green-50 text-green-700 border-green-200 shadow-sm',
    filterIdle: 'bg-slate-50/70 text-slate-600 border-slate-200/80 hover:bg-green-50/60 hover:text-green-800 hover:border-green-100',
  },
  qualities: {
    zh: '形容词',
    en: 'Adjectives',
    icon: 'palette',
    bg: 'bg-sky-100',
    text: 'text-sky-700',
    border: 'border-sky-200',
    dot: 'bg-sky-600',
    sentenceText: '!text-sky-700',
    filterActive: 'bg-sky-50 text-sky-700 border-sky-200 shadow-sm',
    filterIdle: 'bg-slate-50/70 text-slate-600 border-slate-200/80 hover:bg-sky-50/60 hover:text-sky-800 hover:border-sky-100',
  },
  opposites: {
    zh: '成对形容词',
    en: 'Paired Adjectives',
    icon: 'blend',
    bg: 'bg-violet-100',
    text: 'text-violet-700',
    border: 'border-violet-200',
    dot: 'bg-violet-600',
    sentenceText: '!text-violet-700',
    filterActive: 'bg-violet-50 text-violet-700 border-violet-200 shadow-sm',
    filterIdle: 'bg-slate-50/70 text-slate-600 border-slate-200/80 hover:bg-violet-50/60 hover:text-violet-800 hover:border-violet-100',
  },
};

export function categorySentenceText(category: WordCategory | null | undefined): string {
  if (!category) return '';
  return CATEGORY_LABELS[category]?.sentenceText ?? '';
}

export function categoryBadgeClass(category: WordCategory | null | undefined): string {
  if (!category) return 'bg-slate-50 text-slate-600 border-slate-200';
  const c = CATEGORY_LABELS[category];
  if (!c) return 'bg-slate-50 text-slate-600 border-slate-200';
  return `${c.bg.replace('-100', '-50')} ${c.text} ${c.border}`;
}
