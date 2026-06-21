import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Word } from '../types/word';
import { VocabService } from '../services/vocab.service';
import { setLemmaIds, setLemmaCategories } from '../lib/wordTokens';

interface WordsContextType {
  words: Word[];
  loading: boolean;
  ready: boolean;
  error: string | null;
}

const WordsContext = createContext<WordsContextType | undefined>(undefined);

export function WordsProvider({ children }: { children: ReactNode }) {
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [, rows] = await Promise.all([
          VocabService.loadInflections(),
          VocabService.fetchWords(),
        ]);
        if (cancelled) return;
        if (!rows.length) {
          setError('词库加载失败：Supabase 无数据，请先运行 npm run import:vocab');
          setWords([]);
        } else {
          setLemmaIds(new Set(rows.map((w) => w.id)));
          setLemmaCategories(new Map(rows.map((w) => [w.id, w.category])));
          setWords(rows);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : '词库加载失败');
          setWords([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setReady(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <WordsContext.Provider value={{ words, loading, ready, error }}>
      {children}
    </WordsContext.Provider>
  );
}

export function useWords() {
  const ctx = useContext(WordsContext);
  if (!ctx) throw new Error('useWords must be used within WordsProvider');
  return ctx;
}
