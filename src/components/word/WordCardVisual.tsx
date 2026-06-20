import type { ReactNode } from 'react';
import type { Word } from '../../types/word';
import OperatorVisual from '../OperatorVisual';
import { DirectionGraphic, SUPPORTED_DIRECTION_WORDS } from '../DirectionsVisual';
import GrammarWordVisual from '../GrammarWordVisual';
import PicturableWordVisual from '../concept/PicturableWordVisual';
import GeneralWordVisual from '../concept/GeneralWordVisual';
import { QualityWordVisual, OppositeWordVisual } from '../concept/TraitWordVisual';
import WordIllustrationImg from './WordIllustrationImg';

export type WordVisualSize = 'thumb' | 'detail' | 'inline';

/** 词卡左侧图标外框 — BrowserView 等复用 */
export const WORD_THUMB_OUTER =
  'flex items-center justify-center w-14 sm:w-16 shrink-0 mr-4 sm:mr-5';

/** 词卡左侧图标内框 — 正方形，避免 PNG 在扁矩形里被拉伸 */
export const WORD_THUMB_INNER = 'aspect-square w-full flex items-center justify-center';

function shellClass(size: WordVisualSize): string {
  if (size === 'detail') return 'word-card-visual word-card-visual--detail';
  if (size === 'inline') return 'word-card-visual word-card-visual--inline';
  return 'word-card-visual word-card-visual--thumb';
}

function VisualShell({ size, children }: { size: WordVisualSize; children: ReactNode }) {
  return <div className={shellClass(size)}>{children}</div>;
}

export type WordVisualInput = Pick<Word, 'word' | 'category'>;

function ProceduralVisual({ word }: { word: WordVisualInput }) {
  const w = word.word;
  const cat = word.category;

  if (cat === 'operators') {
    return <OperatorVisual type={w} />;
  }

  if (cat === 'actions') {
    const lower = w.toLowerCase();
    if (SUPPORTED_DIRECTION_WORDS.includes(lower)) {
      return <DirectionGraphic type={lower} />;
    }
    return <GrammarWordVisual type={w} />;
  }

  if (cat === 'picturables') {
    return <PicturableWordVisual type={w} />;
  }

  if (cat === 'generals') {
    return <GeneralWordVisual type={w} />;
  }

  if (cat === 'qualities') {
    return <QualityWordVisual type={w} />;
  }

  if (cat === 'opposites') {
    return <OppositeWordVisual type={w} />;
  }

  return <GrammarWordVisual type={w} />;
}

/** 850 词插图统一路由 — PNG 优先，程序化 SVG 回退 */
export default function WordCardVisual({
  word,
  size = 'thumb',
}: {
  word: WordVisualInput;
  size?: WordVisualSize;
}) {
  return (
    <VisualShell size={size}>
      <WordIllustrationImg
        word={word.word}
        fallback={<ProceduralVisual word={word} />}
      />
    </VisualShell>
  );
}
