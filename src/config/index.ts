/**
 * 全局应用配置
 * Global Application Configuration
 */

export const APP_CONFIG = {
  // TTS (Text-To-Speech) 发音配置
  TTS: {
    // 切换到谷歌翻译原生纯正口音 AI (免费、免鉴权)
    GOOGLE_TTS_BASE_URL: 'https://translate.google.com/translate_tts',
    DEFAULT_LANG: 'en', // 'en' for English
    CLIENT_TYPE: 'tw-ob', // Magic client type that allows direct access
  },
  
  // 本地存储键名
  STORAGE_KEYS: {
    LEARNING_PROGRESS: 'ogden_learning_progress',
    PRACTICE_HISTORY: 'ogden_practice_history',
  },

  // 基础参数配置
  PARAMS: {
    PRACTICE_MAX_WORDS: 3, // 一次最多选择挑战的词汇数
    QUIZ_QUESTION_COUNT: 5, // 每次测试包含的题目数
  }
};
