import { tokenizeSentence, hasClickableWord } from '../../lib/wordTokens';
import type { TokenRole } from '../../types/vocab';

interface ClickableSentenceProps {
  sentence: string;
  onWordClick?: (wordId: string) => void;
  className?: string;
}

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
        if (clickable && tok.wordId) {
          return (
            <button
              key={i}
              type="button"
              className={`asm-chunk asm-chunk--${role} asm-chunk--ogden asm-chunk--link`}
              onClick={() => onWordClick(tok.wordId!)}
              title="查看词典详情"
            >
              {tok.surface}
            </button>
          );
        }
        if (tok.wordId) {
          return (
            <span key={i} className={`asm-chunk asm-chunk--${role} asm-chunk--ogden`}>
              {tok.surface}
            </span>
          );
        }
        return (
          <span key={i} className={`asm-chunk asm-chunk--${role}`}>
            {tok.surface}
          </span>
        );
      })}
    </span>
  );
}
