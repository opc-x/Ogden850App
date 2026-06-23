import React, { useState, useEffect, useMemo, useRef, lazy, Suspense, useCallback } from 'react';
import {
  BookOpen, Home, Blocks,
  Sparkles,
  RefreshCw, BarChart3,
} from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import type { Word } from './types/word';
import type { WordGuideRow } from './types/vocab';
import { LandingPage } from './components/onboarding/LandingPage';
import { VocabService } from './services/vocab.service';
import { BrowserRouter, useLocation, useNavigate } from 'react-router-dom';
import { TTSService } from './services/tts.service';
import { WordDetailModal } from './components/word/WordDetailModal';
import { AppLogo } from './components/AppLogo';
import { useProgress } from './contexts/ProgressContext';
import { useWords } from './contexts/WordsContext';
import { useAuth } from './contexts/AuthContext';
import { ASSEMBLER_NAV_HINT, ASSEMBLER_NAV_LABEL } from './data/marketing';
import { MobileWrapper } from './components/layout/MobileWrapper';
import { PwaInstallBanner } from './components/layout/PwaInstallBanner';
import { usePwaInstallPrompt } from './hooks/usePwaInstallPrompt';
import { HeaderUserButton } from './components/profile/HeaderUserButton';
import { WebShellView } from './views/WebShellView';
const HomeView = lazy(() => import('./views/HomeView').then(m => ({ default: m.HomeView })));
const BrowserView = lazy(() => import('./views/BrowserView').then(m => ({ default: m.BrowserView })));
const StatsView = lazy(() => import('./views/StatsView').then(m => ({ default: m.StatsView })));
const AssemblerView = lazy(() => import('./views/AssemblerView').then(m => ({ default: m.AssemblerView })));
const CoachView = lazy(() => import('./views/CoachView').then(m => ({ default: m.CoachView })));
const ProfileView = lazy(() => import('./views/ProfileView').then(m => ({ default: m.ProfileView })));

function ViewFallback() {
  return (
    <div className="flex items-center justify-center py-24">
      <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
    </div>
  );
}

function mobileNavItemClass(isActive: boolean) {
  return [
    'flex flex-col items-center justify-center gap-0.5',
    'transition-colors duration-200 outline-none w-14 md:w-16 py-2 cursor-pointer',
    isActive
      ? 'text-[#2f7d4f]'
      : 'text-[#2f7d4f]/45 hover:text-[#2f7d4f]/70 active:text-[#2f7d4f]/60',
  ].join(' ');
}

