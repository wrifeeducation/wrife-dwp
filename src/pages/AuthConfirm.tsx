import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import AuthShell from '@/components/shell/AuthShell'
import { supabase } from '@/lib/supabase'

/**
 * Lands the user after they click a Supabase email confirmation link.
 *
 * Two flows we handle here:
 *   - signup / magiclink → finalise the session, redirect to /parent or /teacher
 *   - recovery / invite  → redirect to /update-password (not built yet — for now bounce to /login)
 *
 * Supabase appends either ?token_hash=...&type=... query params (the new flow)
 * or #access_token=... hash params (the older flow). We handle both.
 */
export default function AuthConfirm() {
  const nav = useNavigate()
  const [params] = useSearchParams()
  const [status, setStatus] = useState<'pending' | 'error'>('pending')
  const [message, setMessage] = useState<string>('Confirming your account…')

  useEffect(() => {
    let cancelled = false
    async function run() {
      const tokenHash = params.get('token_hash')
      const type = params.get('type') as 'signup' | 'magiclink' | 'recovery' | 'invite' | 'email_change' | null

      // New-style token_hash flow
      if (tokenHash && type) {
        const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
        if (cancelled) return
        if (error) { setStatus('error'); setMessage(error.message); return }
        return redirectByRole()
      }

      // Old-style hash flow — Supabase JS auto-detects on init, so by the time
      // this component mounts we should already have a session
      const { data: { session } } = await supabase.auth.getSession()
      if (cancelled) return
      if (!session) {
        setStatus('error')
        setMessage('Could not finish confirming. Please try the email link again.')
        return
      }
      return redirectByRole()
    }

    async function redirectByRole() {
      const { data: { user } } = await supabase.auth.getUser()
      const role = user?.user_metadata?.role as string | undefined
      if (role === 'parent') nav('/parent', { replace: true })
      else if (role === 'independent_teacher') nav('/teacher', { replace: true })
      else nav('/', { replace: true })
    }

    run()
    return () => { cancelled = true }
  }, [params, nav])

  return (
    <AuthShell
      title={status === 'pending' ? 'Just a moment…' : 'Something went wrong'}
      subtitle={status === 'pending' ? message : undefined}
      mood={status === 'pending' ? 'thinking' : 'welcome'}
    >
      {status === 'error' && (
        <div>
          <p className="text-pwp-sm text-neutral-700 mb-4">{message}</p>
          <button onClick={() => nav('/login')} className="btn-wrife-cta btn-wrife-cta--primary">
            Try signing in instead →
          </button>
        </div>
      )}
    </AuthShell>
  )
}
