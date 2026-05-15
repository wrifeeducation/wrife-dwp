-- DWP — RLS corrections + write policies
--
-- 1. The original pupil-scoped policies on dwp_progress/dwp_attempts/etc
--    compared `pupil_id` (a pupils.id) directly to `auth.uid()` (an auth.users.id).
--    Those are different UUIDs, so pupils could never read their own data.
--    Fix: join through pupils.auth_user_id.
--
-- 2. Add INSERT/UPDATE policies to classes + pupils so a parent or teacher's
--    session can create children / pupils. (Reads already worked.)

-- ─── 1. Fix pupil-scoped read/write policies ────────────────────────
DROP POLICY IF EXISTS "dwp_progress pupil reads own"   ON dwp_progress;
DROP POLICY IF EXISTS "dwp_progress pupil writes own"  ON dwp_progress;
DROP POLICY IF EXISTS "dwp_progress pupil updates own" ON dwp_progress;
CREATE POLICY "dwp_progress pupil reads own"   ON dwp_progress FOR SELECT TO authenticated
  USING (pupil_id IN (SELECT id FROM pupils WHERE auth_user_id = auth.uid()));
CREATE POLICY "dwp_progress pupil writes own"  ON dwp_progress FOR INSERT TO authenticated
  WITH CHECK (pupil_id IN (SELECT id FROM pupils WHERE auth_user_id = auth.uid()));
CREATE POLICY "dwp_progress pupil updates own" ON dwp_progress FOR UPDATE TO authenticated
  USING (pupil_id IN (SELECT id FROM pupils WHERE auth_user_id = auth.uid()))
  WITH CHECK (pupil_id IN (SELECT id FROM pupils WHERE auth_user_id = auth.uid()));

DROP POLICY IF EXISTS "dwp_attempts pupil reads own" ON dwp_attempts;
CREATE POLICY "dwp_attempts pupil reads own" ON dwp_attempts FOR SELECT TO authenticated
  USING (pupil_id IN (SELECT id FROM pupils WHERE auth_user_id = auth.uid()));

DROP POLICY IF EXISTS "dwp_daily_attempts pupil reads own" ON dwp_daily_attempts;
CREATE POLICY "dwp_daily_attempts pupil reads own" ON dwp_daily_attempts FOR SELECT TO authenticated
  USING (pupil_id IN (SELECT id FROM pupils WHERE auth_user_id = auth.uid()));

DROP POLICY IF EXISTS "dwp_garden_seeds pupil reads own"  ON dwp_garden_seeds;
DROP POLICY IF EXISTS "dwp_garden_seeds pupil plants own" ON dwp_garden_seeds;
CREATE POLICY "dwp_garden_seeds pupil reads own" ON dwp_garden_seeds FOR SELECT TO authenticated
  USING (pupil_id IN (SELECT id FROM pupils WHERE auth_user_id = auth.uid()));
CREATE POLICY "dwp_garden_seeds pupil plants own" ON dwp_garden_seeds FOR UPDATE TO authenticated
  USING (pupil_id IN (SELECT id FROM pupils WHERE auth_user_id = auth.uid()))
  WITH CHECK (pupil_id IN (SELECT id FROM pupils WHERE auth_user_id = auth.uid()));

DROP POLICY IF EXISTS "dwp_certificates pupil reads own" ON dwp_certificates;
CREATE POLICY "dwp_certificates pupil reads own" ON dwp_certificates FOR SELECT TO authenticated
  USING (pupil_id IN (SELECT id FROM pupils WHERE auth_user_id = auth.uid()));

-- ─── 2. Allow home_account owners to create + update classes ────────
DROP POLICY IF EXISTS "classes owner inserts" ON classes;
CREATE POLICY "classes owner inserts" ON classes FOR INSERT TO authenticated
  WITH CHECK (owner_id IN (SELECT id FROM home_accounts WHERE auth_user_id = auth.uid()));

DROP POLICY IF EXISTS "classes owner updates" ON classes;
CREATE POLICY "classes owner updates" ON classes FOR UPDATE TO authenticated
  USING (owner_id IN (SELECT id FROM home_accounts WHERE auth_user_id = auth.uid()))
  WITH CHECK (owner_id IN (SELECT id FROM home_accounts WHERE auth_user_id = auth.uid()));

-- ─── 3. Allow home_account owners to manage pupils in their classes ─
DROP POLICY IF EXISTS "pupils owner inserts" ON pupils;
CREATE POLICY "pupils owner inserts" ON pupils FOR INSERT TO authenticated
  WITH CHECK (class_id IN (
    SELECT c.id FROM classes c
    JOIN home_accounts ha ON ha.id = c.owner_id
    WHERE ha.auth_user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "pupils owner updates" ON pupils;
CREATE POLICY "pupils owner updates" ON pupils FOR UPDATE TO authenticated
  USING (class_id IN (
    SELECT c.id FROM classes c
    JOIN home_accounts ha ON ha.id = c.owner_id
    WHERE ha.auth_user_id = auth.uid()
  ))
  WITH CHECK (class_id IN (
    SELECT c.id FROM classes c
    JOIN home_accounts ha ON ha.id = c.owner_id
    WHERE ha.auth_user_id = auth.uid()
  ));
