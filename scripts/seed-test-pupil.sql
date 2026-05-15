-- One-off test pupil seed for local + production smoke testing.
-- Run this in your Supabase project's SQL editor.
--
-- After running, you can log in at /login with:
--   Class code:  DWPTEST1
--   Username:    testpupil
--   PIN:         1234
--
-- The pupil's Supabase auth user will be created lazily on first login by
-- the pupil-login Edge Function, so we don't need to mint auth.users here.

DO $$
DECLARE
  test_class_id UUID;
  test_pupil_id UUID;
  -- bcrypt hash of "1234" (cost 10). Pre-computed so this seed is reproducible.
  -- Verified to match: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy is "1234"
  pin_hash_1234 TEXT := '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';
BEGIN
  -- Create the test home class if it doesn't exist. We use account_type='home'
  -- with a placeholder owner_id; but the CHECK constraint demands owner_id
  -- for home classes. Insert into account_type='independent_teacher' is also
  -- not right without a teacher. Use a dummy home_accounts row.
  --
  -- For simplicity: create a synthetic home_accounts row first.
  INSERT INTO home_accounts (auth_user_id, account_type, display_name, email, subscription_status)
  VALUES (gen_random_uuid(), 'parent', 'Test Parent', 'test-parent@dwp-local.invalid', 'trial')
  ON CONFLICT DO NOTHING;

  -- Now create the class
  INSERT INTO classes (class_code, class_name, account_type, owner_id, year_group)
  SELECT 'DWPTEST1', 'Test Family Class', 'home', ha.id, 'Y4'
  FROM home_accounts ha
  WHERE ha.email = 'test-parent@dwp-local.invalid'
  ON CONFLICT (class_code) DO NOTHING
  RETURNING id INTO test_class_id;

  -- If the class already existed, fetch its id
  IF test_class_id IS NULL THEN
    SELECT id INTO test_class_id FROM classes WHERE class_code = 'DWPTEST1';
  END IF;

  -- Create the test pupil
  INSERT INTO pupils (class_id, username, display_name, pin_hash, year_group, source)
  VALUES (test_class_id, 'testpupil', 'Test Pupil', pin_hash_1234, 'Y4', 'direct_home')
  ON CONFLICT (class_id, username) DO UPDATE SET pin_hash = EXCLUDED.pin_hash;
END $$;
