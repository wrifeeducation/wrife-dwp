/// <reference lib="deno.ns" />
/**
 * DWP — Edge Function: pupil-create  (v3)
 *
 * Creates a new pupil account and links them to a class via class_members.
 * Compatible with wrife.co.uk's architecture:
 *   - class_members junction table (not pupils.class_id)
 *   - password_hash (bcrypt) field for PIN
 *   - auth email: pupil-{pupilId}@practice.wrife.co.uk
 *   - auth user id = pupil.id so auth.uid() === pupils.id
 *
 * Caller can be: parent (home_accounts), indie teacher (home_accounts),
 *   or school teacher/admin (profiles.role = 'teacher'|'admin').
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'
import * as bcrypt from 'https://esm.sh/bcryptjs@2.4.3'

interface CreateBody {
  class_id?: string
  display_name?: string
  username?: string
  pin?: string         // 4 digits
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

    // Identify caller — check home_accounts first, then profiles (school teachers)
    let callerId: string
    let callerAccountType: string
    let isSchoolAccount = false

    const { data: homeAccount } = await admin
      .from('home_accounts')
      .select('id, account_type')
      .eq('auth_user_id', user.id)
      .maybeSingle()

    if (homeAccount) {
      callerId = homeAccount.id
      callerAccountType = homeAccount.account_type
    } else {
      const { data: profile } = await admin
        .from('profiles')
        .select('id, role')
        .eq('id', user.id)
        .maybeSingle()
      if (!profile || (profile.role !== 'teacher' && profile.role !== 'admin')) {
        return err(403, 'not_account_holder', 'Only parents, teachers, and admins can add pupils.')
      }
      callerId = profile.id
      callerAccountType = profile.role === 'admin' ? 'school_admin' : 'school_teacher'
      isSchoolAccount = true
    }

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
      // Verify caller owns this class
      const { data: cls } = await admin
        .from('classes')
        .select('id, class_code, home_account_id, teacher_id')
        .eq('id', classId)
        .maybeSingle()
      if (!cls) return err(404, 'class_not_found', 'Class not found.')

      const ownsClass = isSchoolAccount
        ? cls.teacher_id === callerId
        : cls.home_account_id === callerId
      if (!ownsClass) return err(403, 'not_class_owner', "You don't own that class.")
      classCode = cls.class_code
    } else if (callerAccountType === 'parent') {
      // Parent path: auto-create or reuse home class
      const { data: existing } = await admin
        .from('classes')
        .select('id, class_code')
        .eq('home_account_id', callerId)
        .eq('account_type', 'home')
        .maybeSingle()
      if (existing) {
        classId = existing.id; classCode = existing.class_code
      } else {
        classCode = generateClassCode()
        const { data: created, error: createErr } = await admin.from('classes').insert({
          class_code: classCode,
          name: 'My Family',
          account_type: 'home',
          home_account_id: callerId,
        }).select('id').single()
        if (createErr || !created) return err(500, 'class_create_failed', createErr?.message ?? 'create failed')
        classId = created.id
      }
    } else {
      return err(400, 'class_id_required', 'Teachers must specify which class to add the pupil to.')
    }

    // Check username uniqueness within the class via class_members
    const { data: members } = await admin
      .from('class_members')
      .select('pupil_id')
      .eq('class_id', classId)
    const memberIds = (members ?? []).map((m: { pupil_id: string }) => m.pupil_id)

    if (memberIds.length > 0) {
      const { data: existingPupil } = await admin
        .from('pupils')
        .select('id')
        .eq('username', username)
        .in('id', memberIds)
        .maybeSingle()
      if (existingPupil) return err(409, 'username_taken', 'Another pupil in this class has that username already.')
    }

    // Pre-generate pupil ID so auth user id === pupils.id
    const pupilId = crypto.randomUUID()
    const authEmail = `pupil-${pupilId}@practice.wrife.co.uk`
    const passwordHash = await bcrypt.hash(pin, 10)
    const tempPassword = randomPassword()

    // Create auth user with explicit id matching pupilId
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      id: pupilId,
      email: authEmail,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { role: 'pupil', display_name: displayName },
    })
    if (createErr || !created.user) return err(500, 'auth_create_failed', createErr?.message ?? 'create failed')

    // Insert pupil row — password_hash holds the bcrypt PIN (matches wrife.co.uk)
    const { data: pupil, error: pupilErr } = await admin.from('pupils').insert({
      id: pupilId,
      auth_user_id: pupilId,
      username,
      display_name: displayName,
      password_hash: passwordHash,
      year_group: yearGroup,
      source: callerAccountType === 'parent' ? 'direct_home' : 'direct_teacher',
    }).select('id, username, display_name, year_group').single()

    if (pupilErr || !pupil) {
      await admin.auth.admin.deleteUser(pupilId)
      return err(500, 'pupil_insert_failed', pupilErr?.message ?? 'insert failed')
    }

    // Link pupil to class via class_members junction table
    const { error: memberErr } = await admin.from('class_members').insert({
      class_id: classId,
      pupil_id: pupilId,
    })
    if (memberErr) {
      await admin.auth.admin.deleteUser(pupilId)
      await admin.from('pupils').delete().eq('id', pupilId)
      return err(500, 'class_member_failed', memberErr.message)
    }

    // Seed initial dwp_progress at L1
    await admin.from('dwp_progress').upsert({
      pupil_id: pupilId,
      class_id: classId,
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
