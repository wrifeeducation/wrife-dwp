import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  throw new Error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. ' +
    'Copy .env.example to .env.local and fill in values from the shared WriFe Platform ' +
    'Supabase project (gzmgjkbtsvezfclmreru). All WriFe sub-apps share one project.'
  )
}

// ── Route A (school hub SSO) detection ──────────────────────────────────────
// School pupils arrive via: https://dailywrite.wrife.co.uk#access_token=...
// We MUST read the hash BEFORE createClient() is called — the Supabase SDK
// processes and clears the hash asynchronously on init, creating a race
// condition if we check later (e.g. in useEffect). Read it synchronously here.
// sessionStorage clears on tab close so a fresh direct visit never shows the
// ← WriFe back button.
if (typeof window !== 'undefined' && window.location.hash.includes('access_token=')) {
  sessionStorage.setItem('entryViaHub', '1')
}

/**
 * Single Supabase client for the DWP sub-app.
 *
 * Target: gzmgjkbtsvezfclmreru — the SHARED WriFe Platform Supabase project.
 * All WriFe sub-apps (PWP Studio, Interactive Practice, Daily Writing) share
 * one Supabase instance so that:
 *   - Route A hash-tokens minted by wrife.co.uk authenticate directly here
 *   - The `pupils`, `classes`, and `home_accounts` tables are shared
 *   - `learning_events` written here are readable by wrife.co.uk teacher views
 *
 * detectSessionInUrl: true is REQUIRED for Route A hash-token auto-detection.
 * When a school pupil arrives from wrife.co.uk with a JWT in the URL hash,
 * the Supabase SDK detects it automatically and calls setSession().
 *
 * flowType is intentionally NOT set to 'pkce' — PKCE flow expects a ?code=
 * parameter, not an #access_token= hash. The Route A SSO uses the implicit
 * hash token format, which is incompatible with PKCE mode.
 */
export const supabase = createClient<Database>(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})
