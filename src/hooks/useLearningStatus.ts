import { useState, useEffect, useMemo } from 'react';
import { wordsData, Word } from '../data/wordsList';

export function useLearningStatus() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [learningStatus, setLearningStatus] = useState<Record<string, 'learning' | 'mastered'>>({});
  const [starredWords, setStarredWords] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const storedStatus = localStorage.getItem('ogden850_learning_status');
      const storedStars = localStorage.getItem('ogden850_starred');

      if (storedStatus) setLearningStatus(JSON.parse(storedStatus));
      if (storedStars) setStarredWords(JSON.parse(storedStars));
    } catch (e) {
      console.error('Error loading history:', e);
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

  const totalWords = wordsData.length;
  
  const masteredCount = useMemo(() => {
    return Object.values(learningStatus).filter(s => s === 'mastered').length;
  }, [learningStatus]);
  
  const learningCount = useMemo(() => {
    return Object.values(learningStatus).filter(s => s === 'learning').length;
  }, [learningStatus]);
  
  const starredCount = useMemo(() => {
    return Object.values(starredWords).filter(s => s).length;
  }, [starredWords]);

  const progressPercent = useMemo(() => {
    return Math.round((masteredCount / totalWords) * 100) || 0;
  }, [masteredCount, totalWords]);

  return {
    isInitialized,
    learningStatus,
    setLearningStatus,
    starredWords,
    setStarredWords,
    masteredCount,
    learningCount,
    starredCount,
    progressPercent,
    totalWords
  };
}
