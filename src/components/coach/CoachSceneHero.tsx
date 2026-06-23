import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import { APP_SHELL_MAX_WIDTH_CLASS } from '../../constants/layout';
import {
  SceneCover,
  SCENE_COVER_ASPECT_CLASS,
  SCENE_COVER_CAROUSEL_CLASS,
} from '../assembler/SceneCover';
import type { SceneCatalogItem } from '../../types/scene';

export function CoachSceneHero({
  scene,
  loading,
  expanded,
  onExpand,
  onCollapse,
  compact = false,
}: {
  scene: SceneCatalogItem | null;
  loading: boolean;
  expanded: boolean;
  onExpand: () => void;
  onCollapse: () => void;
  /** PC /web：限制 hero 高度，给对话区留空间 */
  compact?: boolean;
}) {
  const coverClass = compact
    ? 'aspect-[5/2] max-h-[7.5rem] w-full'
    : `w-full ${SCENE_COVER_ASPECT_CLASS}`;

  if (loading) {
    return <div className={`rounded-2xl bg-slate-100 animate-pulse ${coverClass}`} />;
  }

  if (!scene) return null;

  return (
    <>
      <button
        type="button"
        onClick={onExpand}
        className="group relative w-full overflow-hidden rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_rgba(15,23,42,0.08)] active:scale-[0.99] transition-transform"
        aria-label={`${scene.titleZh}，轻触全屏查看`}
      >
        <SceneCover
          slug={scene.slug}
          gradient={scene.gradient}
          titleZh={scene.titleZh}
          overlayTitle={scene.titleZh}
          fit="cover"
          tone="default"
          className={`${coverClass} ${SCENE_COVER_CAROUSEL_CLASS}`}
        />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[70] flex flex-col bg-[#0a0f14]"
            role="dialog"
            aria-modal
            aria-label={scene.titleZh}
          >
            <div className="flex items-center justify-between px-4 pt-safe pb-2">
              <p className="text-sm font-bold text-white/90 truncate">{scene.titleZh}</p>
              <button
                type="button"
                onClick={onCollapse}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white active:scale-95"
                aria-label="关闭全屏"
              >
                <X className="h-5 w-5" strokeWidth={2} />
              </button>
            </div>

            <div className="flex flex-1 min-h-0 items-center justify-center px-2 pb-safe">
              <motion.div
                initial={{ scale: 0.94, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.96, opacity: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className={`w-full ${APP_SHELL_MAX_WIDTH_CLASS}`}
              >
                <SceneCover
                  slug={scene.slug}
                  gradient={scene.gradient}
                  titleZh={scene.titleZh}
                  fit="contain"
                  tone="default"
                  className={`w-full ${SCENE_COVER_ASPECT_CLASS}`}
                />
              </motion.div>
            </div>

            <p className="shrink-0 px-4 pb-4 text-center text-body-sm font-medium text-white/45">
              边看图边开口 · 轻触右上角关闭
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
