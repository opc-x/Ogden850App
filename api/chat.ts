import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

const getGeminiClient = () => {
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

const ai = getGeminiClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS setup
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: 'Messages history is required' });
      return;
    }

    if (!process.env.GEMINI_API_KEY) {
      res.json({
        reply: "Hello! I am your Ogden 850 learning partner. Please configure your GEMINI_API_KEY inside the project to activate real-time English conversations!",
        reply_zh: "你好！我是你的 Ogden 850 学习伙伴。请在项目环境变量中配置您的 GEMINI_API_KEY 以激活实时英文对话！"
      });
      return;
    }

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
}
