/// <reference lib="deno.ns" />
/**
 * DWP — Edge Function: pupil-login (v16)
 *
 * Handles Route B direct login for ALL pupil types.
 *
 * PIN verification handles two formats:
 *   1. Bcrypt hash (starts with $2a/$2b, length 60)
 *   2. Plaintext 4-digit PIN (school pupils from wrife.co.uk with plain storage)
 * On successful plaintext login the hash is silently upgraded to bcrypt (hashSync).
 *
 * Auth email: pupil-{pupil.id}@practice.wrife.co.uk
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
function isBcryptHash(value: string): boolean {
  return (value.startsWith('$2a$') || value.startsWith('$2b$')) && value.length >= 60
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders() })
  if (req.method !== 'POST') return err(405, 'method_not_allowed', 'Use POST.')

  try {
    const url = Deno.env.get('SUPABASE_URL')!
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const admin = createClient(url, serviceKey)

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

    // 1. Find the class
    const { data: classRow, error: classErr } = await admin
      .from('classes')
      .select('id, name, account_type')
      .eq('class_code', classCode)
      .maybeSingle()
    if (classErr) return err(500, 'db_error', classErr.message)
    if (!classRow) return err(401, 'invalid_credentials', 'Class code, username, or PIN is incorrect.')

    // 2. Get pupil IDs in this class via class_members
    const { data: members, error: membersErr } = await admin
      .from('class_members')
      .select('pupil_id')
      .eq('class_id', classRow.id)
    if (membersErr) return err(500, 'db_error', membersErr.message)
    const memberIds = (members ?? []).map((m: { pupil_id: string }) => m.pupil_id)
    if (memberIds.length === 0) return err(401, 'invalid_credentials', 'Class code, username, or PIN is incorrect.')

    // 3. Find the pupil by username within this class
    const { data: pupil, error: pupilErr } = await admin
      .from('pupils')
      .select('id, display_name, first_name, username, password_hash, pin_hash, auth_user_id, year_group, source')
      .eq('username', username)
      .in('id', memberIds)
      .maybeSingle()
    if (pupilErr) return err(500, 'db_error', pupilErr.message)
    if (!pupil) return err(401, 'invalid_credentials', 'Class code, username, or PIN is incorrect.')

    // 4. Verify PIN — bcrypt hash or plaintext fallback
    const hashToVerify = pupil.password_hash ?? pupil.pin_hash
    if (!hashToVerify) return err(401, 'invalid_credentials', 'Class code, username, or PIN is incorrect.')

    let pinValid = false
    let needsHashUpgrade = false

    if (isBcryptHash(hashToVerify)) {
      pinValid = await bcrypt.compare(pin, hashToVerify)
    } else {
      // Plaintext PIN stored directly (school pupils imported from wrife.co.uk)
      pinValid = (pin === hashToVerify)
      if (pinValid) needsHashUpgrade = true
    }

    if (!pinValid) return err(401, 'invalid_credentials', 'Class code, username, or PIN is incorrect.')

    // 5. Ensure auth user exists
    const authEmail = `pupil-${pupil.id}@practice.wrife.co.uk`
    let authUserId = pupil.auth_user_id as string | null

    if (!authUserId) {
      const initialPass = generateRandomPassword()
      const displayName = pupil.display_name ?? pupil.first_name ?? username
      const { data: created, error: createErr } = await admin.auth.admin.createUser({
        id: pupil.id,
        email: authEmail,
        password: initialPass,
        email_confirm: true,
        user_metadata: { role: 'pupil', pupil_id: pupil.id, display_name: displayName },
      })
      if (createErr && !createErr.message?.toLowerCase().includes('already')) {
        return err(500, 'auth_create_failed', createErr.message)
      }
      authUserId = created?.user?.id ?? pupil.id
      await admin.from('pupils').update({ auth_user_id: authUserId }).eq('id', pupil.id)
    }

    // 6. Rotate password to mint a fresh session
    const sessionPassword = generateRandomPassword()
    const { error: updErr } = await admin.auth.admin.updateUserById(authUserId!, { password: sessionPassword })
    if (updErr) return err(500, 'auth_update_failed', updErr.message)

    const userClient = createClient(url, anonKey)
    const { data: signInData, error: signInErr } = await userClient.auth.signInWithPassword({
      email: authEmail,
      password: sessionPassword,
    })
    if (signInErr || !signInData.session) {
      return err(500, 'auth_signin_failed', signInErr?.message ?? 'sign-in failed')
    }

    // 7. Upgrade plaintext PIN to bcrypt (non-blocking, best-effort)
    if (needsHashUpgrade) {
      try {
        const newHash = bcrypt.hashSync(pin, 10)
        await admin.from('pupils').update({ password_hash: newHash }).eq('id', pupil.id)
      } catch (_e) { /* non-fatal — next login will upgrade again */ }
    }

    // 8. Ensure dwp_progress row exists
    await admin.from('dwp_progress').upsert({
      pupil_id: pupil.id,
      class_id: classRow.id,
      current_level_id: 'dwp_l1',
    }, { onConflict: 'pupil_id', ignoreDuplicates: true })

    return new Response(JSON.stringify({
      session: {
        access_token: signInData.session.access_token,
        refresh_token: signInData.session.refresh_token,
        expires_at: signInData.session.expires_at,
        expires_in: signInData.session.expires_in,
        token_type: signInData.session.token_type,
      },
      pupil: {
        id: pupil.id,
        display_name: pupil.display_name ?? pupil.first_name ?? username,
        username: pupil.username,
        class_id: classRow.id,
        class_name: classRow.name,
        class_code: classCode,
        year_group: pupil.year_group,
        source: pupil.source ?? 'school',
      },
    }), { headers: corsHeaders() })
  } catch (e) {
    console.error('[pupil-login] unhandled error:', e)
    return err(500, 'internal', String(e))
  }
})
