import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  ReactNode,
} from 'react';
import { useWords } from './WordsContext';
import { useAuth } from './AuthContext';
import {
  clearProgressForUser,
  migrateLegacyProgressToUser,
  readProgressJson,
  writeProgressJson,
} from '../lib/progressStorage';

type LearningStatusMap = Record<string, 'learning' | 'mastered'>;
type StarredWordsMap = Record<string, boolean>;
type PracticedScenesMap = Record<string, boolean>;

interface ProgressActions {
  setWordStatus: (wordId: string, status: 'learning' | 'mastered' | null, e?: React.MouseEvent) => void;
  toggleStar: (wordId: string, e?: React.MouseEvent) => void;
  toggleScenePracticed: (sceneKey: string, e?: React.MouseEvent) => void;
  resetProgressData: () => void;
}

interface ProgressStats {
  masteredCount: number;
  learningCount: number;
  starredCount: number;
  practicedSceneCount: number;
  progressPercent: number;
}

interface ProgressMeta {
  isInitialized: boolean;
}

interface ProgressContextType extends ProgressActions, ProgressStats, ProgressMeta {
  learningStatus: LearningStatusMap;
  starredWords: StarredWordsMap;
  practicedScenes: PracticedScenesMap;
  isScenePracticed: (sceneKey: string) => boolean;
}

const LearningStatusContext = createContext<LearningStatusMap | undefined>(undefined);
const StarredWordsContext = createContext<StarredWordsMap | undefined>(undefined);
const PracticedScenesContext = createContext<PracticedScenesMap | undefined>(undefined);
const ProgressActionsContext = createContext<ProgressActions | undefined>(undefined);
const ProgressStatsContext = createContext<ProgressStats | undefined>(undefined);
const ProgressMetaContext = createContext<ProgressMeta | undefined>(undefined);

