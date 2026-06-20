import { useState, type ReactNode } from 'react';
import { wordIllustrationCandidates } from '../../lib/wordIllustration';

type Props = {
  word: string;
  fallback: ReactNode;
  className?: string;
  eager?: boolean;
};

/** 渲染 public/assets/word-img/{word}.png；缺失时回退程序化 SVG 组件 */
export default function WordIllustrationImg({ word, fallback, className, eager }: Props) {
  const candidates = wordIllustrationCandidates(word);
  const [idx, setIdx] = useState(0);

  if (idx >= candidates.length) {
    return <>{fallback}</>;
  }

  return (
    <img
      src={candidates[idx]}
      alt=""
      aria-hidden
      width={128}
      height={128}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      className={className ?? 'word-illustration-img'}
      onError={() => setIdx((i) => i + 1)}
    />
  );
}
