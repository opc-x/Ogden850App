import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { Word, wordsData } from '../data/wordsList';

interface ProgressContextType {
  learningStatus: Record<string, 'learning' | 'mastered'>;
  starredWords: Record<string, boolean>;
  isInitialized: boolean;
  setWordStatus: (wordId: string, status: 'learning' | 'mastered' | null, e?: React.MouseEvent) => void;
  toggleStar: (wordId: string, e?: React.MouseEvent) => void;
  masteredCount: number;
  learningCount: number;
  starredCount: number;
  progressPercent: number;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export const ProgressProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [learningStatus, setLearningStatus] = useState<Record<string, 'learning' | 'mastered'>>({});
  const [starredWords, setStarredWords] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const storedStatus = localStorage.getItem('ogden850_learning_status');
      if (storedStatus) setLearningStatus(JSON.parse(storedStatus));
      
      const storedStarred = localStorage.getItem('ogden850_starred');
      if (storedStarred) setStarredWords(JSON.parse(storedStarred));
    } catch (e) {
      console.warn('Could not load progress from local storage', e);
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem('ogden850_learning_status', JSON.stringify(learningStatus));
  }, [learningStatus, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem('ogden850_starred', JSON.stringify(starredWords));
  }, [starredWords, isInitialized]);

  const toggleStar = (wordId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setStarredWords(prev => ({ ...prev, [wordId]: !prev[wordId] }));
  };

  const setWordStatus = (wordId: string, status: 'learning' | 'mastered' | null, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setLearningStatus(prev => {
      const updated = { ...prev };
      if (status === null) delete updated[wordId];
      else updated[wordId] = status;
      return updated;
    });
  };

  const masteredCount = useMemo(() => Object.values(learningStatus).filter(s => s === 'mastered').length, [learningStatus]);
  const learningCount = useMemo(() => Object.values(learningStatus).filter(s => s === 'learning').length, [learningStatus]);
  const starredCount = useMemo(() => Object.values(starredWords).filter(s => s).length, [starredWords]);
  const progressPercent = useMemo(() => Math.round((masteredCount / wordsData.length) * 100) || 0, [masteredCount]);

  return (
    <ProgressContext.Provider value={{
      learningStatus, starredWords, isInitialized,
      setWordStatus, toggleStar,
      masteredCount, learningCount, starredCount, progressPercent
    }}>
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) throw new Error("useProgress must be used within ProgressProvider");
  return context;
};
