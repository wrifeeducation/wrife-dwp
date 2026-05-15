# WriFe Daily Writing Practice (DWP)

The third pupil-facing sub-app in the WriFe Education ecosystem, alongside
[PWP Studio](https://pwp-studio.wrife.co.uk) (`wrifeapp` repo) and
[Interactive Practice](https://practice.wrife.co.uk) (`InteractivePracticeApp`
repo). DWP teaches transcription and sentence-construction automaticity through
a 40-level mastery hierarchy, a 365-day prompt rotation, AI-assessed feedback,
oral rehearsal, and an Enchanted Story Garden of Word Seeds.

- **Production URL:** `dailywrite.wrife.co.uk`
- **Stack:** React + Vite + TypeScript + Tailwind + Supabase + Claude (Sonnet) + ElevenLabs
- **Shared Supabase project:** `gzmgjkbtsvezfclmreru` (WriFe Platform)
- **Build plan:** `../WriFe_DWP_Build_Plan_v1.md`
- **Source material:** `../../DWP Bible/`

## Quick start

```bash
cp .env.example .env
# Fill in VITE_SUPABASE_ANON_KEY from the wrife-website project on Supabase
npm install
npm run dev
```

Dev server runs on http://localhost:5174 (PWP Studio uses 5173 by convention).

## Project layout

```
src/
  components/     activity, audio, dashboard, feedback, garden, shell
  pages/          Dashboard, LevelStart, StepPractice, LevelComplete,
                  DailyPrompt, Garden, Login, HomeSignup, TeacherSignup,
                  ParentView, TeacherView, NotFound
  lib/            supabase client + auth/claude/audio/progress/garden/transferGap helpers
  styles/         design tokens + word-class colour table
  types/          generated Supabase types (run `npm run supabase:types`)
supabase/
  migrations/     dwp_* tables (owned by this repo per ecosystem rule)
  functions/      dwp-assess (Claude), dwp-tts-feedback (ElevenLabs)
scripts/          one-off scripts e.g. ElevenLabs MP3 pre-generation
```

## WriFe brand rules this repo follows

1. **Single Supabase project** — all production migrations target `gzmgjkbtsvezfclmreru`.
2. **Table ownership** — this repo owns `dwp_*` tables only. Never alter tables
   owned by `wrife-website` (`classes`, `pupils`, `learning_events`, etc.).
3. **`learning_events` INSERT only** — sub-apps write events; wrife-website reads.
4. **`class_id` nullable** — standalone mode (home learners) must always work.
5. **Route A school pupils** — log in at wrife.co.uk; this sub-app's `/login`
   rejects them and redirects.
6. **`← WriFe` back button** — visible only when entered via hash-token
   (`sessionStorage.entryViaHub === '1'`).
7. **Design system** — follows `wrife-design-world` five signature patterns.
   Never use cream `#FDF8EE` on pupil screens.
8. **Responsive** — fluid typography via `--pwp-text-*` tokens; touch targets
   ≥ `--pwp-touch-min` (44px).

## Build phases

See `../WriFe_DWP_Build_Plan_v1.md` for the full phased plan. In short:

1. ✅ **Phase 1** — Scaffolding (this commit)
2. ⏳ **Phase 2** — Schema & seed data
3. ⏳ **Phase 3** — Core activity engine (Dashboard, LevelStart, StepPractice)
4. ⏳ **Phase 4** — AI assessment route (Edge Function `dwp-assess`)
5. ⏳ **Phase 5** — ElevenLabs audio pipeline + Web Speech mic
6. ⏳ **Phase 6** — 365-day Daily Prompt mode
7. ⏳ **Phase 7** — Story Garden Phase 1 (Meadow biome)
8. ⏳ **Integration** — `wrife-website` tile + Transfer Gap cross-app (after MVP)
9. ⏳ **Pilot prep** — Beta testing, Pilot Starter Pack, MIS exports

## License

Proprietary — © WriFe Education
