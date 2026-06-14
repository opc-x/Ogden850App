/**
 * AI 智能辅导业务逻辑服务
 * 专门处理与大模型的交互和造句评估逻辑
 */
import { API_ROUTES } from '../router/api';

export interface EvaluationResult {
  correct: boolean;
  score: number;
  correctedSentence?: string;
  analysis: string;
  translation: string;
  recommendedUsage: string;
}

export const AIService = {
  /**
   * 评估用户的造句
   */
  async evaluateSentence(userSentence: string, targetWords: string[]): Promise<EvaluationResult> {
    try {
      const response = await fetch(API_ROUTES.AI.EVALUATE_SENTENCE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userSentence, targetWords })
      });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      return data;
    } catch (error) {
      console.error('AI Evaluation failed:', error);
      // Fallback for local testing if serverless is not running or offline
      return {
        correct: false,
        score: 0,
        analysis: '网络请求失败或后端接口异常，请确保启动了 Vercel Dev 环境 (npx vercel dev)。',
        translation: '',
        recommendedUsage: '请检查网络或后端配置。'
      };
    }
  },

  /**
   * 加载单词的 AI 学习上下文提示词
   */
  async loadWordContext(word: string): Promise<any> {
    try {
      // TODO: Implementation for word context backend API
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ success: true });
        }, 800);
      });
    } catch (error) {
      console.error('Load word context failed:', error);
      throw error;
    }
  }
};
