import React, { useState, useEffect, useMemo, useRef, lazy, Suspense, useCallback } from 'react';
import {
  BookOpen, Home, Blocks,
  Sparkles, User,
  RefreshCw, X, Download, Share, BarChart3,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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
import { ASSEMBLER_NAV_HINT, ASSEMBLER_NAV_LABEL } from './data/marketing';
import { MobileWrapper } from './components/layout/MobileWrapper';
import { useAuth } from './contexts/AuthContext';
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
    'transition-colors duration-200 outline-none w-14 py-2 cursor-pointer',
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
  const { learningStatus, starredWords, toggleStar, setWordStatus, masteredCount, learningCount } = useProgress();
  const { isAuthenticated } = useAuth();
  const [generatingForId, setGeneratingForId] = useState<string | null>(null);

  const activeTab = location.pathname === '/' ? 'onboarding' : location.pathname.substring(1);
  const setActiveTab = (tab: string) => navigate(tab === 'onboarding' ? '/' : `/${tab}`);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [dynamicGuide, setDynamicGuide] = useState<WordGuideRow | null>(null);
  const [browserCategory, setBrowserCategory] = useState<string>('all');
  const [browserStatus, setBrowserStatus] = useState<'all' | 'starred' | 'learning' | 'mastered'>('all');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showIOSInstallPrompt, setShowIOSInstallPrompt] = useState(false);
  const [assemblerSceneDetailOpen, setAssemblerSceneDetailOpen] = useState(false);
  const guideRequestRef = useRef(0);

  const { words, loading: wordsLoading, ready: wordsReady, error: wordsError } = useWords();

  const wordsById = useMemo(() => new Map(words.map((w) => [w.id, w])), [words]);

  useEffect(() => {
    if (activeTab !== 'assembler') setAssemblerSceneDetailOpen(false);
  }, [activeTab]);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // iOS Detection
    const _isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isStandalone = (window.navigator as any).standalone || window.matchMedia('(display-mode: standalone)').matches;
    
    if (_isIOS && !isStandalone) {
      setTimeout(() => setShowIOSInstallPrompt(true), 2000);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  // Onboarding redirect
  useEffect(() => {
    if (localStorage.getItem('ogden850_has_seen_onboarding') === 'true' && activeTab === 'onboarding') {
      setActiveTab('home');
    }
  }, []);

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
        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
          <header className="flex-none w-full bg-white/90 backdrop-blur-xl flex items-center justify-between px-4 sm:px-6 py-3 border-b border-slate-200/60 z-40 pt-safe">
            <h1
              style={{ fontFamily: "'Pacifico', cursive", fontSize: '1.75rem' }}
              className="font-extrabold tracking-tight text-[#2f7d4f] select-none pb-1"
            >
              Ogden 850
            </h1>
          </header>
          <main className="flex-1 overflow-y-auto w-full px-4 sm:px-6 py-6 pb-28">
            <ViewFallback />
          </main>
        </div>
      </MobileWrapper>
    );
  }

  return (
    <MobileWrapper>
      {activeTab === 'onboarding' ? (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <LandingPage onComplete={() => {
          localStorage.setItem('ogden850_has_seen_onboarding', 'true');
          setActiveTab('home');
        }} />
        </div>
      ) : (
        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
          {/* Top Header App Bar */}
          <header className="flex-none w-full bg-white/90 backdrop-blur-xl flex items-center justify-between px-4 sm:px-6 py-3 border-b border-slate-200/60 z-40 pt-safe">
        <div className="flex items-center gap-3">
          <div>
            <h1 
              onClick={() => setActiveTab('home')}
              style={{ fontFamily: "'Pacifico', cursive", fontSize: "1.75rem" }}
              className="font-extrabold tracking-tight text-[#2f7d4f] cursor-pointer hover:opacity-90 select-none pb-1"
            >
              Ogden 850
            </h1>
            <p className="text-[10px] text-emerald-800/60 font-semibold tracking-wider -mt-1 scale-90 origin-left hidden">温馨基本英语 · 暖心伴读</p>
          </div>
        </div>
        
        {/* User avatar and profile status with cumulative scores */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden">
            <p className="text-xs text-emerald-800/60 font-bold">语言掌握中</p>
            <p className="text-sm font-extrabold text-[#2f7d4f]">{masteredCount + learningCount} / 850 词</p>
          </div>
          <div 
            onClick={() => setActiveTab('profile')}
            className="w-10 h-10 rounded-xl border border-emerald-200/50 shadow-sm bg-gradient-to-tr from-[#2f7d4f] to-[#5cb377] flex items-center justify-center text-white cursor-pointer relative group active:scale-95 transition-all"
            title={isAuthenticated ? '我的账号' : '登录 / 注册'}
          >
            <User className="w-5 h-5 text-white" />
            <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#fffbf6] ${
              isAuthenticated ? 'bg-emerald-500' : 'bg-slate-300'
            }`} />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main
        className={
          assemblerSceneDetailOpen && activeTab === 'assembler'
            ? 'flex flex-col flex-1 min-h-0 overflow-hidden w-full px-4 sm:px-6 py-6 pb-28'
            : 'flex-1 overflow-y-auto overscroll-y-contain w-full px-4 sm:px-6 py-6 pb-28'
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
            <CoachView />
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
        className="flex-none w-full bg-white/95 backdrop-blur-xl border-t border-slate-200/60 flex justify-around items-center pt-3 pb-safe px-2 z-50 absolute bottom-0 shadow-[0_-10px_20px_rgba(0,0,0,0.03)]"
      >
        <button id="nav-home" onClick={() => setActiveTab('home')} className={mobileNavItemClass(activeTab === 'home')}>
          <MobileNavIcon active={activeTab === 'home'}><Home className="w-5 h-5" strokeWidth={activeTab === 'home' ? 2.25 : 1.75} /></MobileNavIcon>
          <span className={`text-[10px] tracking-wide ${activeTab === 'home' ? 'font-bold' : 'font-medium'}`}>主页</span>
        </button>

        <button
          id="nav-browser"
          onClick={() => { setBrowserCategory('all'); setBrowserStatus('all'); setActiveTab('browser'); }}
          className={mobileNavItemClass(activeTab === 'browser')}
        >
          <MobileNavIcon active={activeTab === 'browser'}><BookOpen className="w-5 h-5" strokeWidth={activeTab === 'browser' ? 2.25 : 1.75} /></MobileNavIcon>
          <span className={`text-[10px] tracking-wide ${activeTab === 'browser' ? 'font-bold' : 'font-medium'}`}>词典</span>
        </button>

        <button
          id="nav-assembler"
          onClick={() => setActiveTab('assembler')}
          className={mobileNavItemClass(activeTab === 'assembler')}
          title={ASSEMBLER_NAV_HINT}
        >
          <MobileNavIcon active={activeTab === 'assembler'}><Blocks className="w-5 h-5" strokeWidth={activeTab === 'assembler' ? 2.25 : 1.75} /></MobileNavIcon>
          <span className={`text-[10px] tracking-wide ${activeTab === 'assembler' ? 'font-bold' : 'font-medium'}`}>{ASSEMBLER_NAV_LABEL}</span>
        </button>

        <button id="nav-stats" onClick={() => setActiveTab('stats')} className={mobileNavItemClass(activeTab === 'stats')}>
          <MobileNavIcon active={activeTab === 'stats'}><BarChart3 className="w-5 h-5" strokeWidth={activeTab === 'stats' ? 2.25 : 1.75} /></MobileNavIcon>
          <span className={`text-[10px] tracking-wide ${activeTab === 'stats' ? 'font-bold' : 'font-medium'}`}>统计</span>
        </button>

        <button id="nav-chat" onClick={() => setActiveTab('chat')} className={mobileNavItemClass(activeTab === 'chat')}>
          <MobileNavIcon active={activeTab === 'chat'}><Sparkles className="w-5 h-5" strokeWidth={activeTab === 'chat' ? 2.25 : 1.75} /></MobileNavIcon>
          <span className={`text-[10px] tracking-wide ${activeTab === 'chat' ? 'font-bold' : 'font-medium'}`}>AI 陪练</span>
        </button>
      </nav>

      {/* PWA Install Banners */}
      <AnimatePresence>
        {/* iOS Install Guide */}
        {showIOSInstallPrompt && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="absolute bottom-24 left-4 right-4 z-50 bg-white/95 backdrop-blur-xl p-5 rounded-3xl border border-indigo-200 shadow-2xl"
          >
            <button 
              onClick={() => setShowIOSInstallPrompt(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex gap-4">
              <div className="w-12 h-12 shrink-0 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-center shadow-sm">
                <img src="/pwa-192x192.png" className="w-8 h-8 rounded-lg" alt="App Icon" />
              </div>
              <div className="space-y-1">
                <h4 className="font-black text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  获取最佳沉浸体验
                </h4>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  点击底部的 <Share className="inline w-3.5 h-3.5 mx-0.5 text-blue-500" /> <b>分享</b> 按钮，<br/>
                  选择 <b className="text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">添加到主屏幕</b> 即可一键安装此原生 App！
                </p>
              </div>
            </div>
            {/* Arrow pointing down for mobile */}
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-white sm:hidden drop-shadow-md"></div>
          </motion.div>
        )}

        {/* Android / Desktop Install Button */}
        {deferredPrompt && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="absolute bottom-24 left-4 right-4 z-50 bg-white/95 backdrop-blur-xl p-5 rounded-3xl border border-emerald-200 shadow-2xl"
          >
            <button 
              onClick={() => setDeferredPrompt(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 shrink-0 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-center shadow-sm">
                <img src="/pwa-192x192.png" className="w-8 h-8 rounded-lg" alt="App Icon" />
              </div>
              <div className="flex-1">
                <h4 className="font-black text-slate-800">安装 Ogden Basic</h4>
                <p className="text-xs text-slate-500 font-medium mt-0.5">秒开无广告，沉浸学习体验</p>
              </div>
            </div>
            <button
              onClick={handleInstallClick}
              className="mt-4 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 rounded-xl flex justify-center items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.4)] active:scale-95 transition-all cursor-pointer"
            >
              <Download className="w-5 h-5" /> 立即安装到设备
            </button>
          </motion.div>
        )}
      </AnimatePresence>
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