function MobileNavIcon({ active, children }: { active: boolean; children: React.ReactNode }) {
  return (
    <span className={`transition-opacity duration-200 ${active ? 'opacity-100' : 'opacity-70'}`}>
      {children}
    </span>
  );
}

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();

  if (location.pathname === '/web' || location.pathname.startsWith('/web/')) {
    return <WebShellView />;
  }
  const { learningStatus, starredWords, toggleStar, setWordStatus, masteredCount, learningCount } = useProgress();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [generatingForId, setGeneratingForId] = useState<string | null>(null);

  const activeTab = location.pathname === '/' ? 'onboarding' : location.pathname.substring(1);
  const setActiveTab = (tab: string) => navigate(tab === 'onboarding' ? '/' : `/${tab}`);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [dynamicGuide, setDynamicGuide] = useState<WordGuideRow | null>(null);
  const [browserCategory, setBrowserCategory] = useState<string>('all');
  const [browserStatus, setBrowserStatus] = useState<'all' | 'starred' | 'learning' | 'mastered'>('all');
  const [assemblerSceneDetailOpen, setAssemblerSceneDetailOpen] = useState(false);
  const pwaInstall = usePwaInstallPrompt(activeTab);
  const guideRequestRef = useRef(0);
  const explicitLandingVisit = useRef(false);

  const { words, loading: wordsLoading, ready: wordsReady, error: wordsError } = useWords();

  const wordsById = useMemo(() => new Map(words.map((w) => [w.id, w])), [words]);

  useEffect(() => {
    if (activeTab !== 'assembler') setAssemblerSceneDetailOpen(false);
  }, [activeTab]);

  useEffect(() => {
    if (authLoading) return;
    if (location.pathname !== '/') {
      explicitLandingVisit.current = false;
      return;
    }
    if (isAuthenticated && !explicitLandingVisit.current) {
      navigate('/home', { replace: true });
    }
  }, [authLoading, isAuthenticated, location.pathname, navigate]);

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

  const openWord = (word: Word) => {
    setSelectedWord(word);
    void loadWordAiContext(word);
  };

  const openWordById = (wordId: string) => {
    const id = wordId.toLowerCase();
    const word = wordsById.get(id);
    if (word) {
      openWord(word);
      return;
    }
    void VocabService.fetchWordById(id).then((fetched) => {
      if (fetched) openWord(fetched);
    });
  };

  // Search filter
  const filteredWords = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase().trim();
    return words.filter(w =>
      w.word.toLowerCase().includes(query) ||
      w.translation.includes(query)
    ).slice(0, 15);
  }, [searchQuery, words]);

  // Browser list filtering lives in BrowserView

  // Start Core Operators focused set
  const startOperatorsRoutine = () => {
    setBrowserCategory('operators');
    setBrowserStatus('all');
    setActiveTab('browser');
  };

  if (wordsReady && wordsError && activeTab !== 'onboarding') {
    return (
      <MobileWrapper>
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center gap-3">
          <p className="text-slate-700 font-bold">词库未就绪</p>
          <p className="text-sm text-slate-500">{wordsError}</p>
        </div>
      </MobileWrapper>
    );
  }

  if (wordsLoading && activeTab !== 'onboarding') {
    return (
      <MobileWrapper>
        <div className="relative flex h-full min-h-0 flex-1 flex-col overflow-hidden">
          <header className="flex-none w-full bg-white/90 backdrop-blur-xl flex items-center justify-between px-4 sm:px-6 py-3 border-b border-slate-200/60 z-40 pt-safe">
            <h1
              style={{ fontFamily: "'Pacifico', cursive", fontSize: '1.75rem' }}
              className="font-extrabold tracking-tight text-[#2f7d4f] select-none pb-1"
            >
              Ogden 850
            </h1>
          </header>
          <main className="flex-1 overflow-y-auto w-full px-4 sm:px-6 py-6 pb-bottom-nav">
            <ViewFallback />
          </main>
        </div>
      </MobileWrapper>
    );
  }

  return (
    <MobileWrapper>
      {activeTab === 'onboarding' ? (
        <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
        <LandingPage onComplete={() => {
          localStorage.setItem('ogden850_has_seen_onboarding', 'true');
          setActiveTab('home');
        }} />
        </div>
      ) : (
        <div className="relative flex h-full min-h-0 flex-1 flex-col overflow-hidden">
          {/* Top Header App Bar */}
          <header className="flex-none w-full bg-white/90 backdrop-blur-xl flex items-center justify-between px-4 sm:px-6 py-3 border-b border-slate-200/60 z-40 pt-safe">
        <div className="flex items-center gap-3">
          <div>
            <h1 
              onClick={() => {
                explicitLandingVisit.current = true;
                setActiveTab('onboarding');
              }}
              style={{ fontFamily: "'Pacifico', cursive", fontSize: "1.75rem", backgroundImage: "linear-gradient(120deg, #1f6b3f 0%, #2f7d4f 45%, #5cb377 100%)" }}
              className="font-extrabold tracking-tight bg-clip-text text-transparent cursor-pointer hover:opacity-90 select-none pb-1"
            >
              Ogden 850
            </h1>
            <p className="text-caption text-emerald-800/60 font-semibold tracking-wider -mt-1 scale-90 origin-left hidden">温馨基本英语 · 暖心伴读</p>
          </div>
        </div>
        
        {/* User avatar and profile status with cumulative scores */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden">
            <p className="text-xs text-emerald-800/60 font-bold">语言掌握中</p>
            <p className="text-sm font-extrabold text-[#2f7d4f]">{masteredCount + learningCount} / 850 词</p>
          </div>
          <HeaderUserButton onClick={() => setActiveTab('profile')} />
        </div>
      </header>

      {/* Main Container */}
      <main
        className={
          assemblerSceneDetailOpen && activeTab === 'assembler'
            ? 'flex flex-col flex-1 min-h-0 overflow-hidden w-full mx-auto px-4 sm:px-6 py-4 pb-bottom-nav'
            : activeTab === 'assembler'
              ? 'flex-1 overflow-y-auto overscroll-y-contain w-full mx-auto px-4 sm:px-6 pt-3 pb-bottom-nav'
              : activeTab === 'chat'
                ? 'flex flex-col flex-1 min-h-0 overflow-hidden w-full px-0 pt-1 pb-bottom-nav'
                : 'flex-1 overflow-y-auto overscroll-y-contain w-full px-4 sm:px-6 py-6 pb-bottom-nav'
        }
      >
        
        {/* TAB 1: HOME PANEL */}
        {activeTab === 'home' && (
          <Suspense fallback={<ViewFallback />}>
            <HomeView
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filteredWords={filteredWords}
            selectedWord={selectedWord}
            setSelectedWord={setSelectedWord}
            startOperatorsRoutine={startOperatorsRoutine}
            setActiveTab={setActiveTab}
            loadWordAiContext={loadWordAiContext}
            totalWords={totalWords}
            setBrowserCategory={setBrowserCategory}
            setBrowserStatus={setBrowserStatus as any}
          />
          </Suspense>
        )}

        {activeTab === 'browser' && (
          <Suspense fallback={<ViewFallback />}>
            <BrowserView
            browserCategory={browserCategory}
            setBrowserCategory={setBrowserCategory}
            browserStatus={browserStatus as any}
            setBrowserStatus={setBrowserStatus as any}
            selectedWord={selectedWord}
            setSelectedWord={setSelectedWord}
            playSpeech={playSpeech}
            loadWordAiContext={loadWordAiContext}
          />
          </Suspense>
        )}

        {activeTab === 'profile' && (
          <Suspense fallback={<ViewFallback />}>
            <ProfileView totalWords={totalWords} setActiveTab={setActiveTab} />
          </Suspense>
        )}

        {activeTab === 'stats' && (
          <Suspense fallback={<ViewFallback />}>
            <StatsView
            totalWords={totalWords}
            setActiveTab={setActiveTab}
          />
          </Suspense>
        )}
        {activeTab === 'chat' && (
          <Suspense fallback={<ViewFallback />}>
            <div className="flex flex-col flex-1 min-h-0 w-full">
              <CoachView />
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

      </main>

      {/* MODAL: EXQUISITE DETAILED DRAWER / SIDE-SHEET */}
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

      {/* Mobile bottom nav — tonal contrast, no pill backgrounds */}
      <nav
        id="bottom-bar-nav"
        className="absolute inset-x-0 bottom-0 w-full bg-white/95 backdrop-blur-xl border-t border-slate-200/60 flex justify-around items-center pt-2.5 pb-safe px-2 z-50 shadow-[0_-10px_20px_rgba(0,0,0,0.03)]"
      >
        <button id="nav-home" onClick={() => setActiveTab('home')} className={mobileNavItemClass(activeTab === 'home')}>
          <MobileNavIcon active={activeTab === 'home'}><Home className="w-5 h-5" strokeWidth={activeTab === 'home' ? 2.25 : 1.75} /></MobileNavIcon>
          <span className={`text-caption tracking-wide ${activeTab === 'home' ? 'font-bold' : 'font-medium'}`}>主页</span>
        </button>

        <button
          id="nav-browser"
          onClick={() => { setBrowserCategory('all'); setBrowserStatus('all'); setActiveTab('browser'); }}
          className={mobileNavItemClass(activeTab === 'browser')}
        >
          <MobileNavIcon active={activeTab === 'browser'}><BookOpen className="w-5 h-5" strokeWidth={activeTab === 'browser' ? 2.25 : 1.75} /></MobileNavIcon>
          <span className={`text-caption tracking-wide ${activeTab === 'browser' ? 'font-bold' : 'font-medium'}`}>词典</span>
        </button>

        <button
          id="nav-assembler"
          onClick={() => setActiveTab('assembler')}
          className={mobileNavItemClass(activeTab === 'assembler')}
          title={ASSEMBLER_NAV_HINT}
        >
          <MobileNavIcon active={activeTab === 'assembler'}><Blocks className="w-5 h-5" strokeWidth={activeTab === 'assembler' ? 2.25 : 1.75} /></MobileNavIcon>
          <span className={`text-caption tracking-wide ${activeTab === 'assembler' ? 'font-bold' : 'font-medium'}`}>{ASSEMBLER_NAV_LABEL}</span>
        </button>

        <button id="nav-stats" onClick={() => setActiveTab('stats')} className={mobileNavItemClass(activeTab === 'stats')}>
          <MobileNavIcon active={activeTab === 'stats'}><BarChart3 className="w-5 h-5" strokeWidth={activeTab === 'stats' ? 2.25 : 1.75} /></MobileNavIcon>
          <span className={`text-caption tracking-wide ${activeTab === 'stats' ? 'font-bold' : 'font-medium'}`}>统计</span>
        </button>

        <button id="nav-chat" onClick={() => setActiveTab('chat')} className={mobileNavItemClass(activeTab === 'chat')}>
          <MobileNavIcon active={activeTab === 'chat'}><Sparkles className="w-5 h-5" strokeWidth={activeTab === 'chat' ? 2.25 : 1.75} /></MobileNavIcon>
          <span className={`text-caption tracking-wide ${activeTab === 'chat' ? 'font-bold' : 'font-medium'}`}>AI 陪练</span>
        </button>
      </nav>

      <PwaInstallBanner
        visible={pwaInstall.visible}
        platform={pwaInstall.platform}
        iosBrowser={pwaInstall.iosBrowser}
        canNativeInstall={pwaInstall.canNativeInstall}
        waitingForPrompt={pwaInstall.waitingForPrompt}
        onDismiss={pwaInstall.dismiss}
        onInstall={() => void pwaInstall.install()}
      />

        </div>
      )}
    </MobileWrapper>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
