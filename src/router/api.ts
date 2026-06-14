/**
 * 后端接口路由映射 (API Router Mapping)
 * 集中管理所有前后端数据交互的 URL 路径
 */

export const API_ROUTES = {
  // --- AI 相关接口 ---
  AI: {
    // 评估拼词造句 (使用 Gemini 或其他大模型)
    EVALUATE_SENTENCE: '/api/evaluate-sentence',
    // 加载单词的 AI 学习上下文提示词
    LOAD_WORD_CONTEXT: '/api/word-context',
  },
  
  // --- 用户数据同步接口 (未来接入真实云端数据库时使用) ---
  USER: {
    SYNC_PROGRESS: '/api/user/sync-progress',
    GET_PROFILE: '/api/user/profile',
  }
};
