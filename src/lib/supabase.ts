import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

const url = import.meta.env.VITE_DWP_SUPABASE_URL
const anonKey = import.meta.env.VITE_DWP_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  throw new Error(
    'Missing VITE_DWP_SUPABASE_URL or VITE_DWP_SUPABASE_ANON_KEY. ' +
    'Copy .env.example to .env and fill in values from the DWP-specific Supabase project.'
  )
}

/**
 * Single Supabase client for the DWP sub-app.
 *
 * Target: DWP's OWN Supabase project (separate from PWP, IP, wrife.co.uk).
 * DWP is a standalone product with its own auth, pupil registry, and tables.
 *
 * detectSessionInUrl: true is REQUIRED for Route A hash-token auto-detection.
 * The hash-token will be minted by the wrife.co.uk → DWP bridge Edge Function
 * once the SSO bridge is built (post-MVP integration phase).
 */
export const supabase = createClient<Database>(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
})
