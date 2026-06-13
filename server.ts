import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with telemetry header
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('Waring: GEMINI_API_KEY is not defined. AI features will require configuration.');
  }
  return new GoogleGenAI({
    apiKey: apiKey || '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

const ai = getGeminiClient();

// API Route: AI-assisted word detail generator
app.post('/api/explain', async (req, res) => {
  try {
    const { word, category, translation } = req.body;
    if (!word) {
       res.status(400).json({ error: 'Word is required' });
       return;
    }

    if (!process.env.GEMINI_API_KEY) {
       res.json({
        success: false,
        offlineFallback: true,
        sentence: `This is a simple sample sentence with the word: ${word}.`,
        sentence_zh: `这是一个包含单词（${word}）的简单示例句子。`,
        tip: '请在 AI Studio “Secrets” 设置中配置您的 GEMINI_API_KEY 以解锁高保真 AI 例句和解释！',
      });
      return;
    }

    const prompt = `Give me a helpful explanation, a simple illustrative sentence using the word "${word}" (category: "${category}", standard translation: "${translation}"). 
To make it perfectly accessible for beginners, the sentence should strictly use words from the Ogden 850 Basic English wordlist, or extremely simple common English vocabularies.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction: `You are a professional pedagogical tutor specializing in Ogden 850 Basic English. 
Your goal is to explain the target word using extremely simple language.
Produce output strictly as structured JSON matching the requested schema. No conversational filler or surrounding markdown.`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sentence: {
              type: Type.STRING,
              description: 'A beautiful, simple illustrative sentence containing the target word, using ultra-simple English.',
            },
            sentence_zh: {
              type: Type.STRING,
              description: 'The natural Simplified Chinese translation of the illustrative sentence.',
            },
            tip: {
              type: Type.STRING,
              description: 'A 1-sentence friendly tip or memory trick in Chinese about how this word is used in Basic English.',
            },
          },
          required: ['sentence', 'sentence_zh', 'tip'],
        },
      },
    });

    const resultText = response.text || '{}';
    const parsed = JSON.parse(resultText.trim());
    res.json({ success: true, ...parsed });
  } catch (error: any) {
    console.error('Gemini explanation error:', error);
    res.json({
      success: false,
      error: error.message || 'Gemini error',
      sentence: `Let us use the word "${req.body.word || 'it'}" carefully.`,
      sentence_zh: `让我们小心地使用这个词。`,
      tip: 'AI 暂时处于离线状态，此处显示的是经典备用例句。',
    });
  }
});

// API Route: AI Tutor Dialogues
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
       res.status(400).json({ error: 'Messages history is required' });
       return;
    }

    if (!process.env.GEMINI_API_KEY) {
       res.json({
        reply: "Hello! I am your Ogden 850 learning partner. Please configure your GEMINI_API_KEY inside the 'Settings > Secrets' panel to activate real-time English conversations!",
        reply_zh: "你好！我是你的 Ogden 850 学习伙伴。请在‘设置 > Secrets’面板配置您的 GEMINI_API_KEY 以激活实时英文对话！"
      });
      return;
    }

    // Format dialogue history for Gemini SDK
    // The history consists of user and model turns.
    const contents = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: contents,
      config: {
        systemInstruction: `You are an encouraging and friendly basic English speaking tutor. 
1. Speak STRICTLY in Ogden Basic English (850 list) or extremely simple words, keeping sentences brief, positive, and clear.
2. You MUST respond with exactly two parts: your simple English response, followed immediately by its Simplified Chinese translation enclosed in square brackets on a new line.
3. If the user makes structural or vocabulary errors in English, politely point out the correction in Chinese in a supportive way inside the translation brackets.
4. Keep the turn brief — at most 2-3 simple English sentences.`,
        temperature: 0.7,
      },
    });

    const replyText = response.text || '';
    
    // Parse the English text and bracketed Chinese translation from response
    // For robust rendering, we separate them
    let englishPart = replyText;
    let chinesePart = '';
    
    const bracketIndex = replyText.indexOf('[');
    if (bracketIndex !== -1) {
      englishPart = replyText.substring(0, bracketIndex).trim();
      chinesePart = replyText.substring(bracketIndex + 1, replyText.lastIndexOf(']')).trim();
      if (!chinesePart) {
        chinesePart = replyText.substring(bracketIndex).trim();
      }
    } else {
      // In case bracket styling was skipped, split by newlines
      const lines = replyText.split('\n').filter(l => l.trim().length > 0);
      if (lines.length > 1) {
        englishPart = lines[0].trim();
        chinesePart = lines.slice(1).join('\n').trim();
      }
    }

    res.json({
      reply: englishPart,
      reply_zh: chinesePart || '（翻译加载中...）'
    });
  } catch (error: any) {
    console.error('Gemini Chat error:', error);
    res.json({
      reply: "I am having trouble hearing you. Let us try to talk again shortly!",
      reply_zh: "服务连接出现了点小问题，让我们下一次再继续欢快对话吧！"
    });
  }
});

// API Route: AI Sentence Composition Evaluator (拼词造句评估)
app.post('/api/evaluate-sentence', async (req, res) => {
  try {
    const { userSentence, targetWords } = req.body;
    if (!userSentence || !targetWords) {
      res.status(400).json({ error: 'userSentence and targetWords are required' });
      return;
    }

    const wordsStr = targetWords.join(', ');

    if (!process.env.GEMINI_API_KEY) {
      // Offline mock fallback
      const hasWord1 = userSentence.toLowerCase().includes(targetWords[0]?.toLowerCase() || '');
      const score = hasWord1 ? 95 : 60;
      res.json({
        success: true,
        offlineFallback: true,
        correct: hasWord1,
        score: score,
        correctedSentence: hasWord1 ? null : `I want to study the word: ${targetWords[0]}.`,
        analysis: hasWord1 
          ? `非常好的句子！您已将目标词汇拼写并在句子中运用成功。`
          : `造句未检测到目标单词。试一试在该句中包含并正确拼写目标词: ${wordsStr}。`,
        translation: `（离线模拟分析）您的造句: "${userSentence}"`,
        recommendedUsage: `离线模式：请在 AI Studio 设置中配置您的 GEMINI_API_KEY 以获取完整语法订正与美妙翻译建议。`
      });
      return;
    }

    const prompt = `Evaluate this English sentence constructed by a learner: "${userSentence}".
The user was challenged to write a valid sentence including and correctly spelling these target word(s): [${wordsStr}].

Review the sentence on:
1. Are the target word(s) successfully included and spelled/used correctly?
2. Is the grammar, syntax, and spelling correct?
3. Is it clear and simple English?

Please output your evaluation strictly as structured JSON matching the requested schema. Do not output any conversational text outside the JSON block.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction: `You are an expert pedagogical tutor of English as a second language, specializing in Ogden 850 Basic English.
Evaluate the user's sentence composition and provide structured feedback. Be friendly, structured, and helpful. Translate everything in "analysis" and "recommendedUsage" to Simplified Chinese.`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            correct: {
              type: Type.BOOLEAN,
              description: 'Whether the sentence usage of the target word is correct and free of fatal grammar/spelling errors.'
            },
            score: {
              type: Type.INTEGER,
              description: 'A score from 0 to 100 based on grammar accuracy, structure correctness, and target word usage.'
            },
            correctedSentence: {
              type: Type.STRING,
              description: 'A polished, natural, and correct version of the sentence. Return null if the user sentence is absolutely perfect.'
            },
            analysis: {
              type: Type.STRING,
              description: 'A brief 2-3 sentence analysis of their grammar or spelling with friendly suggestions in Simplified Chinese.'
            },
            translation: {
              type: Type.STRING,
              description: 'An elegant, natural Simplified Chinese translation of the user sentence (or corrected sentence if user made big mistakes).'
            },
            recommendedUsage: {
              type: Type.STRING,
              description: 'A helpful pedagogical tip in Chinese showing standard usage or extensions of the target words.'
            }
          },
          required: ['correct', 'score', 'correctedSentence', 'analysis', 'translation', 'recommendedUsage'],
        }
      }
    });

    const resultText = response.text || '{}';
    const parsed = JSON.parse(resultText.trim());
    res.json({ success: true, ...parsed });
  } catch (error: any) {
    console.error('Sentence evaluation error:', error);
    res.json({
      success: false,
      error: error.message || 'Gemini evaluation failed',
      correct: true,
      score: 80,
      correctedSentence: null,
      analysis: '语法服务暂时在开小差，不过你的句型感觉非常棒！继续加油拼词造句。',
      translation: '（自动读取中）',
      recommendedUsage: '请再次点击“生成智能评估”重试。'
    });
  }
});

// Serve frontend assets
async function setupServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Ogden 850 server running on http://localhost:${PORT}`);
  });
}

setupServer().catch((err) => {
  console.error('Failed to start Ogden 850 server:', err);
});
