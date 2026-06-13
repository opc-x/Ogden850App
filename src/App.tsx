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
  BookMarked
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { wordsData, CATEGORY_LABELS, Word } from './data/wordsList';

export default function App() {
  // Navigation & UI States
  const [activeTab, setActiveTab] = useState<'home' | 'browser' | 'practice' | 'stats' | 'chat'>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);

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

  // Load from LocalStorage
  useEffect(() => {
    try {
      const storedStatus = localStorage.getItem('ogden850_learning_status');
      const storedStars = localStorage.getItem('ogden850_starred');
      const storedCache = localStorage.getItem('ogden850_ai_cache');
      const storedChat = localStorage.getItem('ogden850_chat_messages');
      const storedPracticeHistory = localStorage.getItem('ogden850_practice_history');

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
    <div className="min-h-screen bg-[#fffbf6] text-[#2c1c14] flex flex-col font-sans relative overflow-x-hidden pb-20 md:pb-8">
      
      {/* Top Header App Bar */}
      <header className="w-full top-0 sticky z-40 bg-[#fffbf6]/90 backdrop-blur-md flex items-center justify-between px-4 py-3 sm:px-6 sm:py-3.5 border-b border-orange-100/50">
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
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-4">
        
        {/* TAB 1: HOME PANEL */}
        {activeTab === 'home' && (
          <div className="space-y-6">
            
            {/* Search Section */}
            <div className="relative">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-400 group-focus-within:text-[#c65a30] transition-colors w-5 h-5" />
                <input 
                  type="text"
                  placeholder="搜索 850 个核心词汇 (如: hand, warm, build)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-orange-100 rounded-2xl py-4 pl-12 pr-4 shadow-[0_4px_24px_rgba(230,120,80,0.04)] border-orange-100/60 focus:border-[#c65a30]/30 focus:ring-4 focus:ring-orange-500/5 outline-none transition-all text-base placeholder-orange-900/30 text-orange-950 font-medium"
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
                    className="absolute top-full left-0 right-0 mt-2 bg-[#fffdfa] rounded-2xl shadow-xl border border-orange-100 z-50 overflow-hidden"
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
            <section className="bg-[#fffdf9] rounded-2xl p-6 border border-orange-100/50 shadow-[0_8px_30px_rgba(230,120,80,0.02)] flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-[#c65a30] bg-orange-500/10 px-2.5 py-1 rounded-full tracking-wider uppercase">学习进度</span>
                  <p className="text-xs text-orange-850/50 font-bold">(Ogden 850 标准系统)</p>
                </div>
                <h3 className="text-2xl font-black text-orange-950">
                  已掌握 <span className="text-[#c65a30] font-black">{masteredCount}</span> / {totalWords} 词
                </h3>
                <p className="text-sm text-orange-900/70 font-semibold">
                  标记：正在学 <span className="text-amber-600 font-bold">{learningCount}</span> 词 · 
                  已收藏 <span className="text-rose-500 font-bold">{starredCount}</span> 词
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
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-orange-950">核心词汇分类</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                
                {/* 动作词 */}
                <div 
                  onClick={() => handleCategoryClick('actions')}
                  className="bg-white p-5 rounded-2xl shadow-sm border border-orange-50 hover:shadow-md hover:border-orange-200/50 transition-all cursor-pointer flex flex-col gap-4 active:scale-95 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-700">
                    <Move className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-orange-950 text-base group-hover:text-[#c65a30] transition-colors">动作与方向</h3>
                    <p className="text-xs text-orange-550 font-bold uppercase mt-0.5">100 Words</p>
                  </div>
                </div>

                {/* 可见物 */}
                <div 
                  onClick={() => handleCategoryClick('picturables')}
                  className="bg-white p-5 rounded-2xl shadow-sm border border-orange-50 hover:shadow-md hover:border-orange-200/50 transition-all cursor-pointer flex flex-col gap-4 active:scale-95 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
                    <Eye className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-orange-950 text-base group-hover:text-[#c65a30] transition-colors">可见物/实物</h3>
                    <p className="text-xs text-amber-600 font-bold uppercase mt-0.5">200 Words</p>
                  </div>
                </div>

                {/* 普通名词 (Span 2 to make interesting layout as mockup) */}
                <div 
                  onClick={() => handleCategoryClick('generals')}
                  className="col-span-2 md:col-span-1 bg-white p-5 rounded-2xl shadow-sm border border-orange-50 hover:shadow-md hover:border-orange-200/50 transition-all cursor-pointer flex items-center md:flex-col md:items-start justify-between md:justify-center gap-4 active:scale-95 group"
                >
                  <div className="flex items-center md:flex-col md:items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center text-rose-700">
                      <Package className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-orange-950 text-base group-hover:text-[#c65a30] transition-colors">普通名词</h3>
                      <p className="text-xs text-rose-600 font-bold uppercase mt-0.5">400 Words</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-orange-300 group-hover:text-[#c65a30] group-hover:translate-x-1 transition-all md:hidden" />
                </div>

                {/* 性质词 */}
                <div 
                  onClick={() => handleCategoryClick('qualities')}
                  className="bg-white p-5 rounded-2xl shadow-sm border border-orange-50 hover:shadow-md hover:border-orange-200/50 transition-all cursor-pointer flex flex-col gap-4 active:scale-95 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-peach-100 bg-[#fff5eb] flex items-center justify-center text-orange-600">
                    <Palette className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-orange-950 text-base group-hover:text-[#c65a30] transition-colors">性质词 (形容词)</h3>
                    <p className="text-xs text-orange-600 font-bold uppercase mt-0.5">100 Words</p>
                  </div>
                </div>

                {/* 反义词 */}
                <div 
                  onClick={() => handleCategoryClick('opposites')}
                  className="bg-white p-5 rounded-2xl shadow-sm border border-orange-50 hover:shadow-md hover:border-orange-200/50 transition-all cursor-pointer flex flex-col gap-4 active:scale-95 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-[#c65a30]">
                    <Blend className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-orange-950 text-base group-hover:text-[#c65a30] transition-colors">反义词</h3>
                    <p className="text-xs text-red-600 font-bold uppercase mt-0.5">50 Words</p>
                  </div>
                </div>

                {/* Navigation quick start card */}
                <div 
                  onClick={() => {
                    setBrowserCategory('all');
                    setBrowserStatus('starred');
                    setActiveTab('browser');
                  }}
                  className="bg-rose-500/5 p-5 rounded-2xl border border-rose-200/30 hover:bg-rose-500/10 transition-all cursor-pointer flex items-center justify-between active:scale-95 group"
                >
                  <div>
                    <h3 className="font-extrabold text-[#c65a30]">收藏夹词汇</h3>
                    <p className="text-xs text-[#833113] font-bold uppercase mt-0.5">{starredCount} 个单词</p>
                  </div>
                  <Star className="w-6 h-6 text-amber-500 fill-amber-400" />
                </div>

              </div>
            </section>

          </div>
        )}

        {/* TAB 2: OGDEN 850 WORDLIST BROWSER */}
        {activeTab === 'browser' && (
          <div className="space-y-6">
            
            {/* Horizontal Filter Row */}
            <div className="bg-[#fffdfa] p-4 rounded-2xl border border-orange-100/40 shadow-[0_4px_24px_rgba(230,120,80,0.02)] space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                
                {/* Search in view */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400 w-4 h-4" />
                  <input 
                    type="text"
                    placeholder="在当前列表中快速筛选..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-orange-500/5 border border-orange-100/30 rounded-xl py-2.5 pl-9 pr-4 text-sm focus:ring-4 focus:ring-orange-500/5 focus:border-orange-200 outline-none text-orange-950 placeholder-orange-850/40"
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
                <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  {(['all', 'starred', 'learning', 'mastered'] as const).map(status => (
                    <button
                       key={status}
                       onClick={() => setBrowserStatus(status)}
                       className={`px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                        browserStatus === status 
                        ? 'bg-[#c65a30] text-white shadow-sm' 
                        : 'bg-orange-50 text-orange-700/80 hover:bg-orange-100/80'
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

              {/* Category Pills Slider */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                <button
                  onClick={() => setBrowserCategory('all')}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                    browserCategory === 'all'
                    ? 'bg-[#c65a30] text-white shadow-sm'
                    : 'bg-orange-50/70 text-orange-800/80 hover:bg-orange-100/50'
                  }`}
                >
                  全部单词 (850)
                </button>
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setBrowserCategory(key)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                      browserCategory === key
                      ? 'bg-[#c65a30] text-white shadow-sm'
                      : 'bg-orange-50/70 text-orange-800/80 hover:bg-orange-100/50'
                    }`}
                  >
                    <span>{label.zh}</span>
                    <span className="opacity-65">({label.count})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* List Results Grid */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-2">
                <p className="text-xs text-orange-805/50 font-bold">
                  词汇列表 ({browserList.length}/{totalWords})
                </p>
                <p className="text-xs text-orange-800/40 font-bold">
                  点击卡片查看 AI 语境、中文发音和详解
                </p>
              </div>

              {browserList.length === 0 ? (
                <div className="bg-[#fffdfa] rounded-2xl p-12 text-center text-orange-900/40 border border-orange-150/40">
                  <HelpCircle className="w-12 h-12 mx-auto text-orange-200 mb-3" />
                  <p className="text-sm font-extrabold text-orange-950">在此筛选条件中未找到任何单词</p>
                  <p className="text-xs text-orange-800/40 mt-1">您可以试着切换更广的分类或重设过滤选项</p>
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
                        className={`bg-white rounded-xl p-4 border transition-all cursor-pointer select-none relative group h-32 flex flex-col justify-between hover:shadow-md ${
                          selectedWord?.id === word.id 
                          ? 'border-[#c65a30] bg-[#fffbf4]/80 ring-4 ring-orange-500/10' 
                          : 'border-orange-100/50'
                        }`}
                      >
                        {/* Word top state flags */}
                        <div className="flex justify-between items-start">
                          <span className="font-extrabold text-xs py-0.5 px-2.5 rounded-full text-orange-800 bg-orange-100/50 uppercase tracking-widest scale-95 origin-left">
                            {CATEGORY_LABELS[word.category]?.zh}
                          </span>
                          
                          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button 
                              onClick={() => toggleStar(word.id)}
                              className="p-1 rounded-full text-orange-200 hover:text-amber-500 hover:bg-orange-50"
                            >
                              <Star className={`w-4 h-4 ${isStarred ? 'fill-amber-400 text-amber-500' : ''}`} />
                            </button>
                            
                            {status === 'mastered' ? (
                              <button 
                                onClick={() => setWordStatus(word.id, null)}
                                className="p-1 text-emerald-500 rounded-full hover:bg-emerald-50"
                                title="标记为正在学习"
                              >
                                <CheckCircle className="w-4 h-4 fill-emerald-50/50" />
                              </button>
                            ) : status === 'learning' ? (
                              <button 
                                onClick={() => setWordStatus(word.id, 'mastered')}
                                className="w-2.5 h-2.5 bg-amber-500 rounded-full"
                                title="标记为掌握"
                              />
                            ) : (
                              <button 
                                onClick={() => setWordStatus(word.id, 'learning')}
                                className="w-2.5 h-2.5 border border-orange-300 hover:border-[#c65a30] rounded-full"
                                title="标记为正在学"
                              />
                            )}
                          </div>
                        </div>

                        {/* Word content */}
                        <div className="space-y-1">
                          <h4 className="text-xl font-bold text-orange-950 tracking-tight leading-none group-hover:text-[#c65a30] transition-colors">
                            {word.word}
                          </h4>
                          <p className="text-sm text-orange-900/60 font-semibold truncate">
                            {word.translation}
                          </p>
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
            <div className="bg-gradient-to-r from-orange-500/5 to-amber-500/5 p-6 rounded-2xl border border-orange-100/50 shadow-sm relative overflow-hidden">
              <div className="absolute right-0 top-0 h-full w-1/3 opacity-5 pointer-events-none">
                <BookMarked className="w-full h-full text-orange-950" />
              </div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-black text-orange-950 flex items-center gap-2">
                    <BookMarked className="w-6 h-6 text-[#c65a30]" />
                    拼词造句超级工坊 <span className="text-xs font-bold px-2 py-0.5 bg-orange-100 text-[#c65a30] rounded-md">EFFECTS LAB</span>
                  </h2>
                  <p className="text-xs text-orange-800/60 font-semibold mt-1 max-w-xl">
                    在词典中挑选想要挑战的 1-3 个 Ogden 核心词。练习拼写，用简单的词汇写一句完整的句子。见证 AI 即时为你评估、翻译、发音与视觉效果呈现！
                  </p>
                </div>
                
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={randomizePracticeWords}
                    className="px-4 py-2 bg-white hover:bg-orange-50 text-orange-950 font-bold text-xs border border-orange-100 rounded-xl transition-all shadow-sm flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> 随机挑战
                  </button>
                  <button
                    onClick={() => setShowPracticeSearch(true)}
                    className="px-4 py-2 bg-[#c65a30] hover:bg-[#c65a30]/90 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1 cursor-pointer"
                  >
                    <Search className="w-3.5 h-3.5" /> 词典搜词
                  </button>
                </div>
              </div>
            </div>

            {/* Dictionary Selection Drawer/Modal overlay */}
            <AnimatePresence>
              {showPracticeSearch && (
                <div className="fixed inset-0 bg-orange-950/20 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-[#fffdfa] rounded-2xl w-full max-w-lg border border-orange-150 p-5 shadow-xl space-y-4"
                  >
                    <div className="flex justify-between items-center pb-2 border-b border-orange-100/50">
                      <h4 className="font-extrabold text-orange-950 text-base">从 850 核心词中选择挑战词汇</h4>
                      <button 
                        onClick={() => {
                          setShowPracticeSearch(false);
                          setPracticeSearchQuery('');
                        }}
                        className="p-1 rounded-full text-orange-400 hover:text-orange-950 cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400 w-4 h-4" />
                      <input 
                        type="text"
                        placeholder="输入英文、中文检索单词..."
                        value={practiceSearchQuery}
                        onChange={(e) => setPracticeSearchQuery(e.target.value)}
                        className="w-full bg-orange-500/5 border border-orange-100/30 rounded-xl py-2 pl-9 pr-4 text-sm focus:ring-4 focus:ring-orange-500/5 outline-none text-orange-950 placeholder-orange-850/40"
                      />
                    </div>

                    <div className="max-h-60 overflow-y-auto divide-y divide-orange-50/50 pr-1">
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
                            className={`p-3 hover:bg-orange-50 flex items-center justify-between cursor-pointer rounded-lg transition-colors mt-0.5 ${
                              isAdded ? 'bg-orange-500/5 border-l-4 border-[#c65a30]' : ''
                            }`}
                          >
                            <div>
                              <span className="font-extrabold text-orange-950 text-sm">{word.word}</span>
                              <span className="text-[10px] ml-2 text-orange-800/50 bg-orange-100 px-1.5 py-0.5 rounded uppercase font-bold">
                                {CATEGORY_LABELS[word.category]?.zh}
                              </span>
                            </div>
                            <span className="text-xs text-orange-900/60 font-semibold flex items-center gap-1.5">
                              {word.translation}
                              {isAdded ? (
                                <span className="text-xs text-[#c65a30] font-black">已选</span>
                              ) : (
                                <span className="text-xs text-gray-300 font-bold">未选</span>
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
                        className="px-5 py-2 bg-[#c65a30] text-white font-bold text-xs rounded-xl shadow-sm hover:opacity-95 active:scale-95 cursor-pointer"
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
                  <h3 className="text-sm font-extrabold text-orange-950">
                    当前挑战词 ({practiceWords.length}/3)
                  </h3>
                  <p className="text-[10px] text-orange-800/40 font-bold">点击卡片可移出挑战</p>
                </div>

                {practiceWords.length === 0 ? (
                  <div className="bg-[#fffdfb] rounded-2xl p-8 text-center text-orange-900/40 border border-dotted border-orange-200">
                    <HelpCircle className="w-10 h-10 mx-auto text-orange-200 mb-2" />
                    <p className="text-xs font-bold text-orange-900/70">没有活跃的挑战词汇</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">请点击右上角【词典搜词】或【随机挑战】</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {practiceWords.map(word => {
                      const isComplete = !!spelledRevealed[word.id];
                      const letters = word.word.split('');
                      return (
                        <div 
                          key={word.id} 
                          className="bg-[#fffdf9] p-4 rounded-2xl border border-orange-100/50 shadow-sm space-y-3 relative overflow-hidden"
                        >
                          <button 
                            onClick={() => removePracticeWord(word.id)}
                            className="absolute top-3 right-3 p-1 rounded-full bg-orange-100/40 text-orange-400 hover:text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="移出挑战"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>

                          <div className="flex justify-between items-start pr-6">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-xl font-extrabold text-orange-950 tracking-tight">{word.word}</h4>
                                <button 
                                  onClick={() => playSpeech(word.word)}
                                  className="text-orange-400 hover:text-[#c65a30] transition-colors p-1"
                                >
                                  <Volume2 className="w-4 h-4" />
                                </button>
                              </div>
                              <p className="text-xs text-orange-900/60 font-semibold">{word.translation}</p>
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded-full text-orange-850 bg-orange-100 uppercase tracking-wider font-extrabold font-mono shrink-0">
                              {CATEGORY_LABELS[word.category]?.zh}
                            </span>
                          </div>

                          {/* Mini Game: Spelling click-to-tile helper */}
                          <div className="bg-orange-500/5 p-2.5 rounded-xl border border-orange-100/30 text-xs">
                            <div className="flex justify-between items-center mb-1.5">
                              <span className="text-[10px] font-bold text-orange-850/60">🧩 拼字速记还原挑战</span>
                              {isComplete ? (
                                <span className="text-[10px] font-black text-emerald-600 flex items-center gap-0.5">
                                  <CheckCircle className="w-3.5 h-3.5 fill-emerald-100 text-emerald-600" /> 还原成功
                                </span>
                              ) : (
                                <button 
                                  onClick={() => {
                                    setSpelledRevealed(prev => ({ ...prev, [word.id]: true }));
                                    playSpeech(word.word);
                                  }}
                                  className="text-[10px] font-bold text-[#c65a30] hover:underline"
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
                                    className="w-7 h-7 bg-emerald-600 text-white font-extrabold text-sm flex items-center justify-center rounded-lg shadow-sm border border-emerald-500/30 animate-pulse"
                                  >
                                    {char}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <div className="text-center py-2 bg-white rounded-lg border border-orange-50 flex flex-wrap justify-center gap-1.5">
                                  {letters.map((_, idx) => (
                                    <span 
                                      key={idx} 
                                      className="w-6 h-6 border-b-2 border-orange-200 text-transparent font-extrabold flex items-center justify-center text-xs"
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
                                  className="w-full text-center py-1 bg-white hover:bg-orange-50 border border-orange-100 rounded-md text-[10px] text-[#c65a30] font-black transition-all cursor-pointer"
                                >
                                  点击解锁拼词
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
                <div className="bg-[#fffdf9] p-5 rounded-2xl border border-orange-100/50 shadow-sm space-y-4">
                  <div className="flex justify-between items-baseline">
                    <h3 className="text-sm font-extrabold text-orange-950 flex items-center gap-1.5">
                      <Palette className="w-4 h-4 text-orange-500" />
                      笔记本写作台 <span className="text-[10px] text-orange-900/40">Ogden English Compose</span>
                    </h3>
                    <span className="text-xs text-orange-850/50 font-bold">语法搭配由 AI 实时辅导评估</span>
                  </div>

                  {/* Progressive target completion checklist badges */}
                  <div className="flex flex-wrap gap-2 text-xs">
                    {practiceWords.map(w => {
                      const isIncluded = practiceSentence.toLowerCase().includes(w.word.toLowerCase());
                      return (
                        <span 
                          key={w.id} 
                          className={`px-2.5 py-1 rounded-full font-bold transition-all flex items-center gap-1 ${
                            isIncluded 
                            ? 'bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/20' 
                            : 'bg-orange-500/5 text-orange-800 ring-1 ring-orange-200/20 opacity-70'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {w.word}
                          {isIncluded ? ' (已用)' : ' (未使用)'}
                        </span>
                      );
                    })}
                  </div>

                  {/* Lined Paper Mockup Textarea */}
                  <div className="relative">
                    <textarea
                      rows={4}
                      value={practiceSentence}
                      onChange={(e) => setPracticeSentence(e.target.value)}
                      placeholder="请运用上述挑战词汇写一句英文句子。例如：The beautiful sun guides our path to the warm house. (用到了 sun, beautiful)"
                      className="w-full bg-[#fcfaf5] border border-orange-150 rounded-xl p-4 text-orange-950 text-sm font-bold leading-7 outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-200"
                      style={{
                        backgroundImage: 'linear-gradient(#f1e6d4 1px, transparent 1px)',
                        backgroundSize: '100% 1.75rem',
                      }}
                    />
                    {practiceSentence && (
                      <button 
                        onClick={() => setPracticeSentence('')}
                        className="absolute right-3.5 bottom-3.5 p-1 rounded-md bg-white text-orange-400 hover:text-orange-950 border border-orange-100 shadow-sm cursor-pointer"
                        title="清空文本"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Composition controls bar */}
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-[10px] text-orange-850/55 font-bold">
                      字词精简最能展现 Basic English 极简极美的语意魅力
                    </span>
                    
                    <button
                      onClick={evaluatePracticeSentence}
                      disabled={practiceWords.length === 0 || !practiceSentence.trim() || practiceEvaluating}
                      className={`flex items-center gap-1.5 px-5 py-3 rounded-xl font-bold text-sm shadow-md transition-all cursor-pointer ${
                        (practiceWords.length === 0 || !practiceSentence.trim() || practiceEvaluating)
                        ? 'bg-orange-100 text-orange-350 cursor-not-allowed shadow-none'
                        : 'bg-gradient-to-r from-[#c65a30] to-[#faa144] text-white hover:opacity-90 active:scale-95 shadow-orange-500/10'
                      }`}
                    >
                      {practiceEvaluating ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          智能评估中...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          一键智能效果评估
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
                      className="bg-white rounded-2xl border-2 border-orange-150 overflow-hidden shadow-lg relative"
                    >
                      {/* Top plaque banner */}
                      <div className="bg-[#c65a30] px-4 py-3 text-white flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" /> COMPOSITION EFFECT POSTER · 造句效果展板
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
                                  ? 'fill-amber-300 text-amber-300' 
                                  : 'text-orange-950/20'
                                }`} 
                              />
                            );
                          })}
                        </div>
                      </div>

                      {/* Poster Content Area */}
                      <div className="p-6 space-y-6 text-center bg-gradient-to-b from-[#fffbf4]/70 to-[#fffdfb]">
                        
                        {/* Word score emblem */}
                        <div className="inline-block mx-auto mb-2 bg-[#fff7ea] border border-orange-100 px-4 py-1.5 rounded-full text-center shadow-xs">
                          <p className="text-xs font-semibold text-orange-900/60 leading-none">AI 语法分项评级</p>
                          <p className="text-lg font-black text-[#c65a30] tracking-tight mt-0.5">{practiceResult.score} / 100 分</p>
                        </div>

                        {/* Large Quote Composition Display */}
                        <div className="max-w-md mx-auto space-y-2 py-4 border-y border-orange-150/40 relative font-serif">
                          <span className="absolute -top-3 left-4 text-4xl text-orange-200/50">“</span>
                          
                          <p className="text-2xl font-black text-orange-950 tracking-tight leading-relaxed italic px-2">
                            {practiceSentence}
                          </p>
                          
                          <div className="text-xs font-extrabold text-orange-800/40 font-mono">
                            Composition by Learner (Ogden standard)
                          </div>
                        </div>

                        {/* Speech read-out effect player */}
                        <div className="flex justify-center">
                          <button
                            onClick={() => playSpeech(practiceResult.correctedSentence || practiceSentence)}
                            className="px-5 py-2.5 bg-orange-500/5 border border-orange-100 hover:bg-orange-100/45 text-[#c65a30] font-black text-xs rounded-xl flex items-center gap-1.5 active:scale-95 transition-all shadow-xs cursor-pointer"
                          >
                            <Volume2 className="w-4 h-4 text-[#c65a30]" />
                            听真人标准发声朗读展示
                          </button>
                        </div>

                        {/* Chinese translation plate */}
                        <div className="max-w-md mx-auto p-3.5 bg-orange-100/10 border border-orange-50 rounded-xl">
                          <span className="text-[10px] uppercase font-bold tracking-widest text-orange-850/50 block mb-1">Chinese Translation · 译文释义</span>
                          <p className="text-sm font-bold text-orange-950 leading-relaxed">
                            {practiceResult.translation}
                          </p>
                        </div>

                        {/* Tutor Evaluation Section */}
                        <div className="text-left bg-white p-4 rounded-xl border border-orange-100/30 shadow-xs space-y-3 max-w-lg mx-auto">
                          
                          <div>
                            <span className="text-xs font-bold text-orange-900/50 block">智能精修批改:</span>
                            {practiceResult.correctedSentence ? (
                              <p className="text-sm font-black text-[#c65a30] mt-0.5 bg-[#c65a30]/5 p-2 rounded-lg border border-orange-100/40 leading-normal">
                                {practiceResult.correctedSentence} (推荐修正表达)
                              </p>
                            ) : (
                              <p className="text-sm font-black text-emerald-700 mt-0.5 bg-emerald-500/5 p-2 rounded-lg border border-emerald-100/50 leading-normal">
                                👍 句子拼写精进，语法准确性极高，不需要任何修正。
                              </p>
                            )}
                          </div>
                          
                          <div className="space-y-1.5 text-xs font-semibold text-orange-900/80 leading-relaxed pt-1 border-t border-orange-50">
                            <p><b className="text-orange-950 font-extrabold">🔍 分析评价</b>: {practiceResult.analysis}</p>
                            <p><b className="text-[#00677f] font-extrabold">启发建议</b>: {practiceResult.recommendedUsage}</p>
                          </div>

                        </div>

                        {/* Save block */}
                        <div className="pt-2 flex justify-center gap-3">
                          <button
                            onClick={savePracticeToHistory}
                            className="px-6 py-2.5 bg-[#c65a30] hover:bg-[#c65a30]/90 text-white font-bold text-xs rounded-xl shadow-md active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                          >
                            💾 保存至【造句成就书】
                          </button>
                          
                          <button
                            onClick={() => setPracticeResult(null)}
                            className="px-4 py-2.5 bg-gray-50 border border-orange-100 hover:bg-orange-50 text-orange-900/85 font-bold text-xs rounded-xl active:scale-95 transition-all cursor-pointer"
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
            <div className="bg-[#fffdfb] p-6 rounded-2xl border border-orange-100/50 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-extrabold text-orange-950 text-base flex items-center gap-1.5">
                    <Award className="w-5 h-5 text-amber-500 animate-bounce" />
                    我的造句成就书 ({practiceHistory.length})
                  </h3>
                  <p className="text-xs text-orange-800/40 font-bold">收集您写过的所有得到 AI 批改盖章的优秀英语造句作品</p>
                </div>
                
                {practiceHistory.length > 0 && (
                  <button
                    onClick={() => {
                      if (confirm('确定要清空您写过的所有造句成就历史吗？')) {
                        setPracticeHistory([]);
                      }
                    }}
                    className="text-xs font-bold text-rose-500 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> 清空成就书
                  </button>
                )}
              </div>

              {practiceHistory.length === 0 ? (
                <div className="p-12 text-center text-orange-950/30 border border-dotted border-orange-150 rounded-xl space-y-2">
                  <BookMarked className="w-12 h-12 mx-auto text-orange-200" />
                  <p className="text-xs font-bold text-orange-950/50">你的造句成就本目前尚无收藏</p>
                  <p className="text-[10px] text-orange-900/40">创作并提交你的英文句子，通过 AI 评估后点击保存，你的成功表达将在这本属于你自己的成就书里生根发芽！</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {practiceHistory.map((item) => (
                    <div 
                      key={item.id} 
                      className="bg-[#fffffc] p-4 rounded-xl border border-orange-100 hover:border-orange-200 shadow-xs transition-all relative flex flex-col justify-between gap-3 group"
                    >
                      <button 
                        onClick={(e) => deletePracticeHistoryItem(item.id, e)}
                        className="absolute top-2.5 right-2.5 p-1 rounded-full text-orange-200 hover:text-rose-500 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        title="删除该条记录"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <div className="space-y-2">
                        {/* Rating and date */}
                        <div className="flex justify-between items-center text-[10px] text-orange-800/50 font-bold border-b border-orange-50 pb-1.5">
                          <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                          <span className="font-extrabold text-[#c65a30] bg-orange-100 px-1.5 py-0.5 rounded">
                            {item.score}分
                          </span>
                        </div>

                        {/* Words used */}
                        <div className="flex flex-wrap gap-1">
                          {item.targetWords.map((tw, idx) => (
                            <span key={idx} className="text-[9px] bg-orange-100/50 text-[#c65a30] font-black rounded px-1.5 py-0.5">
                              {tw.word}
                            </span>
                          ))}
                        </div>

                        {/* Sentence */}
                        <p className="text-sm font-black text-orange-950 tracking-tight leading-normal font-sans italic pt-1">
                          "{item.userSentence}"
                        </p>

                        {/* Translation */}
                        <p className="text-xs text-orange-900/60 font-semibold line-clamp-2">
                          {item.translation}
                        </p>
                      </div>

                      {/* Bottom Quick Play */}
                      <div className="pt-2 border-t border-orange-100/30 flex justify-between items-center">
                        <button
                          onClick={() => playSpeech(item.correctedSentence || item.userSentence)}
                          className="text-[10px] font-bold text-[#c65a30] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Volume2 className="w-3.5 h-3.5 text-[#c65a30]" /> 听标准发音
                        </button>
                        
                        <span className="text-[9.5px] text-amber-600 font-extrabold">已掌握</span>
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
              
              <div className="bg-[#fffdfb] p-6 rounded-2xl border border-orange-100/50 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-orange-950 flex items-center gap-2 mb-1">
                    <Award className="w-5 h-5 text-[#c65a30]" />
                    系统评估
                  </h3>
                  <p className="text-xs text-orange-850/50 font-bold">Ogden English 经典分级标准</p>
                </div>

                <div className="my-8 flex justify-center relative">
                  <div className="w-40 h-40 rounded-full border-8 border-orange-50 bg-white flex flex-col items-center justify-center shadow-inner">
                    <span className="text-4xl font-black text-orange-950">{masteredCount}</span>
                    <span className="text-[10px] text-orange-800/40 font-black uppercase mt-0.5">/ 850 词掌握</span>
                    <div className="absolute inset-x-0 bottom-0 text-center">
                      <span className="text-xs font-bold text-[#c65a30] bg-orange-500/10 px-3 py-1 rounded-full border border-orange-100">
                        词汇掌握：{progressPercent}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 border-t pt-4 border-orange-100/30 text-sm text-orange-900/70">
                  <div className="flex justify-between">
                    <span>收藏重要单词:</span>
                    <span className="font-bold text-orange-950">{starredCount} 词</span>
                  </div>
                  <div className="flex justify-between">
                    <span>熟手级别:</span>
                    <span className="font-black text-[#c65a30]">
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
              <div className="bg-[#fffdfb] p-6 rounded-2xl border border-orange-100/50 shadow-sm lg:col-span-2 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-orange-950">各分支覆盖率</h3>
                    <p className="text-xs text-orange-800/40 font-bold">词性及功能性词汇分类达标指标</p>
                  </div>
                  <button 
                    onClick={generateQuiz}
                    className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#c65a30] to-[#faa144] text-white hover:opacity-90 active:scale-95 transition-all text-xs font-bold rounded-xl shadow-md cursor-pointer"
                  >
                    <Brain className="w-4 h-4" />
                    开启 5 词速测
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(CATEGORY_LABELS).map(([catKey, label]) => {
                    const countInCat = wordsData.filter(w => w.category === catKey).length;
                    const masteredInCat = wordsData.filter(w => w.category === catKey && learningStatus[w.id] === 'mastered').length;
                    const percent = Math.round((masteredInCat / countInCat) * 100) || 0;

                    return (
                      <div key={catKey} className="p-3 bg-white rounded-xl space-y-2 border border-orange-100/35 shadow-sm">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-orange-950">{label.zh} ({label.en})</span>
                          <span className="text-orange-850/60">{masteredInCat} / {countInCat}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-orange-50 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-orange-400 to-[#c65a30]" style={{ width: `${percent}%` }} />
                          </div>
                          <span className="text-xs font-bold text-orange-900/60 w-8 text-right">{percent}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-end gap-3 pt-2 text-xs">
                  <button 
                    onClick={resetProgressData}
                    className="text-rose-500 hover:text-rose-700 font-bold flex items-center gap-1.5 border border-rose-100 hover:bg-rose-50 px-3 py-1.5 rounded-lg active:scale-95 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    重置学习记录
                  </button>
                </div>

              </div>

            </div>

            {/* Quick Multi-choice Quiz Interface */}
            {quizActive && (
              <motion.section 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-orange-500/5 p-6 rounded-2xl border border-orange-150 shadow-sm relative overflow-hidden"
              >
                <button 
                  onClick={() => setQuizActive(false)}
                  className="absolute top-4 right-4 text-orange-850 hover:text-orange-950 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>

                {!quizSubmitted ? (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center border-b border-orange-100/50 pb-3">
                      <div className="flex items-center gap-2">
                        <Brain className="w-5 h-5 text-[#c65a30] animate-pulse" />
                        <h3 className="font-bold text-orange-950">Ogden English 挑战测试</h3>
                      </div>
                      <span className="text-xs font-bold text-orange-800/50">
                        问题 {currentQuizIndex + 1} / 5
                      </span>
                    </div>

                    {/* Question presentation */}
                    <div className="text-center py-4 bg-white rounded-2xl border border-orange-100/50 shadow-sm max-w-md mx-auto">
                      <p className="text-xs text-[#c65a30] font-bold tracking-widest uppercase">请选择正确的中文释义</p>
                      <h4 className="text-4xl font-extrabold text-orange-950 tracking-tight mt-1 mb-2">
                        {quizQuestions[currentQuizIndex]?.word.word}
                      </h4>
                      <p className="text-xs text-orange-400 font-medium">({CATEGORY_LABELS[quizQuestions[currentQuizIndex]?.word.category]?.zh})</p>
                    </div>

                    {/* Multiple choices */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-lg mx-auto">
                      {quizQuestions[currentQuizIndex]?.options.map((option, idx) => {
                        const isSelected = quizQuestions[currentQuizIndex]?.selectedIndex === idx;
                        return (
                          <button
                            key={idx}
                            onClick={() => handleSelectQuizOption(idx)}
                            className={`p-4 rounded-xl text-sm font-bold text-left transition-all tracking-tight cursor-pointer ${
                              isSelected 
                              ? 'bg-[#c65a30] text-white shadow-md' 
                              : 'bg-white border border-orange-100/50 hover:bg-orange-50 text-orange-950'
                            }`}
                          >
                            <span className="inline-block mr-2 text-xs font-semibold opacity-70">
                              {['A', 'B', 'C', 'D'][idx]}.
                            </span>
                            {option}
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        onClick={handleNextQuiz}
                        disabled={quizQuestions[currentQuizIndex]?.selectedIndex === null}
                        className={`flex items-center gap-1 px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all cursor-pointer ${
                          quizQuestions[currentQuizIndex]?.selectedIndex === null
                          ? 'bg-orange-100 text-orange-350 cursor-not-allowed shadow-none'
                          : 'bg-[#c65a30] text-white hover:opacity-90 active:scale-95'
                        }`}
                      >
                        {currentQuizIndex < 4 ? '下一题' : '完成测试'}
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 space-y-4 max-w-sm mx-auto">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mx-auto">
                      <Award className="w-10 h-10" />
                    </div>
                    <div>
                      <h4 className="text-xl font-extrabold text-orange-950">测试挑战完成！</h4>
                      <p className="text-2xl font-black text-[#c65a30] mt-1">您答对了 {quizScore} / 5</p>
                    </div>
                    <p className="text-xs text-orange-900/50 leading-relaxed font-semibold">
                      凡是答对的词语已经被<b>自动标记为“已掌握”</b>。多做词汇评测是掌握 Ogden Basic 的最快途径！
                    </p>
                    <div className="flex gap-3 justify-center pt-2">
                      <button
                        onClick={generateQuiz}
                        className="px-4 py-2 text-xs font-bold ring-1 ring-orange-200 hover:bg-white text-[#c65a30] rounded-lg active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> 再试一次
                      </button>
                      <button
                        onClick={() => setQuizActive(false)}
                        className="px-4 py-2 text-xs font-bold bg-[#c65a30] text-white rounded-lg hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                      >
                        返回统计
                      </button>
                    </div>
                  </div>
                )}
              </motion.section>
            )}

            {/* General Description Card */}
            <div className="bg-[#fffdfb] p-6 rounded-2xl border border-orange-100/50 shadow-sm space-y-4">
              <h3 className="font-bold text-orange-950 text-lg flex items-center gap-2">
                <Languages className="w-5 h-5 text-orange-500 animate-pulse" />
                关于 Ogden 850 基础英语
              </h3>
              <p className="text-sm text-orange-900/80 leading-relaxed font-medium">
                <b>Ogden Basic English</b> (奥格登基本英语) 是由英国语言学家 Charles Kay Ogden 发明的简化英语系统。
                它仅仅挑选了 <b>850 个核心词汇</b>，用来涵盖和表达几乎所有的日常场景。只要您熟练掌握这 850 个英文单词，
                您就已经拥有了在全世界流畅读写、自由表达的核心基石。
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-orange-500/5 p-4 rounded-xl text-center text-sm border border-orange-100/30">
                <div>
                  <p className="font-black text-[#00677f] text-xl">18 核心动词</p>
                  <p className="text-xs text-gray-400 mt-0.5">沟通句子逻辑的核心枢纽</p>
                </div>
                <div className="border-t sm:border-t-0 sm:border-x border-gray-200/60 py-2 sm:py-0">
                  <p className="font-black text-emerald-700 text-xl">600 物与名词</p>
                  <p className="text-xs text-gray-400 mt-0.5">200个实体和400个一般概念</p>
                </div>
                <div>
                  <p className="font-black text-rose-700 text-xl">150 描述品质</p>
                  <p className="text-xs text-gray-400 mt-0.5">100个普通性质和50个完美反义词</p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 4: PRACTICE PARTNER CHAT */}
        {activeTab === 'chat' && (
          <div className="space-y-4 max-w-3xl mx-auto flex flex-col h-[calc(100vh-14rem)] md:h-[70vh]">
            
            {/* Chat header area */}
            <div className="bg-[#fffdfb] px-5 py-4 rounded-xl border border-orange-100/50 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100/70 border border-orange-200 flex items-center justify-center text-[#c65a30]">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-extrabold text-orange-950">Basic AI Tutor</h3>
                  <p className="text-xs text-emerald-600 font-bold">● 暖心实时辅导中 (支持智能语法订正)</p>
                </div>
              </div>

              <button 
                onClick={clearChatHistory}
                className="text-xs font-bold text-orange-850/40 hover:text-rose-500 flex items-center gap-1 cursor-pointer transition-colors"
                title="清空对话"
              >
                <Trash2 className="w-4 h-4" /> 网页清空
              </button>
            </div>

            {/* Conversation Window */}
            <div className="flex-1 bg-[#fffdfb] rounded-2xl border border-orange-100/50 shadow-inner p-4 overflow-y-auto space-y-4 font-bold">
              {chatMessages.map((msg, idx) => {
                const isUser = msg.role === 'user';
                return (
                  <div 
                    key={idx}
                    className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm tracking-tight shadow-sm ${
                      isUser 
                      ? 'bg-[#c65a30] text-white rounded-tr-none shadow-orange-950/15' 
                      : 'bg-orange-500/5 border border-orange-100/50 text-orange-950 rounded-tl-none font-extrabold'
                    }`}>
                      <p className="font-bold leading-relaxed">{msg.content}</p>
                      
                      {/* Chinese Translation */}
                      {!isUser && msg.contentZh && (
                        <p className="text-xs opacity-75 mt-2 border-t pt-2 border-orange-200/40 leading-relaxed font-sans text-orange-900/60 font-semibold text-left">
                          {msg.contentZh}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}

              {sendingMessage && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] bg-orange-55/55 border border-orange-100/40 rounded-2xl px-4 py-3 rounded-tl-none text-xs text-orange-850/60 font-bold flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-[#c65a30]" />
                    小奥老师正在用心构思回复中...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Convenient Prompts Suggestions */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
              {[
                { label: '我想开始日常简单寒暄', text: 'Hello! I want to practice basic conversation today.' },
                { label: '能来一些核心动词的练习吗', text: 'Can you show me how to use operator words in a story?' },
                { label: '出个 850 范围的猜词游戏', text: 'Please play a guessing game using basic words.' }
              ].map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => setChatInput(p.text)}
                  className="bg-orange-50 hover:bg-orange-100 text-orange-800/80 font-bold px-3 py-1.5 rounded-full whitespace-nowrap outline-none border border-orange-150/40 active:scale-95 transition-all cursor-pointer"
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Input form */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="在此输入您的 Basic 英语回复..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') sendChatMessage();
                }}
                disabled={sendingMessage}
                className="flex-1 bg-white border border-orange-150 rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-orange-500/5 focus:border-[#c65a30] outline-none transition-all shadow-sm text-orange-950 placeholder-orange-850/40 font-bold"
              />
              <button
                onClick={sendChatMessage}
                disabled={!chatInput.trim() || sendingMessage}
                className={`p-3 rounded-xl shadow-md transition-all flex items-center justify-center cursor-pointer ${
                  !chatInput.trim() || sendingMessage
                  ? 'bg-orange-100 text-orange-400 cursor-not-allowed shadow-none animate-none'
                  : 'bg-[#c65a30] text-white hover:opacity-90 active:scale-95'
                }`}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>

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
              className="relative w-full sm:max-w-xl bg-white sm:rounded-2xl rounded-t-3xl shadow-2xl overflow-hidden max-h-[85vh] sm:max-h-[90vh] flex flex-col"
            >
              
              {/* Cover/Splash area */}
              <div className="bg-orange-500/5 p-6 border-b border-orange-100 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#c65a30] uppercase tracking-wider bg-orange-100 px-2.5 py-0.5 rounded-full">
                      {CATEGORY_LABELS[selectedWord.category]?.zh}
                    </span>
                    <span className="text-xs text-orange-450 font-bold font-mono uppercase">ID: {selectedWord.id}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 mt-1">
                    <h2 className="text-4xl font-extrabold text-orange-950 tracking-tight">{selectedWord.word}</h2>
                    <button 
                      onClick={() => playSpeech(selectedWord.word)}
                      className="p-1.5 bg-white text-[#c65a30] hover:text-white hover:bg-[#c65a30] transition-all rounded-full shadow-sm active:scale-90 cursor-pointer border border-orange-100"
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
                    className="p-2 bg-white text-orange-200 hover:text-amber-500 rounded-full shadow-xs active:scale-90 transition-all border border-orange-100 cursor-pointer"
                  >
                    <Star className={`w-5 h-5 ${starredWords[selectedWord.id] ? 'fill-amber-400 text-amber-500' : ''}`} />
                  </button>
                  {/* Close button */}
                  <button 
                    onClick={() => setSelectedWord(null)}
                    className="p-2 bg-white text-orange-400 hover:text-[#c65a30] rounded-full shadow-xs active:scale-90 transition-all border border-orange-100 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Main definitions & scrollable content */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-[#fffdfb]">
                
                {/* Chinese translations */}
                <div className="space-y-1">
                  <span className="text-xs font-bold text-orange-850/40 uppercase tracking-widest">中文释义</span>
                  <p className="text-2xl font-black text-orange-950 tracking-tight">{selectedWord.translation}</p>
                </div>

                {/* English standard definition */}
                <div className="space-y-1 bg-orange-500/5 p-4 rounded-xl border border-orange-100">
                  <span className="text-xs font-bold text-orange-400 uppercase tracking-widest block mb-1">英文释义 Definition</span>
                  <p className="text-sm font-semibold text-orange-900 leading-relaxed italic">
                    "{selectedWord.definition_en}"
                  </p>
                </div>

                {/* Status change selector buttons */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-orange-400 uppercase tracking-widest block">掌握状态标记</span>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setWordStatus(selectedWord.id, 'learning')}
                      className={`p-3 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                        learningStatus[selectedWord.id] === 'learning'
                        ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                        : 'bg-white text-orange-850 hover:bg-orange-50 border-orange-100'
                      }`}
                    >
                      正在学习中 🍀
                    </button>
                    <button
                      onClick={() => setWordStatus(selectedWord.id, 'mastered')}
                      className={`p-3 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                        learningStatus[selectedWord.id] === 'mastered'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-white text-orange-855 hover:bg-orange-50 border-orange-100'
                      }`}
                    >
                      已彻底掌握 ✨
                    </button>
                  </div>
                </div>

                {/* Spelling & Sentence Practice Shortcut */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-orange-400 uppercase tracking-widest block">创意拼词造句</span>
                  <button
                    onClick={() => {
                      addPracticeWord(selectedWord);
                      setSelectedWord(null);
                      setActiveTab('practice');
                    }}
                    className="w-full p-3.5 bg-gradient-to-r from-[#c65a30] to-[#faa144] text-white hover:opacity-90 font-black text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <BookMarked className="w-4 h-4" />
                    携带此词前往「拼词造句」超级工坊 →
                  </button>
                </div>

                {/* Generated AI Content Wrapper */}
                <div className="border-t pt-5 border-orange-100 space-y-4">
                  <div className="flex justify-between items-center bg-transparent">
                    <span className="text-xs font-bold text-orange-800/40 uppercase tracking-widest flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-[#c65a30]" />
                      AI 助记例句 & 语境
                    </span>
                    
                    {!aiExplanations[selectedWord.id] && !generatingForId && (
                      <button 
                        onClick={() => loadWordAiContext(selectedWord)}
                        className="text-xs font-bold hover:underline text-[#c65a30] flex items-center gap-1 cursor-pointer"
                      >
                        生成新语境
                      </button>
                    )}
                  </div>

                  {generatingForId === selectedWord.id ? (
                    <div className="space-y-3 bg-orange-50/20 p-4 rounded-xl border border-orange-100 animate-pulse">
                      <div className="h-4 bg-orange-100 rounded-md w-[80%]"></div>
                      <div className="h-3.5 bg-orange-100 rounded-md w-[55%]"></div>
                      <div className="h-3 bg-orange-100 rounded-md w-[60%]"></div>
                    </div>
                  ) : aiExplanations[selectedWord.id] ? (
                    <div className="space-y-4 font-bold">
                      
                      {/* Examples Sentence sentence */}
                      <div className="p-4 bg-orange-500/5 rounded-xl border border-orange-100 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] uppercase font-bold text-[#c65a30]">简单例句 Example</span>
                          <button 
                            onClick={() => playSpeech(aiExplanations[selectedWord.id]?.sentence || '')}
                            className="p-1 rounded-full text-orange-400 hover:text-[#c65a30] cursor-pointer"
                            title="朗读例句"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-sm font-extrabold tracking-tight text-[#c65a30] leading-relaxed font-sans cursor-pointer animate-none" onClick={() => playSpeech(aiExplanations[selectedWord.id]?.sentence || '')}>
                          {aiExplanations[selectedWord.id]?.sentence}
                        </p>
                        <p className="text-xs text-orange-950 font-semibold">
                          {aiExplanations[selectedWord.id]?.sentence_zh}
                        </p>
                      </div>

                      {/* AI usage tips */}
                      {aiExplanations[selectedWord.id]?.tip && (
                        <div className="p-3 bg-amber-50 text-orange-950 border border-orange-100/60 rounded-xl text-xs space-y-1">
                          <span className="font-bold text-[#c65a30]">Tutor 学习窍门:</span>
                          <p className="font-medium text-orange-900/80 leading-normal">{aiExplanations[selectedWord.id]?.tip}</p>
                        </div>
                      )}

                    </div>
                  ) : (
                    <div className="text-center p-5 bg-orange-500/5 rounded-xl border border-dotted border-orange-200">
                      <p className="text-xs text-orange-800/50 leading-relaxed font-medium">
                        由于网络延迟，该离线词汇暂时未预加载智能例句。
                      </p>
                      <button 
                        onClick={() => loadWordAiContext(selectedWord)}
                        className="mt-3.5 px-4 py-1.5 bg-[#c65a30] text-white font-bold text-xs rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-md cursor-pointer"
                      >
                        召唤 AI 瞬间生成
                      </button>
                    </div>
                  )}

                </div>

              </div>
              
              {/* Simple Bottom close trigger */}
              <div className="p-4 bg-orange-50/20 border-t border-orange-100/40 text-center sm:hidden">
                <button 
                  onClick={() => setSelectedWord(null)}
                  className="w-full py-3 bg-white text-orange-950 text-sm font-extrabold border border-orange-100 rounded-xl hover:bg-orange-50 transition-colors cursor-pointer"
                >
                  关闭页面
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Persistent Beautiful Bottom Navigation Bar for Mobile */}
      <nav id="bottom-bar-nav" className="fixed bottom-0 left-0 right-0 z-40 bg-[#fffdfb] border-t border-orange-100/60 shadow-[0_-4px_25px_rgba(230,120,80,0.04)] rounded-t-2xl flex justify-around items-center h-16 px-4 md:hidden pb-safe">
        
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

        {/* Navigation Item 2.5 - Spelling & Sentence Practice */}
        <button 
          id="nav-practice"
          onClick={() => setActiveTab('practice')}
          className={`flex flex-col items-center justify-center transition-all duration-300 w-14 outline-none cursor-pointer ${
            activeTab === 'practice'
            ? 'text-[#c65a30] scale-105 font-black'
            : 'text-orange-850 hover:text-orange-950'
          }`}
          title="拼词造句"
        >
          <BookMarked className="w-5 h-5" />
          <span className="text-[11px] mt-1 font-bold">造句</span>
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
          className={`p-3.5 rounded-full shadow-lg border outline-none transition-all cursor-pointer ${
            activeTab === 'home' 
            ? 'bg-[#c65a30] text-white border-[#c65a30] scale-105 shadow-orange-900/10' 
            : 'bg-white text-orange-800 border-orange-100 hover:bg-orange-50'
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
          className={`p-3.5 rounded-full shadow-lg border outline-none transition-all cursor-pointer ${
            activeTab === 'browser'
            ? 'bg-[#c65a30] text-white border-[#c65a30] scale-105 shadow-orange-900/10' 
            : 'bg-white text-orange-800 border-orange-100 hover:bg-orange-50'
          }`}
          title="词汇浏览器"
        >
          <BookOpen className="w-5 h-5" />
        </button>
        <button 
          onClick={() => setActiveTab('practice')}
          className={`p-3.5 rounded-full shadow-lg border outline-none transition-all cursor-pointer ${
            activeTab === 'practice'
            ? 'bg-[#c65a30] text-white border-[#c65a30] scale-105 shadow-orange-900/10 animate-pulse' 
            : 'bg-white text-orange-800 border-orange-100 hover:bg-orange-50'
          }`}
          title="拼词造句超级工坊"
        >
          <BookMarked className="w-5 h-5" />
        </button>
        <button 
          onClick={() => setActiveTab('stats')}
          className={`p-3.5 rounded-full shadow-lg border outline-none transition-all cursor-pointer ${
            activeTab === 'stats'
            ? 'bg-[#c65a30] text-white border-[#c65a30] scale-105 shadow-orange-900/10' 
            : 'bg-white text-orange-800 border-orange-100 hover:bg-orange-50'
          }`}
          title="学习统计 & 测试"
        >
          <BarChart3 className="w-5 h-5" />
        </button>
        <button 
          onClick={() => setActiveTab('chat')}
          className={`p-3.5 rounded-full shadow-lg border outline-none transition-all cursor-pointer ${
            activeTab === 'chat'
            ? 'bg-[#c65a30] text-white border-[#c65a30] scale-105 shadow-orange-900/10' 
            : 'bg-white text-orange-800 border-orange-100 hover:bg-orange-50 animate-pulse'
          }`}
          title="AI 辅导陪练"
        >
          <Sparkles className="w-5 h-5" />
        </button>
      </div>

    </div>
  );
}
