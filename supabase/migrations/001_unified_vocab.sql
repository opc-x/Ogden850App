-- Ogden850 unified vocabulary + scene dialogue schema
-- Run via Supabase CLI or MCP apply_migration

-- ── Vocabulary hub (dictionary + 造词纺 shared) ──

CREATE TABLE IF NOT EXISTS ogden_words (
  id              text PRIMARY KEY,
  word            text NOT NULL,
  category        text NOT NULL CHECK (category IN (
    'operators', 'actions', 'picturables', 'generals', 'qualities', 'opposites'
  )),
  translation     text NOT NULL DEFAULT '',
  ipa             text,
  definition_en   text,
  visual_type     text NOT NULL DEFAULT 'fallback' CHECK (visual_type IN (
    'operator', 'direction', 'image', 'fallback'
  )),
  visual_ref      text,
  audio_url       text,
  is_operator     boolean NOT NULL DEFAULT false,
  sort_order      int NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ogden_words_category ON ogden_words (category);
CREATE INDEX IF NOT EXISTS idx_ogden_words_sort ON ogden_words (sort_order);

CREATE TABLE IF NOT EXISTS word_inflections (
  surface         text PRIMARY KEY,
  lemma_id        text NOT NULL REFERENCES ogden_words (id) ON DELETE CASCADE,
  kind            text NOT NULL DEFAULT 'other'
);

CREATE INDEX IF NOT EXISTS idx_word_inflections_lemma ON word_inflections (lemma_id);

-- Extend / align word guides (id = lowercase word, matches legacy client)
CREATE TABLE IF NOT EXISTS ogden_word_guides (
  id              text PRIMARY KEY REFERENCES ogden_words (id) ON DELETE CASCADE,
  hook            text,
  concept         text,
  equation        text,
  combine         text,
  ogden_tip       text,
  guide_sentences jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- ── Scene dialogue (造词纺) ──

CREATE TABLE IF NOT EXISTS scenes (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            text UNIQUE NOT NULL,
  title_en        text NOT NULL,
  title_zh        text NOT NULL,
  tier            text NOT NULL DEFAULT 'P0' CHECK (tier IN ('P0', 'P1', 'P2')),
  freq_rank       int NOT NULL DEFAULT 999,
  icon            text,
  status          text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_scenes_tier_rank ON scenes (tier, freq_rank);

CREATE TABLE IF NOT EXISTS scene_words (
  scene_id        uuid NOT NULL REFERENCES scenes (id) ON DELETE CASCADE,
  word_id         text NOT NULL REFERENCES ogden_words (id) ON DELETE CASCADE,
  role            text NOT NULL DEFAULT 'core' CHECK (role IN ('core', 'optional', 'grammar')),
  PRIMARY KEY (scene_id, word_id)
);

CREATE TABLE IF NOT EXISTS dialogues (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scene_id        uuid NOT NULL REFERENCES scenes (id) ON DELETE CASCADE,
  title           text,
  difficulty      smallint NOT NULL DEFAULT 1,
  turn_count      smallint,
  status          text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'validated', 'published')),
  source          text NOT NULL DEFAULT 'curated',
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS dialogue_turns (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dialogue_id     uuid NOT NULL REFERENCES dialogues (id) ON DELETE CASCADE,
  seq             smallint NOT NULL,
  speaker         text NOT NULL,
  speaker_zh      text,
  en              text NOT NULL,
  zh              text,
  speech_act      text,
  audio_url       text,
  UNIQUE (dialogue_id, seq)
);

CREATE TABLE IF NOT EXISTS turn_tokens (
  turn_id         uuid NOT NULL REFERENCES dialogue_turns (id) ON DELETE CASCADE,
  idx             smallint NOT NULL,
  surface         text NOT NULL,
  word_id         text REFERENCES ogden_words (id) ON DELETE SET NULL,
  token_role      text,
  PRIMARY KEY (turn_id, idx)
);

CREATE TABLE IF NOT EXISTS generation_jobs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scene_id        uuid REFERENCES scenes (id) ON DELETE SET NULL,
  status          text NOT NULL DEFAULT 'pending',
  prompt          text,
  result          jsonb,
  created_at      timestamptz NOT NULL DEFAULT now(),
  finished_at     timestamptz
);

-- ── RLS: public read for published content ──

ALTER TABLE ogden_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE word_inflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE ogden_word_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE scene_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE dialogues ENABLE ROW LEVEL SECURITY;
ALTER TABLE dialogue_turns ENABLE ROW LEVEL SECURITY;
ALTER TABLE turn_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS ogden_words_read ON ogden_words;
CREATE POLICY ogden_words_read ON ogden_words FOR SELECT USING (true);

DROP POLICY IF EXISTS word_inflections_read ON word_inflections;
CREATE POLICY word_inflections_read ON word_inflections FOR SELECT USING (true);

DROP POLICY IF EXISTS ogden_word_guides_read ON ogden_word_guides;
CREATE POLICY ogden_word_guides_read ON ogden_word_guides FOR SELECT USING (true);

DROP POLICY IF EXISTS scenes_read ON scenes;
CREATE POLICY scenes_read ON scenes FOR SELECT USING (status = 'published');

DROP POLICY IF EXISTS scene_words_read ON scene_words;
CREATE POLICY scene_words_read ON scene_words FOR SELECT USING (true);

DROP POLICY IF EXISTS dialogues_read ON dialogues;
CREATE POLICY dialogues_read ON dialogues FOR SELECT USING (status = 'published');

DROP POLICY IF EXISTS dialogue_turns_read ON dialogue_turns;
CREATE POLICY dialogue_turns_read ON dialogue_turns FOR SELECT USING (true);

DROP POLICY IF EXISTS turn_tokens_read ON turn_tokens;
CREATE POLICY turn_tokens_read ON turn_tokens FOR SELECT USING (true);
