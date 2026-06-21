import { useEffect, useState } from 'react';
import { SceneService } from '../services/scene.service';
import { slugifySceneKey } from '../lib/sceneSlug';

/** 场景故事 — storyBlurb 用户可见，storyScript 完整母本（开发折叠） */
export function useSceneStory(sceneKey: string | null) {
  const [story, setStory] = useState<string | null>(null);
  const [storyScript, setStoryScript] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!sceneKey) {
      setStory(null);
      setStoryScript(null);
      return;
    }
    const slug = slugifySceneKey(sceneKey);
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const [blurb, script] = await Promise.all([
          SceneService.fetchStoryBlurbBySlug(slug),
          SceneService.fetchStoryScriptBySlug(slug),
        ]);
        if (!cancelled) {
          setStory(blurb);
          setStoryScript(script);
        }
      } catch {
        if (!cancelled) {
          setStory(null);
          setStoryScript(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sceneKey]);

  return { story, storyScript, loading };
}
