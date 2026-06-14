import { useState } from 'react';
import { Word } from '../data/wordsList';

export function useQuiz() {
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

  return {
    quizActive, setQuizActive,
    quizQuestions, setQuizQuestions,
    currentQuizIndex, setCurrentQuizIndex,
    quizScore, setQuizScore,
    quizSubmitted, setQuizSubmitted
  };
}
