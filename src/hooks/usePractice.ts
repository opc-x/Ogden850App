import { useState, useEffect } from 'react';
import { Word, wordsData } from '../data/wordsList';

export function usePractice() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [practiceHistory, setPracticeHistory] = useState<Array<{
    original: string;
    score: number;
    correct: boolean;
    analysis: string;
    translation: string;
    recommendedUsage: string;
    timestamp: number;
  }>>([]);
  
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

  useEffect(() => {
    try {
      const storedPracticeHistory = localStorage.getItem('ogden850_practice_history');
      if (storedPracticeHistory) setPracticeHistory(JSON.parse(storedPracticeHistory));
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
    const shuffled = [...wordsData].sort(() => 0.5 - Math.random());
    const word1 = shuffled[0];
    const word2 = shuffled.find(w => w.category !== word1.category) || shuffled[1];
    setPracticeWords([word1, word2]);
    setPracticeSentence('');
    setPracticeResult(null);
    setSpelledRevealed({});
  };

  return {
    practiceHistory, setPracticeHistory,
    practiceWords, setPracticeWords,
    practiceSentence, setPracticeSentence,
    practiceEvaluating, setPracticeEvaluating,
    practiceResult, setPracticeResult,
    spelledRevealed, setSpelledRevealed,
    addPracticeWord, removePracticeWord, randomizePracticeWords
  };
}
