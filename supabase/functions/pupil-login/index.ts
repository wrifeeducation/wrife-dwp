/// <reference lib="deno.ns" />
/**
 * DWP — Edge Function: pupil-login
 *
 * Authenticates a pupil via the Route B credential triplet (class_code +
 * username + 4-digit PIN) and returns a fully-functional Supabase Auth
 * session that the client can pass to supabase.auth.setSession().
 *
 * Why this exists:
 *   Pupils don't have email addresses, so they can't use Supabase's standard
 *   email/password sign-in. But we still want a real Supabase session so that:
 *     - RLS policies that reference auth.uid() Just Work
 *     - Edge Functions can verify the caller via supabase.auth.getUser()
 *     - The future wrife.co.uk SSO bridge has a session model to bind to
 *
 * How it works:
 *   1. Look up classes.id by class_code (case-insensitive)
 *   2. Look up pupils row by (class_id, username) — selecting pin_hash, auth_user_id, auth_email
 *   3. Verify PIN via bcrypt.compare against pin_hash
 *   4. Generate a fresh random password (32 chars)
 *   5. admin.updateUserById sets that password on the pupil's auth user
 *   6. signInWithPassword to mint a session
 *   7. Return { session, pupil }
 *
 * Rate-limiting note: not implemented in this MVP. Add per-IP throttling
 * before pilot if pupils' PINs are guessable.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'
import * as bcrypt from 'https://esm.sh/bcryptjs@2.4.3'

interface LoginBody {
  class_code?: string
  username?: string
  pin?: string
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, content-type',
    'Content-Type': 'application/json',
  }
}

function err(status: number, code: string, message: string) {
  return new Response(JSON.stringify({ error: code, message }), { status, headers: corsHeaders() })
}

function generateRandomPassword(): string {
  const bytes = new Uint8Array(24)
  crypto.getRandomValues(bytes)
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('')
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders() })
  if (req.method !== 'POST') return err(405, 'method_not_allowed', 'Use POST.')

  try {
    const url = Deno.env.get('SUPABASE_URL')!
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const body = (await req.json()) as LoginBody
    const classCode = (body.class_code ?? '').trim().toUpperCase()
    const username = (body.username ?? '').trim().toLowerCase()
    const pin = (body.pin ?? '').trim()

    if (!classCode || !username || !pin) {
      return err(400, 'missing_fields', 'class_code, username and pin are all required.')
    }
    if (!/^\d{4}$/.test(pin)) {
      return err(400, 'pin_invalid', 'PIN must be 4 digits.')
    }

    const admin = createClient(url, serviceKey)

    // 1. Find the class by code
    const { data: classRow, error: classErr } = await admin
      .from('classes')
      .select('id, class_name, account_type')
      .eq('class_code', classCode)
      .maybeSingle()
    if (classErr) return err(500, 'db_error', classErr.message)
    if (!classRow) {
      // Constant-time-ish — same message for any failed login to avoid leaking which field was wrong
      return err(401, 'invalid_credentials', 'Class code, username, or PIN is incorrect.')
    }

    // 2. Find the pupil by (class_id, username)
    const { data: pupil, error: pupilErr } = await admin
      .from('pupils')
      .select('id, display_name, username, pin_hash, auth_user_id, auth_email, class_id, year_group, source')
      .eq('class_id', classRow.id)
      .eq('username', username)
      .maybeSingle()
    if (pupilErr) return err(500, 'db_error', pupilErr.message)
    if (!pupil) {
      return err(401, 'invalid_credentials', 'Class code, username, or PIN is incorrect.')
    }

    // 3. Verify PIN
    const pinValid = await bcrypt.compare(pin, pupil.pin_hash)
    if (!pinValid) {
      return err(401, 'invalid_credentials', 'Class code, username, or PIN is incorrect.')
    }

    // 4. Make sure the pupil has an auth user. If they don't (legacy / seed
    //    data), create one on the fly so direct login still works.
    let authUserId = pupil.auth_user_id as string | null
    let authEmail = pupil.auth_email as string | null

    if (!authUserId || !authEmail) {
      authEmail = `pupil-${(pupil.id as string).slice(0, 8)}@dwp-internal.wrife.co.uk`
      const initialPass = generateRandomPassword()
      const { data: created, error: createErr } = await admin.auth.admin.createUser({
        email: authEmail,
        password: initialPass,
        email_confirm: true,
        user_metadata: { role: 'pupil', pupil_id: pupil.id, display_name: pupil.display_name },
      })
      if (createErr || !created.user) return err(500, 'auth_create_failed', createErr?.message ?? 'create failed')
      authUserId = created.user.id
      await admin.from('pupils').update({ auth_user_id: authUserId, auth_email: authEmail }).eq('id', pupil.id)
    }

    // 5. Rotate the auth user's password so the next signInWithPassword call works
    const sessionPassword = generateRandomPassword()
    const { error: updErr } = await admin.auth.admin.updateUserById(authUserId!, {
      password: sessionPassword,
    })
    if (updErr) return err(500, 'auth_update_failed', updErr.message)

    // 6. Sign in with that fresh password to mint a session
    const userClient = createClient(url, anonKey)
    const { data: signInData, error: signInErr } = await userClient.auth.signInWithPassword({
      email: authEmail!,
      password: sessionPassword,
    })
    if (signInErr || !signInData.session) {
      return err(500, 'auth_signin_failed', signInErr?.message ?? 'sign-in failed')
    }

    return new Response(
      JSON.stringify({
        session: {
          access_token: signInData.session.access_token,
          refresh_token: signInData.session.refresh_token,
          expires_at: signInData.session.expires_at,
          expires_in: signInData.session.expires_in,
          token_type: signInData.session.token_type,
        },
        pupil: {
          id: pupil.id,
          display_name: pupil.display_name,
          username: pupil.username,
          class_id: pupil.class_id,
          class_name: classRow.class_name,
          class_code: classCode,
          year_group: pupil.year_group,
          source: pupil.source,
        },
      }),
      { headers: corsHeaders() }
    )
  } catch (e) {
    return err(500, 'internal', String(e))
  }
})
