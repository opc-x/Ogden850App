import { useState } from 'react';
import { BookOpen, ChevronDown } from 'lucide-react';
import { useSceneStory } from '../../hooks/useSceneStory';
import { SceneCover } from './SceneCover';

const isDev = import.meta.env.DEV;

/** 场景详情头 — 紧凑封面 + 秒懂开场 + 开发模式可展开完整故事母本 */
export function SceneStoryHero({
  sceneKey,
  slug,
  gradient,
  titleZh,
  sentenceCount,
  loadingCount,
}: {
  sceneKey: string;
  slug: string;
  gradient: string;
  titleZh: string;
  sentenceCount: number;
  loadingCount?: boolean;
}) {
  const { story, storyScript, loading } = useSceneStory(sceneKey);
  const [scriptOpen, setScriptOpen] = useState(false);

  return (
    <>
      <SceneCover
        slug={slug}
        gradient={gradient}
        titleZh={titleZh}
        className="aspect-[5/2] w-full shrink-0 rounded-none"
      />

      <div className="shrink-0 px-5 pt-4 pb-3 border-b border-slate-100/80">
        <div className="flex items-center justify-between gap-3 mb-2">
          <h3 className="text-xl font-black text-slate-800">{titleZh}</h3>
          <span className="text-caption font-bold text-slate-400 shrink-0 tabular-nums">
            {loadingCount ? '…' : `${sentenceCount} 句`}
          </span>
        </div>

        {loading ? (
          <div className="h-4 rounded bg-slate-100 animate-pulse w-[88%] mb-3" />
        ) : story ? (
          <p className="text-sm leading-relaxed text-slate-600 mb-3">{story}</p>
        ) : null}

        {isDev && storyScript ? (
          <div className="mb-3">
            <button
              type="button"
              onClick={() => setScriptOpen((v) => !v)}
              className="flex items-center gap-1.5 text-body-sm font-semibold text-violet-600 hover:text-violet-700 cursor-pointer"
            >
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${scriptOpen ? 'rotate-180' : ''}`} />
              {scriptOpen ? '收起' : '展开'}完整故事脚本（DEV）
            </button>
            {scriptOpen ? (
              <div className="mt-2 rounded-xl border border-violet-100 bg-violet-50/60 px-3 py-2.5 max-h-48 overflow-y-auto">
                {storyScript.split(/\n\n+/).map((para) => (
                  <p key={para.slice(0, 24)} className="text-body-sm leading-[1.7] text-slate-700 mb-2 last:mb-0">
                    {para}
                  </p>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        <p className="text-caption text-slate-400 flex items-center gap-1.5">
          <BookOpen className="w-3 h-3 shrink-0" />
          点词查释义 · 支持朗读跟读
        </p>
      </div>
    </>
  );
}
