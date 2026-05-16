# WriFe DWP (Daily Writing Practice)
*Last updated: 2026-05-16 · Session 4*

## Current state
`dailywrite.wrife.co.uk` is fully operational. Pupil login (Route B) works for all pupil types. Audio is live — all 405 ElevenLabs MP3s (365 daily prompts + 40 level intros) are uploaded to the `dwp-audio` Supabase Storage bucket and confirmed playing at HTTP 200. Esma K (Silver Birch) tested end-to-end: login → level 1 intro audio plays. Direct sign-up routes exist for home learners (Route C) and independent teachers (Route D) but have no Stripe paywall yet.

## Next steps
1. **Add Stripe paywall to Route C/D sign-up** — `/home-signup` and `/teacher-signup` currently create accounts with no payment; add Stripe checkout before account creation completes
2. **Commit and push v19 Edge Function** — `git add supabase/functions/pupil-login/index.ts && git commit -m "fix(pupil-login): v19 — default bcrypt import" && git push origin main`
3. **Add DWP SSO tile to wrife.co.uk teacher dashboard** — school teachers have no tile to reach DWP from the hub
4. **Apply pending wrife-website migrations** — `20260511_school_registrations.sql` and `20260511000001_ai_attempts.sql`

## Key decisions
- **`import * as bcrypt` is broken on esm.sh:** Namespace import does not expose `compareSync`, `compare`, or `hashSync`. Always use: `import bcrypt from 'https://esm.sh/bcryptjs@2.4.3'` in Edge Functions.
- **Route B confirmed for all pupil types:** School pupils, home learners, and independent teacher pupils all log in directly on DWP. Ecosystem skill updated.
- **Audio files must be manually uploaded to Supabase Storage:** `public/audio/` is git-ignored; `generate-audio.ts` uses local cache as done-marker so re-runs skip uploads. Use `scripts/upload-audio-to-storage.mjs` to push to bucket. Run with `node scripts/upload-audio-to-storage.mjs` from project root.
- **`pupils` lookup via `class_members`:** `pupils.class_id` is NULL for school pupils. Pupil-login finds them via `class_members` junction table.
- **Two PIN formats in DB:** 9 Silver Birch pupils have bcrypt hashes; 16 have plaintext 4-digit PINs (legacy import). v19 handles both, upgrades plaintext to bcrypt on first login.
- **Shared Supabase project:** DWP uses `gzmgjkbtsvezfclmreru` — NOT its own project.
- **No Stripe paywall yet:** Route C/D sign-up creates free accounts. This is a known gap.

## Files & locations
- `supabase/functions/pupil-login/index.ts` — v19 deployed; default bcrypt import, handles bcrypt + plaintext PINs
- `scripts/upload-audio-to-storage.mjs` — uploads all MP3s from `public/audio/` to `dwp-audio` bucket; reads from `.env` or `.env.local`
- `src/lib/audio/tts.ts` — builds Supabase Storage public URLs; `levelIntroUrl(levelId)` and `dailyPromptUrl(slug)`
- `src/components/audio/TTSPlayer.tsx` — plays audio via `new Audio(src)`; was correct all along, just had no files
- `src/pages/HomeSignup.tsx` / `src/pages/TeacherSignup.tsx` — Route C/D sign-up (no paywall yet)
- `supabase/migrations/20260518200000_dwp_fix_pupils_schema.sql` — adds DWP columns to shared `pupils` table

## Open questions
- Does wrife.co.uk populate `class_members` for every new pupil added to a class? (DWP Route B depends on it.)
- `dwp-tts-feedback` Edge Function — does it still need a redeploy?

---

## Session log

| # | Date | Summary |
|---|------|---------|
| 4 | 2026-05-16 | Fixed audio: uploaded 405 MP3s to dwp-audio Supabase bucket via upload script; confirmed HTTP 200 + audio plays live for Esma K / Silver Birch |
| 3 | 2026-05-16 | Diagnosed and fixed bcrypt bug in pupil-login (v19): `import * as bcrypt` silently breaks all bcrypt calls on esm.sh; switched to default import |
| 2 | 2026-05-16 | Fixed ElevenLabs audio pipeline; fixed full DWP auth for teachers + pupils; fixed schema column name bugs |
| 1 | 2026-05-15 | Built and deployed DWP — Vercel env vars, Edge Functions, daily prompts seed, SSO tile on wrife.co.uk pupil dashboard |
