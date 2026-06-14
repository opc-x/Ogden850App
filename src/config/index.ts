/**
 * 全局应用配置
 * Global Application Configuration
 */

export const APP_CONFIG = {
  // TTS (Text-To-Speech) 发音配置
  TTS: {
    // 使用有道词典真人发音接口（国内网络友好，发音纯正）
    YOUDAO_TTS_BASE_URL: 'https://dict.youdao.com/dictvoice',
    DEFAULT_TYPE: 2, // 1: 英音, 2: 美音
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
