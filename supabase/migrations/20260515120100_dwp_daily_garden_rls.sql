-- DWP — daily prompts, garden seeds, RLS policies

-- ─────────────────────────────────────────────────────────────────────
-- dwp_daily_prompts — 365 prompts catalogue
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS dwp_daily_prompts (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_slug         TEXT NOT NULL UNIQUE,                 -- e.g. 'n001', 's001'
  category            TEXT NOT NULL CHECK (category IN ('sensory','narrative','reflection','description','argument')),
  prompt_text         TEXT NOT NULL,
  target_tier_min     INTEGER NOT NULL DEFAULT 1 CHECK (target_tier_min BETWEEN 1 AND 8),
  target_tier_max     INTEGER NOT NULL DEFAULT 8 CHECK (target_tier_max BETWEEN 1 AND 8),
  word_seeds          TEXT[] DEFAULT '{}',                  -- words this prompt commonly yields
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (target_tier_max >= target_tier_min)
);
CREATE INDEX IF NOT EXISTS idx_dwp_daily_prompts_category ON dwp_daily_prompts(category);

-- ─────────────────────────────────────────────────────────────────────
-- dwp_daily_attempts — per-pupil daily submissions
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS dwp_daily_attempts (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pupil_id           UUID NOT NULL,
  class_id           UUID,
  prompt_id          UUID NOT NULL REFERENCES dwp_daily_prompts(id),
  prompt_slug        TEXT NOT NULL,
  category           TEXT NOT NULL,
  submission_text    TEXT NOT NULL,
  word_count         INTEGER NOT NULL DEFAULT 0,
  oral_rehearsal_transcript TEXT,
  ai_assessment      JSONB,
  feature_tags       JSONB NOT NULL DEFAULT '[]',
  band               TEXT CHECK (band IN ('mastery','secure','developing','emerging')),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_dwp_daily_attempts_pupil_date ON dwp_daily_attempts(pupil_id, created_at DESC);

-- ─────────────────────────────────────────────────────────────────────
-- dwp_garden_seeds — per-pupil Word Seed inventory
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS dwp_garden_seeds (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pupil_id     UUID NOT NULL,
  word         TEXT NOT NULL,
  biome        TEXT NOT NULL CHECK (biome IN ('meadow','grove','stone_path','reflection_pool','workshop')),
  rarity       TEXT NOT NULL DEFAULT 'common' CHECK (rarity IN ('common','rare','legendary')),
  source_type  TEXT NOT NULL CHECK (source_type IN ('level','daily_prompt')),
  source_id    TEXT NOT NULL,                           -- level_id or prompt_slug
  earned_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  planted_at   TIMESTAMPTZ,                             -- nullable until pupil plants it
  growth_stage TEXT NOT NULL DEFAULT 'sprout' CHECK (growth_stage IN ('sprout','bloom','mature'))
);
CREATE INDEX IF NOT EXISTS idx_dwp_garden_seeds_pupil ON dwp_garden_seeds(pupil_id, biome);
CREATE UNIQUE INDEX IF NOT EXISTS uq_dwp_garden_seeds_pupil_word_source
  ON dwp_garden_seeds(pupil_id, word, source_type, source_id);

-- ─────────────────────────────────────────────────────────────────────
-- Row-Level Security
-- ─────────────────────────────────────────────────────────────────────
-- Pattern: pupils see only their own rows. Teachers and parents see their
-- pupils via the existing wrife-website tables. dwp_levels and dwp_daily_prompts
-- and dwp_badges are world-readable (catalogue).

ALTER TABLE dwp_levels         ENABLE ROW LEVEL SECURITY;
ALTER TABLE dwp_daily_prompts  ENABLE ROW LEVEL SECURITY;
ALTER TABLE dwp_badges         ENABLE ROW LEVEL SECURITY;
ALTER TABLE dwp_progress       ENABLE ROW LEVEL SECURITY;
ALTER TABLE dwp_attempts       ENABLE ROW LEVEL SECURITY;
ALTER TABLE dwp_daily_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE dwp_garden_seeds   ENABLE ROW LEVEL SECURITY;
ALTER TABLE dwp_certificates   ENABLE ROW LEVEL SECURITY;

-- World-readable catalogues
CREATE POLICY "dwp_levels readable by anyone authed"
  ON dwp_levels FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "dwp_daily_prompts readable by anyone authed"
  ON dwp_daily_prompts FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "dwp_badges readable by anyone authed"
  ON dwp_badges FOR SELECT
  TO authenticated USING (true);

-- Pupil progress — own rows only
CREATE POLICY "dwp_progress pupil reads own"
  ON dwp_progress FOR SELECT
  TO authenticated USING (pupil_id = auth.uid());

CREATE POLICY "dwp_progress pupil writes own"
  ON dwp_progress FOR INSERT
  TO authenticated WITH CHECK (pupil_id = auth.uid());

CREATE POLICY "dwp_progress pupil updates own"
  ON dwp_progress FOR UPDATE
  TO authenticated USING (pupil_id = auth.uid()) WITH CHECK (pupil_id = auth.uid());

-- Attempts — own rows only (writes happen via Edge Function with service role; reads are pupil-scoped)
CREATE POLICY "dwp_attempts pupil reads own"
  ON dwp_attempts FOR SELECT
  TO authenticated USING (pupil_id = auth.uid());

CREATE POLICY "dwp_daily_attempts pupil reads own"
  ON dwp_daily_attempts FOR SELECT
  TO authenticated USING (pupil_id = auth.uid());

-- Garden seeds — own rows only
CREATE POLICY "dwp_garden_seeds pupil reads own"
  ON dwp_garden_seeds FOR SELECT
  TO authenticated USING (pupil_id = auth.uid());

CREATE POLICY "dwp_garden_seeds pupil plants own"
  ON dwp_garden_seeds FOR UPDATE
  TO authenticated USING (pupil_id = auth.uid()) WITH CHECK (pupil_id = auth.uid());

CREATE POLICY "dwp_certificates pupil reads own"
  ON dwp_certificates FOR SELECT
  TO authenticated USING (pupil_id = auth.uid());

-- Teacher / parent visibility is granted via wrife-website policies on classes/pupils
-- (joins read access through those). DWP does not duplicate that logic.
