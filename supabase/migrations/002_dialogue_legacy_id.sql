-- Stable turn ids for JSON ↔ DB sync and /audio/sentences/{id}.mp3 paths

ALTER TABLE dialogue_turns
  ADD COLUMN IF NOT EXISTS legacy_turn_id int;

CREATE UNIQUE INDEX IF NOT EXISTS idx_dialogue_turns_legacy_turn_id
  ON dialogue_turns (legacy_turn_id)
  WHERE legacy_turn_id IS NOT NULL;