export const ProgressProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { words } = useWords();
  const { user, loading: authLoading } = useAuth();
  const userId = user?.id ?? null;
  const [isInitialized, setIsInitialized] = useState(false);
  const [learningStatus, setLearningStatus] = useState<LearningStatusMap>({});
  const [starredWords, setStarredWords] = useState<StarredWordsMap>({});
  const [practicedScenes, setPracticedScenes] = useState<PracticedScenesMap>({});

  useEffect(() => {
    if (authLoading) return;

    setIsInitialized(false);

    if (!userId) {
      setLearningStatus({});
      setStarredWords({});
      setPracticedScenes({});
      setIsInitialized(true);
      return;
    }

    try {
      migrateLegacyProgressToUser(userId);
      setLearningStatus(readProgressJson<LearningStatusMap>('learningStatus', userId) ?? {});
      setStarredWords(readProgressJson<StarredWordsMap>('starred', userId) ?? {});
      setPracticedScenes(readProgressJson<PracticedScenesMap>('practicedScenes', userId) ?? {});
    } catch (e) {
      console.warn('Could not load progress from local storage', e);
      setLearningStatus({});
      setStarredWords({});
      setPracticedScenes({});
    }
    setIsInitialized(true);
  }, [userId, authLoading]);

  useEffect(() => {
    if (!isInitialized || !userId) return;
    writeProgressJson('learningStatus', userId, learningStatus);
  }, [learningStatus, isInitialized, userId]);

  useEffect(() => {
    if (!isInitialized || !userId) return;
    writeProgressJson('starred', userId, starredWords);
  }, [starredWords, isInitialized, userId]);

  useEffect(() => {
    if (!isInitialized || !userId) return;
    writeProgressJson('practicedScenes', userId, practicedScenes);
  }, [practicedScenes, isInitialized, userId]);

  const toggleStar = useCallback((wordId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setStarredWords((prev) => ({ ...prev, [wordId]: !prev[wordId] }));
  }, []);

  const setWordStatus = useCallback(
    (wordId: string, status: 'learning' | 'mastered' | null, e?: React.MouseEvent) => {
      if (e) e.stopPropagation();
      setLearningStatus((prev) => {
        const updated = { ...prev };
        if (status === null) delete updated[wordId];
        else updated[wordId] = status;
        return updated;
      });
    },
    [],
  );

  const toggleScenePracticed = useCallback((sceneKey: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setPracticedScenes((prev) => {
      const next = { ...prev };
      if (next[sceneKey]) delete next[sceneKey];
      else next[sceneKey] = true;
      return next;
    });
  }, []);

  const resetProgressData = useCallback(() => {
    if (!userId) return;
    if (!confirm('警告：这将会清除您在本地保存的所有学习进度与收藏夹。确认重置？')) return;
    setLearningStatus({});
    setStarredWords({});
    setPracticedScenes({});
    clearProgressForUser(userId);
  }, [userId]);

  const masteredCount = useMemo(
    () => Object.values(learningStatus).filter((s) => s === 'mastered').length,
    [learningStatus],
  );
  const learningCount = useMemo(
    () => Object.values(learningStatus).filter((s) => s === 'learning').length,
    [learningStatus],
  );
  const starredCount = useMemo(
    () => Object.values(starredWords).filter(Boolean).length,
    [starredWords],
  );
  const practicedSceneCount = useMemo(
    () => Object.values(practicedScenes).filter(Boolean).length,
    [practicedScenes],
  );
  const progressPercent = useMemo(
    () => (words.length ? Math.round((masteredCount / words.length) * 100) || 0 : 0),
    [masteredCount, words.length],
  );

  const actions = useMemo<ProgressActions>(
    () => ({ setWordStatus, toggleStar, toggleScenePracticed, resetProgressData }),
    [setWordStatus, toggleStar, toggleScenePracticed, resetProgressData],
  );

  const stats = useMemo<ProgressStats>(
    () => ({
      masteredCount,
      learningCount,
      starredCount,
      practicedSceneCount,
      progressPercent,
    }),
    [masteredCount, learningCount, starredCount, practicedSceneCount, progressPercent],
  );

  const meta = useMemo<ProgressMeta>(() => ({ isInitialized }), [isInitialized]);

  return (
    <LearningStatusContext.Provider value={learningStatus}>
      <StarredWordsContext.Provider value={starredWords}>
        <PracticedScenesContext.Provider value={practicedScenes}>
          <ProgressActionsContext.Provider value={actions}>
            <ProgressStatsContext.Provider value={stats}>
              <ProgressMetaContext.Provider value={meta}>{children}</ProgressMetaContext.Provider>
            </ProgressStatsContext.Provider>
          </ProgressActionsContext.Provider>
        </PracticedScenesContext.Provider>
      </StarredWordsContext.Provider>
    </LearningStatusContext.Provider>
  );
};

function useContextOrThrow<T>(ctx: React.Context<T | undefined>, name: string): T {
  const value = useContext(ctx);
  if (value === undefined) throw new Error(`${name} must be used within ProgressProvider`);
  return value;
}

export const useLearningStatus = (): LearningStatusMap =>
  useContextOrThrow(LearningStatusContext, 'useLearningStatus');

export const useStarredWords = (): StarredWordsMap =>
  useContextOrThrow(StarredWordsContext, 'useStarredWords');

export const usePracticedScenes = (): PracticedScenesMap =>
  useContextOrThrow(PracticedScenesContext, 'usePracticedScenes');

export const useProgressActions = (): ProgressActions =>
  useContextOrThrow(ProgressActionsContext, 'useProgressActions');

export const useProgressStats = (): ProgressStats =>
  useContextOrThrow(ProgressStatsContext, 'useProgressStats');

export const useProgressMeta = (): ProgressMeta =>
  useContextOrThrow(ProgressMetaContext, 'useProgressMeta');

export const useProgress = (): ProgressContextType => {
  const learningStatus = useLearningStatus();
  const starredWords = useStarredWords();
  const practicedScenes = usePracticedScenes();
  const actions = useProgressActions();
  const stats = useProgressStats();
  const meta = useProgressMeta();

  return useMemo(
    () => ({
      learningStatus,
      starredWords,
      practicedScenes,
      ...actions,
      isScenePracticed: (sceneKey: string) => Boolean(practicedScenes[sceneKey]),
      ...stats,
      ...meta,
    }),
    [learningStatus, starredWords, practicedScenes, actions, stats, meta],
  );
};
