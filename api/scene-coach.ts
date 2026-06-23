import type { VercelRequest, VercelResponse } from '@vercel/node';
import { evaluateCoachAttempt } from './_lib/coachEval.js';

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

    const result = await evaluateCoachAttempt({
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
