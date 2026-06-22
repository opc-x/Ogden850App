import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type FC } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { SceneCatalogItem } from '../../types/scene';
import { sceneCoverUrl } from '../../lib/sceneAsset';
import { SCENE_COVER_ASPECT_CLASS, SCENE_COVER_CAROUSEL_CLASS } from './SceneCover';

const CARD_WIDTH_CLASS = 'w-[50vw] max-w-[12.5rem] sm:w-[12.5rem]';
const BUFFER = 2;

const DOCK_MAX_SCALE = 1.14;
const DOCK_MIN_SCALE = 0.62;
const DOCK_RADIUS_PX = 125;

type CardFocus = { scale: number; opacity: number; y: number; blurPx: number };
type LoopItem = SceneCatalogItem & { loopKey: string };
type ScrollDir = 'left' | 'right' | null;

function buildLoopItems(items: SceneCatalogItem[]): { loopItems: LoopItem[]; baseOffset: number } {
  if (items.length === 0) return { loopItems: [], baseOffset: 0 };
  if (items.length === 1) {
    return { loopItems: [{ ...items[0], loopKey: items[0].slug }], baseOffset: 0 };
  }

  const head = items.slice(-BUFFER);
  const tail = items.slice(0, BUFFER);
  const loopItems = [...head, ...items, ...tail].map((scene, i) => ({
    ...scene,
    loopKey: `${i}-${scene.slug}`,
  }));

  return { loopItems, baseOffset: BUFFER };
}

function dockFocus(distancePx: number): Omit<CardFocus, 'blurPx'> {
  const t = distancePx / DOCK_RADIUS_PX;
  const influence = Math.exp(-t * t * 1.5);
  return {
    scale: DOCK_MIN_SCALE + (DOCK_MAX_SCALE - DOCK_MIN_SCALE) * influence,
    opacity: 0.45 + 0.55 * Math.exp(-t * t * 1.0),
    y: Math.min(t, 1.1) * 4,
  };
}

const DEFAULT_FOCUS: CardFocus = { ...dockFocus(Number.POSITIVE_INFINITY), blurPx: 0 };

function measureDock(container: HTMLDivElement, scrollDir: ScrollDir) {
  const cards = container.querySelectorAll<HTMLElement>('[data-carousel-card]');
  const containerRect = container.getBoundingClientRect();
  const focusCenter = containerRect.left + containerRect.width / 2;
  const focuses: CardFocus[] = [];
  let activeExtended = 0;
  let bestDist = Number.POSITIVE_INFINITY;

  cards.forEach((card, index) => {
    const rect = card.getBoundingClientRect();
    const cardCenter = rect.left + rect.width / 2;
    const dist = Math.abs(focusCenter - cardCenter);
    focuses.push({ ...dockFocus(dist), blurPx: 0 });
    if (dist < bestDist) {
      bestDist = dist;
      activeExtended = index;
    }
  });

  focuses.forEach((focus, index) => {
    const rect = cards[index].getBoundingClientRect();
    const cardCenter = rect.left + rect.width / 2;
    if (!scrollDir || index === activeExtended) return;
    if (scrollDir === 'left' && cardCenter > focusCenter + 12) {
      focuses[index] = { ...focus, blurPx: 6 };
    } else if (scrollDir === 'right' && cardCenter < focusCenter - 12) {
      focuses[index] = { ...focus, blurPx: 6 };
    }
  });

  return { focuses, activeExtended };
}

function toLogicalIndex(extended: number, baseOffset: number, realCount: number) {
  if (realCount <= 1) return 0;
  let idx = extended - baseOffset;
  idx = ((idx % realCount) + realCount) % realCount;
  return idx;
}

function scrollCardToCenter(el: HTMLDivElement, card: HTMLElement, behavior: ScrollBehavior) {
  const left = card.offsetLeft - (el.clientWidth - card.offsetWidth) / 2;
  const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth);
  el.scrollTo({ left: Math.max(0, Math.min(maxScroll, left)), behavior });
}

type ScenePreviewCardProps = {
  scene: LoopItem;
  focus: CardFocus;
  highlighted: boolean;
  onSelect?: () => void;
};

