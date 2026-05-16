-- DWP: Fix pupils table schema for cross-app use
-- ─────────────────────────────────────────────────────────────────────
-- All 53 existing rows have class_id = null, so changing the type is safe.
-- We drop the legacy integer class_id and add a UUID version referencing classes(id).
-- We also add the DWP-specific columns needed by pupil-login and pupil-create.
-- ─────────────────────────────────────────────────────────────────────

-- 1. Replace integer class_id with UUID (all existing values are null — safe)
ALTER TABLE pupils DROP COLUMN IF EXISTS class_id;
ALTER TABLE pupils ADD COLUMN class_id UUID REFERENCES classes(id) ON DELETE SET NULL;

-- 2. Add DWP-specific auth/login columns (nullable so wrife.co.uk school pupils
--    in profiles are unaffected; only sub-app-created pupils have these set)
ALTER TABLE pupils
  ADD COLUMN IF NOT EXISTS pin_hash   TEXT,
  ADD COLUMN IF NOT EXISTS auth_email TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS source     TEXT NOT NULL DEFAULT 'school'
    CHECK (source IN ('school', 'direct_home', 'direct_teacher', 'wrife_hub'));

-- Index for pupil-login lookup performance
CREATE INDEX IF NOT EXISTS idx_pupils_class_username ON pupils(class_id, username);
CREATE INDEX IF NOT EXISTS idx_pupils_auth_email ON pupils(auth_email);
