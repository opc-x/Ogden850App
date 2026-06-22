import { useEffect, useRef } from 'react';
import type { SceneCatalogItem } from '../../types/scene';
import { SceneCover, SCENE_COVER_ASPECT_CLASS } from '../assembler/SceneCover';

const STRIP_INACTIVE = 'w-[5.25rem]';
const STRIP_ACTIVE = 'w-[8.75rem]';

/** 陪练场景条 — 选中项放大 + 水晶描边，与上方 Hero 联动 */
export function CoachSceneStrip({
  scenes,
  activeSlug,
  loading,
  onSelect,
}: {
  scenes: SceneCatalogItem[];
  activeSlug: string | null;
  loading: boolean;
  onSelect: (slug: string) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  useEffect(() => {
    if (!activeSlug) return;
    const el = itemRefs.current.get(activeSlug);
    el?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [activeSlug]);

  if (loading) {
    return (
      <div className="flex gap-2.5 overflow-hidden py-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={`${i === 2 ? STRIP_ACTIVE : STRIP_INACTIVE} shrink-0 rounded-xl bg-slate-100 animate-pulse aspect-[5/2]`}
          />
        ))}
      </div>
    );
  }

  if (scenes.length === 0) return null;

  return (
    <div
      ref={scrollRef}
      className="flex items-center gap-2.5 overflow-x-auto py-1 -mx-3 pl-3 pr-3 snap-x snap-mandatory scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {scenes.map((scene) => {
        const active = scene.slug === activeSlug;
        return (
          <button
            key={scene.slug}
            ref={(node) => {
              if (node) itemRefs.current.set(scene.slug, node);
              else itemRefs.current.delete(scene.slug);
            }}
            type="button"
            onClick={() => onSelect(scene.slug)}
            aria-label={scene.titleZh}
            aria-current={active ? 'true' : undefined}
            title={scene.titleZh}
            className={`group shrink-0 transition-all duration-300 ease-out active:scale-[0.98] ${
              active
                ? `${STRIP_ACTIVE} z-10 snap-center -my-0.5`
                : `${STRIP_INACTIVE} snap-start opacity-65 hover:opacity-90`
            }`}
          >
            <div
              className={`relative rounded-xl transition-all duration-300 ${
                active
                  ? 'p-[2px] bg-gradient-to-br from-[#2f7d4f]/50 via-white/95 to-cyan-100/70 shadow-[0_0_0_1px_rgba(255,255,255,0.55)_inset,0_4px_20px_rgba(47,125,79,0.22)]'
                  : 'ring-1 ring-slate-100/90'
              }`}
            >
              <div
                className={`relative overflow-hidden bg-slate-50 ${
                  active ? 'rounded-[10px]' : 'rounded-[11px]'
                }`}
              >
                <SceneCover
                  slug={scene.slug}
                  gradient={scene.gradient}
                  titleZh={scene.titleZh}
                  fit="contain"
                  tone={active ? 'default' : 'soft'}
                  className={`w-full ${SCENE_COVER_ASPECT_CLASS}`}
                />
                {active && (
                  <>
                    <div
                      className="pointer-events-none absolute inset-x-0 top-0 h-3 bg-gradient-to-b from-white/50 to-transparent"
                      aria-hidden
                    />
                    <div
                      className="pointer-events-none absolute inset-0 rounded-[10px] ring-1 ring-inset ring-white/60"
                      aria-hidden
                    />
                    <div
                      className="pointer-events-none absolute inset-x-2 bottom-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent"
                      aria-hidden
                    />
                  </>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
