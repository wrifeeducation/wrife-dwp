import { useState } from 'react'
import type { ActivityProps } from './types'

interface StarterItem {
  starter: string         // e.g. "When " or "Although "
  example?: string        // worked example shown as a hint
  hint?: string
}

/**
 * Tier 7 (L34, L35) — Complete each sentence that starts with "When ___" or
 * "Although ___". Each item shows the starter as a fixed prefix.
 */
export default function SentenceStarter({ level, onSubmit, submitting }: ActivityProps) {
  const items = (level.items as StarterItem[]) ?? []
  const [completions, setCompletions] = useState<Record<number, string>>({})
  const allReady = items.length > 0 && items.every((_, i) => (completions[i] ?? '').trim().length > 6)

  return (
    <div className="flex flex-col gap-3">
      <p className="text-pwp-sm font-extrabold text-neutral-500 uppercase tracking-wide text-center">
        Complete each sentence with your own ideas
      </p>
      {items.map((it, i) => (
        <div key={i} className="bg-surface-practice-bg rounded-pwp-tile p-3">
          {it.example && (
            <p className="text-pwp-xs text-neutral-500 italic mb-2">e.g. {it.example}</p>
          )}
          <div className="flex items-center gap-2">
            <span className="text-pwp-md font-extrabold text-brand-primary whitespace-nowrap">{it.starter}</span>
            <input
              type="text"
              value={completions[i] ?? ''}
              onChange={(e) => setCompletions((c) => ({ ...c, [i]: e.target.value }))}
              placeholder="…continue the sentence"
              className="flex-1 bg-white border-2 border-brand-primary/30 focus:border-brand-primary rounded-pwp-tile px-3 py-2 text-pwp-base outline-none"
            />
          </div>
          {it.hint && <p className="text-pwp-xs text-neutral-500 mt-1">{it.hint}</p>}
        </div>
      ))}
      <button onClick={() => onSubmit({ completions })} disabled={!allReady || submitting} className="btn-wrife-cta btn-wrife-cta--primary mt-1">
        {submitting ? 'Checking…' : 'Check my sentences'}
      </button>
    </div>
  )
}
