import React, { useState, useEffect, useMemo, useRef, lazy, Suspense, useCallback } from 'react';
import {
  BookOpen, Home, Blocks, Sparkles, BarChart3, RefreshCw,
} from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { Word } from '../types/word';
import type { WordGuideRow } from '../types/vocab';
import { LandingPage } from '../components/onboarding/LandingPage';
import { VocabService } from '../services/vocab.service';
import { TTSService } from '../services/tts.service';
import { WordDetailModal } from '../components/word/WordDetailModal';
import { useProgress } from '../contexts/ProgressContext';
import { useWords } from '../contexts/WordsContext';
import { ASSEMBLER_NAV_HINT, ASSEMBLER_NAV_LABEL, BRAND_GRADIENT } from '../data/marketing';
import { APP_SHELL_MAX_WIDTH_CLASS } from '../constants/layout';
import { HeaderUserButton } from '../components/profile/HeaderUserButton';

const HomeView = lazy(() => import('./HomeView').then((m) => ({ default: m.HomeView })));
const BrowserView = lazy(() => import('./BrowserView').then((m) => ({ default: m.BrowserView })));
const StatsView = lazy(() => import('./StatsView').then((m) => ({ default: m.StatsView })));
const AssemblerView = lazy(() => import('./AssemblerView').then((m) => ({ default: m.AssemblerView })));
const CoachView = lazy(() => import('./CoachView').then((m) => ({ default: m.CoachView })));
const ProfileView = lazy(() => import('./ProfileView').then((m) => ({ default: m.ProfileView })));

const WEB_TABS = ['home', 'browser', 'assembler', 'stats', 'chat', 'profile'] as const;
type WebTab = (typeof WEB_TABS)[number];

function ViewFallback() {
  return (
    <div className="flex items-center justify-center py-24">
      <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
    </div>
  );
}

function parseWebTab(pathname: string): 'onboarding' | WebTab {
  const rest = pathname.replace(/^\/web\/?/, '');
  if (!rest) return 'onboarding';
  const segment = rest.split('/')[0];
  return (WEB_TABS as readonly string[]).includes(segment) ? (segment as WebTab) : 'onboarding';
}

function webNavItemClass(isActive: boolean) {
  return [
    'flex items-center gap-3 w-full px-4 py-3 rounded-xl text-left transition-colors cursor-pointer',
    isActive
      ? 'bg-emerald-50 text-[#2f7d4f] font-semibold'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800',
  ].join(' ');
}

const NAV_ITEMS = [
  { id: 'home' as const, label: '主页', icon: Home },
  { id: 'browser' as const, label: '词典', icon: BookOpen },
  { id: 'assembler' as const, label: ASSEMBLER_NAV_LABEL, icon: Blocks },
  { id: 'stats' as const, label: '统计', icon: BarChart3 },
  { id: 'chat' as const, label: 'AI 陪练', icon: Sparkles },
];

