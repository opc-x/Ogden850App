/** 场景封面 — 插画 webp/png 优先，SVG 兜底 */
import { useState } from 'react';

const FORMATS = ['webp', 'png', 'svg'] as const;

export function SceneCover({
  slug,
  gradient,
  titleZh,
  className = '',
}: {
  slug: string;
  gradient: string;
  titleZh: string;
  className?: string;
}) {
  const [formatIdx, setFormatIdx] = useState(0);
  const ext = FORMATS[formatIdx] ?? 'svg';
  const imgSrc = `/assets/scenes/${slug}.${ext}`;

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ background: gradient }}
    >
      <img
        src={imgSrc}
        alt={titleZh}
        className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
        onError={() => {
          if (formatIdx < FORMATS.length - 1) setFormatIdx((i) => i + 1);
        }}
      />
    </div>
  );
}
