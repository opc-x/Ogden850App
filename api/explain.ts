import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from '@google/genai';

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
        tip: '请在项目环境变量中配置您的 GEMINI_API_KEY 以解锁高保真 AI 例句和解释！',
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
}
