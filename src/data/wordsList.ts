import { WORDS, isOperator } from './words850Legacy';
import wordGuides from '../components/word-guides.json';
import type { Word } from '../types/word';

export type { Word } from '../types/word';
export { CATEGORY_LABELS } from '../types/word';

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
