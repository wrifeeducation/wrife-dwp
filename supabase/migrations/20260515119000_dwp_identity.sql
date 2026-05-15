-- WriFe DWP — identity tables migration
-- Owned by: wrife-dwp repo
-- Target: DWP's OWN Supabase project (separate from PWP, IP, wrife.co.uk)
--
-- DWP is standalone: it owns its own pupil/class/home-account tables and
-- runs its own Supabase Auth. The wrife.co.uk integration is a later bridge
-- that mints DWP sessions for school pupils arriving via Route A SSO.
--
-- Naming note: tables are NOT prefixed with `dwp_` because they ARE the
-- core registry for DWP — there's no other registry to disambiguate from.
-- This matches the pattern wrife-website uses for its own pupils/classes.


-- ─────────────────────────────────────────────────────────────────────
-- home_accounts — direct sign-up accounts (parents and indie teachers)
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS home_accounts (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id        UUID NOT NULL UNIQUE,                  -- references auth.users(id)
  account_type        TEXT NOT NULL CHECK (account_type IN ('parent','independent_teacher')),
  display_name        TEXT NOT NULL,
  email               TEXT NOT NULL,
  stripe_customer_id  TEXT,
  subscription_status TEXT NOT NULL DEFAULT 'trial' CHECK (subscription_status IN ('trial','active','past_due','canceled','none')),
  subscription_tier   TEXT,                                  -- e.g. 'family_monthly', 'teacher_annual'
  trial_ends_at       TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_home_accounts_auth ON home_accounts(auth_user_id);

-- ─────────────────────────────────────────────────────────────────────
-- classes — class membership (home class for Route C, indie teacher class for Route D, school class shadow for Route A)
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS classes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_code      TEXT NOT NULL UNIQUE,                     -- 8-char code pupils type at /login
  class_name      TEXT NOT NULL,
  account_type    TEXT NOT NULL CHECK (account_type IN ('home','independent_teacher','school_shadow')),
  owner_id        UUID,                                      -- home_accounts.id for home/indie classes; NULL for school_shadow
  school_external_id TEXT,                                   -- wrife-website's classes.id when this is a school_shadow
  year_group      TEXT,                                      -- e.g. 'Y3' (optional)
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT classes_owner_or_school CHECK (
    (account_type IN ('home','independent_teacher') AND owner_id IS NOT NULL) OR
    (account_type = 'school_shadow' AND school_external_id IS NOT NULL)
  )
);
CREATE INDEX IF NOT EXISTS idx_classes_owner ON classes(owner_id) WHERE owner_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_classes_account_type ON classes(account_type);

-- ─────────────────────────────────────────────────────────────────────
-- pupils — DWP's pupil registry
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pupils (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id       UUID UNIQUE,                            -- references auth.users(id); nullable until first login
  class_id           UUID REFERENCES classes(id),            -- nullable for fully-solo home learners
  username           TEXT NOT NULL,
  display_name       TEXT NOT NULL,
  pin_hash           TEXT NOT NULL,                          -- 4-digit pin hashed
  year_group         TEXT,
  consent_audio      BOOLEAN NOT NULL DEFAULT FALSE,         -- recording oral rehearsal requires parental consent
  source             TEXT NOT NULL CHECK (source IN ('direct_home','direct_teacher','wrife_hub')),
  wrife_pupil_external_id UUID,                              -- wrife-website's pupils.id when source = 'wrife_hub'
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT pupils_username_class_unique UNIQUE (class_id, username)
);
CREATE INDEX IF NOT EXISTS idx_pupils_class ON pupils(class_id) WHERE class_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_pupils_auth ON pupils(auth_user_id) WHERE auth_user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_pupils_wrife_external ON pupils(wrife_pupil_external_id) WHERE wrife_pupil_external_id IS NOT NULL;

-- ─────────────────────────────────────────────────────────────────────
-- pupil_parent_links — parents seeing their children's progress
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pupil_parent_links (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pupil_id      UUID NOT NULL REFERENCES pupils(id) ON DELETE CASCADE,
  parent_account_id UUID NOT NULL REFERENCES home_accounts(id) ON DELETE CASCADE,
  relationship  TEXT NOT NULL DEFAULT 'parent' CHECK (relationship IN ('parent','guardian')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (pupil_id, parent_account_id)
);
CREATE INDEX IF NOT EXISTS idx_pupil_parent_pupil ON pupil_parent_links(pupil_id);
CREATE INDEX IF NOT EXISTS idx_pupil_parent_account ON pupil_parent_links(parent_account_id);

-- ─────────────────────────────────────────────────────────────────────
-- RLS for identity tables
-- ─────────────────────────────────────────────────────────────────────
ALTER TABLE home_accounts       ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes             ENABLE ROW LEVEL SECURITY;
ALTER TABLE pupils              ENABLE ROW LEVEL SECURITY;
ALTER TABLE pupil_parent_links  ENABLE ROW LEVEL SECURITY;

-- home_accounts: owner reads/updates own
CREATE POLICY "home_accounts owner reads own"
  ON home_accounts FOR SELECT TO authenticated
  USING (auth_user_id = auth.uid());
CREATE POLICY "home_accounts owner updates own"
  ON home_accounts FOR UPDATE TO authenticated
  USING (auth_user_id = auth.uid()) WITH CHECK (auth_user_id = auth.uid());

-- classes: pupils read their own class; owners read classes they own
CREATE POLICY "classes pupil reads own class"
  ON classes FOR SELECT TO authenticated
  USING (id IN (SELECT class_id FROM pupils WHERE auth_user_id = auth.uid()));
CREATE POLICY "classes owner reads own"
  ON classes FOR SELECT TO authenticated
  USING (owner_id IN (SELECT id FROM home_accounts WHERE auth_user_id = auth.uid()));

-- pupils: pupils read themselves; parents read their linked children; teachers read their class
CREATE POLICY "pupils read own"
  ON pupils FOR SELECT TO authenticated
  USING (auth_user_id = auth.uid());
CREATE POLICY "pupils parent reads linked"
  ON pupils FOR SELECT TO authenticated
  USING (id IN (
    SELECT ppl.pupil_id FROM pupil_parent_links ppl
    JOIN home_accounts ha ON ha.id = ppl.parent_account_id
    WHERE ha.auth_user_id = auth.uid()
  ));
CREATE POLICY "pupils teacher reads class"
  ON pupils FOR SELECT TO authenticated
  USING (class_id IN (
    SELECT c.id FROM classes c
    JOIN home_accounts ha ON ha.id = c.owner_id
    WHERE ha.auth_user_id = auth.uid() AND ha.account_type = 'independent_teacher'
  ));

-- pupil_parent_links: parents read own links
CREATE POLICY "pupil_parent_links parent reads"
  ON pupil_parent_links FOR SELECT TO authenticated
  USING (parent_account_id IN (SELECT id FROM home_accounts WHERE auth_user_id = auth.uid()));
