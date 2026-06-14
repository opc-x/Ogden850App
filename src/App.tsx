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

export default function App() {
  // Navigation & UI States
  const [activeTab, setActiveTab] = useState<'onboarding' | 'home' | 'browser' | 'practice' | 'stats' | 'chat' | 'assembler'>('onboarding');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
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
  const playSpeech = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const sentence = new SpeechSynthesisUtterance(text);
      sentence.lang = 'en-US';
      sentence.rate = 0.85;
      window.speechSynthesis.speak(sentence);
    }
  };

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
    if (aiExplanations[word.id]) return; // already in cache
    
    setGeneratingForId(word.id);
    try {
      const response = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          word: word.word,
          category: CATEGORY_LABELS[word.category]?.en || word.category,
          translation: word.translation
        })
      });
      const data = await response.json();
      if (data.success || data.offlineFallback) {
        setAiExplanations(prev => ({
          ...prev,
          [word.id]: {
            sentence: data.sentence,
            sentence_zh: data.sentence_zh,
            tip: data.tip
          }
        }));
      }
    } catch (err) {
      console.error('Error fetching word explanation:', err);
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
          <div 
            onClick={() => setActiveTab('home')}
            className="w-10 h-10 rounded-xl bg-orange-600/10 flex items-center justify-center cursor-pointer active:scale-95 transition-all shadow-sm border border-orange-500/10"
          >
            <BookMarked className="w-6 h-6 text-[#c65a30]" />
          </div>
          <div>
            <h1 
              onClick={() => setActiveTab('home')}
              className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#c65a30] cursor-pointer hover:opacity-90 select-none"
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
          <div className="space-y-6">
            
            {/* Search Section */}
            <div className="relative">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-400 transition-colors w-5 h-5" />
                <input 
                  type="text"
                  placeholder="搜索 850 个核心词汇 (如: hand, warm, build)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white backdrop-blur-md border border-slate-200 rounded-2xl py-4 pl-12 pr-4 shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-base placeholder-slate-400 text-slate-800 font-medium"
                />
                
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-orange-400 hover:text-orange-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Instant Search Results Dropdown */}
              <AnimatePresence>
                {searchQuery.trim().length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden"
                  >
                    <div className="p-3 border-b border-orange-50/50 flex justify-between items-center bg-orange-50/20">
                      <span className="text-xs font-bold text-orange-850/80">匹配结果 ({filteredWords.length})</span>
                      <button 
                        onClick={() => {
                          setBrowserCategory('all');
                          setBrowserStatus('all');
                          setActiveTab('browser');
                        }}
                        className="text-xs font-bold text-[#c65a30] hover:underline"
                      >
                        浏览全部
                      </button>
                    </div>
                    {filteredWords.length === 0 ? (
                      <div className="p-8 text-center text-orange-900/40 text-sm font-medium">
                        未找到与 “{searchQuery}” 相关的词汇
                      </div>
                    ) : (
                      <div className="divide-y divide-orange-100/30 max-h-60 overflow-y-auto">
                        {filteredWords.map(word => (
                          <div 
                            key={word.id}
                            onClick={() => {
                              setSelectedWord(word);
                              loadWordAiContext(word);
                              setSearchQuery('');
                            }}
                            className="p-3.5 hover:bg-orange-500/5 flex items-center justify-between cursor-pointer group transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              {(() => {
                                const annotation = (wordAnnotations as any)[word.word.toLowerCase()];
                                const img = annotation?.img;
                                return img ? (
                                  <img 
                                    src={img.replace(/\/200px-/g, '/120px-')} 
                                    alt="" 
                                    className="w-7 h-7 object-contain mix-blend-multiply opacity-90"
                                    onError={(e) => { e.currentTarget.src = img; }}
                                  />
                                ) : null;
                              })()}
                              <span className="font-extrabold text-orange-950 text-base">{word.word}</span>
                              <span className="text-xs text-orange-700/80 font-bold px-2.5 py-0.5 bg-orange-100/45 rounded-full">
                                {CATEGORY_LABELS[word.category]?.zh}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-orange-900/60 font-medium">{word.translation}</span>
                              <ChevronRight className="w-4 h-4 text-orange-300 group-hover:text-[#c65a30] transition-transform group-hover:translate-x-0.5" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Smart Learning Progress Card */}
            <section className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-3xl"></div>
              <div className="space-y-2 flex-1 relative z-10">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full tracking-wider uppercase border border-emerald-100">学习进度</span>
                  <p className="text-xs text-slate-400 font-bold tracking-widest uppercase">Ogden 850</p>
                </div>
                <h3 className="text-2xl font-black text-slate-800 mt-2">
                  已掌握 <span className="text-emerald-600 text-3xl">{masteredCount}</span> <span className="text-slate-400">/ {totalWords}</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  正在学 <span className="text-emerald-500 font-bold">{learningCount}</span> 词 · 
                  已收藏 <span className="text-amber-500 font-bold">{starredCount}</span> 词
                </p>
              </div>
              
              <div className="md:w-64 space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-orange-900/50 font-semibold">词汇覆盖率</span>
                  <span className="text-3xl font-black text-[#c65a30]">{progressPercent}%</span>
                </div>
                <div className="w-full h-3 bg-orange-100/30 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-[#c65a30] to-[#faa144] rounded-full"
                  />
                </div>
              </div>
            </section>

            {/* Core Operators Section */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-orange-950 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-orange-500" />
                  核心动词 <span className="text-xs text-orange-900/50 font-normal">Operators</span>
                </h2>
                <span className="text-xs font-semibold bg-orange-100 text-orange-800 px-3 py-1 rounded-full">
                  18 个关键
                </span>
              </div>
              
              <div 
                onClick={startOperatorsRoutine}
                className="relative w-full h-36 sm:h-52 rounded-2xl overflow-hidden shadow-sm group active:scale-[0.99] hover:shadow-md transition-all duration-300 cursor-pointer border border-orange-150/55"
              >
                <img 
                  alt="Minimal digital workspace learning zen"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuA67Z_foag2kUgf83Cki6FUcrkpIy1uxkVg5KKhduemzlJKdZaVVBnknU6ttRReZHcSdPmgjUxJ0-Hlh8Ob9LwsLnMhuEWghK6m-Nz3nmdVSGR_Z_bqXl41yTfdyG-kXNzY90SD95b6nIL9-rvi9yZFHtfS9GHVLCq3wPWi7t6cfWzgm9CcShrewK756MNR6ifoe3g1VVx4iLJJ8FXJ-iBjP5DcQvB_Qz1_dPf6WoDw-LWuu0bhjsfT5KkAxnWl6Siod6DuFgvvDrws"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-orange-950/80 via-orange-900/40 to-transparent flex flex-col justify-end p-6">
                  <p className="text-white font-extrabold text-xl sm:text-2xl mb-1 flex items-center gap-2">
                    掌握语言的引擎 <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                  </p>
                  <p className="text-white/90 text-xs sm:text-sm leading-relaxed max-w-xl font-medium">
                    点击强化演练这 18 个决定 Basic English 句式结构的核心动词（如 come, get, give, let 等），松弛掌控句法灵魂。
                  </p>
                </div>
              </div>
            </section>

            {/* Categorized Bento Grid */}
            <section className="space-y-4">
              <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                核心词汇分类
                <div className="h-px bg-slate-200 flex-1 ml-2"></div>
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                
                {/* 动作词 */}
                <div 
                  onClick={() => handleCategoryClick('actions')}
                  className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-100 hover:border-cyan-200 transition-all cursor-pointer flex flex-col gap-3 sm:gap-4 active:scale-95 group shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_20px_rgba(6,182,212,0.1)]"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-cyan-50 flex items-center justify-center text-cyan-500 border border-cyan-100">
                    <Move className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-sm sm:text-base group-hover:text-cyan-600 transition-colors">动作与方向</h3>
                    <p className="text-[10px] text-cyan-600/60 font-black uppercase mt-0.5 sm:mt-1 tracking-widest">100 Words</p>
                  </div>
                </div>

                {/* 可见物 */}
                <div 
                  onClick={() => handleCategoryClick('picturables')}
                  className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-100 hover:border-amber-200 transition-all cursor-pointer flex flex-col gap-3 sm:gap-4 active:scale-95 group shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_20px_rgba(245,158,11,0.1)]"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 border border-amber-100">
                    <Eye className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-sm sm:text-base group-hover:text-amber-600 transition-colors">可见物/实物</h3>
                    <p className="text-[10px] text-amber-600/60 font-black uppercase mt-0.5 sm:mt-1 tracking-widest">200 Words</p>
                  </div>
                </div>

                {/* 普通名词 */}
                <div 
                  onClick={() => handleCategoryClick('generals')}
                  className="col-span-2 md:col-span-1 bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-100 hover:border-rose-200 transition-all cursor-pointer flex items-center md:flex-col md:items-start justify-between md:justify-center gap-3 sm:gap-4 active:scale-95 group shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_20px_rgba(244,63,94,0.1)]"
                >
                  <div className="flex items-center md:flex-col md:items-start gap-3 sm:gap-4">
                    <div className="w-12 h-12 md:w-10 md:h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 border border-rose-100">
                      <Package className="w-6 h-6 md:w-5 md:h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-800 text-base sm:text-lg md:text-base group-hover:text-rose-600 transition-colors">普通名词</h3>
                      <p className="text-[10px] text-rose-600/60 font-black uppercase mt-0.5 sm:mt-1 tracking-widest">400 Words</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-slate-300 group-hover:text-rose-400 group-hover:translate-x-1 transition-all md:hidden" />
                </div>

                {/* 性质词 */}
                <div 
                  onClick={() => handleCategoryClick('qualities')}
                  className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-100 hover:border-purple-200 transition-all cursor-pointer flex flex-col gap-3 sm:gap-4 active:scale-95 group shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_20px_rgba(168,85,247,0.1)]"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-purple-50 flex items-center justify-center text-purple-500 border border-purple-100">
                    <Palette className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-sm sm:text-base group-hover:text-purple-600 transition-colors">性质词</h3>
                    <p className="text-[10px] text-purple-600/60 font-black uppercase mt-0.5 sm:mt-1 tracking-widest">100 Words</p>
                  </div>
                </div>

                {/* 反义词 */}
                <div 
                  onClick={() => handleCategoryClick('opposites')}
                  className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-100 hover:border-red-200 transition-all cursor-pointer flex flex-col gap-3 sm:gap-4 active:scale-95 group shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_20px_rgba(239,68,68,0.1)]"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-red-50 flex items-center justify-center text-red-500 border border-red-100">
                    <Blend className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-sm sm:text-base group-hover:text-red-600 transition-colors">反义词</h3>
                    <p className="text-[10px] text-red-600/60 font-black uppercase mt-0.5 sm:mt-1 tracking-widest">50 Words</p>
                  </div>
                </div>

                {/* Navigation quick start card */}
                <div 
                  onClick={() => {
                    setBrowserCategory('all');
                    setBrowserStatus('starred');
                    setActiveTab('browser');
                  }}
                  className="bg-amber-50 p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-amber-100 hover:bg-amber-100 transition-all cursor-pointer flex items-center justify-between active:scale-95 group shadow-sm"
                >
                  <div>
                    <h3 className="font-extrabold text-amber-700 text-sm sm:text-base">收藏夹词汇</h3>
                    <p className="text-[10px] text-amber-700/60 font-black uppercase mt-0.5 sm:mt-1 tracking-widest">{starredCount} WORDS</p>
                  </div>
                  <Star className="w-6 h-6 sm:w-7 sm:h-7 text-amber-500 drop-shadow-sm" />
                </div>

              </div>
            </section>

          </div>
        )}

        {/* TAB 2: OGDEN 850 WORDLIST BROWSER */}
        {activeTab === 'browser' && (
          <div className="space-y-6">
            
            {/* Horizontal Filter Row */}
            <div className="bg-white p-3 sm:p-4 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                
                {/* Search in view */}
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input 
                    type="text"
                    placeholder="在当前列表中快速筛选..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl py-2.5 sm:py-3 pl-10 pr-4 text-[13px] sm:text-sm focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 outline-none text-slate-800 placeholder-slate-400 transition-all shadow-sm"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-orange-400 hover:text-orange-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Status selector */}
                <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                  {(['all', 'starred', 'learning', 'mastered'] as const).map(status => (
                    <button
                       key={status}
                       onClick={() => setBrowserStatus(status)}
                       className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap shadow-sm ${
                        browserStatus === status 
                        ? 'bg-cyan-50 text-cyan-600 border border-cyan-200 shadow-[0_2px_10px_rgba(6,182,212,0.1)]' 
                        : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {status === 'all' && '全状态'}
                      {status === 'starred' && '已收藏'}
                      {status === 'learning' && '正在学'}
                      {status === 'mastered' && '已掌握'}
                    </button>
                  ))}
                </div>

              </div>

              <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none">
                <button
                  onClick={() => setBrowserCategory('all')}
                  className={`px-5 py-2 rounded-full text-[10px] uppercase tracking-widest font-black transition-all whitespace-nowrap border ${
                    browserCategory === 'all'
                    ? 'bg-amber-50 text-amber-600 border-amber-200 shadow-sm'
                    : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 hover:text-slate-600'
                  }`}
                >
                  全部单词 (850)
                </button>
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setBrowserCategory(key)}
                    className={`px-4 py-2 rounded-full text-[10px] font-black transition-all flex items-center gap-1.5 whitespace-nowrap border uppercase tracking-wider ${
                      browserCategory === key
                      ? `${label.bg} ${label.text} ${label.border} shadow-sm`
                      : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 hover:text-slate-600'
                    }`}
                  >
                    <span>{label.zh}</span>
                    <span className="opacity-50">({label.count})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* List Results Grid */}
            <div className="space-y-3">
              <div className="flex justify-between items-center px-2">
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
                  词汇列表 ({browserList.length}/{totalWords})
                </p>
                <p className="text-[10px] text-cyan-600/50 font-bold hidden sm:block">
                  点击卡片查看 AI 语境与发音
                </p>
              </div>

              {browserList.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-200 shadow-sm">
                  <HelpCircle className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                  <p className="text-sm font-extrabold text-slate-600">未找到任何单词</p>
                  <p className="text-xs text-slate-400 mt-2">您可以试着切换分类或重设过滤选项</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
                  {browserList.map(word => {
                    const isStarred = !!starredWords[word.id];
                    const status = learningStatus[word.id];

                    return (
                      <motion.div
                        layout
                        key={word.id}
                        onClick={() => {
                          setSelectedWord(word);
                          loadWordAiContext(word);
                        }}
                        className={`bg-white rounded-2xl sm:rounded-3xl border transition-all cursor-pointer select-none relative group overflow-hidden hover:shadow-[0_4px_20px_rgba(0,0,0,0.05)] ${
                          selectedWord?.id === word.id 
                          ? 'border-cyan-300 bg-cyan-50 shadow-sm' 
                          : 'border-slate-100 hover:border-slate-200 shadow-sm'
                        }`}
                      >
                        <div className="flex flex-row h-28 sm:h-32">
                          {/* Left: Image Wrapper */}
                          <div className="w-[42%] bg-slate-50 relative flex items-center justify-center p-3 sm:p-4 border-r border-slate-100 group-hover:bg-slate-100 transition-colors">
                            {/* Word top state flags - Right side only */}
                            <div className="absolute top-2 right-2 flex items-center gap-1.5 z-10 pointer-events-auto">
                              {status === 'mastered' ? (
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setWordStatus(word.id, null); }}
                                  className="p-1 rounded-full text-emerald-500 hover:bg-emerald-50 transition-colors bg-white/80 backdrop-blur-md shadow-sm"
                                  title="标记为正在学习"
                                >
                                  <CheckCircle className="w-3.5 h-3.5 fill-emerald-100" />
                                </button>
                              ) : status === 'learning' ? (
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setWordStatus(word.id, 'mastered'); }}
                                  className="w-3 h-3 bg-amber-400 rounded-full shadow-sm mx-1 ring-2 ring-white"
                                  title="标记为掌握"
                                />
                              ) : (
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setWordStatus(word.id, 'learning'); }}
                                  className="w-3 h-3 border-2 border-slate-300 hover:border-cyan-400 rounded-full mx-1 transition-colors bg-white/80"
                                  title="标记为正在学"
                                />
                              )}
                            </div>

                            {/* Category Badge top-left */}
                            <div className="absolute top-2 left-2 z-10 pointer-events-none">
                              <span className={`font-bold text-[9px] py-1 px-2 rounded border shadow-sm tracking-widest ${CATEGORY_LABELS[word.category]?.bg} ${CATEGORY_LABELS[word.category]?.text} ${CATEGORY_LABELS[word.category]?.border}`}>
                                {CATEGORY_LABELS[word.category]?.zh}
                              </span>
                            </div>

                            {(() => {
                              const annotation = (wordAnnotations as any)[word.word.toLowerCase()];
                              const img = annotation?.img;
                              return img ? (
                                <img 
                                  src={img.replace(/\/200px-/g, '/120px-')} 
                                  alt={word.word} 
                                  className="w-full h-full object-contain mix-blend-multiply opacity-90 group-hover:scale-105 transition-transform duration-300 mt-4"
                                  onError={(e) => { e.currentTarget.src = img; }}
                                />
                              ) : (
                                <div className="text-4xl font-black text-slate-200 opacity-50 mt-4">{word.word.charAt(0).toUpperCase()}</div>
                              );
                            })()}
                          </div>

                          {/* Right: Card Body */}
                          <div className="w-[58%] p-3 sm:p-4 bg-white flex flex-col justify-center relative">
                            {/* Star Icon top right */}
                            <button 
                              onClick={(e) => { e.stopPropagation(); toggleStar(word.id); }}
                              className="absolute top-2 right-2 p-1.5 rounded-full hover:bg-slate-50 transition-colors z-10"
                            >
                              <Star className={`w-3.5 h-3.5 ${isStarred ? 'fill-amber-400 text-amber-400 drop-shadow-sm' : 'text-slate-300'}`} />
                            </button>

                            <div className="flex flex-col h-full justify-center">
                              <div className="flex items-center gap-2 pr-6 mb-0.5">
                                <h4 className="text-lg sm:text-xl font-black text-slate-800 tracking-tight leading-none group-hover:text-cyan-600 transition-colors truncate">
                                  {word.word}
                                </h4>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    playSpeech(word.word);
                                  }}
                                  className="p-1 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-full transition-colors active:scale-95 shrink-0"
                                  title="点击发音"
                                >
                                  <Volume2 className="w-4 h-4" />
                                </button>
                              </div>
                              <div className="flex flex-col gap-0.5">
                                {(() => {
                                  const annotation = (wordAnnotations as any)[word.word.toLowerCase()];
                                  return annotation?.ipa ? (
                                    <span className="text-[10px] text-slate-400 font-mono tracking-wider">/{annotation.ipa}/</span>
                                  ) : null;
                                })()}
                                <p className="text-xs text-slate-600 font-semibold line-clamp-2 leading-snug mt-1">
                                  {word.translation}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB: PRACTICE WORKSPACE FOR SPELLING & SENTENCE BUILDING (拼词造句) */}
        {activeTab === 'practice' && (
          <div className="space-y-6">
            
            {/* Top Workspace Header Card */}
            <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
              <div className="absolute right-0 top-0 h-full w-1/3 opacity-5 pointer-events-none">
                <BookMarked className="w-full h-full text-indigo-400" />
              </div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
                <div className="relative z-10">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-800 flex items-center gap-2">
                    <BookMarked className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-500" />
                    拼词造句超级工坊 <span className="text-[10px] font-black px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md border border-indigo-100">EFFECTS LAB</span>
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-1 max-w-xl">
                    在词典中挑选想要挑战的 1-3 个 Ogden 核心词。练习拼写，用简单的词汇写一句完整的句子。见证 AI 即时为你评估、翻译、发音与视觉效果呈现！
                  </p>
                </div>
                
                <div className="flex gap-2 shrink-0 relative z-10">
                  <button
                    onClick={randomizePracticeWords}
                    className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold text-xs border border-slate-200 rounded-xl transition-all shadow-sm flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> 随机挑战
                  </button>
                  <button
                    onClick={() => setShowPracticeSearch(true)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-indigo-900/30 flex items-center gap-1 cursor-pointer border border-indigo-500/50"
                  >
                    <Search className="w-3.5 h-3.5" /> 词典搜词
                  </button>
                </div>
              </div>
            </div>

            {/* Dictionary Selection Drawer/Modal overlay */}
            <AnimatePresence>
              {showPracticeSearch && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-lg border border-slate-100 p-4 sm:p-5 shadow-2xl space-y-3 sm:space-y-4"
                  >
                    <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                      <h4 className="font-extrabold text-slate-800 text-sm sm:text-base">从 850 核心词中选择挑战词汇</h4>
                      <button 
                        onClick={() => {
                          setShowPracticeSearch(false);
                          setPracticeSearchQuery('');
                        }}
                        className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <div className="relative">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input 
                        type="text"
                        placeholder="输入英文、中文检索单词..."
                        value={practiceSearchQuery}
                        onChange={(e) => setPracticeSearchQuery(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 sm:py-3 pl-10 pr-4 text-[13px] sm:text-sm focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none text-slate-800 placeholder-slate-400"
                      />
                    </div>

                    <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 pr-1">
                      {wordsData.filter(w => {
                        if (!practiceSearchQuery.trim()) return true;
                        const q = practiceSearchQuery.toLowerCase();
                        return w.word.toLowerCase().includes(q) || w.translation.includes(q);
                      }).slice(0, 15).map(word => {
                        const isAdded = practiceWords.some(pw => pw.id === word.id);
                        return (
                          <div 
                            key={word.id}
                            onClick={() => {
                              if (isAdded) {
                                removePracticeWord(word.id);
                              } else {
                                if (practiceWords.length >= 3) {
                                  alert('一次最多只能选择 3 个挑战词汇哦！');
                                  return;
                                }
                                addPracticeWord(word);
                              }
                            }}
                            className={`p-3 hover:bg-slate-50 flex items-center justify-between cursor-pointer rounded-xl transition-colors mt-0.5 ${
                              isAdded ? 'bg-indigo-50 border border-indigo-200' : 'border border-transparent'
                            }`}
                          >
                            <div>
                              <span className="font-black text-slate-800 text-sm">{word.word}</span>
                              <span className="text-[9px] ml-2 text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded uppercase font-black">
                                {CATEGORY_LABELS[word.category]?.zh}
                              </span>
                            </div>
                            <span className="text-xs text-slate-500 font-semibold flex items-center gap-1.5">
                              {word.translation}
                              {isAdded ? (
                                <span className="text-xs text-indigo-600 font-black px-2 py-0.5 rounded-full bg-indigo-100 border border-indigo-200">已选</span>
                              ) : (
                                <span className="text-xs text-slate-400 font-bold px-2 py-0.5">未选</span>
                              )}
                            </span>
                          </div>
                        );
                      }).concat(wordsData.filter(w => {
                        if (!practiceSearchQuery.trim()) return true;
                        const q = practiceSearchQuery.toLowerCase();
                        return w.word.toLowerCase().includes(q) || w.translation.includes(q);
                      }).slice(0, 15).map(word => {
                        const isAdded = practiceWords.some(pw => pw.id === word.id);
                        return null; // safety
                      }).filter(Boolean) as any)}
                    </div>
                    
                    <div className="pt-2 text-right">
                      <button
                        onClick={() => {
                          setShowPracticeSearch(false);
                          setPracticeSearchQuery('');
                        }}
                        className="px-6 py-3 bg-indigo-600 text-white font-black text-xs rounded-xl shadow-lg shadow-indigo-900/30 hover:bg-indigo-500 active:scale-95 cursor-pointer transition-all"
                      >
                        完成选词 ({practiceWords.length})
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* Main Interactive Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Challenge list and Spelling (takes 5 cols) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="flex justify-between items-baseline px-1">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    当前挑战词 ({practiceWords.length}/3)
                  </h3>
                  <p className="text-[10px] text-slate-600 font-bold">点击卡片可移出挑战</p>
                </div>

                {practiceWords.length === 0 ? (
                  <div className="bg-white rounded-3xl p-8 text-center text-slate-500 border border-dashed border-slate-200 shadow-sm">
                    <HelpCircle className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="text-xs font-bold text-slate-600">没有活跃的挑战词汇</p>
                    <p className="text-[10px] text-slate-400 mt-1">请点击右上角【词典搜词】或【随机挑战】</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {practiceWords.map(word => {
                      const isComplete = !!spelledRevealed[word.id];
                      const letters = word.word.split('');
                      return (
                        <div 
                          key={word.id} 
                          className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-3 relative overflow-hidden group"
                        >
                          <button 
                            onClick={() => removePracticeWord(word.id)}
                            className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                            title="移出挑战"
                          >
                            <X className="w-4 h-4" />
                          </button>

                          <div className="flex justify-between items-start pr-6">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-xl font-black text-slate-800 tracking-tight">{word.word}</h4>
                                <button 
                                  onClick={() => playSpeech(word.word)}
                                  className="text-slate-400 hover:text-indigo-500 transition-colors p-1"
                                >
                                  <Volume2 className="w-4 h-4" />
                                </button>
                              </div>
                              <p className="text-xs text-slate-500 font-semibold">{word.translation}</p>
                            </div>
                            <span className="text-[9px] px-2 py-1 rounded-lg text-slate-500 bg-slate-50 border border-slate-100 uppercase tracking-wider font-black font-mono shrink-0">
                              {CATEGORY_LABELS[word.category]?.zh}
                            </span>
                          </div>

                          {/* Mini Game: Spelling click-to-tile helper */}
                          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-indigo-400" /> 拼字挑战
                              </span>
                              {isComplete ? (
                                <span className="text-[10px] font-black text-emerald-400 flex items-center gap-1">
                                  <CheckCircle className="w-3.5 h-3.5 fill-emerald-500/20 text-emerald-400" /> 还原成功
                                </span>
                              ) : (
                                <button 
                                  onClick={() => {
                                    setSpelledRevealed(prev => ({ ...prev, [word.id]: true }));
                                    playSpeech(word.word);
                                  }}
                                  className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                                >
                                  直接揭晓
                                </button>
                              )}
                            </div>

                            {isComplete ? (
                              <div className="flex gap-1.5 justify-center py-1 flex-wrap">
                                {word.word.split('').map((char, index) => (
                                  <span 
                                    key={index} 
                                    className="w-8 h-8 bg-emerald-50 text-emerald-600 font-black text-sm flex items-center justify-center rounded-xl shadow-sm border border-emerald-100"
                                  >
                                    {char}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <div className="space-y-3">
                                <div className="text-center py-2.5 bg-white rounded-xl border border-slate-200 flex flex-wrap justify-center gap-2 shadow-inner">
                                  {letters.map((_, idx) => (
                                    <span 
                                      key={idx} 
                                      className="w-6 h-6 border-b-2 border-slate-300 text-transparent font-extrabold flex items-center justify-center text-xs"
                                    >
                                      ?
                                    </span>
                                  ))}
                                </div>
                                <button
                                  onClick={() => {
                                    setSpelledRevealed(prev => ({ ...prev, [word.id]: true }));
                                    playSpeech(word.word);
                                  }}
                                  className="w-full text-center py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl text-[10px] text-indigo-600 font-black transition-all cursor-pointer uppercase tracking-wider"
                                >
                                  点击解锁拼写
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right Column: Lined Compose Notebook and Result Render (takes 7 cols) */}
              <div className="lg:col-span-7 space-y-5">
                
                {/* Lined Notebook Writing Card */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                  <div className="flex justify-between items-baseline">
                    <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                      <Palette className="w-5 h-5 text-indigo-500" />
                      极客写作终端 <span className="text-[9px] text-slate-400 uppercase tracking-widest font-mono">Ogden Compose Terminal</span>
                    </h3>
                    <span className="text-[10px] text-slate-400 font-bold hidden sm:block">由 AI 实时辅导评估</span>
                  </div>

                  {/* Progressive target completion checklist badges */}
                  <div className="flex flex-wrap gap-2 text-xs">
                    {practiceWords.map(w => {
                      const isIncluded = practiceSentence.toLowerCase().includes(w.word.toLowerCase());
                      return (
                        <span 
                          key={w.id} 
                          className={`px-3 py-1.5 rounded-xl font-black transition-all flex items-center gap-1.5 ${
                            isIncluded 
                            ? 'bg-emerald-500/20 text-emerald-600 border border-emerald-500/50 shadow-sm' 
                            : 'bg-slate-50 text-slate-500 border border-slate-200'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {w.word}
                        </span>
                      );
                    })}
                  </div>

                  {/* Terminal Mockup Textarea */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-2xl blur-md pointer-events-none group-focus-within:opacity-100 opacity-0 transition-opacity"></div>
                    <textarea
                      rows={5}
                      value={practiceSentence}
                      onChange={(e) => setPracticeSentence(e.target.value)}
                      placeholder="> 请在此输入包含挑战词汇的完整英文句子_&#10;> 例: The beautiful sun guides our path."
                      className="w-full relative z-10 bg-slate-50 border border-slate-200 rounded-2xl p-5 text-indigo-900 text-sm font-mono leading-relaxed outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 placeholder-slate-400 resize-none shadow-inner"
                    />
                    {practiceSentence && (
                      <button 
                        onClick={() => setPracticeSentence('')}
                        className="absolute right-4 bottom-4 p-2 rounded-xl bg-white text-slate-400 hover:text-rose-500 hover:bg-rose-50 border border-slate-200 shadow-sm cursor-pointer z-20 transition-colors"
                        title="清空文本"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Composition controls bar */}
                  <div className="flex flex-col sm:flex-row justify-between items-center pt-2 gap-3">
                    <span className="text-[10px] text-slate-500 font-medium">
                      使用越精简的基础词汇，越能展现语言的架构之美。
                    </span>
                    
                    <button
                      onClick={evaluatePracticeSentence}
                      disabled={practiceWords.length === 0 || !practiceSentence.trim() || practiceEvaluating}
                      className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-black text-xs shadow-sm transition-all cursor-pointer ${
                        (practiceWords.length === 0 || !practiceSentence.trim() || practiceEvaluating)
                        ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/50 active:scale-95 border border-indigo-400/50'
                      }`}
                    >
                      {practiceEvaluating ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          正在进行智能分析...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          一键评估造句效果
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* VISUAL COMPOSITION EFFECT RENDERING CARD ("效果展示" - user core focus) */}
                <AnimatePresence>
                  {practiceResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 15 }}
                      className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-xl relative"
                    >
                      {/* Top plaque banner */}
                      <div className="bg-indigo-600/20 border-b border-indigo-500/30 px-5 py-3.5 text-indigo-400 flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                          <Eye className="w-4 h-4" /> COMPOSITION EFFECT POSTER · 效果展板
                        </span>
                        
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => {
                            const starScore = practiceResult.score;
                            const rating = starScore >= 95 ? 5 : starScore >= 85 ? 4 : starScore >= 70 ? 3 : 2;
                            return (
                              <Star 
                                key={i} 
                                className={`w-3.5 h-3.5 ${
                                  i < rating 
                                  ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.5)]' 
                                  : 'text-slate-700'
                                }`} 
                              />
                            );
                          })}
                        </div>
                      </div>

                      {/* Poster Content Area */}
                      <div className="p-6 sm:p-8 space-y-6 text-center bg-gradient-to-b from-indigo-50/50 to-white">
                        
                        {/* Word score emblem */}
                        <div className="inline-block mx-auto mb-2 bg-white border border-indigo-100 px-5 py-2 rounded-2xl shadow-sm relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-transparent pointer-events-none"></div>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">AI 语法分项评级</p>
                          <p className="text-2xl font-black text-indigo-600 tracking-tight mt-1">{practiceResult.score} / 100 分</p>
                        </div>

                        {/* Large Quote Composition Display */}
                        <div className="max-w-md mx-auto space-y-3 py-6 border-y border-slate-100 relative font-serif">
                          <span className="absolute -top-4 left-2 text-5xl text-indigo-500/10 font-sans">"</span>
                          
                          <p className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight leading-relaxed italic px-4 relative z-10">
                            {practiceSentence}
                          </p>
                          
                          <div className="text-[10px] font-black text-slate-500 font-mono uppercase tracking-widest pt-2">
                            Composition by Learner (Ogden standard)
                          </div>
                        </div>

                        {/* Speech read-out effect player */}
                        <div className="flex justify-center">
                          <button
                            onClick={() => playSpeech(practiceResult.correctedSentence || practiceSentence)}
                            className="px-6 py-3 bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 text-cyan-400 font-black text-xs rounded-xl flex items-center gap-2 active:scale-95 transition-all shadow-[0_0_15px_rgba(6,182,212,0.15)] cursor-pointer"
                          >
                            <Volume2 className="w-4 h-4 text-cyan-400" />
                            听真人标准发声朗读展示
                          </button>
                        </div>

                        {/* Chinese translation plate */}
                        <div className="max-w-md mx-auto p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                          <span className="text-[9px] uppercase font-black tracking-widest text-slate-400 block mb-1.5">Chinese Translation · 译文释义</span>
                          <p className="text-sm font-bold text-slate-600 leading-relaxed">
                            {practiceResult.translation}
                          </p>
                        </div>

                        {/* Tutor Evaluation Section */}
                        <div className="text-left bg-slate-50 p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4 max-w-lg mx-auto">
                          
                          <div>
                            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest block mb-2">智能精修批改</span>
                            {practiceResult.correctedSentence ? (
                              <p className="text-sm font-black text-amber-600 bg-amber-50 p-3 rounded-xl border border-amber-100 leading-relaxed">
                                {practiceResult.correctedSentence} <span className="text-xs text-amber-500 font-semibold block mt-1">(推荐修正表达)</span>
                              </p>
                            ) : (
                              <p className="text-sm font-black text-emerald-600 bg-emerald-50 p-3 rounded-xl border border-emerald-100 leading-relaxed flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 shrink-0" /> 句子拼写精进，语法准确性极高，不需要任何修正。
                              </p>
                            )}
                          </div>
                          
                          <div className="space-y-2 text-xs font-semibold text-slate-600 leading-relaxed pt-2 border-t border-slate-200">
                            <p className="bg-white p-3 rounded-xl border border-slate-100"><b className="text-slate-800 font-black block mb-1">🔍 分析评价:</b> {practiceResult.analysis}</p>
                            <p className="bg-indigo-50 p-3 rounded-xl border border-indigo-100"><b className="text-indigo-700 font-black block mb-1">💡 启发建议:</b> {practiceResult.recommendedUsage}</p>
                          </div>

                        </div>

                        {/* Save block */}
                        <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
                          <button
                            onClick={savePracticeToHistory}
                            className="px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-black text-xs rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer border border-emerald-400/50"
                          >
                            <Award className="w-4 h-4" /> 💾 保存至【造句成就书】
                          </button>
                          
                          <button
                            onClick={() => setPracticeResult(null)}
                            className="px-6 py-3.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-black text-xs rounded-xl active:scale-95 transition-all cursor-pointer shadow-sm"
                          >
                            重写这一句
                          </button>
                        </div>

                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>

            </div>

            {/* Achievements Log: 造句成就本 */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
                    <Award className="w-6 h-6 text-emerald-500" />
                    我的造句成就书 ({practiceHistory.length})
                  </h3>
                  <p className="text-xs text-slate-500 font-bold mt-1">收集您写过的所有得到 AI 批改盖章的优秀英语造句作品</p>
                </div>
                
                {practiceHistory.length > 0 && (
                  <button
                    onClick={() => {
                      if (confirm('确定要清空您写过的所有造句成就历史吗？')) {
                        setPracticeHistory([]);
                      }
                    }}
                    className="text-xs font-black text-rose-500 hover:text-rose-600 transition-colors flex items-center gap-1 cursor-pointer bg-rose-50 hover:bg-rose-100 p-2 rounded-xl"
                  >
                    <Trash2 className="w-4 h-4" /> <span className="hidden sm:inline">清空记录</span>
                  </button>
                )}
              </div>

              {practiceHistory.length === 0 ? (
                <div className="p-16 text-center text-slate-500 border border-dashed border-slate-200 rounded-3xl space-y-3 bg-slate-50">
                  <BookMarked className="w-12 h-12 mx-auto text-slate-300" />
                  <p className="text-sm font-black text-slate-600">你的造句成就本目前尚无收藏</p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">创作并提交你的英文句子，通过 AI 评估后点击保存，你的成功表达将在这本属于你自己的成就书里生根发芽！</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {practiceHistory.map((item) => (
                    <div 
                      key={item.id} 
                      className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-indigo-300 shadow-sm hover:shadow-md transition-all relative flex flex-col justify-between gap-4 group"
                    >
                      <button 
                        onClick={(e) => deletePracticeHistoryItem(item.id, e)}
                        className="absolute top-3 right-3 p-1.5 rounded-full text-slate-400 hover:text-rose-500 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                        title="删除该条记录"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="space-y-3">
                        {/* Rating and date */}
                        <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold border-b border-slate-100 pb-2">
                          <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                          <span className="font-black text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-md border border-indigo-500/20">
                            {item.score}分
                          </span>
                        </div>

                        {/* Words used */}
                        <div className="flex flex-wrap gap-1.5">
                          {item.targetWords.map((tw, idx) => (
                            <span key={idx} className="text-[9px] bg-slate-800 text-emerald-400 font-black rounded-md px-2 py-0.5 border border-slate-700/50">
                              {tw.word}
                            </span>
                          ))}
                        </div>

                        {/* Sentence */}
                        <p className="text-base font-black text-slate-200 tracking-tight leading-relaxed font-serif italic pt-1">
                          "{item.userSentence}"
                        </p>

                        {/* Translation */}
                        <p className="text-xs text-slate-400 font-medium line-clamp-2 leading-relaxed">
                          {item.translation}
                        </p>
                      </div>

                      {/* Bottom Quick Play */}
                      <div className="pt-3 border-t border-slate-800/50 flex justify-between items-center">
                        <button
                          onClick={() => playSpeech(item.correctedSentence || item.userSentence)}
                          className="text-[10px] font-black text-cyan-500 hover:text-cyan-400 transition-colors flex items-center gap-1 cursor-pointer bg-cyan-500/10 px-2.5 py-1.5 rounded-lg border border-cyan-500/20"
                        >
                          <Volume2 className="w-3.5 h-3.5" /> 听标准发音
                        </button>
                        
                        <span className="text-[10px] text-emerald-500/70 font-black uppercase tracking-widest">已掌握</span>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 3: STATS & PRACTICE PANEL */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            
            {/* Left Stats Circle & Category meters split */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl pointer-events-none"></div>
                <div className="relative z-10">
                  <h3 className="text-xl font-black text-slate-800 flex items-center gap-2 mb-1">
                    <Award className="w-5 h-5 text-indigo-500" />
                    系统评估
                  </h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Ogden English 经典分级标准</p>
                </div>

                <div className="my-10 flex justify-center relative z-10">
                  <div className="w-44 h-44 rounded-full border-[10px] border-slate-50 bg-white flex flex-col items-center justify-center shadow-inner relative">
                    <div className="absolute inset-[-10px] rounded-full border-[10px] border-indigo-100 border-t-indigo-500 border-r-indigo-400 rotate-45"></div>
                    <span className="text-5xl font-black text-slate-800 tracking-tighter">{masteredCount}</span>
                    <span className="text-[10px] text-slate-400 font-black uppercase mt-1 tracking-widest">/ 850 词掌握</span>
                    <div className="absolute inset-x-0 -bottom-4 text-center">
                      <span className="text-xs font-black text-indigo-700 bg-indigo-50 px-4 py-1.5 rounded-full border border-indigo-200 shadow-sm backdrop-blur-md">
                        词汇掌握：{progressPercent}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 border-t pt-5 border-slate-100 text-sm text-slate-500 font-medium relative z-10">
                  <div className="flex justify-between items-center">
                    <span>收藏重要单词</span>
                    <span className="font-black text-slate-700 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md">{starredCount} 词</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>当前熟手级别</span>
                    <span className="font-black text-indigo-600">
                      {progressPercent < 10 && '🌱 菜鸟学步'}
                      {progressPercent >= 10 && progressPercent < 30 && '🍀 入门能手'}
                      {progressPercent >= 30 && progressPercent < 70 && '🍊 基本流畅'}
                      {progressPercent >= 70 && progressPercent < 95 && '🚀 驾轻就熟'}
                      {progressPercent >= 95 && '💎 Basic 完美掌控'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Categoric Completion Status */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm lg:col-span-2 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="text-xl font-black text-slate-800">各分支覆盖率</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">词性及功能性词汇分类达标指标</p>
                  </div>
                  <button 
                    onClick={generateQuiz}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500 active:scale-95 transition-all text-xs font-black rounded-xl shadow-md cursor-pointer w-full sm:w-auto"
                  >
                    <Brain className="w-4 h-4" />
                    开启 5 词速测
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                  {Object.entries(CATEGORY_LABELS).map(([catKey, label]) => {
                    const countInCat = wordsData.filter(w => w.category === catKey).length;
                    const masteredInCat = wordsData.filter(w => w.category === catKey && learningStatus[w.id] === 'mastered').length;
                    const percent = Math.round((masteredInCat / countInCat) * 100) || 0;

                    return (
                      <div key={catKey} className="p-4 bg-slate-50 rounded-2xl space-y-3 border border-slate-200 hover:border-slate-300 transition-colors shadow-sm">
                        <div className="flex justify-between text-xs font-black">
                          <span className="text-slate-700">{label.zh} <span className="text-slate-400 text-[10px] ml-1 uppercase">{label.en}</span></span>
                          <span className="text-slate-500">{masteredInCat} / {countInCat}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2.5 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                            <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 shadow-sm transition-all duration-1000" style={{ width: `${percent}%` }} />
                          </div>
                          <span className="text-xs font-black text-cyan-600 w-9 text-right">{percent}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-end gap-3 pt-3 text-xs">
                  <button 
                    onClick={resetProgressData}
                    className="text-slate-400 hover:text-rose-500 font-bold flex items-center gap-1.5 border border-slate-200 hover:bg-rose-50 hover:border-rose-200 px-4 py-2 rounded-xl active:scale-95 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    危险：重置所有学习记录
                  </button>
                </div>

              </div>

            </div>

            {/* Quick Multi-choice Quiz Interface */}
            {quizActive && (
              <motion.section 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/95 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-cyan-200 shadow-xl relative overflow-hidden"
              >
                <button 
                  onClick={() => setQuizActive(false)}
                  className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 bg-slate-100 p-1.5 rounded-full cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                {!quizSubmitted ? (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                      <div className="flex items-center gap-2">
                        <Brain className="w-6 h-6 text-cyan-500 animate-pulse" />
                        <h3 className="text-lg font-black text-slate-800">Ogden English 挑战测试</h3>
                      </div>
                      <span className="text-[10px] font-black text-cyan-600 uppercase tracking-widest bg-cyan-50 px-3 py-1 rounded-full border border-cyan-100">
                        问题 {currentQuizIndex + 1} / 5
                      </span>
                    </div>

                    {/* Question presentation */}
                    <div className="text-center py-8 bg-slate-50 rounded-3xl border border-slate-200 shadow-sm max-w-md mx-auto">
                      <p className="text-[10px] text-cyan-600 font-black tracking-widest uppercase mb-2">请选择正确的中文释义</p>
                      <h4 className="text-5xl font-black text-slate-800 tracking-tight mb-3">
                        {quizQuestions[currentQuizIndex]?.word.word}
                      </h4>
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white px-3 py-1 rounded-lg border border-slate-200">
                        {CATEGORY_LABELS[quizQuestions[currentQuizIndex]?.word.category]?.zh}
                      </span>
                    </div>

                    {/* Multiple choices */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 max-w-xl mx-auto pt-2">
                      {quizQuestions[currentQuizIndex]?.options.map((option, idx) => {
                        const isSelected = quizQuestions[currentQuizIndex]?.selectedIndex === idx;
                        return (
                          <button
                            key={idx}
                            onClick={() => handleSelectQuizOption(idx)}
                            className={`p-5 rounded-2xl text-sm font-black text-left transition-all tracking-tight cursor-pointer ${
                              isSelected 
                              ? 'bg-cyan-50 text-cyan-700 shadow-sm border border-cyan-300' 
                              : 'bg-white border border-slate-200 hover:bg-slate-50 hover:border-cyan-200 text-slate-700'
                            }`}
                          >
                            <span className="inline-block mr-3 text-xs font-black opacity-60 bg-slate-100 px-2 py-1 rounded">
                              {['A', 'B', 'C', 'D'][idx]}
                            </span>
                            {option}
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex justify-end pt-4 max-w-xl mx-auto">
                      <button
                        onClick={handleNextQuiz}
                        disabled={quizQuestions[currentQuizIndex]?.selectedIndex === null}
                        className={`flex items-center justify-center w-full sm:w-auto gap-2 px-8 py-4 rounded-2xl font-black text-sm shadow-md transition-all cursor-pointer ${
                          quizQuestions[currentQuizIndex]?.selectedIndex === null
                          ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none'
                          : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:opacity-90 active:scale-95 shadow-sm'
                        }`}
                      >
                        {currentQuizIndex < 4 ? '下一题 Next' : '完成测试 Finish'}
                        <ArrowRight className="w-5 h-5 ml-1" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 space-y-6 max-w-sm mx-auto">
                    <div className="w-24 h-24 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500 mx-auto shadow-sm">
                      <Award className="w-12 h-12" />
                    </div>
                    <div>
                      <h4 className="text-2xl font-black text-slate-800">测试挑战完成！</h4>
                      <p className="text-3xl font-black text-cyan-500 mt-2">您答对了 {quizScore} / 5</p>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium bg-slate-50 p-4 rounded-2xl border border-slate-200">
                      凡是答对的词语已经被 <b className="text-emerald-500">自动标记为“已掌握”</b>。多做词汇评测是掌握 Ogden Basic 的最快途径！
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                      <button
                        onClick={generateQuiz}
                        className="px-6 py-3.5 text-xs font-black border border-cyan-200 hover:bg-cyan-50 text-cyan-600 rounded-xl active:scale-95 transition-all flex justify-center items-center gap-2 cursor-pointer w-full sm:w-auto"
                      >
                        <RefreshCw className="w-4 h-4" /> 再试一次
                      </button>
                      <button
                        onClick={() => setQuizActive(false)}
                        className="px-6 py-3.5 text-xs font-black bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl shadow-sm active:scale-95 transition-all cursor-pointer w-full sm:w-auto"
                      >
                        返回统计
                      </button>
                    </div>
                  </div>
                )}
              </motion.section>
            )}

            {/* General Description Card */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-5">
              <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
                <Languages className="w-6 h-6 text-indigo-500 animate-pulse" />
                关于 Ogden 850 基础英语
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                <b className="text-slate-800 font-black">Ogden Basic English</b> (奥格登基本英语) 是由英国语言学家 Charles Kay Ogden 发明的简化英语系统。
                它仅仅挑选了 <b className="text-indigo-600 font-black">850 个核心词汇</b>，用来涵盖和表达几乎所有的日常场景。只要您熟练掌握这 850 个英文单词，
                您就已经拥有了在全世界流畅读写、自由表达的核心基石。
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-5 rounded-2xl text-center text-sm border border-slate-200 shadow-sm">
                <div className="py-2">
                  <p className="font-black text-cyan-600 text-xl tracking-tight">18 核心动词</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">沟通句子逻辑的核心枢纽</p>
                </div>
                <div className="border-t sm:border-t-0 sm:border-x border-slate-200 py-4 sm:py-2">
                  <p className="font-black text-emerald-600 text-xl tracking-tight">600 物与名词</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">200个实体和400个一般概念</p>
                </div>
                <div className="py-2">
                  <p className="font-black text-amber-500 text-xl tracking-tight">150 描述品质</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">100个普通性质和50个完美反义词</p>
                </div>
              </div>
            </div>

          </div>
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
            {/* Backdrop cover */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedWord(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />
            
            {/* Modal Box */}
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100dvh' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-full sm:max-w-xl bg-white sm:rounded-2xl rounded-t-[2rem] shadow-2xl border border-slate-200 overflow-hidden max-h-[85vh] sm:max-h-[90vh] flex flex-col"
            >
              {/* Drag handle */}
              <div className="w-full flex justify-center pt-3 pb-1">
                <div className="w-12 h-1.5 bg-slate-300 rounded-full"></div>
              </div>
              
              {/* Cover/Splash area */}
              <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-cyan-600 uppercase tracking-wider bg-cyan-50 px-2.5 py-0.5 rounded-full border border-cyan-200">
                      {CATEGORY_LABELS[selectedWord.category]?.zh}
                    </span>
                    <span className="text-xs text-slate-400 font-bold font-mono uppercase">ID: {selectedWord.id}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 mt-2">
                    <h2 className="text-4xl font-black text-slate-800 tracking-tight">{selectedWord.word}</h2>
                    <button 
                      onClick={() => playSpeech(selectedWord.word)}
                      className="p-1.5 bg-cyan-50 text-cyan-600 hover:text-white hover:bg-cyan-500 transition-all rounded-full shadow-sm active:scale-90 cursor-pointer border border-cyan-200"
                      title="朗读发音"
                    >
                      <Volume2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  {/* Star toggle button */}
                  <button 
                    onClick={() => toggleStar(selectedWord.id)}
                    className="p-2 bg-white text-slate-500 hover:text-amber-500 hover:bg-slate-50 rounded-full shadow-sm active:scale-90 transition-all border border-slate-200 cursor-pointer"
                  >
                    <Star className={`w-5 h-5 ${starredWords[selectedWord.id] ? 'fill-amber-400 text-amber-400' : ''}`} />
                  </button>
                  {/* Close button */}
                  <button 
                    onClick={() => setSelectedWord(null)}
                    className="p-2 bg-white text-slate-500 hover:text-rose-500 hover:bg-slate-50 rounded-full shadow-sm active:scale-90 transition-all border border-slate-200 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Main definitions & scrollable content */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-white">
                
                {/* Chinese translations */}
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">中文释义</span>
                  <p className="text-2xl font-black text-slate-800 tracking-tight">{selectedWord.translation}</p>
                </div>

                {/* SVG Visual Focus */}
                <div className="w-full flex justify-center py-4 relative min-h-[140px] items-center">
                  <div className="absolute inset-0 bg-gradient-to-b from-slate-50/50 to-white rounded-3xl -z-10" />
                  {selectedWord.category === 'operators' && (
                    <div className="scale-125 transform-gpu origin-center pb-8"><OperatorVisual type={selectedWord.word} /></div>
                  )}
                  {selectedWord.category === 'actions' && (
                    <div className="scale-125 transform-gpu origin-center pb-8"><DirectionGraphic type={selectedWord.word} /></div>
                  )}
                  {(selectedWord.category === 'picturables' || selectedWord.category === 'generals' || selectedWord.category === 'qualities' || selectedWord.category === 'opposites') && (
                    <div className="flex flex-col items-center justify-center pt-2 pb-6">
                      {(() => {
                        const annotation = (wordAnnotations as any)[selectedWord.word.toLowerCase()];
                        const img = annotation?.img;
                        return img ? (
                          <img 
                            src={img} 
                            alt={selectedWord.word} 
                            className="w-40 h-40 object-contain mix-blend-multiply drop-shadow-sm mb-2"
                          />
                        ) : (
                          <div className="flex flex-col items-center opacity-40 justify-center">
                            {selectedWord.category === 'picturables' || selectedWord.category === 'generals' ? (
                              <>
                                <Package className="w-20 h-20 text-slate-400 drop-shadow-sm mb-2" strokeWidth={1} />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">名词图谱</span>
                              </>
                            ) : (
                              <>
                                <Palette className="w-20 h-20 text-slate-400 drop-shadow-sm mb-2" strokeWidth={1} />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">性质图谱</span>
                              </>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>

                {/* English standard definition */}
                <div className="space-y-1 bg-slate-50 p-4 rounded-2xl border border-slate-100 mt-2">
                  <span className="text-[10px] font-black text-cyan-600 uppercase tracking-widest block mb-1">英文释义 Definition</span>
                  <p className="text-sm font-semibold text-slate-600 leading-relaxed italic">
                    "{selectedWord.definition_en}"
                  </p>
                </div>

                {/* Status change selector buttons */}
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-cyan-600 uppercase tracking-widest block">掌握状态标记</span>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setWordStatus(selectedWord.id, 'learning')}
                      className={`p-3 text-xs font-bold rounded-2xl border transition-all cursor-pointer ${
                        learningStatus[selectedWord.id] === 'learning'
                        ? 'bg-amber-50 text-amber-600 border-amber-200 shadow-sm'
                        : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border-slate-200'
                      }`}
                    >
                      正在学习中 🍀
                    </button>
                    <button
                      onClick={() => setWordStatus(selectedWord.id, 'mastered')}
                      className={`p-3 text-xs font-bold rounded-2xl border transition-all cursor-pointer ${
                        learningStatus[selectedWord.id] === 'mastered'
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-200 shadow-sm'
                        : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border-slate-200'
                      }`}
                    >
                      已彻底掌握 ✨
                    </button>
                  </div>
                </div>

                {/* spelling & Sentence Practice Shortcut */}
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest block">创意拼词造句</span>
                  <button
                    onClick={() => {
                      const mapping: Record<string, 'op18' | 'dir' | 'pic' | 'things' | 'qual' | 'opp'> = {
                        operators: 'op18',
                        actions: 'dir',
                        picturables: 'pic',
                        generals: 'things',
                        qualities: 'qual',
                        opposites: 'opp'
                      };
                      setAssemblerTier(mapping[selectedWord.category] || 'op18');
                      setSelectedWord(null);
                      setActiveTab('assembler');
                    }}
                    className="w-full p-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:opacity-90 font-black text-xs rounded-2xl transition-all shadow-lg shadow-purple-900/50 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <BookMarked className="w-4 h-4" />
                    携带此词前往「拼词造句」超级工坊 →
                  </button>
                </div>

                {/* Generated AI Content Wrapper */}
                <div className="border-t pt-6 border-slate-800 space-y-4">
                  <div className="flex justify-between items-center bg-transparent">
                    <span className="text-[10px] font-black text-cyan-500 uppercase tracking-widest flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                      AI 助记例句 & 语境
                    </span>
                    
                    {!aiExplanations[selectedWord.id] && !generatingForId && (
                      <button 
                        onClick={() => loadWordAiContext(selectedWord)}
                        className="text-[10px] font-bold hover:underline text-cyan-400 flex items-center gap-1 cursor-pointer bg-cyan-900/30 px-2 py-1 rounded border border-cyan-800/50"
                      >
                        生成新语境
                      </button>
                    )}
                  </div>

                  {generatingForId === selectedWord.id ? (
                    <div className="space-y-3 bg-cyan-50 p-4 rounded-2xl border border-cyan-100 animate-pulse">
                      <div className="h-4 bg-cyan-200/50 rounded-md w-[80%]"></div>
                      <div className="h-3.5 bg-cyan-200/50 rounded-md w-[55%]"></div>
                      <div className="h-3 bg-cyan-200/50 rounded-md w-[60%]"></div>
                    </div>
                  ) : aiExplanations[selectedWord.id] ? (
                    <div className="space-y-4 font-bold">
                      
                      {/* Examples Sentence sentence */}
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] uppercase font-black text-cyan-600">简单例句 Example</span>
                          <button 
                            onClick={() => playSpeech(aiExplanations[selectedWord.id]?.sentence || '')}
                            className="p-1 rounded-full text-cyan-500 hover:text-cyan-600 hover:bg-cyan-100 cursor-pointer transition-colors"
                            title="朗读例句"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-base font-black tracking-tight text-slate-800 leading-relaxed font-sans cursor-pointer animate-none" onClick={() => playSpeech(aiExplanations[selectedWord.id]?.sentence || '')}>
                          {aiExplanations[selectedWord.id]?.sentence}
                        </p>
                        <p className="text-xs text-slate-500 font-semibold">
                          {aiExplanations[selectedWord.id]?.sentence_zh}
                        </p>
                      </div>

                      {/* AI usage tips */}
                      {aiExplanations[selectedWord.id]?.tip && (
                        <div className="p-4 bg-indigo-900/20 border border-indigo-500/30 rounded-2xl text-xs space-y-1">
                          <span className="font-black text-indigo-400 flex items-center gap-1 mb-2">
                            <Sparkles className="w-3.5 h-3.5" /> Tutor 学习窍门:
                          </span>
                          <p className="font-medium text-slate-300 leading-normal">{aiExplanations[selectedWord.id]?.tip}</p>
                        </div>
                      )}

                    </div>
                  ) : (
                    <div className="text-center p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <p className="text-xs text-slate-500 leading-relaxed font-medium">
                        由于网络延迟，该离线词汇暂时未预加载智能例句。
                      </p>
                      <button 
                        onClick={() => loadWordAiContext(selectedWord)}
                        className="mt-4 px-4 py-2 bg-cyan-50 text-cyan-600 border border-cyan-200 font-bold text-xs rounded-xl hover:bg-cyan-100 active:scale-95 transition-all shadow-sm cursor-pointer"
                      >
                        召唤 AI 瞬间生成
                      </button>
                    </div>
                  )}

                </div>

              </div>
              
              {/* Simple Bottom close trigger */}
              <div className="p-4 bg-white border-t border-slate-100 text-center sm:hidden pb-safe">
                <button 
                  onClick={() => setSelectedWord(null)}
                  className="w-full py-4 bg-slate-50 text-slate-600 text-sm font-black border border-slate-200 rounded-2xl hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  关闭
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Persistent Beautiful Bottom Navigation Bar for Mobile */}
      <nav id="bottom-bar-nav" className="flex-none w-full bg-white/95 backdrop-blur-xl border-t border-slate-200/60 flex md:hidden justify-around items-center pt-3 pb-safe px-2 z-50 shadow-[0_-10px_20px_rgba(0,0,0,0.03)] absolute bottom-0">
        
        {/* Navigation Item 1 */}
        <button 
          id="nav-home"
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center justify-center transition-all duration-300 outline-none w-14 cursor-pointer ${
            activeTab === 'home' 
            ? 'text-[#c65a30] scale-105 font-black' 
            : 'text-orange-800/40 hover:text-orange-950'
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
          className={`flex flex-col items-center justify-center transition-all duration-300 outline-none w-14 cursor-pointer ${
            activeTab === 'browser'
            ? 'text-[#c65a30] scale-105 font-black'
            : 'text-orange-800/40 hover:text-orange-950'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[11px] mt-1 font-bold">词典</span>
        </button>

        {/* Navigation Item 2.5 - Word Assembler */}
        <button 
          id="nav-assembler"
          onClick={() => setActiveTab('assembler')}
          className={`flex flex-col items-center justify-center transition-all duration-300 w-14 outline-none cursor-pointer ${
            activeTab === 'assembler'
            ? 'text-[#c65a30] scale-105 font-black'
            : 'text-orange-850 hover:text-orange-950'
          }`}
          title="图解拼词"
        >
          <BookMarked className="w-5 h-5" />
          <span className="text-[11px] mt-1 font-bold">图谱</span>
        </button>

        {/* Navigation Item 3 - Stats */}
        <button 
          id="nav-stats"
          onClick={() => setActiveTab('stats')}
          className={`flex flex-col items-center justify-center transition-all duration-300 w-14 outline-none cursor-pointer ${
            activeTab === 'stats'
            ? 'text-[#c65a30] scale-105 font-black'
            : 'text-orange-800/40 hover:text-orange-950'
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          <span className="text-[11px] mt-1 font-bold">统计</span>
        </button>

        {/* Navigation Item 4 - AI Chat partner */}
        <button 
          id="nav-chat"
          onClick={() => setActiveTab('chat')}
          className={`flex flex-col items-center justify-center transition-all duration-300 w-14 outline-none cursor-pointer ${
            activeTab === 'chat'
            ? 'text-[#c65a30] scale-105 font-black'
            : 'text-orange-850 hover:text-orange-950'
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
