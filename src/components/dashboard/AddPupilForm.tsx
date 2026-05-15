import { useState } from 'react'
import { createPupil, PupilCreateError } from '@/lib/auth/pupilCreate'
import ErrorBanner from '@/components/shell/ErrorBanner'

interface Props {
  classId?: string                                  // omit for parent's home class
  context: 'parent' | 'teacher'
  onCreated: (result: { credentials: { class_code: string; username: string; pin: string }, pupilName: string }) => void
}

function randomPin(): string {
  const arr = new Uint32Array(1); crypto.getRandomValues(arr)
  return String(arr[0] % 10000).padStart(4, '0')
}

function suggestUsername(displayName: string): string {
  // First name + last initial + 2 random digits
  const parts = displayName.trim().toLowerCase().split(/\s+/)
  const stem = parts[0]?.slice(0, 6) ?? 'pupil'
  const initial = parts[1]?.[0] ?? ''
  const arr = new Uint32Array(1); crypto.getRandomValues(arr)
  return `${stem}${initial}${String(arr[0] % 100).padStart(2, '0')}`.replace(/[^a-z0-9_]/g, '')
}

export default function AddPupilForm({ classId, context, onCreated }: Props) {
  const [displayName, setDisplayName] = useState('')
  const [username, setUsername] = useState('')
  const [pin, setPin] = useState(randomPin())
  const [yearGroup, setYearGroup] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleDisplayNameChange(v: string) {
    setDisplayName(v)
    if (!username) setUsername(suggestUsername(v))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true); setError(null)
    try {
      const result = await createPupil({
        classId,
        displayName,
        username,
        pin,
        yearGroup: yearGroup || undefined,
      })
      onCreated({
        credentials: result.credentials,
        pupilName: result.pupil.display_name,
      })
      setDisplayName(''); setUsername(''); setPin(randomPin()); setYearGroup('')
    } catch (e) {
      if (e instanceof PupilCreateError) setError(e.message)
      else setError('Could not add pupil. Please try again.')
    } finally { setSubmitting(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-pwp-banner border-2 border-brand-primary/15 p-5 mb-5">
      <p className="text-pwp-md font-extrabold text-brand-primary mb-3">
        {context === 'parent' ? '👶 Add a child' : '👤 Add a pupil to this class'}
      </p>
      <ErrorBanner message={error} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <label className="block">
          <span className="text-pwp-xs font-extrabold text-neutral-700 uppercase tracking-wide mb-1 block">Name</span>
          <input required type="text" value={displayName} onChange={(e) => handleDisplayNameChange(e.target.value)}
            placeholder="Amadeo Boateng"
            className="w-full px-3 py-2 rounded-pwp-tile bg-surface-practice-bg border-2 border-brand-primary/30 focus:border-brand-primary outline-none text-pwp-base" />
        </label>
        <label className="block">
          <span className="text-pwp-xs font-extrabold text-neutral-700 uppercase tracking-wide mb-1 block">Username (lowercase)</span>
          <input required type="text" value={username} onChange={(e) => setUsername(e.target.value.toLowerCase())}
            placeholder="amab04" pattern="[a-z0-9_]{3,20}"
            className="w-full px-3 py-2 rounded-pwp-tile bg-surface-practice-bg border-2 border-brand-primary/30 focus:border-brand-primary outline-none text-pwp-base font-mono" />
        </label>
        <label className="block">
          <span className="text-pwp-xs font-extrabold text-neutral-700 uppercase tracking-wide mb-1 block">4-digit PIN</span>
          <div className="flex gap-2">
            <input required type="text" inputMode="numeric" value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))} pattern="\d{4}"
              className="w-24 px-3 py-2 rounded-pwp-tile bg-surface-practice-bg border-2 border-brand-primary/30 focus:border-brand-primary outline-none text-pwp-lg font-bold tracking-widest text-center" />
            <button type="button" onClick={() => setPin(randomPin())} className="text-pwp-xs text-brand-primary font-bold hover:underline">
              🎲 New PIN
            </button>
          </div>
        </label>
        <label className="block">
          <span className="text-pwp-xs font-extrabold text-neutral-700 uppercase tracking-wide mb-1 block">Year group (optional)</span>
          <select value={yearGroup} onChange={(e) => setYearGroup(e.target.value)}
            className="w-full px-3 py-2 rounded-pwp-tile bg-surface-practice-bg border-2 border-brand-primary/30 focus:border-brand-primary outline-none text-pwp-base">
            <option value="">—</option>
            <option value="Y2">Year 2</option><option value="Y3">Year 3</option><option value="Y4">Year 4</option>
            <option value="Y5">Year 5</option><option value="Y6">Year 6</option>
          </select>
        </label>
      </div>
      <button type="submit" disabled={submitting || !displayName || username.length < 3 || pin.length !== 4} className="btn-wrife-cta btn-wrife-cta--primary">
        {submitting ? 'Adding…' : context === 'parent' ? 'Create my child\'s account →' : 'Add pupil →'}
      </button>
    </form>
  )
}
