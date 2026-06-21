import { useState } from 'react';
import { sceneCoverUrl } from '../../lib/sceneAsset';

/** 场景封面 — 插画 webp；加载失败时保留渐变底，不显示破碎图标 */
export function SceneCover({
  slug,
  gradient,
  titleZh,
  overlayTitle,
  overlayMeta,
  className = '',
}: {
  slug: string;
  gradient: string;
  titleZh: string;
  /** 叠在封面底部的浅色标题（详情页用） */
  overlayTitle?: string;
  overlayMeta?: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ background: gradient }}
      aria-label={titleZh}
    >
      {!failed && (
        <img
          src={sceneCoverUrl(slug)}
          alt=""
          aria-hidden
          decoding="async"
          onError={() => setFailed(true)}
          className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />
      )}

      {overlayTitle ? (
        <>
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-black/45 via-black/15 to-transparent"
            aria-hidden
          />
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 px-4 pb-3 pt-10">
            <h3 className="text-lg font-bold tracking-tight text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]">
              {overlayTitle}
            </h3>
            {overlayMeta ? (
              <span className="shrink-0 text-[10px] font-semibold tabular-nums text-white/65">
                {overlayMeta}
              </span>
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  );
}
