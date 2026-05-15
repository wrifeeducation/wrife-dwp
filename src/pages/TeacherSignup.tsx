import { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthShell from '@/components/shell/AuthShell'
import ErrorBanner from '@/components/shell/ErrorBanner'
import { signupHomeAccount, SignupError } from '@/lib/auth/signup'

/**
 * Route D — Independent teacher sign-up.
 *
 * Identical shape to HomeSignup but with role=independent_teacher in the
 * Supabase auth metadata. The DB trigger picks that up and creates an
 * independent-teacher home_accounts row.
 *
 * After email confirmation, the teacher lands at /auth/confirm → /teacher and
 * can create classes + add pupils. Class + pupil creation flows live in the
 * teacher view (built in a separate session).
 */
export default function TeacherSignup() {
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sentTo, setSentTo] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true); setError(null)
    try {
      const r = await signupHomeAccount({ displayName, email, password, role: 'independent_teacher' })
      setSentTo(r.email)
    } catch (err) {
      if (err instanceof SignupError) setError(err.message)
      else setError('Something went wrong. Please try again.')
    } finally { setSubmitting(false) }
  }

  if (sentTo) {
    return (
      <AuthShell title="Check your email" subtitle="We've sent you a link to confirm your teacher account." mood="excited">
        <p className="text-pwp-sm text-neutral-700 mb-4">
          Open the email we just sent to <strong>{sentTo}</strong> and click the link to finish setting up your class.
        </p>
        <p className="text-pwp-xs text-neutral-500">
          Didn't receive it? Check spam, or <Link to="/teacher-signup" className="text-brand-primary font-bold hover:underline">try a different email</Link>.
        </p>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      title="For teachers"
      subtitle="Set up your independent teacher account in under a minute."
      mood="welcome"
      bottomLinks={[
        { label: 'Already have an account? Sign in →', to: '/login' },
        { label: 'Parent / family? Sign up here →', to: '/home-signup' },
      ]}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <ErrorBanner message={error} />

        <label className="block">
          <span className="text-pwp-xs font-extrabold text-neutral-700 uppercase tracking-wide mb-1.5 block">Your name</span>
          <input
            type="text" required autoComplete="name"
            value={displayName} onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Ms Patel"
            className="w-full px-4 py-3 rounded-pwp-tile bg-surface-practice-bg border-2 border-brand-primary/30 focus:border-brand-primary focus:outline-none text-pwp-base"
          />
        </label>

        <label className="block">
          <span className="text-pwp-xs font-extrabold text-neutral-700 uppercase tracking-wide mb-1.5 block">Work email</span>
          <input
            type="email" required autoComplete="email" inputMode="email"
            value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="m.patel@example.sch.uk"
            className="w-full px-4 py-3 rounded-pwp-tile bg-surface-practice-bg border-2 border-brand-primary/30 focus:border-brand-primary focus:outline-none text-pwp-base"
          />
        </label>

        <label className="block">
          <span className="text-pwp-xs font-extrabold text-neutral-700 uppercase tracking-wide mb-1.5 block">Password</span>
          <input
            type="password" required autoComplete="new-password" minLength={8}
            value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            className="w-full px-4 py-3 rounded-pwp-tile bg-surface-practice-bg border-2 border-brand-primary/30 focus:border-brand-primary focus:outline-none text-pwp-base"
          />
        </label>

        <p className="text-pwp-xs text-neutral-500">
          By signing up, you agree to WriFe's terms and privacy policy. If you're part of a school
          that already uses WriFe, sign in via your school admin instead.
        </p>

        <button
          type="submit"
          disabled={submitting || !displayName || !email || password.length < 8}
          className="btn-wrife-cta btn-wrife-cta--primary mt-2"
        >
          {submitting ? 'Creating account…' : 'Create my teacher account →'}
        </button>
      </form>
    </AuthShell>
  )
}
