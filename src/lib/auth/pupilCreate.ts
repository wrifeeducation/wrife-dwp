import { supabase } from '@/lib/supabase'

export interface PupilCreateResult {
  pupil: { id: string; username: string; display_name: string; class_id: string; year_group: string | null }
  credentials: { class_code: string; username: string; pin: string }
}

export class PupilCreateError extends Error {
  constructor(public code: string, message: string) { super(message); this.name = 'PupilCreateError' }
}

export async function createPupil(args: {
  classId?: string
  displayName: string
  username: string
  pin: string
  yearGroup?: string
}): Promise<PupilCreateResult> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new PupilCreateError('unauthenticated', 'Please sign in first.')

  const url = `${import.meta.env.VITE_DWP_SUPABASE_URL}/functions/v1/pupil-create`
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': import.meta.env.VITE_DWP_SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      class_id: args.classId,
      display_name: args.displayName,
      username: args.username,
      pin: args.pin,
      year_group: args.yearGroup,
    }),
  })
  const data = await resp.json()
  if (!resp.ok) throw new PupilCreateError(data.error ?? 'unknown', data.message ?? 'Could not create pupil.')
  return data as PupilCreateResult
}
