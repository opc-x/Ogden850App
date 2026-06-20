-- 清除本地 mp3 占位路径（/audio/*.mp3 资源已废弃，发音统一走有道 TTS）
UPDATE ogden_words
SET audio_url = NULL
WHERE audio_url LIKE '/audio/%';

UPDATE dialogue_turns
SET audio_url = NULL
WHERE audio_url LIKE '/audio/%';
