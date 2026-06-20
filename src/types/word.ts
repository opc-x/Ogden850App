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
}

/** UI skin — category chrome only; counts come from DB at runtime */
export const CATEGORY_LABELS: Record<
  string,
  { zh: string; en: string; icon: string; bg: string; text: string; border: string }
> = {
  operators: {
    zh: '核心动词',
    en: 'Operators',
    icon: 'activity',
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    border: 'border-amber-200',
  },
  actions: {
    zh: '方向与结构',
    en: 'Directions & Operations',
    icon: 'move',
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    border: 'border-blue-200',
  },
  picturables: {
    zh: '可见物',
    en: 'Picturable Things',
    icon: 'eye',
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
  },
  generals: {
    zh: '普通名词',
    en: 'General Things',
    icon: 'package',
    bg: 'bg-green-100',
    text: 'text-green-700',
    border: 'border-green-200',
  },
  qualities: {
    zh: '性质词',
    en: 'Qualities (Adjectives)',
    icon: 'palette',
    bg: 'bg-sky-100',
    text: 'text-sky-700',
    border: 'border-sky-200',
  },
  opposites: {
    zh: '反义词',
    en: 'Opposites (Adjectives)',
    icon: 'blend',
    bg: 'bg-rose-100',
    text: 'text-rose-700',
    border: 'border-rose-200',
  },
};
