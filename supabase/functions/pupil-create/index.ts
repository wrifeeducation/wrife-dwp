/// <reference lib="deno.ns" />
/**
 * DWP — Edge Function: pupil-create
 *
 * Called by an authenticated parent or independent teacher to add a new pupil
 * to one of their classes. Returns the credentials the parent/teacher should
 * display to the child ONCE (class_code + username + plaintext PIN).
 *
 * Flow:
 *   1. Authenticate caller via JWT → look up home_accounts row
 *   2. Verify caller owns the target class (or class auto-creation flow)
 *   3. Hash the PIN with bcrypt
 *   4. Generate synthetic email + random initial password
 *   5. Create auth user via admin.createUser
 *   6. Insert pupils row tied to the new auth user
 *   7. Insert dwp_progress row at L1
 *   8. Return { pupil, class_code }
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'
import * as bcrypt from 'https://esm.sh/bcryptjs@2.4.3'

interface CreateBody {
  class_id?: string                      // optional: for indie teachers picking the class
  display_name?: string
  username?: string
  pin?: string                            // 4 digits
  year_group?: string
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
function randomPassword() {
  const b = new Uint8Array(24); crypto.getRandomValues(b)
  return Array.from(b).map((x) => x.toString(16).padStart(2, '0')).join('')
}
function generateClassCode(): string {
  // Uppercase alphanumeric, ambiguous chars removed
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let out = ''
  const arr = new Uint32Array(8)
  crypto.getRandomValues(arr)
  for (let i = 0; i < 8; i++) out += chars[arr[i] % chars.length]
  return out
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders() })
  if (req.method !== 'POST') return err(405, 'method_not_allowed', 'Use POST.')

  try {
    const url = Deno.env.get('SUPABASE_URL')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const accessToken = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '')
    if (!accessToken) return err(401, 'unauthenticated', 'No bearer token.')

    const admin = createClient(url, serviceKey)
    const { data: { user } } = await admin.auth.getUser(accessToken)
    if (!user) return err(401, 'unauthenticated', 'Invalid session.')

    // Find caller's home_account
    const { data: account } = await admin.from('home_accounts').select('id, account_type').eq('auth_user_id', user.id).maybeSingle()
    if (!account) return err(403, 'not_account_holder', 'Only parents and teachers can add pupils.')

    const body = (await req.json()) as CreateBody
    const username = (body.username ?? '').trim().toLowerCase()
    const displayName = (body.display_name ?? '').trim()
    const pin = (body.pin ?? '').trim()
    const yearGroup = (body.year_group ?? '').trim() || null

    if (!username || !displayName || !pin) return err(400, 'missing_fields', 'display_name, username and pin are required.')
    if (!/^[a-z0-9_]{3,20}$/.test(username)) return err(400, 'username_invalid', 'Username must be 3-20 letters, digits or underscores.')
    if (!/^\d{4}$/.test(pin)) return err(400, 'pin_invalid', 'PIN must be 4 digits.')

    // Identify the target class
    let classId: string | null = body.class_id ?? null
    let classCode: string

    if (classId) {
      // Indie-teacher path: verify caller owns this class
      const { data: cls } = await admin.from('classes').select('id, class_code, owner_id').eq('id', classId).maybeSingle()
      if (!cls || cls.owner_id !== account.id) return err(403, 'not_class_owner', 'You don\'t own that class.')
      classCode = cls.class_code
    } else if (account.account_type === 'parent') {
      // Parent path: auto-create or reuse the home class
      const { data: existing } = await admin.from('classes').select('id, class_code').eq('owner_id', account.id).eq('account_type', 'home').maybeSingle()
      if (existing) {
        classId = existing.id; classCode = existing.class_code
      } else {
        classCode = generateClassCode()
        const { data: created, error: createErr } = await admin.from('classes').insert({
          class_code: classCode,
          class_name: 'My Family',
          account_type: 'home',
          owner_id: account.id,
        }).select('id').single()
        if (createErr || !created) return err(500, 'class_create_failed', createErr?.message ?? 'create failed')
        classId = created.id
      }
    } else {
      return err(400, 'class_id_required', 'Teachers must specify which class to add the pupil to.')
    }

    // Check username uniqueness within the class
    const { data: existingPupil } = await admin.from('pupils').select('id').eq('class_id', classId).eq('username', username).maybeSingle()
    if (existingPupil) return err(409, 'username_taken', 'Another pupil in this class has that username already.')

    // Mint auth user
    const pinHash = await bcrypt.hash(pin, 10)
    const tempPassword = randomPassword()

    // Reserve an auth_email — use a temp UUID since the pupil row doesn't exist yet
    const tempId = crypto.randomUUID()
    const authEmail = `pupil-${tempId.slice(0, 8)}@dwp-internal.wrife.co.uk`

    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email: authEmail,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { role: 'pupil', display_name: displayName },
    })
    if (createErr || !created.user) return err(500, 'auth_create_failed', createErr?.message ?? 'create failed')

    // Use the auth user's UUID as the pupil's id so RLS auth.uid() comparisons work directly
    const { data: pupil, error: pupilErr } = await admin.from('pupils').insert({
      id: created.user.id,
      auth_user_id: created.user.id,
      auth_email: authEmail,
      class_id: classId,
      username,
      display_name: displayName,
      pin_hash: pinHash,
      year_group: yearGroup,
      source: account.account_type === 'parent' ? 'direct_home' : 'direct_teacher',
    }).select('id, username, display_name, class_id, year_group').single()
    if (pupilErr || !pupil) {
      // Roll back the auth user if pupil insert fails
      await admin.auth.admin.deleteUser(created.user.id)
      return err(500, 'pupil_insert_failed', pupilErr?.message ?? 'insert failed')
    }

    // Seed initial dwp_progress at L1
    await admin.from('dwp_progress').upsert({
      pupil_id: pupil.id,
      class_id: pupil.class_id,
      current_level_id: 'dwp_l1',
    }, { onConflict: 'pupil_id' })

    return new Response(JSON.stringify({
      pupil: { ...pupil },
      credentials: { class_code: classCode, username: pupil.username, pin },
    }), { headers: corsHeaders() })
  } catch (e) {
    return err(500, 'internal', String(e))
  }
})
