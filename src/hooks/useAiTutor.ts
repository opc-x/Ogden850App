import { useState, useEffect } from 'react';

export function useAiTutor() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [aiExplanations, setAiExplanations] = useState<Record<string, { sentence: string; sentence_zh: string; tip: string }>>({});
  const [generatingForId, setGeneratingForId] = useState<string | null>(null);

  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string; contentZh?: string; correction?: string }>>([
    {
      role: 'assistant',
      content: "Hello! I am your Basic English tutor. Let us chat using our 850 core words! How is your day today?",
      contentZh: "你好！我是你的基础英语导师。让我们使用 850 个核心词汇进行交流吧！你今天过得怎么样？"
    }
  ]);
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    try {
      const storedCache = localStorage.getItem('ogden850_ai_cache');
      const storedChat = localStorage.getItem('ogden850_chat_messages');
      if (storedCache) setAiExplanations(JSON.parse(storedCache));
      if (storedChat) setChatMessages(JSON.parse(storedChat));
    } catch (e) {
      console.error('Error loading AI history:', e);
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem('ogden850_ai_cache', JSON.stringify(aiExplanations));
  }, [aiExplanations, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem('ogden850_chat_messages', JSON.stringify(chatMessages));
  }, [chatMessages, isInitialized]);

  return {
    aiExplanations, setAiExplanations,
    generatingForId, setGeneratingForId,
    chatInput, setChatInput,
    chatMessages, setChatMessages,
    sendingMessage, setSendingMessage
  };
}
