import { supabase } from '@/lib/supabase'

interface PromptRow {
  id: string
  prompt_slug: string
  category: string
  prompt_text: string
  target_tier_min: number
  target_tier_max: number
}

const WEEKLY_CATEGORY_BY_DAY: Record<number, string[]> = {
  // 0 = Sunday … 6 = Saturday — per Bible Section 5
  0: ['reflection'],                                  // Sunday
  1: ['narrative'],                                   // Monday
  2: ['sensory'],                                     // Tuesday
  3: ['description'],                                 // Wednesday
  4: ['narrative'],                                   // Thursday
  5: ['argument'],                                    // Friday
  6: ['sensory'],                                     // Saturday
}

/**
 * Pick today's prompt for this pupil.
 *
 * Rules per Bible Section 5:
 *  - No repeat within 90 days for this pupil
 *  - Balance categories across the week (today's day-of-week → expected category)
 *  - Tier-band aware: pupils still on Tier 1 don't get Argument-heavy prompts
 *
 * If the day's preferred category has no fresh prompts left, falls back to the
 * next category that does.
 */
export async function pickDailyPromptForPupil(pupilId: string, pupilTier: number): Promise<PromptRow | null> {
  const today = new Date()
  const expectedCategories = WEEKLY_CATEGORY_BY_DAY[today.getDay()] ?? ['narrative']
  // Tier-band guard: skip 'argument' for Tier 1-2 pupils, skip 'reflection' for Tier 1
  const allowedCategories = expectedCategories.filter((cat) => {
    if (cat === 'argument' && pupilTier < 5) return false
    if (cat === 'reflection' && pupilTier < 4) return false
    return true
  })
  const finalCategories = allowedCategories.length ? allowedCategories : ['narrative']

  // Get prompts used in last 90 days for no-repeat
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
  const { data: recent } = await supabase
    .from('dwp_daily_attempts')
    .select('prompt_id')
    .eq('pupil_id', pupilId)
    .gte('created_at', ninetyDaysAgo)
  const usedIds = new Set((recent ?? []).map((r: any) => r.prompt_id as string))

  // Try each preferred category in order
  for (const cat of finalCategories) {
    const { data: candidates } = await supabase
      .from('dwp_daily_prompts')
      .select('id, prompt_slug, category, prompt_text, target_tier_min, target_tier_max')
      .eq('category', cat)
      .lte('target_tier_min', pupilTier)
      .gte('target_tier_max', pupilTier)
    const fresh = (candidates ?? []).filter((p: any) => !usedIds.has(p.id))
    if (fresh.length > 0) {
      // Deterministic-ish pick: based on day of year + pupil_id hash, so same
      // pupil gets the same prompt if they revisit the page same day.
      const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000)
      const hash = simpleHash(pupilId + dayOfYear)
      return fresh[hash % fresh.length] as PromptRow
    }
  }
  return null
}

function simpleHash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) { h = (h * 31 + s.charCodeAt(i)) | 0 }
  return Math.abs(h)
}
