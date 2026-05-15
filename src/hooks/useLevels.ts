import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { DwpLevel } from '@/types/dwp'

export function useLevels() {
  const [levels, setLevels] = useState<DwpLevel[] | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancel = false
    setLoading(true)
    supabase
      .from('dwp_levels')
      .select('*')
      .order('display_order', { ascending: true })
      .then(({ data, error }) => {
        if (cancel) return
        if (error) setError(error)
        else setLevels(data as DwpLevel[])
        setLoading(false)
      })
    return () => { cancel = true }
  }, [])

  return { levels, error, loading }
}
