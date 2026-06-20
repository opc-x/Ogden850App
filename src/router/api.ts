/**
 * 后端接口路由映射 (API Router Mapping)
 * 集中管理所有前后端数据交互的 URL 路径
 */

export const API_ROUTES = {
  // --- AI 相关接口 ---
  AI: {
    EVALUATE_SENTENCE: '/api/evaluate-sentence',
    SCENE_COACH: '/api/scene-coach',
    LOAD_WORD_CONTEXT: '/api/word-context',
  },

  // --- 词汇 & 场景对话 ---
  VOCAB: {
    WORDS: '/api/words',
    WORD: (id: string) => `/api/words?id=${encodeURIComponent(id)}`,
  },
  SCENES: {
    LIST: '/api/scenes',
    DETAIL: (slug: string) => `/api/scenes?slug=${encodeURIComponent(slug)}`,
  },
  DIALOGUES: {
    DETAIL: (id: string) => `/api/dialogues?id=${encodeURIComponent(id)}`,
  },
  
  // --- 用户数据同步接口 (未来接入真实云端数据库时使用) ---
  USER: {
    SYNC_PROGRESS: '/api/user/sync-progress',
    GET_PROFILE: '/api/user/profile',
  }
};
