import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { pickDailyPromptForPupil } from '@/lib/progress/promptRotation'

export interface DailyPrompt {
  id: string
  prompt_slug: string
  category: string
  prompt_text: string
}

export function useDailyPrompt() {
  const [prompt, setPrompt] = useState<DailyPrompt | null>(null)
  const [alreadyDoneToday, setAlreadyDoneToday] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancel = false
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { if (!cancel) setLoading(false); return }
      const { data: pupil } = await supabase
        .from('pupils')
        .select('id')
        .eq('auth_user_id', user.id)
        .maybeSingle()
      if (!pupil) { if (!cancel) setLoading(false); return }

      const { data: progress } = await supabase.from('dwp_progress').select('current_level_id').eq('pupil_id', pupil.id).maybeSingle()
      const pupilTier = progress ? deriveTierFromLevelId(progress.current_level_id) : 1

      // Has the pupil already submitted today?
      const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
      const { data: doneToday } = await supabase
        .from('dwp_daily_attempts')
        .select('id')
        .eq('pupil_id', pupil.id)
        .gte('created_at', todayStart.toISOString())
        .limit(1)
      if (doneToday && doneToday.length > 0) {
        if (!cancel) { setAlreadyDoneToday(true); setLoading(false) }
        return
      }

      const picked = await pickDailyPromptForPupil(pupil.id, pupilTier)
      if (!cancel) { setPrompt(picked); setLoading(false) }
    }
    load()
    return () => { cancel = true }
  }, [])

  return { prompt, alreadyDoneToday, loading }
}

function deriveTierFromLevelId(levelId: string): number {
  const m = levelId.match(/^dwp_l(\d+)$/)
  if (!m) return 1
  const n = parseInt(m[1], 10)
  if (n <= 5) return 1
  if (n <= 10) return 2
  if (n <= 17) return 3
  if (n <= 24) return 4
  if (n <= 28) return 5
  if (n <= 33) return 6
  if (n <= 37) return 7
  return 8
}
