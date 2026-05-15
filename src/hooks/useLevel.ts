import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { DwpLevel } from '@/types/dwp'

export function useLevel(levelId: string | undefined) {
  const [level, setLevel] = useState<DwpLevel | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!levelId) { setLoading(false); return }
    let cancel = false
    setLoading(true)
    supabase
      .from('dwp_levels')
      .select('*')
      .eq('level_id', levelId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancel) return
        if (error) setError(error)
        else setLevel(data as DwpLevel | null)
        setLoading(false)
      })
    return () => { cancel = true }
  }, [levelId])

  return { level, error, loading }
}
