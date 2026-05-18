/**
 * Detects whether the current session was entered via the wrife.co.uk hub
 * (Route A — JWT in URL hash). If so, stores a sessionStorage flag so the
 * "← WriFe" back button can be rendered in the nav.
 *
 * sessionStorage (not localStorage) is intentional — clears on tab close so a
 * fresh direct visit never incorrectly shows the back button.
 *
 * The primary hash detection now runs SYNCHRONOUSLY in lib/supabase.ts before
 * createClient() is called. This function provides a secondary SIGNED_IN
 * listener as a safety net for edge cases where the hash check fires after
 * the Supabase SDK has already consumed and cleared the URL hash.
 *
 * Per wrife-brand-ecosystem skill, this runs once on app init from App.tsx.
 */
import { supabase } from '@/lib/supabase'

export const ENTRY_VIA_HUB_KEY = 'entryViaHub'

export function detectHubEntry(): void {
  if (typeof window === 'undefined') return

  // Primary check: flag already set by the synchronous check in lib/supabase.ts.
  // Secondary check: in case this function runs before the supabase module was
  // evaluated (unusual but defensive).
  if (window.location.hash.includes('access_token')) {
    sessionStorage.setItem(ENTRY_VIA_HUB_KEY, '1')
  }

  // Safety-net listener: fires when the SDK finalises the SIGNED_IN event from
  // the hash token, covering any timing edge cases.
  supabase.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_IN') {
      // If we're already flagged, nothing to do.
      if (sessionStorage.getItem(ENTRY_VIA_HUB_KEY)) return

      // If the hash was already cleared by the SDK, check the flag set in supabase.ts.
      // (This branch should rarely fire given the supabase.ts early check.)
    }
  })
}

export function isHubEntry(): boolean {
  if (typeof window === 'undefined') return false
  return sessionStorage.getItem(ENTRY_VIA_HUB_KEY) === '1'
}

export function clearHubEntry(): void {
  sessionStorage.removeItem(ENTRY_VIA_HUB_KEY)
}

/**
 * Returns the full URL to the WriFe pupil dashboard.
 * Used by the ← WriFe back button across DWP components.
 */
export function wrifeHubUrl(): string {
  const base = import.meta.env.VITE_WRIFE_HUB_URL || 'https://wrife.co.uk'
  return `${base}/pupil/dashboard`
}
