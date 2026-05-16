import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import ErrorBanner from '@/components/shell/ErrorBanner'
import type { HomeAccount } from '@/hooks/useHomeAccount'

interface Props {
  account: HomeAccount
  onCreated: () => void
}

function generateClassCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const arr = new Uint32Array(8); crypto.getRandomValues(arr)
  let out = ''
  for (let i = 0; i < 8; i++) out += chars[arr[i] % chars.length]
  return out
}

export default function CreateClassForm({ account, onCreated }: Props) {
  const [className, setClassName] = useState('')
  const [yearGroup, setYearGroup] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true); setError(null)
    try {
      const code = generateClassCode()

      // School teachers (from profiles) link via teacher_id = auth.uid() = account.id.
      // Independent teachers (from home_accounts) link via home_account_id = account.id.
      const classRow = account.isSchoolAccount
        ? {
            class_code: code,
            name: className.trim(),
            account_type: 'school',
            teacher_id: account.id,
            year_group: yearGroup || null,
          }
        : {
            class_code: code,
            name: className.trim(),
            account_type: 'independent_teacher',
            home_account_id: account.id,
            year_group: yearGroup || null,
          }

      const { error: insertErr } = await supabase.from('classes').insert(classRow)
      if (insertErr) {
        if (insertErr.message.toLowerCase().includes('class_code')) {
          setError('That class code happened to collide — try again.')
        } else setError('Could not create class. Please try again.')
        return
      }
      setClassName(''); setYearGroup('')
      onCreated()
    } finally { setSubmitting(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-pwp-banner border-2 border-brand-primary/15 p-5 mb-5">
      <p className="text-pwp-md font-extrabold text-brand-primary mb-3">➕ Create a class</p>
      <ErrorBanner message={error} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <label className="block">
          <span className="text-pwp-xs font-extrabold text-neutral-700 uppercase tracking-wide mb-1 block">Class name</span>
          <input required type="text" value={className} onChange={(e) => setClassName(e.target.value)}
            placeholder="e.g. Year 4 Ducks"
            className="w-full px-3 py-2 rounded-pwp-tile bg-surface-practice-bg border-2 border-brand-primary/30 focus:border-brand-primary outline-none text-pwp-base" />
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
      <button type="submit" disabled={submitting || !className} className="btn-wrife-cta btn-wrife-cta--primary">
        {submitting ? 'Creating…' : 'Create class →'}
      </button>
    </form>
  )
}
