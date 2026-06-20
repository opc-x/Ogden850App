-- Rich scene metadata (story outline, gradient, narrative) — scripts sync, frontend reads DB only

ALTER TABLE scenes
  ADD COLUMN IF NOT EXISTS metadata jsonb NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_scenes_metadata ON scenes USING gin (metadata);
