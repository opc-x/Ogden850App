import { useState } from 'react';
import type { Word } from '../types/word';
import { useWords } from '../contexts/WordsContext';
import { useProgress } from '../contexts/ProgressContext';

export function useQuiz() {
  const { setWordStatus } = useProgress();
  const { words } = useWords();

  const [quizActive, setQuizActive] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<Array<{
    word: Word;
    options: string[];
    correctIndex: number;
    selectedIndex: number | null;
  }>>([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const generateQuiz = () => {
    if (!words.length) return;
    const shuffled = [...words].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 5);

    const questions = selected.map(word => {
      const sameCategory = words.filter(w => w.category === word.category && w.id !== word.id);
      const distractorsRaw = sameCategory.length >= 3 ? sameCategory : words.filter(w => w.id !== word.id);
      const correctIndex = Math.floor(Math.random() * 4);
      const options: string[] = [];
      let distIndex = 0;

      for (let i = 0; i < 4; i++) {
        if (i === correctIndex) {
          options.push(word.translation);
        } else {
          options.push(distractorsRaw[distIndex]?.translation || '其他事物');
          distIndex++;
        }
      }

      return { word, options, correctIndex, selectedIndex: null };
    });

    setQuizQuestions(questions);
    setCurrentQuizIndex(0);
    setQuizScore(0);
    setQuizSubmitted(false);
    setQuizActive(true);
  };

  const handleSelectQuizOption = (optionIndex: number) => {
    if (quizSubmitted) return;
    setQuizQuestions(prev => {
      const copy = [...prev];
      copy[currentQuizIndex] = { ...copy[currentQuizIndex], selectedIndex: optionIndex };
      return copy;
    });
  };

  const handleNextQuiz = () => {
    const q = quizQuestions[currentQuizIndex];
    if (q.selectedIndex === q.correctIndex) {
      setQuizScore(prev => prev + 1);
      setWordStatus(q.word.id, 'mastered');
    }
    if (currentQuizIndex < quizQuestions.length - 1) {
      setCurrentQuizIndex(prev => prev + 1);
    } else {
      setQuizSubmitted(true);
    }
  };

  return {
    quizActive, setQuizActive,
    quizQuestions, currentQuizIndex,
    quizScore, quizSubmitted,
    generateQuiz, handleSelectQuizOption, handleNextQuiz,
  };
}
