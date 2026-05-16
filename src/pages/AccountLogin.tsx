import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthShell from '@/components/shell/AuthShell'
import ErrorBanner from '@/components/shell/ErrorBanner'
import { supabase } from '@/lib/supabase'

/**
 * Adult email + password sign-in.
 *
 * Supports:
 *   - Parents (Route C) — home_accounts.account_type = 'parent' → /parent
 *   - Independent teachers (Route D) — home_accounts.account_type = 'independent_teacher' → /teacher
 *   - School teachers / admins — profiles.role = 'teacher' | 'admin' → /teacher
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
      const { data, error: signInErr } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      })
      if (signInErr || !data.user) { setError(friendly(signInErr?.message ?? '')); return }

      // 1. Check home_accounts (parents + independent teachers)
      const { data: homeAccount } = await supabase
        .from('home_accounts').select('account_type').eq('auth_user_id', data.user.id).maybeSingle()

      if (homeAccount?.account_type === 'parent') { nav('/parent', { replace: true }); return }
      if (homeAccount?.account_type === 'independent_teacher') { nav('/teacher', { replace: true }); return }

      // 2. Fall back to profiles (school teachers + admins from wrife.co.uk)
      const { data: profile } = await supabase
        .from('profiles').select('role').eq('id', data.user.id).maybeSingle()

      if (profile?.role === 'teacher' || profile?.role === 'admin') {
        nav('/teacher', { replace: true }); return
      }

      // 3. Anything else (e.g. pupil auth user who ended up here) — send home
      nav('/', { replace: true })
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
