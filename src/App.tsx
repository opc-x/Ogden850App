import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Home, 
  BookOpen, 
  BarChart3, 
  Search, 
  Menu, 
  ChevronRight, 
  Sparkles, 
  Volume2, 
  Star, 
  Brain, 
  Trash2, 
  ArrowRight, 
  CheckCircle, 
  Activity, 
  Move, 
  Eye, 
  Package, 
  Palette, 
  Blend, 
  User, 
  HelpCircle, 
  Send,
  RefreshCw,
  Award,
  X,
  Languages,
  BookMarked,
  Download,
  Share
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { wordsData, CATEGORY_LABELS, Word } from './data/wordsList';
import wordAnnotations from './data/word-annotations.json';
import { LandingPage } from './components/onboarding/LandingPage';
import WordAssembler from './components/practice/WordAssembler';
import OperatorVisual from './components/OperatorVisual';
import { DirectionGraphic } from './components/DirectionsVisual';
import { db } from './lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { BrowserRouter, Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';

import { TTSService } from './services/tts.service';
import { AIService } from './services/ai.service';
import { WordDetailModal } from './components/word/WordDetailModal';
import { BrowserView } from './views/BrowserView';
import { PracticeView } from './views/PracticeView';
import { StatsView } from './views/StatsView';
import { HomeView } from './views/HomeView';
import { AppLogo } from './components/AppLogo';

