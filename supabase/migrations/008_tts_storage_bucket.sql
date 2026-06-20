-- Gemini TTS 音频存储（公开 CDN）
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('tts', 'tts', true, 5242880, ARRAY['audio/wav', 'audio/mpeg'])
ON CONFLICT (id) DO UPDATE SET public = true;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'tts_public_read') THEN
    CREATE POLICY "tts_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'tts');
  END IF;
END $$;

-- 清除 legacy 本地占位路径
UPDATE ogden_words SET audio_url = NULL WHERE audio_url LIKE '/audio/%';
UPDATE dialogue_turns SET audio_url = NULL WHERE audio_url LIKE '/audio/%';
