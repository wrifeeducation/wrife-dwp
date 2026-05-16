# WriFe DWP (Daily Writing Practice)
*Last updated: 2026-05-16 · Session 2*

## Current state
`dailywrite.wrife.co.uk` is live and deployed on Vercel. The app connects to the shared WriFe Platform Supabase project (`gzmgjkbtsvezfclmreru`). All 405 ElevenLabs audio files are uploaded to the `dwp-audio` Storage bucket and play correctly. Auth now works for all three user types: school teachers (wrife.co.uk credentials), independent teachers/parents (home_accounts), and pupils (class code + username + PIN via `pupil-login` Edge Function).

## Next steps
1. **Test the full login flow** — school teacher at `/account/login`, then create a class and add a pupil, then log in as that pupil at `/login`
2. **Add DWP SSO tile to wrife.co.uk teacher dashboard** — school teachers currently have no tile to reach DWP from wrife.co.uk (only the pupil dashboard tile was added)
3. **Apply pending wrife-website migrations** — `20260511_school_registrations.sql` and `20260511000001_ai_attempts.sql` still need applying

## Key decisions
- **Shared Supabase project:** DWP uses `gzmgjkbtsvezfclmreru` (WriFe Platform) — NOT its own project. Legacy project `nxhkpqngnxshgotvuujb` is safe to delete (0 rows).
- **`pupils` table schema:** Added `pin_hash`, `auth_email`, `source` columns and changed `class_id` from integer to UUID via migration `dwp_fix_pupils_schema`. All 53 existing rows had null class_id so the type change was safe.
- **`classes` table:** Real column names are `name` (not `class_name`) and `home_account_id` (not `owner_id`). All DWP code now uses the correct names.
- **School teacher auth on DWP:** Falls back to `profiles.role = 'teacher'/'admin'` after checking `home_accounts`. TeacherView queries by `teacher_id` for school accounts, `home_account_id` for independent teachers.
- **Audio bucket:** `dwp-audio` bucket created with public read RLS. Files served at `dwp-audio/levels/{level_id}/intro.mp3` and `dwp-audio/daily/{slug}.mp3`.

## Files & locations
- `src/hooks/useHomeAccount.ts` — extended to fall back to `profiles` for school teachers; returns `isSchoolAccount: boolean`
- `src/pages/AccountLogin.tsx` — now routes school teachers (`profiles.role`) to `/teacher`
- `src/pages/TeacherView.tsx` — dual query: `teacher_id` for school accounts, `home_account_id` for independent
- `src/components/dashboard/CreateClassForm.tsx` — fixed `owner_id`→`home_account_id`, `class_name`→`name`
- `supabase/functions/pupil-login/` — deployed v11; fixed `class_name`→`name` column
- `supabase/functions/pupil-create/` — deployed v2; fixed column names + added school teacher support
- `supabase/migrations/20260518200000_dwp_fix_pupils_schema.sql` — adds DWP columns to `pupils`, changes class_id to UUID
- `scripts/generate-audio.ts` — generates ElevenLabs MP3s; requires `SUPABASE_SERVICE_ROLE_KEY` in `.env`

## Open questions
- Does the `dwp-tts-feedback` Edge Function need redeploying after the bucket creation?
- Should school pupils be able to log in directly on DWP (bypassing Route A from wrife.co.uk)?

---

## Session log

| # | Date | Summary |
|---|------|---------|
| 2 | 2026-05-16 | Fixed ElevenLabs audio pipeline (bucket, script bugs); fixed full DWP auth for teachers + pupils; fixed `classes`/`pupils` schema column name bugs throughout |
| 1 | 2026-05-15 | Built and deployed DWP app — Vercel env vars, Edge Functions, daily prompts seed, SSO tile on wrife.co.uk pupil dashboard |
