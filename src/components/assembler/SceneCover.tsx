import { useState } from 'react';
import { sceneCoverUrl } from '../../lib/sceneAsset';

/** 场景封面原生比例 1536×614 ≈ 5:2 */
export const SCENE_COVER_ASPECT_CLASS = 'aspect-[5/2]';

/** 列表网格封面 — 降饱和 + 微提亮，视觉更清爽 */
export const SCENE_COVER_SOFT_CLASS =
  'saturate-[0.72] brightness-[1.06] contrast-[0.97] group-hover:saturate-[0.82] group-hover:brightness-[1.04] transition-[filter] duration-300';

/** 顶部轮播 hero — 比列表缩略图更鲜艳，接近原图 */
export const SCENE_COVER_CAROUSEL_CLASS =
  'saturate-[0.92] brightness-[1.02] contrast-[1.01] transition-[filter] duration-300';

/** 场景封面 — 插画 webp；加载失败时保留渐变底，不显示破碎图标 */
export function SceneCover({
  slug,
  gradient,
  titleZh,
  overlayTitle,
  overlayMeta,
  tone = 'default',
  fit,
  className = '',
}: {
  slug: string;
  gradient: string;
  titleZh: string;
  /** 叠在封面底部的浅色标题（详情页用） */
  overlayTitle?: string;
  overlayMeta?: string;
  /** soft = 列表缩略图，降饱和更清爽 */
  tone?: 'default' | 'soft';
  /** contain = 完整展示 5:2 插画；cover = 铺满裁切（详情叠字用） */
  fit?: 'cover' | 'contain';
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const imgTone = tone === 'soft' ? SCENE_COVER_SOFT_CLASS : '';
  const objectFit = fit ?? (overlayTitle || tone === 'soft' ? 'contain' : 'cover');
  const useContain = objectFit === 'contain';

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ background: failed || !useContain ? gradient : undefined }}
      aria-label={titleZh}
    >
      {!failed && (
        <img
          src={sceneCoverUrl(slug)}
          alt=""
          aria-hidden
          decoding="async"
          onError={() => setFailed(true)}
          className={
            useContain
              ? `pointer-events-none h-full w-full select-none object-contain object-center ${imgTone}`
              : `absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105 ${imgTone}`
          }
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