const ScenePreviewCard: FC<ScenePreviewCardProps> = ({
  scene,
  focus,
  highlighted,
  onSelect,
}) => {
  const frame = (
      <div
        className={`rounded-2xl transition-all duration-300 ${
          highlighted
            ? 'p-[2px] bg-gradient-to-br from-[#2f7d4f]/50 via-white/95 to-cyan-100/70 shadow-[0_0_0_1px_rgba(255,255,255,0.55)_inset,0_8px_28px_rgba(47,125,79,0.2)]'
            : ''
        }`}
      >
        <div
          className={`${SCENE_COVER_ASPECT_CLASS} relative overflow-hidden bg-slate-50 ${
            highlighted ? 'rounded-[14px]' : 'rounded-2xl border border-slate-200/60 shadow-[0_4px_16px_rgba(15,23,42,0.05)]'
          }`}
        >
          <img
            src={sceneCoverUrl(scene.slug)}
            alt=""
            decoding="async"
            draggable={false}
            className={`pointer-events-none h-full w-full select-none object-contain object-center ${SCENE_COVER_CAROUSEL_CLASS}`}
            style={{
              filter: focus.blurPx > 0 ? `blur(${focus.blurPx}px) saturate(0.88)` : undefined,
              transition: 'filter 0.18s ease-out',
            }}
          />
          {highlighted && (
            <>
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-3 bg-gradient-to-b from-white/45 to-transparent"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute inset-0 rounded-[14px] ring-1 ring-inset ring-white/55"
                aria-hidden
              />
            </>
          )}
        </div>
      </div>
  );

  return (
    <div
      data-carousel-card
      aria-label={scene.titleZh}
      className={`${CARD_WIDTH_CLASS} shrink-0 snap-center`}
      style={{
        transform: `translateY(${focus.y}px) scale(${focus.scale})`,
        opacity: focus.opacity,
        transformOrigin: 'center bottom',
        zIndex: Math.round(focus.scale * 100),
        transition: 'transform 0.12s linear, opacity 0.15s linear',
        willChange: 'transform, opacity',
      }}
    >
      {highlighted && onSelect ? (
        <button
          type="button"
          onClick={onSelect}
          className="block w-full cursor-pointer text-left active:scale-[0.98] transition-transform"
          aria-label={`进入场景：${scene.titleZh}`}
        >
          {frame}
        </button>
      ) : (
        frame
      )}
    </div>
  );
};

function GlassNavButton({
  dir,
  disabled,
  onClick,
}: {
  dir: 'prev' | 'next';
  disabled: boolean;
  onClick: () => void;
}) {
  const Icon = dir === 'prev' ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === 'prev' ? '上一个场景' : '下一个场景'}
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm ring-1 ring-slate-200/90 transition-all enabled:hover:bg-emerald-50 enabled:hover:text-[#2f7d4f] enabled:hover:ring-emerald-200/80 enabled:active:scale-90 disabled:opacity-30"
    >
      <Icon className="h-4 w-4" strokeWidth={2.5} />
    </button>
  );
}

