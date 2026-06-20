import { useState, useEffect, type MouseEvent } from 'react';
import { useWords } from '../contexts/WordsContext';
import type { Word } from '../types/word';
import { useProgress } from '../contexts/ProgressContext';

export type PracticeHistoryItem = {
  id: string;
  targetWords: Word[];
  userSentence: string;
  correctedSentence: string | null;
  score: number;
  correct: boolean;
  analysis: string;
  translation: string;
  recommendedUsage: string;
  timestamp: number;
};

export function usePractice() {
  const { learningStatus, setWordStatus } = useProgress();
  const { words } = useWords();

  const [isInitialized, setIsInitialized] = useState(false);
  const [practiceHistory, setPracticeHistory] = useState<PracticeHistoryItem[]>([]);
  const [practiceWords, setPracticeWords] = useState<Word[]>([]);
  const [practiceSentence, setPracticeSentence] = useState('');
  const [practiceEvaluating, setPracticeEvaluating] = useState(false);
  const [practiceResult, setPracticeResult] = useState<{
    correct: boolean;
    score: number;
    correctedSentence: string | null;
    analysis: string;
    translation: string;
    recommendedUsage: string;
  } | null>(null);
  const [spelledRevealed, setSpelledRevealed] = useState<Record<string, boolean>>({});
  const [showPracticeSearch, setShowPracticeSearch] = useState(false);
  const [practiceSearchQuery, setPracticeSearchQuery] = useState('');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('ogden850_practice_history');
      if (stored) setPracticeHistory(JSON.parse(stored));
    } catch (e) {
      console.error('Error loading practice history:', e);
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem('ogden850_practice_history', JSON.stringify(practiceHistory));
  }, [practiceHistory, isInitialized]);

  const addPracticeWord = (word: Word) => {
    if (practiceWords.find(w => w.id === word.id)) return;
    if (practiceWords.length >= 3) return;
    setPracticeWords(prev => [...prev, word]);
    setPracticeResult(null);
  };

  const removePracticeWord = (wordId: string) => {
    setPracticeWords(prev => prev.filter(w => w.id !== wordId));
    setPracticeResult(null);
  };

  const randomizePracticeWords = () => {
    if (!words.length) return;
    const shuffled = [...words].sort(() => 0.5 - Math.random());
    const word1 = shuffled[0];
    const word2 = shuffled.find(w => w.category !== word1.category) || shuffled[1];
    setPracticeWords([word1, word2]);
    setPracticeSentence('');
    setPracticeResult(null);
    setSpelledRevealed({});
  };

  const evaluatePracticeSentence = async () => {
    if (practiceWords.length === 0 || !practiceSentence.trim() || practiceEvaluating) return;
    setPracticeEvaluating(true);
    setPracticeResult(null);
    try {
      const response = await fetch('/api/evaluate-sentence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userSentence: practiceSentence,
          targetWords: practiceWords.map(w => w.word),
        }),
      });
      const data = await response.json();
      if (data.success || data.offlineFallback) {
        setPracticeResult({
          correct: data.correct,
          score: data.score,
          correctedSentence: data.correctedSentence,
          analysis: data.analysis,
          translation: data.translation,
          recommendedUsage: data.recommendedUsage,
        });
        if (data.score >= 90) {
          practiceWords.forEach(w => setWordStatus(w.id, 'mastered'));
        } else if (data.score >= 60) {
          practiceWords.forEach(w => {
            if (learningStatus[w.id] !== 'mastered') setWordStatus(w.id, 'learning');
          });
        }
      }
    } catch (err) {
      console.error('Error evaluating sentence:', err);
    } finally {
      setPracticeEvaluating(false);
    }
  };

  const savePracticeToHistory = () => {
    if (!practiceResult || !practiceSentence.trim()) return;
    setPracticeHistory(prev => [{
      id: `pract_${Date.now()}`,
      targetWords: [...practiceWords],
      userSentence: practiceSentence,
      correctedSentence: practiceResult.correctedSentence,
      score: practiceResult.score,
      correct: practiceResult.correct,
      analysis: practiceResult.analysis,
      translation: practiceResult.translation,
      recommendedUsage: practiceResult.recommendedUsage,
      timestamp: Date.now(),
    }, ...prev]);
    setPracticeSentence('');
    setPracticeWords([]);
    setPracticeResult(null);
    setSpelledRevealed({});
  };

  const deletePracticeHistoryItem = (id: string, e: MouseEvent) => {
    e.stopPropagation();
    setPracticeHistory(prev => prev.filter(item => item.id !== id));
  };

  return {
    practiceHistory, setPracticeHistory,
    practiceWords, practiceSentence, setPracticeSentence,
    practiceEvaluating, practiceResult, setPracticeResult,
    spelledRevealed, setSpelledRevealed,
    showPracticeSearch, setShowPracticeSearch,
    practiceSearchQuery, setPracticeSearchQuery,
    addPracticeWord, removePracticeWord, randomizePracticeWords,
    evaluatePracticeSentence, savePracticeToHistory, deletePracticeHistoryItem,
  };
}
