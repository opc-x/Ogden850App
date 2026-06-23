import { tokenizeSentence, hasClickableWord } from '../../lib/wordTokens';
import { categorySentenceText } from '../../types/word';
import type { TokenRole } from '../../types/vocab';

interface ClickableSentenceProps {
  sentence: string;
  onWordClick?: (wordId: string) => void;
  className?: string;
}

const LINK_CLASS =
  'cursor-pointer border-0 p-0 m-0 bg-transparent font-inherit inline font-semibold underline underline-offset-2 decoration-current/20 hover:decoration-current/35 active:opacity-90 touch-manipulation';

const HIGHLIGHT_CLASS = 'font-semibold';

export function ClickableSentence({ sentence, onWordClick, className }: ClickableSentenceProps) {
  const tokens = tokenizeSentence(sentence);

  return (
    <span className={className}>
      {tokens.map((tok, i) => {
        if (tok.isWhitespace) {
          return <span key={i}>{tok.surface}</span>;
        }
        const clickable = onWordClick && hasClickableWord(tok);
        const role = tok.role as TokenRole;
        const catColor = categorySentenceText(tok.category);
        if (clickable && tok.wordId) {
          return (
            <button
              key={i}
              type="button"
              className={`${LINK_CLASS} ${catColor}`}
              onClick={() => onWordClick(tok.wordId!)}
              title="查看词典详情"
            >
              {tok.surface}
            </button>
          );
        }
        if (tok.wordId) {
          return (
            <span key={i} className={`${HIGHLIGHT_CLASS} ${catColor}`}>
              {tok.surface}
            </span>
          );
        }
        return (
          <span key={i} className={`asm-chunk--${role}`}>
            {tok.surface}
          </span>
        );
      })}
    </span>
  );
}
