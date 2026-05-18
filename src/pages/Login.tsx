import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthShell from '@/components/shell/AuthShell'
import ErrorBanner from '@/components/shell/ErrorBanner'
import { pupilLogin, PupilLoginError } from '@/lib/auth/pupilLogin'

/**
 * Route B — Pupil sign-in for ALL pupil types (school, home learner, independent teacher).
 *
 * Pupils enter the class_code their parent or teacher gave them, their
 * username (lowercase nickname), and their 4-digit PIN. The combination is
 * verified server-side by the pupil-login Edge Function which mints a real
 * Supabase session.
 *
 * Route B is now open for school pupils too — standalone Play Store apps
 * access DWP directly without going through wrife.co.uk first.
 */
export default function Login() {
  const nav = useNavigate()
  const [classCode, setClassCode] = useState('')
  const [username, setUsername] = useState('')
  const [pin, setPin] = useState('')
  const [showPin, setShowPin] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function friendlyError(err: PupilLoginError): string {
    switch (err.code) {
      case 'invalid_credentials':
        return 'That class code, username, or PIN doesn\'t match. Try again.'
      case 'pin_invalid':
        return 'PIN must be 4 digits.'
      case 'missing_fields':
        return 'Please fill in all three boxes.'
      default:
        return 'Something went wrong. Please try again in a moment.'
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    setError(null)
    try {
      await pupilLogin({ classCode, username, pin })
      nav('/', { replace: true })
    } catch (err) {
      if (err instanceof PupilLoginError) {
        setError(friendlyError(err))
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthShell
      title="Hello again!"
      subtitle="Sign in with your class code, username and PIN."
      mood="welcome"
      bottomLinks={[
        { label: 'New family? Sign up →', to: '/home-signup' },
        { label: "Teacher? Sign up here →", to: '/teacher-signup' },
        { label: 'Parent or teacher signing in? →', to: '/account/login' },
      ]}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <ErrorBanner message={error} />

        <label className="block">
          <span className="text-pwp-xs font-extrabold text-neutral-700 uppercase tracking-wide mb-1.5 block">Class code</span>
          <input
            type="text"
            inputMode="text"
            autoCapitalize="characters"
            autoComplete="off"
            spellCheck={false}
            value={classCode}
            onChange={(e) => setClassCode(e.target.value.toUpperCase())}
            maxLength={12}
            required
            className="w-full px-4 py-3 rounded-pwp-tile bg-surface-practice-bg border-2 border-brand-primary/30 focus:border-brand-primary focus:outline-none text-pwp-md font-extrabold tracking-widest text-center uppercase"
            placeholder="ABC12345"
          />
        </label>

        <label className="block">
          <span className="text-pwp-xs font-extrabold text-neutral-700 uppercase tracking-wide mb-1.5 block">Your username</span>
          <input
            type="text"
            inputMode="text"
            autoCapitalize="none"
            autoComplete="username"
            spellCheck={false}
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase())}
            required
            className="w-full px-4 py-3 rounded-pwp-tile bg-surface-practice-bg border-2 border-brand-primary/30 focus:border-brand-primary focus:outline-none text-pwp-base font-bold"
            placeholder="amab04"
          />
        </label>

        <label className="block">
          <span className="text-pwp-xs font-extrabold text-neutral-700 uppercase tracking-wide mb-1.5 block">4-digit PIN</span>
          <div className="relative">
            <input
              type={showPin ? 'text' : 'password'}
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="current-password"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              maxLength={4}
              required
              className="w-full px-4 py-3 pr-12 rounded-pwp-tile bg-surface-practice-bg border-2 border-brand-primary/30 focus:border-brand-primary focus:outline-none text-pwp-xl font-extrabold tracking-[0.5em] text-center"
              placeholder="••••"
            />
            <button
              type="button"
              onClick={() => setShowPin((v) => !v)}
              aria-label={showPin ? 'Hide PIN' : 'Show PIN'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-brand-primary text-lg bg-transparent border-0 cursor-pointer p-1"
            >
              {showPin ? '🙈' : '👁️'}
            </button>
          </div>
          <p className="text-pwp-xs text-neutral-400 mt-1.5 text-center">
            Forgotten your PIN? Ask your teacher.
          </p>
        </label>

        <button
          type="submit"
          disabled={submitting || classCode.length < 4 || !username || pin.length !== 4}
          className="btn-wrife-cta mt-2"
        >
          {submitting ? 'Signing in…' : 'Start writing →'}
        </button>
      </form>
    </AuthShell>
  )
}
