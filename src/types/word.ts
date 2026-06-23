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
    bg: 'bg-amber-100',
    text: 'text-amber-800',
    border: 'border-amber-200/70',
    dot: 'bg-amber-600/75',
    sentenceText: '!text-amber-800/72',
    filterActive: 'bg-amber-50 text-amber-800 border-amber-200/80 shadow-sm',
    filterIdle:
      'bg-slate-50/70 text-slate-600 border-slate-200/80 hover:bg-amber-50/60 hover:text-amber-900 hover:border-amber-200/60',
  },
  actions: {
    zh: '动作·方位·连接',
    en: 'Actions & Function Words',
    icon: 'move',
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-200/70',
    dot: 'bg-blue-600/75',
    sentenceText: '!text-blue-800/70',
    filterActive: 'bg-blue-50 text-blue-800 border-blue-200/80 shadow-sm',
    filterIdle:
      'bg-slate-50/70 text-slate-600 border-slate-200/80 hover:bg-blue-50/60 hover:text-blue-900 hover:border-blue-200/60',
  },
  picturables: {
    zh: '看得见的物',
    en: 'Concrete Nouns',
    icon: 'eye',
    bg: 'bg-teal-100',
    text: 'text-teal-800',
    border: 'border-teal-200/70',
    dot: 'bg-teal-600/75',
    sentenceText: '!text-teal-800/72',
    filterActive: 'bg-teal-50 text-teal-800 border-teal-200/80 shadow-sm',
    filterIdle:
      'bg-slate-50/70 text-slate-600 border-slate-200/80 hover:bg-teal-50/60 hover:text-teal-900 hover:border-teal-200/60',
  },
  generals: {
    zh: '抽象的事物',
    en: 'Abstract Nouns',
    icon: 'package',
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200/70',
    dot: 'bg-green-700/75',
    sentenceText: '!text-green-800/68',
    filterActive: 'bg-green-50 text-green-800 border-green-200/80 shadow-sm',
    filterIdle:
      'bg-slate-50/70 text-slate-600 border-slate-200/80 hover:bg-green-50/60 hover:text-green-900 hover:border-green-200/60',
  },
  qualities: {
    zh: '形容词',
    en: 'Adjectives',
    icon: 'palette',
    bg: 'bg-cyan-100',
    text: 'text-cyan-800',
    border: 'border-cyan-200/70',
    dot: 'bg-cyan-600/75',
    sentenceText: '!text-cyan-800/70',
    filterActive: 'bg-cyan-50 text-cyan-800 border-cyan-200/80 shadow-sm',
    filterIdle:
      'bg-slate-50/70 text-slate-600 border-slate-200/80 hover:bg-cyan-50/60 hover:text-cyan-900 hover:border-cyan-200/60',
  },
  opposites: {
    zh: '成对形容词',
    en: 'Paired Adjectives',
    icon: 'blend',
    bg: 'bg-violet-100',
    text: 'text-violet-800',
    border: 'border-violet-200/70',
    dot: 'bg-violet-600/75',
    sentenceText: '!text-violet-800/72',
    filterActive: 'bg-violet-50 text-violet-800 border-violet-200/80 shadow-sm',
    filterIdle:
      'bg-slate-50/70 text-slate-600 border-slate-200/80 hover:bg-violet-50/60 hover:text-violet-900 hover:border-violet-200/60',
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
