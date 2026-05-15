import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { DwpProgress } from '@/types/dwp'

export function useProgress() {
  const [progress, setProgress] = useState<DwpProgress | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancel = false
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { if (!cancel) { setLoading(false); setProgress(null) } ; return }

      // Look up the DWP pupil row for this auth user
      const { data: pupil } = await supabase
        .from('pupils').select('id').eq('auth_user_id', user.id).maybeSingle()
      if (!pupil) { if (!cancel) { setLoading(false); setProgress(null) }; return }

      const { data, error } = await supabase
        .from('dwp_progress')
        .select('*')
        .eq('pupil_id', pupil.id)
        .maybeSingle()
      if (cancel) return
      if (error) setError(error)
      else setProgress(data as DwpProgress | null)
      setLoading(false)
    }
    load()
    return () => { cancel = true }
  }, [])

  return { progress, error, loading }
}
