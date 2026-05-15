import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Session } from '@supabase/supabase-js'

export type Role = 'pupil' | 'parent' | 'independent_teacher' | 'unknown'

export interface SessionInfo {
  session: Session | null
  role: Role
  loading: boolean
}

export function useSession(): SessionInfo {
  const [session, setSession] = useState<Session | null>(null)
  const [role, setRole] = useState<Role>('unknown')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function resolveRole(s: Session | null) {
      if (!s) { setRole('unknown'); setLoading(false); return }
      const fromMeta = s.user.user_metadata?.role as Role | undefined
      if (fromMeta) { setRole(fromMeta); setLoading(false); return }
      // Fallback: query home_accounts
      const { data: account } = await supabase
        .from('home_accounts').select('account_type').eq('auth_user_id', s.user.id).maybeSingle()
      if (cancelled) return
      setRole((account?.account_type as Role) ?? 'pupil')
      setLoading(false)
    }

    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return
      setSession(data.session)
      resolveRole(data.session)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      resolveRole(newSession)
    })
    return () => { cancelled = true; sub.subscription.unsubscribe() }
  }, [])

  return { session, role, loading }
}
