import { WORDS, isOperator } from './words850Legacy';
import wordGuides from '../components/word-guides.json';

export interface Word {
  id: string;
  word: string;
  translation: string;
  category: 'operators' | 'actions' | 'picturables' | 'generals' | 'qualities' | 'opposites';
  definition_en: string;
  ipa?: string;
}

export const CATEGORY_LABELS: Record<string, { zh: string; en: string; icon: string; bg: string; text: string; border: string; count: number }> = {
  operators: {
    zh: '核心动词',
    en: 'Operators',
    icon: 'activity',
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    border: 'border-amber-200',
    count: 18,
  },
  actions: {
    zh: '方向与结构',
    en: 'Directions & Operations',
    icon: 'move',
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    border: 'border-blue-200',
    count: 82,
  },
  picturables: {
    zh: '可见物',
    en: 'Picturable Things',
    icon: 'eye',
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    count: 200,
  },
  generals: {
    zh: '普通名词',
    en: 'General Things',
    icon: 'package',
    bg: 'bg-green-100',
    text: 'text-green-700',
    border: 'border-green-200',
    count: 400,
  },
  qualities: {
    zh: '性质词',
    en: 'Qualities (Adjectives)',
    icon: 'palette',
    bg: 'bg-sky-100',
    text: 'text-sky-700',
    border: 'border-sky-200',
    count: 100,
  },
  opposites: {
    zh: '反义词',
    en: 'Opposites (Adjectives)',
    icon: 'blend',
    bg: 'bg-rose-100',
    text: 'text-rose-700',
    border: 'border-rose-200',
    count: 50,
  },
};

export const wordsData: Word[] = WORDS.map(w => {
  let category: Word['category'] = 'generals';
  
  if (w.t === 'ops') {
    category = isOperator(w.w) ? 'operators' : 'actions';
  } else if (w.t === 'pic') {
    category = 'picturables';
  } else if (w.t === 'things') {
    category = 'generals';
  } else if (w.t === 'qual') {
    category = 'qualities';
  } else if (w.t === 'opp') {
    category = 'opposites';
  }

  const lowerW = w.w.toLowerCase();
  const guide = (wordGuides as Record<string, any>)[lowerW];
  let definition = `Basic English word: ${w.w}`;
  if (guide && guide.hook) {
    definition = `【秒懂】${guide.hook} 【解析】${guide.concept || ''}`;
  }

  return {
    id: lowerW,
    word: w.w,
    translation: w.cn || w.w,
    category,
    definition_en: definition,
    ipa: w.ipa
  };
});
