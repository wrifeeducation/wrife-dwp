import { supabase } from '@/lib/supabase'

export interface PupilSessionResult {
  pupil: {
    id: string
    display_name: string
    username: string
    class_id: string
    class_name: string
    class_code: string
    year_group: string | null
    source: 'direct_home' | 'direct_teacher' | 'wrife_hub'
  }
}

export class PupilLoginError extends Error {
  constructor(public code: string, message: string) { super(message); this.name = 'PupilLoginError' }
}

/**
 * Call the pupil-login Edge Function, validate the response, and set the
 * Supabase session so subsequent supabase.from() queries are authed as the
 * pupil's auth user.
 */
export async function pupilLogin(args: { classCode: string; username: string; pin: string }): Promise<PupilSessionResult> {
  const url = `${import.meta.env.VITE_DWP_SUPABASE_URL}/functions/v1/pupil-login`
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': import.meta.env.VITE_DWP_SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${import.meta.env.VITE_DWP_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      class_code: args.classCode,
      username: args.username,
      pin: args.pin,
    }),
  })
  const data = await resp.json()
  if (!resp.ok) {
    throw new PupilLoginError(data.error ?? 'unknown', data.message ?? 'Login failed.')
  }
  const { error: sessionError } = await supabase.auth.setSession({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
  })
  if (sessionError) {
    throw new PupilLoginError('session_set_failed', sessionError.message)
  }
  return { pupil: data.pupil }
}