function AppContent() {
  // Navigation & UI States
  const location = useLocation();
  const navigate = useNavigate();
  
  const activeTab = location.pathname === '/' ? 'onboarding' : location.pathname.substring(1);
  const setActiveTab = (tab: string) => navigate(tab === 'onboarding' ? '/' : `/${tab}`);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [dynamicGuide, setDynamicGuide] = useState<any>(null);
  const [assemblerTier, setAssemblerTier] = useState<'op18' | 'dir' | 'pic' | 'things' | 'qual' | 'opp'>('op18');

  // Spelling & Sentence Composition (拼词造句) States
  const [practiceWords, setPracticeWords] = useState<Word[]>([]);
  const [practiceSentence, setPracticeSentence] = useState('');
  const [practiceHistory, setPracticeHistory] = useState<Array<{
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
  }>>([]);
  const [practiceEvaluating, setPracticeEvaluating] = useState(false);
  const [practiceResult, setPracticeResult] = useState<{
    correct: boolean;
    score: number;
    correctedSentence: string | null;
    analysis: string;
    translation: string;
    recommendedUsage: string;
  } | null>(null);
  const [showPracticeSearch, setShowPracticeSearch] = useState(false);
  const [practiceSearchQuery, setPracticeSearchQuery] = useState('');
  
  // Interactive letter spelling reveal state for practice words
  const [spelledRevealed, setSpelledRevealed] = useState<Record<string, boolean>>({});
  
  // Learning Status States (stored in localStorage)
  const [isInitialized, setIsInitialized] = useState(false);
  const [learningStatus, setLearningStatus] = useState<Record<string, 'learning' | 'mastered'>>({});
  const [starredWords, setStarredWords] = useState<Record<string, boolean>>({});
  
  // Flashcard Browser Filtering
  const [browserCategory, setBrowserCategory] = useState<string>('all');
  const [browserStatus, setBrowserStatus] = useState<'all' | 'starred' | 'learning' | 'mastered'>('all');

  // AI-Assisted Explanations Cache (stored in localStorage or dynamically loaded)
  const [aiExplanations, setAiExplanations] = useState<Record<string, { sentence: string; sentence_zh: string; tip: string }>>({});
  const [generatingForId, setGeneratingForId] = useState<string | null>(null);

  // Chat/Dialogue state
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string; contentZh?: string; correction?: string }>>([
    {
      role: 'assistant',
      content: "Hello! I am your Basic English tutor. Let us chat using our 850 core words! How is your day today?",
      contentZh: "你好！我是你的基础英语导师。让我们使用 850 个核心词汇进行交流吧！你今天过得怎么样？"
    }
  ]);
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Quiz States
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

  // PWA Install States
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showIOSInstallPrompt, setShowIOSInstallPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Chrome / Android install prompt
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // iOS Detection
    const _isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(_isIOS);
    // iOS Safari exposes navigator.standalone
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

  // Load from LocalStorage
  useEffect(() => {
    try {
      const storedStatus = localStorage.getItem('ogden850_learning_status');
      const storedStars = localStorage.getItem('ogden850_starred');
      const storedCache = localStorage.getItem('ogden850_ai_cache');
      const storedChat = localStorage.getItem('ogden850_chat_messages');
      const storedPracticeHistory = localStorage.getItem('ogden850_practice_history');
      const hasSeenOnboarding = localStorage.getItem('ogden850_has_seen_onboarding');

      if (hasSeenOnboarding === 'true') setActiveTab('home');
      if (storedStatus) setLearningStatus(JSON.parse(storedStatus));
      if (storedStars) setStarredWords(JSON.parse(storedStars));
      if (storedCache) setAiExplanations(JSON.parse(storedCache));
      if (storedChat) setChatMessages(JSON.parse(storedChat));
      if (storedPracticeHistory) setPracticeHistory(JSON.parse(storedPracticeHistory));
    } catch (e) {
      console.error('Error loading history:', e);
    }
    setIsInitialized(true);
  }, []);

  // Sync to LocalStorage
  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem('ogden850_learning_status', JSON.stringify(learningStatus));
  }, [learningStatus, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem('ogden850_starred', JSON.stringify(starredWords));
  }, [starredWords, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem('ogden850_ai_cache', JSON.stringify(aiExplanations));
  }, [aiExplanations, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem('ogden850_chat_messages', JSON.stringify(chatMessages));
  }, [chatMessages, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem('ogden850_practice_history', JSON.stringify(practiceHistory));
  }, [practiceHistory, isInitialized]);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Progress Calculations
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

  // Text-to-Speech function
  const playSpeech = (text: string) => { TTSService.playSpeech(text); };

  // Spelling & Sentence composition functions
  const addPracticeWord = (word: Word) => {
    if (practiceWords.find(w => w.id === word.id)) return;
    if (practiceWords.length >= 3) return; // cap at 3
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
          targetWords: practiceWords.map(w => w.word)
        })
      });
      const data = await response.json();
      if (data.success || data.offlineFallback) {
        setPracticeResult({
          correct: data.correct,
          score: data.score,
          correctedSentence: data.correctedSentence,
          analysis: data.analysis,
          translation: data.translation,
          recommendedUsage: data.recommendedUsage
        });

        // Interactive mastery side-effects
        if (data.score >= 90) {
          practiceWords.forEach(w => {
            setLearningStatus(prev => ({
              ...prev,
              [w.id]: 'mastered'
            }));
          });
        } else if (data.score >= 60) {
          practiceWords.forEach(w => {
            if (learningStatus[w.id] !== 'mastered') {
              setLearningStatus(prev => ({
                ...prev,
                [w.id]: 'learning'
              }));
            }
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
    const newItem = {
      id: `pract_${Date.now()}`,
      targetWords: [...practiceWords],
      userSentence: practiceSentence,
      correctedSentence: practiceResult.correctedSentence,
      score: practiceResult.score,
      correct: practiceResult.correct,
      analysis: practiceResult.analysis,
      translation: practiceResult.translation,
      recommendedUsage: practiceResult.recommendedUsage,
      timestamp: Date.now()
    };
    setPracticeHistory(prev => [newItem, ...prev]);
    setPracticeSentence('');
    setPracticeWords([]);
    setPracticeResult(null);
    setSpelledRevealed({});
  };

  const deletePracticeHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPracticeHistory(prev => prev.filter(item => item.id !== id));
  };

  // Auto-fill prompt upon landing on practice tab
  useEffect(() => {
    if (activeTab === 'practice' && practiceWords.length === 0) {
      randomizePracticeWords();
    }
  }, [activeTab]);

  // Trigger category click from homepage
  const handleCategoryClick = (categoryKey: string) => {
    setBrowserCategory(categoryKey);
    setBrowserStatus('all');
    setActiveTab('browser');
  };

  // Star / Unstar Word Toggle
  const toggleStar = (wordId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setStarredWords(prev => ({
      ...prev,
      [wordId]: !prev[wordId]
    }));
  };

  // Toggle Learning Status (Mastered / Learning / Unmarked)
  const setWordStatus = (wordId: string, status: 'learning' | 'mastered' | null, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setLearningStatus(prev => {
      const updated = { ...prev };
      if (status === null) {
        delete updated[wordId];
      } else {
        updated[wordId] = status;
      }
      return updated;
    });
  };

  // Fetch AI Context for word
  const loadWordAiContext = async (word: Word) => {
    if (dynamicGuide?.word === word.word.toLowerCase()) return;
    
    setGeneratingForId(word.id);
    try {
      const docRef = doc(db, 'ogden_word_guides', word.word.toLowerCase());
      
      // 2-second timeout for Firebase (to handle GFW blocks in China)
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2000));
      const docSnap = await Promise.race([getDoc(docRef), timeoutPromise]) as any;
      
      if (docSnap.exists()) {
        setDynamicGuide(docSnap.data());
      } else {
        throw new Error('not_found_in_db');
      }
    } catch (err) {
      console.warn('Firebase fetch failed or timed out, falling back to local JSON data...', err);
      // Fallback to local static JSON bundle
      try {
        const localData = await import('./data/word-guides.json');
        const guide = localData.default[word.word.toLowerCase()];
        if (guide) {
          setDynamicGuide(guide);
        } else {
          setDynamicGuide(null);
        }
      } catch (localErr) {
        console.error('Failed to load from local JSON as well', localErr);
        setDynamicGuide(null);
      }
    } finally {
      setGeneratingForId(null);
    }
  };

  // Search filter
  const filteredWords = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase().trim();
    return wordsData.filter(w => 
      w.word.toLowerCase().includes(query) || 
      w.translation.includes(query)
    ).slice(0, 15);
  }, [searchQuery]);

  // General Filter word browser list
  const browserList = useMemo(() => {
    return wordsData.filter(w => {
      // Category filter
      if (browserCategory !== 'all' && w.category !== browserCategory) return false;
      
      // Status filter
      if (browserStatus === 'starred' && !starredWords[w.id]) return false;
      if (browserStatus === 'learning' && learningStatus[w.id] !== 'learning') return false;
      if (browserStatus === 'mastered' && learningStatus[w.id] !== 'mastered') return false;
      
      return true;
    });
  }, [browserCategory, browserStatus, starredWords, learningStatus]);

  // Start Core Operators focused set
  const startOperatorsRoutine = () => {
    setBrowserCategory('operators');
    setBrowserStatus('all');
    setActiveTab('browser');
  };

  // AI Chat API request
  const sendChatMessage = async () => {
    if (!chatInput.trim() || sendingMessage) return;
    const userMessage = chatInput.trim();
    setChatInput('');
    setSendingMessage(true);

    const updatedMessages = [
      ...chatMessages,
      { role: 'user' as const, content: userMessage }
    ];
    setChatMessages(updatedMessages);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages.slice(-6) }) // keep context lighter
      });
      const data = await response.json();
      setChatMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: data.reply,
          contentZh: data.reply_zh
        }
      ]);
    } catch (err) {
      console.error('Chat error:', err);
      setChatMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: "I lost my network signal. Let us speak Basic English again soon!",
          contentZh: "我的信号不太稳定。让我们稍后继续用最基础最原汁原味的英文沟通吧！"
        }
      ]);
    } finally {
      setSendingMessage(false);
    }
  };

  const clearChatHistory = () => {
    if (confirm('确认清空所有辅导对话记录吗？')) {
      setChatMessages([
        {
          role: 'assistant',
          content: "Hello! I am your Basic English tutor. Let us chat using our 850 core words! How is your day today?",
          contentZh: "你好！我是你的基础英语导师。让我们使用 850 个核心词汇进行交流吧！你今天过得怎么样？"
        }
      ]);
    }
  };

  // Quiz Builder on the fly!
  const generateQuiz = () => {
    // Select 5 random words
    const shuffled = [...wordsData].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 5);

    const questions = selected.map(word => {
      // find 3 distractors from same category or general word list
      const sameCategory = wordsData.filter(w => w.category === word.category && w.id !== word.id);
      const distractorsRaw = sameCategory.length >= 3 ? sameCategory : wordsData.filter(w => w.id !== word.id);
      const shuffledDistractors = [...distractorsRaw].sort(() => 0.5 - Math.random()).slice(0, 3);
      
      const correctIndex = Math.floor(Math.random() * 4);
      const options = [];
      let distIndex = 0;
      
      for (let i = 0; i < 4; i++) {
        if (i === correctIndex) {
          options.push(word.translation);
        } else {
          options.push(distractorsRaw[distIndex]?.translation || '其他事物');
          distIndex++;
        }
      }

      return {
        word,
        options,
        correctIndex,
        selectedIndex: null
      };
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
      copy[currentQuizIndex].selectedIndex = optionIndex;
      return copy;
    });
  };

  const handleNextQuiz = () => {
    const q = quizQuestions[currentQuizIndex];
    if (q.selectedIndex === q.correctIndex) {
      setQuizScore(prev => prev + 1);
      // Automatically learn correct word
      setLearningStatus(prev => ({
        ...prev,
        [q.word.id]: 'mastered'
      }));
    }

    if (currentQuizIndex < quizQuestions.length - 1) {
      setCurrentQuizIndex(prev => prev + 1);
    } else {
      setQuizSubmitted(true);
    }
  };

  const resetProgressData = () => {
    if (confirm('警告：这将会清除您在本地保存的所有学习进度、收藏夹和 AI 缓存。确认重置？')) {
      setLearningStatus({});
      setStarredWords({});
      setAiExplanations({});
      setChatMessages([
        {
          role: 'assistant',
          content: "Hello! I am your Basic English tutor. Let us chat using our 850 core words! How is your day today?",
          contentZh: "你好！我是你的基础英语导师。让我们使用 850 个核心词汇进行交流吧！你今天过得怎么样？"
        }
      ]);
      localStorage.clear();
      alert('所有学习数据已重置。');
    }
  };

  return (
    <div className="w-full h-[100dvh] bg-[#f8f9fa] text-slate-800 flex flex-col font-sans relative overflow-hidden">
      
      {activeTab === 'onboarding' ? (
        <LandingPage onComplete={() => {
          localStorage.setItem('ogden850_has_seen_onboarding', 'true');
          setActiveTab('home');
        }} />
      ) : (
        <>
          {/* Top Header App Bar */}
          <header className="flex-none w-full bg-white/90 backdrop-blur-xl flex items-center justify-between px-4 sm:px-6 py-3 border-b border-slate-200/60 z-40 pt-safe">
        <div className="flex items-center gap-3">
          <div>
            <h1 
              onClick={() => setActiveTab('home')}
              style={{ fontFamily: "'Pacifico', cursive", fontSize: "1.75rem" }}
              className="font-extrabold tracking-tight text-[#c65a30] cursor-pointer hover:opacity-90 select-none pb-1"
            >
              Ogden 850
            </h1>
            <p className="text-[10px] text-orange-800/60 font-semibold tracking-wider -mt-1 scale-90 origin-left hidden sm:block">温馨基本英语 · 暖心伴读</p>
          </div>
        </div>
        
        {/* User avatar and profile status with cumulative scores */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-orange-800/60 font-bold">语言掌握中</p>
            <p className="text-sm font-extrabold text-[#c65a30]">{masteredCount + learningCount} / 850 词</p>
          </div>
          <div 
            onClick={() => {
              setActiveTab('stats');
            }}
            className="w-10 h-10 rounded-xl border border-orange-200/50 shadow-sm bg-gradient-to-tr from-[#c65a30] to-[#faa144] flex items-center justify-center text-white cursor-pointer relative group active:scale-95 transition-all"
          >
            <User className="w-5 h-5 text-white" />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#fffbf6]"></span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 overflow-y-auto overscroll-y-contain w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-32">
        
        {/* TAB 1: HOME PANEL */}
        {activeTab === 'home' && (
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
        )}

        {/* TAB 2: OGDEN 850 WORDLIST BROWSER */}
        {activeTab === 'browser' && (
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
        )}

        {/* TAB: PRACTICE WORKSPACE FOR SPELLING & SENTENCE BUILDING (拼词造句) */}
        {activeTab === 'practice' && (
          <PracticeView 
            practiceWords={practiceWords}
            spelledRevealed={spelledRevealed}
            setSpelledRevealed={setSpelledRevealed}
            spellInput={spellInput}
            setSpellInput={setSpellInput}
            sentenceInput={sentenceInput}
            setSentenceInput={setSentenceInput}
            sentenceFeedback={sentenceFeedback}
            practiceScore={practiceScore}
            isChecking={isChecking}
            randomizePracticeWords={randomizePracticeWords}
            checkPracticeAnswers={checkPracticeAnswers}
            playSpeech={playSpeech}
          />
        )}

        {/* TAB 3: STATS & PRACTICE PANEL */}
        {activeTab === 'stats' && (
          <StatsView 
            totalWords={totalWords}
            setActiveTab={setActiveTab}
            setBrowserCategory={setBrowserCategory}
            setBrowserStatus={setBrowserStatus as any}
          />
        )}

        {/* TAB 4: PRACTICE PARTNER CHAT */}
        {activeTab === 'chat' && (
          <div className="space-y-4 max-w-3xl mx-auto flex flex-col h-[calc(100vh-14rem)] md:h-[70vh]">
            
            {/* Chat header area */}
            <div className="bg-white px-5 py-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-500 shadow-sm">
                  <Sparkles className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-lg">Basic AI Tutor</h3>
                  <p className="text-[10px] text-emerald-500 font-bold tracking-widest uppercase mt-0.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    暖心实时辅导中 (支持智能语法订正)
                  </p>
                </div>
              </div>

              <button 
                onClick={clearChatHistory}
                className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors border border-slate-200 shadow-sm cursor-pointer"
                title="清空对话"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Conversation Window */}
            <div className="flex-1 bg-slate-50 rounded-3xl border border-slate-200 shadow-inner p-4 sm:p-6 overflow-y-auto space-y-6 font-bold relative">
              {chatMessages.length === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 pointer-events-none">
                  <Sparkles className="w-12 h-12 mb-3 opacity-20" />
                  <p className="text-sm font-black text-slate-500">试着用 Basic English 和我打个招呼吧</p>
                </div>
              )}
              {chatMessages.map((msg, idx) => {
                const isUser = msg.role === 'user';
                return (
                  <div 
                    key={idx}
                    className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] rounded-3xl px-5 py-4 text-sm tracking-tight shadow-sm relative ${
                      isUser 
                      ? 'bg-indigo-600 text-white rounded-tr-sm shadow-indigo-900/30' 
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm'
                    }`}>
                      <p className={`font-black leading-relaxed ${isUser ? 'text-white' : 'text-slate-800'}`}>{msg.content}</p>
                      
                      {/* Chinese Translation */}
                      {!isUser && msg.contentZh && (
                        <p className="text-xs opacity-80 mt-3 pt-3 border-t border-slate-100 leading-relaxed font-sans text-slate-500 font-semibold text-left">
                          {msg.contentZh}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}

              {sendingMessage && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] bg-white border border-indigo-200 rounded-3xl px-5 py-4 rounded-tl-sm text-xs text-indigo-600 font-black flex items-center gap-2 shadow-sm">
                    <RefreshCw className="w-4 h-4 animate-spin text-indigo-500" />
                    Tutor 正在用心构思回复中...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Convenient Prompts Suggestions */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none text-xs px-1">
              {[
                { label: '👋 我想开始日常简单寒暄', text: 'Hello! I want to practice basic conversation today.' },
                { label: '⚙️ 能来一些核心动词的练习吗', text: 'Can you show me how to use operator words in a story?' },
                { label: '🎮 出个 850 范围的猜词游戏', text: 'Please play a guessing game using basic words.' }
              ].map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => setChatInput(p.text)}
                  className="bg-white hover:bg-slate-50 text-slate-600 font-bold px-4 py-2.5 rounded-xl whitespace-nowrap outline-none border border-slate-200 active:scale-95 transition-all cursor-pointer shadow-sm"
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Input form */}
            <div className="flex gap-3 bg-white p-2 sm:p-3 rounded-2xl border border-slate-100 shadow-sm">
              <input
                type="text"
                placeholder="在此输入您的 Basic 英语回复..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') sendChatMessage();
                }}
                disabled={sendingMessage}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 sm:py-4 text-sm focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none transition-all shadow-inner text-slate-800 placeholder-slate-400 font-black"
              />
              <button
                onClick={sendChatMessage}
                disabled={!chatInput.trim() || sendingMessage}
                className={`px-5 sm:px-6 rounded-xl shadow-sm transition-all flex items-center justify-center cursor-pointer ${
                  !chatInput.trim() || sendingMessage
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none border border-slate-200'
                  : 'bg-indigo-600 text-white hover:bg-indigo-500 active:scale-95 shadow-indigo-900/40 border border-indigo-500/50'
                }`}
              >
                <Send className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

          </div>
        )}

        {/* TAB 6: WORD ASSEMBLER */}
        {activeTab === 'assembler' && (
          <div className="w-full">
            <WordAssembler tier={assemblerTier} />
          </div>
        )}

      </main>

      {/* MODAL: EXQUISITE DETAILED DRAWER / SIDE-SHEET */}
      <AnimatePresence>
        {selectedWord && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 select-none">
        {selectedWord && (
          <WordDetailModal
            selectedWord={selectedWord}
            dynamicGuide={dynamicGuide}
            generatingForId={generatingForId}
            starredWords={starredWords}
            learningStatus={learningStatus}
            onClose={() => setSelectedWord(null)}
            onToggleStar={toggleStar}
            onSetStatus={setWordStatus}
            onPlaySpeech={playSpeech}
            onLoadContext={loadWordAiContext}
          />
        )}
          </div>
        )}
      </AnimatePresence>

      {/* Persistent Beautiful Bottom Navigation Bar for Mobile */}
      <nav id="bottom-bar-nav" className="flex-none w-full bg-white/95 backdrop-blur-xl border-t border-slate-200/60 flex md:hidden justify-around items-center pt-3 pb-safe px-2 z-50 shadow-[0_-10px_20px_rgba(0,0,0,0.03)] absolute bottom-0">
        
        {/* Navigation Item 1 */}
        <button 
          id="nav-home"
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center justify-center transition-all duration-300 outline-none w-14 py-1.5 rounded-2xl cursor-pointer ${
            activeTab === 'home' 
            ? 'bg-orange-50 text-[#c65a30] scale-105 font-black shadow-sm' 
            : 'text-orange-800/40 hover:text-orange-950 hover:bg-orange-50/50'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[11px] mt-1">主页</span>
        </button>

        {/* Navigation Item 2 */}
        <button 
          id="nav-browser"
          onClick={() => {
            setBrowserCategory('all');
            setBrowserStatus('all');
            setActiveTab('browser');
          }}
          className={`flex flex-col items-center justify-center transition-all duration-300 outline-none w-14 py-1.5 rounded-2xl cursor-pointer ${
            activeTab === 'browser'
            ? 'bg-orange-50 text-[#c65a30] scale-105 font-black shadow-sm'
            : 'text-orange-800/40 hover:text-orange-950 hover:bg-orange-50/50'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[11px] mt-1 font-bold">词典</span>
        </button>

        {/* Navigation Item 2.5 - Word Assembler */}
        <button 
          id="nav-assembler"
          onClick={() => setActiveTab('assembler')}
          className={`flex flex-col items-center justify-center transition-all duration-300 w-14 py-1.5 rounded-2xl outline-none cursor-pointer ${
            activeTab === 'assembler'
            ? 'bg-orange-50 text-[#c65a30] scale-105 font-black shadow-sm'
            : 'text-orange-800/40 hover:text-orange-950 hover:bg-orange-50/50'
          }`}
          title="造词纺"
        >
          <AppLogo className="w-[1.75rem] h-[1.75rem] -my-1" />
          <span className="text-[11px] mt-1 font-bold">造词纺</span>
        </button>

        {/* Navigation Item 3 - Stats */}
        <button 
          id="nav-stats"
          onClick={() => setActiveTab('stats')}
          className={`flex flex-col items-center justify-center transition-all duration-300 w-14 py-1.5 rounded-2xl outline-none cursor-pointer ${
            activeTab === 'stats'
            ? 'bg-orange-50 text-[#c65a30] scale-105 font-black shadow-sm'
            : 'text-orange-800/40 hover:text-orange-950 hover:bg-orange-50/50'
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          <span className="text-[11px] mt-1 font-bold">统计</span>
        </button>

        {/* Navigation Item 4 - AI Chat partner */}
        <button 
          id="nav-chat"
          onClick={() => setActiveTab('chat')}
          className={`flex flex-col items-center justify-center transition-all duration-300 w-14 py-1.5 rounded-2xl outline-none cursor-pointer ${
            activeTab === 'chat'
            ? 'bg-orange-50 text-[#c65a30] scale-105 font-black shadow-sm'
            : 'text-orange-800/40 hover:text-orange-950 hover:bg-orange-50/50'
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-[11px] mt-1 font-bold">AI 陪练</span>
        </button>

      </nav>

      {/* Sidebar navigation helper for desktop view layout */}
      <div className="hidden md:flex fixed right-6 bottom-6 flex-col gap-3.5 z-40">
        <button 
          onClick={() => setActiveTab('home')}
          className={`p-3.5 rounded-2xl shadow-sm border outline-none transition-all cursor-pointer ${
            activeTab === 'home' 
            ? 'bg-indigo-600 text-white border-indigo-500 shadow-md' 
            : 'bg-white/90 backdrop-blur-md text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-800'
          }`}
          title="回主页"
        >
          <Home className="w-5 h-5" />
        </button>
        <button 
          onClick={() => {
            setBrowserCategory('all');
            setBrowserStatus('all');
            setActiveTab('browser');
          }}
          className={`p-3.5 rounded-2xl shadow-sm border outline-none transition-all cursor-pointer ${
            activeTab === 'browser'
            ? 'bg-cyan-600 text-white border-cyan-500 shadow-md' 
            : 'bg-white/90 backdrop-blur-md text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-800'
          }`}
          title="词汇浏览器"
        >
          <BookOpen className="w-5 h-5" />
        </button>
        <button 
          onClick={() => setActiveTab('assembler')}
          className={`p-3.5 rounded-2xl shadow-sm border outline-none transition-all cursor-pointer ${
            activeTab === 'assembler'
            ? 'bg-emerald-600 text-white border-emerald-500 shadow-md animate-pulse' 
            : 'bg-white/90 backdrop-blur-md text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-800'
          }`}
          title="视觉拼词图谱"
        >
          <BookMarked className="w-5 h-5" />
        </button>
        <button 
          onClick={() => setActiveTab('stats')}
          className={`p-3.5 rounded-2xl shadow-sm border outline-none transition-all cursor-pointer ${
            activeTab === 'stats'
            ? 'bg-amber-500 text-white border-amber-400 shadow-md' 
            : 'bg-white/90 backdrop-blur-md text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-800'
          }`}
          title="学习统计 & 测试"
        >
          <BarChart3 className="w-5 h-5" />
        </button>
        <button 
          onClick={() => setActiveTab('chat')}
          className={`p-3.5 rounded-2xl shadow-sm border outline-none transition-all cursor-pointer ${
            activeTab === 'chat'
            ? 'bg-purple-600 text-white border-purple-500 shadow-md' 
            : 'bg-white/90 backdrop-blur-md text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-800 animate-pulse'
          }`}
          title="AI 辅导陪练"
        >
          <Sparkles className="w-5 h-5" />
        </button>
      </div>
      {/* PWA Install Banners */}
      <AnimatePresence>
        {/* iOS Install Guide */}
        {showIOSInstallPrompt && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-24 sm:w-96 z-50 bg-white/95 backdrop-blur-xl p-5 rounded-3xl border border-indigo-200 shadow-2xl"
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
            className="fixed bottom-24 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-24 sm:w-96 z-50 bg-white/95 backdrop-blur-xl p-5 rounded-3xl border border-emerald-200 shadow-2xl"
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
        </>
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
