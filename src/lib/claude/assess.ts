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

interface SubmitArgs {
  levelId: string
  submission: unknown
  oralRehearsalTranscript?: string
  timeSpentSeconds?: number
}

/**
 * Calls the dwp-assess Edge Function for a level attempt.
 * Returns a normalized result for the UI. The Edge Function itself handles
 * Claude integration, dwp_attempts insert, progress update, and seed earn.
 */
export async function submitAttempt(args: SubmitArgs): Promise<AssessmentResult> {
  const { data, error } = await supabase.functions.invoke('dwp-assess', {
    body: {
      mode: 'level',
      level_id: args.levelId,
      submission: args.submission,
      oral_rehearsal_transcript: args.oralRehearsalTranscript,
      time_spent_seconds: args.timeSpentSeconds,
    },
  })
  if (error) throw error
  return data as AssessmentResult
}

/** Same Edge Function, daily-prompt mode. */
export async function submitDailyPrompt(args: { promptId: string; text: string; oralRehearsalTranscript?: string }): Promise<AssessmentResult> {
  const { data, error } = await supabase.functions.invoke('dwp-assess', {
    body: {
      mode: 'daily_prompt',
      prompt_id: args.promptId,
      submission: { text: args.text },
      oral_rehearsal_transcript: args.oralRehearsalTranscript,
    },
  })
  if (error) throw error
  return data as AssessmentResult
}
