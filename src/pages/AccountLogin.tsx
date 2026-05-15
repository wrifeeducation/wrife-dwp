import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthShell from '@/components/shell/AuthShell'
import ErrorBanner from '@/components/shell/ErrorBanner'
import { supabase } from '@/lib/supabase'

/**
 * Adult email + password sign-in.
 *
 * Used by parents (Route C) and independent teachers (Route D) who already
 * confirmed their account. After successful sign-in, we look up the
 * home_accounts row to decide whether to send them to /parent or /teacher.
 */
export default function AccountLogin() {
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true); setError(null)
    try {
      const { data, error: signInErr } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password })
      if (signInErr || !data.user) { setError(friendly(signInErr?.message ?? '')); return }
      const { data: account } = await supabase.from('home_accounts').select('account_type').eq('auth_user_id', data.user.id).maybeSingle()
      const accountType = account?.account_type
      if (accountType === 'parent') nav('/parent', { replace: true })
      else if (accountType === 'independent_teacher') nav('/teacher', { replace: true })
      else nav('/', { replace: true })
    } finally { setSubmitting(false) }
  }

  function friendly(msg: string): string {
    const m = msg.toLowerCase()
    if (m.includes('invalid login') || m.includes('credentials')) return 'Email or password is incorrect.'
    if (m.includes('confirm')) return 'Please confirm your email first — check your inbox.'
    return 'Sign-in failed. Please try again.'
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your parent or teacher account."
      mood="welcome"
      bottomLinks={[
        { label: "Are you a pupil? Sign in here →", to: '/login' },
        { label: 'New family? Sign up →', to: '/home-signup' },
        { label: 'New teacher? Sign up →', to: '/teacher-signup' },
      ]}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <ErrorBanner message={error} />
        <label className="block">
          <span className="text-pwp-xs font-extrabold text-neutral-700 uppercase tracking-wide mb-1.5 block">Email</span>
          <input type="email" required autoComplete="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-pwp-tile bg-surface-practice-bg border-2 border-brand-primary/30 focus:border-brand-primary focus:outline-none text-pwp-base" />
        </label>
        <label className="block">
          <span className="text-pwp-xs font-extrabold text-neutral-700 uppercase tracking-wide mb-1.5 block">Password</span>
          <input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-pwp-tile bg-surface-practice-bg border-2 border-brand-primary/30 focus:border-brand-primary focus:outline-none text-pwp-base" />
        </label>
        <button type="submit" disabled={submitting || !email || !password} className="btn-wrife-cta btn-wrife-cta--primary">
          {submitting ? 'Signing in…' : 'Sign in →'}
        </button>
      </form>
    </AuthShell>
  )
}
