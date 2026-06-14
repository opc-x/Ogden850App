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
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
        recommendedUsage: `离线模式：请在项目环境变量中配置您的 GEMINI_API_KEY 以获取完整语法订正与美妙翻译建议。`
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
    console.error('Gemini error:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