export function WebShellView() {
  const location = useLocation();
  const navigate = useNavigate();
  const activeTab = parseWebTab(location.pathname);
  const setWebTab = useCallback(
    (tab: 'onboarding' | WebTab) => navigate(tab === 'onboarding' ? '/web' : `/web/${tab}`),
    [navigate],
  );

  const { learningStatus, starredWords, toggleStar, setWordStatus } = useProgress();
  const [generatingForId, setGeneratingForId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [dynamicGuide, setDynamicGuide] = useState<WordGuideRow | null>(null);
  const [browserCategory, setBrowserCategory] = useState<string>('all');
  const [browserStatus, setBrowserStatus] = useState<'all' | 'starred' | 'learning' | 'mastered'>('all');
  const [assemblerSceneDetailOpen, setAssemblerSceneDetailOpen] = useState(false);
  const guideRequestRef = useRef(0);

  const { words, loading: wordsLoading, ready: wordsReady, error: wordsError } = useWords();
  const wordsById = useMemo(() => new Map(words.map((w) => [w.id, w])), [words]);

  useEffect(() => {
    if (activeTab !== 'assembler') setAssemblerSceneDetailOpen(false);
  }, [activeTab]);

  useEffect(() => {
    VocabService.invalidateGuideCache();
    void VocabService.prefetchAllGuides();
  }, []);

  const totalWords = words.length;
  const playSpeech = useCallback((text: string) => {
    TTSService.playSpeech(text);
  }, []);

  const loadWordAiContext = useCallback(async (word: Word) => {
    const cached = VocabService.getCachedGuide(word.id);
    if (cached) {
      setDynamicGuide(cached);
      setGeneratingForId(null);
      return;
    }
    setDynamicGuide(null);
    setGeneratingForId(word.id);
    const requestId = ++guideRequestRef.current;
    try {
      const data = await VocabService.fetchGuide(word.id);
      if (requestId !== guideRequestRef.current) return;
      setDynamicGuide(data);
    } catch (err) {
      if (requestId !== guideRequestRef.current) return;
      console.warn('Guide fetch failed:', err);
      setDynamicGuide(null);
    } finally {
      if (requestId === guideRequestRef.current) {
        setGeneratingForId(null);
      }
    }
  }, []);

  const openWordById = (wordId: string) => {
    const id = wordId.toLowerCase();
    const word = wordsById.get(id);
    if (word) {
      setSelectedWord(word);
      void loadWordAiContext(word);
      return;
    }
    void VocabService.fetchWordById(id).then((fetched) => {
      if (fetched) {
        setSelectedWord(fetched);
        void loadWordAiContext(fetched);
      }
    });
  };

  const filteredWords = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase().trim();
    return words
      .filter((w) => w.word.toLowerCase().includes(query) || w.translation.includes(query))
      .slice(0, 15);
  }, [searchQuery, words]);

  const startOperatorsRoutine = () => {
    setBrowserCategory('operators');
    setBrowserStatus('all');
    setWebTab('browser');
  };

  const mainClassName =
    assemblerSceneDetailOpen && activeTab === 'assembler'
      ? 'flex flex-col flex-1 min-h-0 overflow-hidden w-full px-4 sm:px-6 py-4'
      : activeTab === 'assembler'
        ? 'flex-1 overflow-y-auto overscroll-y-contain w-full px-4 sm:px-6 pt-3 pb-4'
        : activeTab === 'chat'
          ? 'flex flex-col flex-1 min-h-0 overflow-hidden w-full px-0 pt-1'
          : activeTab === 'onboarding'
            ? 'flex-1 overflow-y-auto overscroll-y-contain w-full'
            : 'flex-1 overflow-y-auto overscroll-y-contain w-full px-4 sm:px-6 py-6';

  const renderAppViews = () => (
    <>
      {activeTab === 'home' && (
        <Suspense fallback={<ViewFallback />}>
          <HomeView
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filteredWords={filteredWords}
            selectedWord={selectedWord}
            setSelectedWord={setSelectedWord}
            startOperatorsRoutine={startOperatorsRoutine}
            setActiveTab={(tab) => setWebTab(tab as WebTab)}
            loadWordAiContext={loadWordAiContext}
            totalWords={totalWords}
            setBrowserCategory={setBrowserCategory}
            setBrowserStatus={setBrowserStatus as (val: string) => void}
          />
        </Suspense>
      )}
      {activeTab === 'browser' && (
        <Suspense fallback={<ViewFallback />}>
          <BrowserView
            browserCategory={browserCategory}
            setBrowserCategory={setBrowserCategory}
            browserStatus={browserStatus}
            setBrowserStatus={setBrowserStatus}
            selectedWord={selectedWord}
            setSelectedWord={setSelectedWord}
            playSpeech={playSpeech}
            loadWordAiContext={loadWordAiContext}
          />
        </Suspense>
      )}
      {activeTab === 'stats' && (
        <Suspense fallback={<ViewFallback />}>
          <StatsView
            totalWords={totalWords}
            setActiveTab={(tab) => setWebTab(tab as WebTab)}
            variant="web"
          />
        </Suspense>
      )}
      {activeTab === 'chat' && (
        <Suspense fallback={<ViewFallback />}>
          <div className="flex flex-col flex-1 min-h-0 w-full">
            <CoachView compactChrome />
          </div>
        </Suspense>
      )}
      {activeTab === 'assembler' && (
        <Suspense fallback={<ViewFallback />}>
          <AssemblerView
            onWordClick={openWordById}
            onSceneDetailChange={setAssemblerSceneDetailOpen}
          />
        </Suspense>
      )}
      {activeTab === 'profile' && (
        <Suspense fallback={<ViewFallback />}>
          <ProfileView totalWords={totalWords} setActiveTab={(tab) => setWebTab(tab as WebTab)} />
        </Suspense>
      )}
    </>
  );

  const renderContent = () => {
    if (wordsReady && wordsError && activeTab !== 'onboarding') {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] px-6 text-center gap-3">
          <p className="text-slate-700 font-bold">词库未就绪</p>
          <p className="text-sm text-slate-500">{wordsError}</p>
        </div>
      );
    }

    if (wordsLoading && activeTab !== 'onboarding') {
      return <ViewFallback />;
    }

    if (activeTab === 'onboarding') {
      return (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <LandingPage
            onComplete={() => {
              localStorage.setItem('ogden850_has_seen_onboarding', 'true');
              setWebTab('home');
            }}
          />
        </div>
      );
    }

    return (
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        {activeTab !== 'chat' && (
          <header className="flex-none w-full bg-white/90 backdrop-blur-xl flex items-center justify-between px-4 sm:px-6 py-3 border-b border-slate-200/60 z-40 pt-safe">
            <div className="flex items-center gap-3">
              <h1
                onClick={() => setWebTab('onboarding')}
                style={{
                  fontFamily: "'Pacifico', cursive",
                  fontSize: '1.75rem',
                  backgroundImage: BRAND_GRADIENT,
                }}
                className="font-extrabold tracking-tight bg-clip-text text-transparent cursor-pointer hover:opacity-90 select-none pb-1"
              >
                Ogden 850
              </h1>
            </div>
            <HeaderUserButton onClick={() => setWebTab('profile')} />
          </header>
        )}
        <main className={mainClassName}>{renderAppViews()}</main>
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full bg-[#e8eaed] flex">
      <aside className="flex-none w-[240px] h-screen sticky top-0 flex flex-col bg-white border-r border-slate-200/80 px-3 py-5">
        <button
          type="button"
          onClick={() => setWebTab('onboarding')}
          style={{
            fontFamily: "'Pacifico', cursive",
            fontSize: '1.65rem',
            backgroundImage: BRAND_GRADIENT,
          }}
          className="font-extrabold tracking-tight bg-clip-text text-transparent cursor-pointer hover:opacity-90 select-none text-left px-3 mb-6"
        >
          Ogden 850
        </button>

        <nav className="flex flex-col gap-1 flex-1">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              id={`web-nav-${id}`}
              title={id === 'assembler' ? ASSEMBLER_NAV_HINT : undefined}
              onClick={() => {
                if (id === 'browser') {
                  setBrowserCategory('all');
                  setBrowserStatus('all');
                }
                setWebTab(id);
              }}
              className={webNavItemClass(activeTab === id)}
            >
              <Icon className="w-5 h-5 shrink-0" strokeWidth={activeTab === id ? 2.25 : 1.75} />
              <span className="text-sm">{label}</span>
            </button>
          ))}
        </nav>

        {activeTab === 'chat' && (
          <div className="mt-auto px-3 pt-4 border-t border-slate-100 flex justify-center">
            <HeaderUserButton onClick={() => setWebTab('profile')} />
          </div>
        )}
      </aside>

      <div className="flex-1 flex justify-center min-h-screen overflow-hidden bg-[#e8eaed]">
        <div
          data-app-shell
          className={`w-full ${activeTab === 'chat' ? 'max-w-[430px]' : APP_SHELL_MAX_WIDTH_CLASS} h-[100dvh] bg-[#f8f9fa] text-slate-800 flex flex-col font-sans relative overflow-hidden sm:shadow-xl ${activeTab === 'chat' ? '' : '@container'}`}
        >
          {renderContent()}

          <AnimatePresence>
            {selectedWord && (
              <WordDetailModal
                key={selectedWord.id}
                selectedWord={selectedWord}
                dynamicGuide={dynamicGuide}
                generatingForId={generatingForId}
                starredWords={starredWords}
                learningStatus={learningStatus}
                onClose={() => {
                  setSelectedWord(null);
                  setDynamicGuide(null);
                }}
                onToggleStar={toggleStar}
                onSetStatus={setWordStatus}
                onPlaySpeech={playSpeech}
                onLoadContext={loadWordAiContext}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