/** 顶部场景横滑 — 闭环无限轮播；滑动/按钮逻辑与简单索引版一致，仅在停稳后静默归位 */
export function ScenePreviewCarousel({
  scenes,
  onSelect,
}: {
  scenes: SceneCatalogItem[];
  onSelect?: (scene: SceneCatalogItem) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>();
  const settleTimerRef = useRef<number>();
  const dirIdleTimerRef = useRef<number>();
  const jumpLockRef = useRef(false);
  const buttonNavRef = useRef(false);
  const activeExtendedRef = useRef(0);
  const scrollDirRef = useRef<ScrollDir>(null);
  const lastScrollLeftRef = useRef(0);

  const loopMetaRef = useRef({ baseOffset: 0, realCount: 0, canLoop: false });

  const [logicalIndex, setLogicalIndex] = useState(0);
  const [activeExtended, setActiveExtended] = useState(0);
  const [focuses, setFocuses] = useState<CardFocus[]>([]);
  const [scrollDir, setScrollDir] = useState<ScrollDir>(null);

  const { loopItems, baseOffset } = useMemo(() => buildLoopItems(scenes), [scenes]);
  const canLoop = scenes.length > 1;
  const realCount = scenes.length;

  loopMetaRef.current = { baseOffset, realCount, canLoop };

  const applyMeasure = useCallback((measured: ReturnType<typeof measureDock>) => {
    const { baseOffset: bo, realCount: rc } = loopMetaRef.current;
    setFocuses(measured.focuses);
    setActiveExtended(measured.activeExtended);
    activeExtendedRef.current = measured.activeExtended;
    setLogicalIndex(toLogicalIndex(measured.activeExtended, bo, rc));
  }, []);

  const scrollToExtended = useCallback((extendedIndex: number, behavior: ScrollBehavior = 'smooth') => {
    const el = scrollRef.current;
    if (!el) return;
    const card = el.querySelectorAll<HTMLElement>('[data-carousel-card]')[extendedIndex];
    if (!card) return;
    scrollCardToCenter(el, card, behavior);
    lastScrollLeftRef.current = el.scrollLeft;
  }, []);

  const syncFromScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || jumpLockRef.current) return;
    applyMeasure(measureDock(el, scrollDirRef.current));
  }, [applyMeasure]);

  const normalizeIfNeeded = useCallback(() => {
    const el = scrollRef.current;
    const { baseOffset: bo, realCount: rc, canLoop: loop } = loopMetaRef.current;
    if (!el || !loop || jumpLockRef.current) return;

    const { activeExtended: ext } = measureDock(el, scrollDirRef.current);
    let target: number | null = null;
    if (ext < bo) target = ext + rc;
    else if (ext >= bo + rc) target = ext - rc;

    if (target === null) return;

    jumpLockRef.current = true;
    scrollToExtended(target, 'auto');
    lastScrollLeftRef.current = el.scrollLeft;
    requestAnimationFrame(() => {
      jumpLockRef.current = false;
      if (scrollRef.current) {
        applyMeasure(measureDock(scrollRef.current, null));
      }
    });
  }, [scrollToExtended, applyMeasure]);

  const settle = useCallback(() => {
    if (jumpLockRef.current) return;
    normalizeIfNeeded();
    syncFromScroll();
    scrollDirRef.current = null;
    setScrollDir(null);
    buttonNavRef.current = false;
  }, [normalizeIfNeeded, syncFromScroll]);

  const syncFromScrollRef = useRef(syncFromScroll);
  const settleRef = useRef(settle);
  syncFromScrollRef.current = syncFromScroll;
  settleRef.current = settle;

  // 仅场景数量变化时初始化 — 禁止依赖 syncFromScroll / scrollDir
  useLayoutEffect(() => {
    if (loopItems.length === 0) return;
    const { baseOffset: bo, canLoop: loop } = loopMetaRef.current;
    const start = loop ? bo : 0;

    requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (!el) return;
      const card = el.querySelectorAll<HTMLElement>('[data-carousel-card]')[start];
      if (!card) return;
      scrollCardToCenter(el, card, 'auto');
      lastScrollLeftRef.current = el.scrollLeft;
      const measured = measureDock(el, null);
      const { baseOffset: bo, realCount: rc } = loopMetaRef.current;
      setFocuses(measured.focuses);
      setActiveExtended(measured.activeExtended);
      activeExtendedRef.current = measured.activeExtended;
      setLogicalIndex(toLogicalIndex(measured.activeExtended, bo, rc));
    });
  }, [loopItems.length]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const scheduleSettle = () => {
      if (jumpLockRef.current) return;
      if (settleTimerRef.current) window.clearTimeout(settleTimerRef.current);
      const delay = buttonNavRef.current ? 480 : 140;
      settleTimerRef.current = window.setTimeout(() => settleRef.current(), delay);
    };

    const onScroll = () => {
      const delta = el.scrollLeft - lastScrollLeftRef.current;
      if (Math.abs(delta) > 0.5) {
        const dir: ScrollDir = delta > 0 ? 'left' : 'right';
        scrollDirRef.current = dir;
        setScrollDir(dir);
        if (dirIdleTimerRef.current) window.clearTimeout(dirIdleTimerRef.current);
        dirIdleTimerRef.current = window.setTimeout(() => {
          scrollDirRef.current = null;
          setScrollDir(null);
        }, 280);
      }
      lastScrollLeftRef.current = el.scrollLeft;

      if (!jumpLockRef.current) {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => syncFromScrollRef.current());
      }
      scheduleSettle();
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    const onResize = () => syncFromScrollRef.current();
    window.addEventListener('resize', onResize);

    return () => {
      el.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (settleTimerRef.current) window.clearTimeout(settleTimerRef.current);
      if (dirIdleTimerRef.current) window.clearTimeout(dirIdleTimerRef.current);
    };
  }, [loopItems.length]);

  const goStep = (delta: number, dir: ScrollDir) => {
    if (!canLoop) return;
    buttonNavRef.current = true;
    scrollDirRef.current = dir;
    setScrollDir(dir);
    scrollToExtended(activeExtendedRef.current + delta, 'smooth');
    if (settleTimerRef.current) window.clearTimeout(settleTimerRef.current);
    settleTimerRef.current = window.setTimeout(() => settleRef.current(), 480);
  };

  if (loopItems.length === 0) return null;

  const activeScene = scenes[logicalIndex];

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className="flex items-end gap-2.5 overflow-x-auto overscroll-x-contain px-2 pb-1.5 pt-2.5 snap-x snap-mandatory touch-pan-x [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-3 sm:px-3"
        style={{ touchAction: 'pan-x pan-y' }}
        aria-label="场景预览，左右滑动循环浏览"
      >
        {loopItems.map((scene, index) => (
          <ScenePreviewCard
            key={scene.loopKey}
            scene={scene}
            focus={focuses[index] ?? DEFAULT_FOCUS}
            highlighted={index === activeExtended}
            onSelect={onSelect ? () => onSelect(scene) : undefined}
          />
        ))}
      </div>

      <div className="mx-3 mb-1.5 flex items-center gap-1 rounded-full border border-slate-200/80 bg-white/90 px-0.5 py-0.5">
        <GlassNavButton dir="prev" disabled={!canLoop} onClick={() => goStep(-1, 'right')} />
        <p className="min-w-0 flex-1 truncate px-0.5 text-center text-[11px] font-semibold text-slate-600">
          {onSelect && activeScene ? (
            <button
              type="button"
              onClick={() => onSelect(activeScene)}
              className="w-full truncate cursor-pointer hover:text-[#2f7d4f] transition-colors"
              aria-label={`进入场景：${activeScene.titleZh}`}
            >
              {activeScene.titleZh}
            </button>
          ) : (
            activeScene?.titleZh
          )}
        </p>
        <GlassNavButton dir="next" disabled={!canLoop} onClick={() => goStep(1, 'left')} />
      </div>
    </div>
  );
}
