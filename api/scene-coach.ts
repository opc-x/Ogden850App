import type { VercelRequest, VercelResponse } from '@vercel/node';
import { evaluateSceneAttempt, resolveDeepSeekApiKey } from './_lib/deepseekCoach';

function cors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Content-Type',
  );
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res);
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      sceneTitleZh,
      sceneTitleEn,
      storyHook,
      userRole,
      expectedLine,
      userAttempt,
      priorContext,
      referenceSnippet,
    } = req.body ?? {};

    if (!sceneTitleZh || !expectedLine?.en || !userAttempt?.trim()) {
      return res.status(400).json({ error: 'sceneTitleZh, expectedLine.en and userAttempt are required' });
    }
    if (userRole !== 'A' && userRole !== 'B') {
      return res.status(400).json({ error: 'userRole must be A or B' });
    }

    if (!resolveDeepSeekApiKey()) {
      const attempt = String(userAttempt).trim().toLowerCase();
      const expected = String(expectedLine.en).trim().toLowerCase();
      const similar =
        attempt === expected ||
        expected.includes(attempt) ||
        attempt.includes(expected.split(' ').slice(0, 3).join(' '));
      const score = similar ? 88 : 55;
      return res.json({
        offlineFallback: true,
        score,
        passed: score >= 70,
        encouragement: similar
          ? '太棒了！你的表达和场景台词很接近，继续保持这份自信～'
          : '别灰心，对照参考台词再试一次，你已经迈出很重要的一步了！',
        correction: similar ? null : expectedLine.en,
        analysis: similar
          ? '（离线模式）语义与参考台词匹配良好。'
          : '（离线模式）与参考台词差距较大，请配置 DEEPSEEK_API_KEY 获取完整 AI 陪练。',
        tip: '听一遍标准发音，跟读关键短语会更自然。',
        mood: similar ? 'good' : 'retry',
      });
    }

    const result = await evaluateSceneAttempt({
      sceneTitleZh,
      sceneTitleEn: sceneTitleEn ?? sceneTitleZh,
      storyHook,
      userRole,
      expectedLine,
      userAttempt: String(userAttempt).trim(),
      priorContext: Array.isArray(priorContext) ? priorContext : [],
      referenceSnippet: Array.isArray(referenceSnippet) ? referenceSnippet : [],
    });

    res.json({ success: true, ...result });
  } catch (error: unknown) {
    console.error('Scene coach error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: 'Coach evaluation failed', details: message });
  }
}
