import { WORDS, isOperator } from './words850Legacy';
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

  return {
    id: w.w.toLowerCase(),
    word: w.w,
    translation: w.cn || w.w,
    category,
    definition_en: `Basic English word: ${w.w}`,
    ipa: w.ipa
  };
});
