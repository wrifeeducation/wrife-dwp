-- Auth wiring for direct sign-up + pupil login
--
-- 1. pupils.auth_email — synthetic email tied to each pupil's Supabase Auth user.
--    Format: pupil-{first-8-chars-of-pupil-id}@dwp-internal.wrife.co.uk
--    Never user-facing.
-- 2. Trigger on auth.users INSERT — when a parent or independent teacher
--    confirms their email, automatically create the home_accounts row using
--    metadata from raw_user_meta_data.

-- ─────────────────────────────────────────────────────────────────────
-- 1. pupils.auth_email
-- ─────────────────────────────────────────────────────────────────────
ALTER TABLE pupils
  ADD COLUMN IF NOT EXISTS auth_email TEXT UNIQUE;

CREATE INDEX IF NOT EXISTS idx_pupils_auth_email
  ON pupils(auth_email) WHERE auth_email IS NOT NULL;

-- ─────────────────────────────────────────────────────────────────────
-- 2. Sign-up trigger — auto-creates home_accounts for parent/teacher
-- ─────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_dwp_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  role_value TEXT;
  display_value TEXT;
BEGIN
  -- Only proceed if metadata indicates a parent or independent_teacher signup.
  -- Pupil auth users are created by Edge Function with a different role tag.
  role_value := NEW.raw_user_meta_data->>'role';
  IF role_value NOT IN ('parent', 'independent_teacher') THEN
    RETURN NEW;
  END IF;

  display_value := COALESCE(
    NEW.raw_user_meta_data->>'display_name',
    split_part(NEW.email, '@', 1)
  );

  INSERT INTO home_accounts (auth_user_id, account_type, display_name, email)
  VALUES (NEW.id, role_value, display_value, NEW.email)
  ON CONFLICT (auth_user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_dwp_user();

-- Allow the function to run despite being called for the auth schema
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.handle_new_dwp_user() TO supabase_auth_admin;
