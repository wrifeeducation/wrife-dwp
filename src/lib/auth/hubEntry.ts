/**
 * Detects whether the current session was entered via the wrife.co.uk hub
 * (Route A — JWT in URL hash). If so, stores a sessionStorage flag so the
 * "← WriFe" back button can be rendered in the nav.
 *
 * sessionStorage (not localStorage) is intentional — clears on tab close so a
 * fresh direct visit never incorrectly shows the back button.
 *
 * Per wrife-brand-ecosystem skill, this runs once on app init from App.tsx.
 * The Supabase SDK itself auto-detects the hash and calls setSession() because
 * detectSessionInUrl: true is set in lib/supabase.ts.
 */
import { supabase } from '@/lib/supabase'

export const ENTRY_VIA_HUB_KEY = 'entryViaHub'

export function detectHubEntry(): void {
  // If the hash already contains an access_token at app boot, this is Route A.
  // Set the flag immediately — Supabase will handle the actual session swap.
  if (typeof window === 'undefined') return

  const hasHashToken =
    window.location.hash.includes('access_token') ||
    window.location.hash.includes('#access_token')

  if (hasHashToken) {
    sessionStorage.setItem(ENTRY_VIA_HUB_KEY, '1')
  }

  // Listen for the SIGNED_IN event triggered by detectSessionInUrl, so even
  // if React mounts before the hash is consumed, we still catch the entry.
  supabase.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_IN' && window.location.hash.includes('access_token')) {
      sessionStorage.setItem(ENTRY_VIA_HUB_KEY, '1')
      // Strip the hash from the URL so it doesn't reappear on refresh
      window.history.replaceState(null, '', window.location.pathname + window.location.search)
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

export function wrifeHubUrl(): string {
  return import.meta.env.VITE_WRIFE_HUB_URL || 'https://wrife.co.uk'
}
