-- WriFe DWP — core tables migration
-- Owned by: wrife-dwp repo
-- Target: gzmgjkbtsvezfclmreru (shared WriFe Platform Supabase)
--
-- Rules followed (per wrife-brand-ecosystem skill):
--   - class_id nullable everywhere → standalone mode always works
--   - all gamification columns have NOT NULL DEFAULT → no NULL crashes
--   - foreign keys to wrife-website-owned tables (pupils, classes) use UUID; no schema changes there
--   - no alterations to learning_events; sub-app INSERTs only


-- ─────────────────────────────────────────────────────────────────────
-- dwp_levels — 40 level definitions
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS dwp_levels (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level_id             TEXT NOT NULL UNIQUE,           -- e.g. 'dwp_l1'
  level_number         INTEGER NOT NULL UNIQUE CHECK (level_number BETWEEN 1 AND 40),
  tier_number          INTEGER NOT NULL CHECK (tier_number BETWEEN 1 AND 8),
  activity_name        TEXT NOT NULL,
  activity_type        TEXT NOT NULL CHECK (activity_type IN (
                         'word_sorting', 'verb_identification', 'noun_verb_logic',
                         'proper_noun_capitalisation', 'mixed_sorting',
                         'add_noun', 'add_verb', 'det_noun_verb',
                         'add_adjective', 'word_chain',
                         'sentence_copy', 'sentence_fix', 'sentence_completion',
                         'independent_milestone', 'add_where', 'add_when', 'who_what_where',
                         'enhance_adjectives', 'join_and', 'use_but',
                         'because_clauses', 'when_time', 'multiple_details', 'formula_sentence',
                         'temporal_connectives', 'three_connected', 'before_after', 'five_sentence_recount',
                         'story_beginning', 'story_middle', 'story_ending', 'bme_plan', 'first_complete_story',
                         'when_starter', 'although_starter', 'sentence_variety',
                         'detailed_opening', 'narrative_showcase'
                       )),
  learning_objective   TEXT NOT NULL,

  -- Prompt content
  prompt_title         TEXT NOT NULL,
  prompt_instructions  TEXT NOT NULL,
  prompt_example       TEXT,
  word_bank            JSONB DEFAULT '[]'::jsonb,      -- array of {word, class} when relevant
  items                JSONB DEFAULT '[]'::jsonb,      -- per activity type — sort items, sentences, etc.

  -- Assessment
  rubric               JSONB NOT NULL,                 -- band thresholds, badges, pattern_analysis
  passing_threshold    INTEGER NOT NULL DEFAULT 80 CHECK (passing_threshold BETWEEN 0 AND 100),

  -- Pedagogical metadata
  expected_time_minutes INTEGER DEFAULT 8,
  difficulty_band      TEXT CHECK (difficulty_band IN ('foundation','developing','advanced')),
  age_range            TEXT,                           -- e.g. '6-7'

  -- Flags
  tier_finale          BOOLEAN NOT NULL DEFAULT FALSE,
  programme_finale     BOOLEAN NOT NULL DEFAULT FALSE,
  milestone            BOOLEAN NOT NULL DEFAULT FALSE,

  -- Ordering / display
  display_order        INTEGER NOT NULL UNIQUE,

  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dwp_levels_tier ON dwp_levels(tier_number);
CREATE INDEX IF NOT EXISTS idx_dwp_levels_order ON dwp_levels(display_order);

-- ─────────────────────────────────────────────────────────────────────
-- dwp_progress — per-pupil current state
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS dwp_progress (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pupil_id              UUID NOT NULL UNIQUE,           -- references pupils.id on wrife-website
  class_id              UUID,                            -- nullable for home learners
  current_level_id      TEXT NOT NULL REFERENCES dwp_levels(level_id) DEFAULT 'dwp_l1',
  levels_completed      TEXT[] NOT NULL DEFAULT '{}',
  badges_earned         JSONB NOT NULL DEFAULT '[]',     -- [{level_id, badge, earned_at}]
  tier1_completed       BOOLEAN NOT NULL DEFAULT FALSE,
  tier2_completed       BOOLEAN NOT NULL DEFAULT FALSE,
  tier3_completed       BOOLEAN NOT NULL DEFAULT FALSE,
  tier4_completed       BOOLEAN NOT NULL DEFAULT FALSE,
  tier5_completed       BOOLEAN NOT NULL DEFAULT FALSE,
  tier6_completed       BOOLEAN NOT NULL DEFAULT FALSE,
  tier7_completed       BOOLEAN NOT NULL DEFAULT FALSE,
  tier8_completed       BOOLEAN NOT NULL DEFAULT FALSE,
  total_attempts        INTEGER NOT NULL DEFAULT 0,
  total_time_minutes    INTEGER NOT NULL DEFAULT 0,
  current_streak_days   INTEGER NOT NULL DEFAULT 0,
  longest_streak_days   INTEGER NOT NULL DEFAULT 0,
  last_active_at        TIMESTAMPTZ,
  xp_total              INTEGER NOT NULL DEFAULT 0,
  coins_total           INTEGER NOT NULL DEFAULT 0,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dwp_progress_pupil ON dwp_progress(pupil_id);
CREATE INDEX IF NOT EXISTS idx_dwp_progress_class ON dwp_progress(class_id) WHERE class_id IS NOT NULL;

-- ─────────────────────────────────────────────────────────────────────
-- dwp_attempts — every pupil submission
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS dwp_attempts (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pupil_id                    UUID NOT NULL,                     -- references pupils.id
  class_id                    UUID,                              -- nullable
  level_id                    TEXT NOT NULL REFERENCES dwp_levels(level_id),
  attempt_number              INTEGER NOT NULL DEFAULT 1,
  submission                  JSONB NOT NULL,                    -- pupil's raw input
  oral_rehearsal_transcript   TEXT,                              -- nullable — spoken-then-written
  oral_rehearsal_audio_url    TEXT,                              -- nullable — Supabase Storage path
  ai_assessment               JSONB,                             -- full Claude JSON response
  feature_tags                JSONB NOT NULL DEFAULT '[]',       -- {feature_slug, applied_correctly, was_required}
  score                       INTEGER,
  total_items                 INTEGER,
  percentage                  INTEGER,
  band                        TEXT CHECK (band IN ('mastery','secure','developing','emerging')),
  badge                       TEXT,
  passed                      BOOLEAN NOT NULL DEFAULT FALSE,
  pattern_errors              TEXT[] DEFAULT '{}',
  time_spent_seconds          INTEGER,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dwp_attempts_pupil_level ON dwp_attempts(pupil_id, level_id);
CREATE INDEX IF NOT EXISTS idx_dwp_attempts_class ON dwp_attempts(class_id) WHERE class_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_dwp_attempts_created ON dwp_attempts(created_at DESC);

-- ─────────────────────────────────────────────────────────────────────
-- dwp_badges — badge catalogue
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS dwp_badges (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  badge_slug    TEXT NOT NULL UNIQUE,
  badge_name    TEXT NOT NULL,
  emoji         TEXT NOT NULL,
  band          TEXT CHECK (band IN ('mastery','secure','developing','emerging','milestone','tier','programme')),
  description   TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────
-- dwp_certificates — tier and programme completion artefacts
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS dwp_certificates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pupil_id        UUID NOT NULL,
  class_id        UUID,
  certificate_type TEXT NOT NULL CHECK (certificate_type IN ('tier','programme')),
  tier_number     INTEGER CHECK (tier_number BETWEEN 1 AND 8),
  awarded_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  pdf_url         TEXT
);
CREATE INDEX IF NOT EXISTS idx_dwp_certificates_pupil ON dwp_certificates(pupil_id);
