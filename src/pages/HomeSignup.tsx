import { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthShell from '@/components/shell/AuthShell'
import ErrorBanner from '@/components/shell/ErrorBanner'
import { signupHomeAccount, SignupError } from '@/lib/auth/signup'

/**
 * Route C — Parent / home-learner sign-up.
 *
 * The parent signs up first. After confirming their email, they land on
 * /auth/confirm → /parent and can create child profiles. The child profile
 * creation form is a follow-on screen (built in a separate session).
 */
export default function HomeSignup() {
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
      const r = await signupHomeAccount({ displayName, email, password, role: 'parent' })
      setSentTo(r.email)
    } catch (err) {
      if (err instanceof SignupError) setError(err.message)
      else setError('Something went wrong. Please try again.')
    } finally { setSubmitting(false) }
  }

  if (sentTo) {
    return (
      <AuthShell title="Check your email" subtitle="We've sent you a link to confirm your account." mood="excited">
        <p className="text-pwp-sm text-neutral-700 mb-4">
          Open the email we just sent to <strong>{sentTo}</strong> and click the link to finish.
          You can close this tab.
        </p>
        <p className="text-pwp-xs text-neutral-500">
          Didn't receive it? Check spam, or <Link to="/home-signup" className="text-brand-primary font-bold hover:underline">try a different email</Link>.
        </p>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      title="Welcome, families!"
      subtitle="Set up a parent account so your child can start writing every day."
      mood="welcome"
      bottomLinks={[
        { label: 'Already have an account? Sign in →', to: '/login' },
        { label: 'Teacher? Sign up here →', to: '/teacher-signup' },
      ]}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <ErrorBanner message={error} />

        <label className="block">
          <span className="text-pwp-xs font-extrabold text-neutral-700 uppercase tracking-wide mb-1.5 block">Your name</span>
          <input
            type="text" required autoComplete="name"
            value={displayName} onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Jane Smith"
            className="w-full px-4 py-3 rounded-pwp-tile bg-surface-practice-bg border-2 border-brand-primary/30 focus:border-brand-primary focus:outline-none text-pwp-base"
          />
        </label>

        <label className="block">
          <span className="text-pwp-xs font-extrabold text-neutral-700 uppercase tracking-wide mb-1.5 block">Email</span>
          <input
            type="email" required autoComplete="email" inputMode="email"
            value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="jane@example.com"
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
          <span className="text-pwp-xs text-neutral-500 mt-1 block">8 characters or more.</span>
        </label>

        <p className="text-pwp-xs text-neutral-500">
          By signing up, you agree to WriFe's terms and privacy policy.
        </p>

        <button
          type="submit"
          disabled={submitting || !displayName || !email || password.length < 8}
          className="btn-wrife-cta btn-wrife-cta--primary mt-2"
        >
          {submitting ? 'Creating account…' : 'Create my family account →'}
        </button>
      </form>
    </AuthShell>
  )
}
