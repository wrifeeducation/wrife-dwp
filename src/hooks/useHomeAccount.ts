import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export interface HomeAccount {
  id: string
  auth_user_id: string
  account_type: 'parent' | 'independent_teacher'
  display_name: string
  email: string
  subscription_status: string
  subscription_tier: string | null
}

export function useHomeAccount() {
  const [account, setAccount] = useState<HomeAccount | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { if (!cancelled) { setLoading(false); setAccount(null) } ; return }
      const { data, error } = await supabase
        .from('home_accounts').select('*').eq('auth_user_id', user.id).maybeSingle()
      if (cancelled) return
      if (error) setError(error)
      else setAccount(data as HomeAccount | null)
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  return { account, loading, error }
}
