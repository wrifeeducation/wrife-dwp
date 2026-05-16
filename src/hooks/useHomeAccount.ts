import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export type AccountType = 'parent' | 'independent_teacher' | 'school_teacher' | 'school_admin'

export interface HomeAccount {
  id: string
  auth_user_id: string
  account_type: AccountType
  display_name: string
  email: string
  subscription_status: string
  subscription_tier: string | null
  /** True when the account comes from `profiles` (school teacher/admin) rather than `home_accounts` */
  isSchoolAccount: boolean
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

      // 1. Try home_accounts first (parents + independent teachers)
      const { data: homeData, error: homeErr } = await supabase
        .from('home_accounts').select('*').eq('auth_user_id', user.id).maybeSingle()
      if (cancelled) return
      if (homeErr) { setError(homeErr); setLoading(false); return }

      if (homeData) {
        setAccount({ ...(homeData as Omit<HomeAccount, 'isSchoolAccount'>), isSchoolAccount: false })
        setLoading(false)
        return
      }

      // 2. Fallback: check profiles for school teachers / admins
      const { data: profileData, error: profileErr } = await supabase
        .from('profiles').select('id, role, display_name, email').eq('id', user.id).maybeSingle()
      if (cancelled) return
      if (profileErr) { setError(profileErr); setLoading(false); return }

      if (profileData && (profileData.role === 'teacher' || profileData.role === 'admin')) {
        setAccount({
          id: profileData.id,
          auth_user_id: user.id,
          account_type: profileData.role === 'admin' ? 'school_admin' : 'school_teacher',
          display_name: profileData.display_name ?? profileData.email ?? 'Teacher',
          email: profileData.email ?? '',
          subscription_status: 'school',
          subscription_tier: null,
          isSchoolAccount: true,
        })
      } else {
        setAccount(null)
      }
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  return { account, loading, error }
}
