import { useState } from 'react'
import type { ActivityProps } from './types'

interface JoinItem {
  sentence_a: string
  sentence_b: string
  connector: string         // e.g. "and", "but", "because", "when"
}

export default function SentenceJoin({ level, onSubmit, submitting }: ActivityProps) {
  const items = (level.items as JoinItem[]) ?? []
  const [answers, setAnswers] = useState<Record<number, string>>({})

  return (
    <div className="flex flex-col gap-4">
      <p className="text-pwp-sm font-extrabold text-neutral-500 uppercase tracking-wide text-center">
        Join each pair using the highlighted connector
      </p>
      {items.map((it, i) => (
        <div key={i} className="bg-surface-practice-bg rounded-pwp-tile p-3">
          <p className="text-pwp-sm text-neutral-700 mb-1">{it.sentence_a}</p>
          <p className="text-pwp-sm text-neutral-700 mb-2">{it.sentence_b}</p>
          <p className="text-pwp-xs text-orange-700 font-extrabold mb-2 uppercase tracking-wide">
            Join with: <span className="bg-surface-prompt-chip px-2 py-0.5 rounded-pwp-pill">{it.connector}</span>
          </p>
          <input type="text" value={answers[i] ?? ''}
            onChange={(e) => setAnswers((a) => ({ ...a, [i]: e.target.value }))}
            placeholder="Type the joined sentence…"
            className="w-full px-3 py-2 rounded-pwp-tile bg-white border-2 border-brand-primary/30 focus:border-brand-primary outline-none text-pwp-base" />
        </div>
      ))}
      <button onClick={() => onSubmit({ answers })} disabled={submitting} className="btn-wrife-cta btn-wrife-cta--primary mt-2">
        {submitting ? 'Checking…' : 'Check my sentences'}
      </button>
    </div>
  )
}
