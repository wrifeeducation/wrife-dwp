import { supabase } from '@/lib/supabase'
import type { Band } from '@/types/dwp'

export interface AssessmentResult {
  band: Band
  badge: string
  percentage: number
  heading: string
  message: string
  xpEarned: number
  passed: boolean
  seedEarned?: string
}

interface SubmitArgs { levelId: string; submission: unknown; oralRehearsalTranscript?: string; timeSpentSeconds?: number }

async function callAssess(body: Record<string, unknown>): Promise<AssessmentResult> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('unauthenticated')
  const url = `${import.meta.env.VITE_DWP_SUPABASE_URL}/functions/v1/dwp-assess-v2`
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
    body: JSON.stringify(body),
  })
  const data = await resp.json().catch(() => ({ error: 'invalid_response', message: 'Server returned an unexpected response.' }))
  if (!resp.ok) throw new Error(data.message ?? data.error ?? 'Assessment failed.')
  return data as AssessmentResult
}

export async function submitAttempt(args: SubmitArgs): Promise<AssessmentResult> {
  return callAssess({
    mode: 'level',
    level_id: args.levelId,
    submission: args.submission,
    oral_rehearsal_transcript: args.oralRehearsalTranscript,
    time_spent_seconds: args.timeSpentSeconds,
  })
}

export async function submitDailyPrompt(args: { promptId: string; text: string; oralRehearsalTranscript?: string }): Promise<AssessmentResult> {
  return callAssess({
    mode: 'daily_prompt',
    prompt_id: args.promptId,
    submission: { text: args.text },
    oral_rehearsal_transcript: args.oralRehearsalTranscript,
  })
}
