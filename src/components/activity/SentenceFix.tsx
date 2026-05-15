import { useState, useMemo } from 'react'
import type { ActivityProps } from './types'
import { shuffle } from '@/lib/progress/shuffle'

interface FixItem { input: string; target: string }

/**
 * L12 — pupils add missing capitals and full stops.
 * UI: each item is an editable textbox pre-filled with the lowercase input.
 * Pupil corrects → submit.
 */
export default function SentenceFix({ level, onSubmit, submitting }: ActivityProps) {
  const rawItems = (level.items as FixItem[]) ?? []
  const items = useMemo(() => shuffle(rawItems), [level.level_id])
  const [answers, setAnswers] = useState<string[]>(items.map((i) => i.input))

  return (
    <div className="flex flex-col gap-3">
      <p className="text-pwp-sm font-extrabold text-neutral-500 uppercase tracking-wide text-center">
        Add the missing capitals and full stops
      </p>
      {items.map((_it, i) => (
        <label key={i} className="block">
          <span className="text-pwp-xs text-neutral-500 mb-1 block">Sentence {i + 1}</span>
          <input
            type="text"
            value={answers[i]}
            onChange={(e) => setAnswers((a) => a.map((v, idx) => (idx === i ? e.target.value : v)))}
            className="w-full bg-surface-practice-bg border-2 border-brand-primary/30 focus:border-brand-primary outline-none rounded-pwp-tile px-3 py-2.5 text-pwp-base font-medium"
          />
        </label>
      ))}
      <button onClick={() => onSubmit({ answers })} disabled={submitting} className="btn-wrife-cta btn-wrife-cta--primary mt-2">
        {submitting ? 'Checking…' : 'Check my answers'}
      </button>
    </div>
  )
}
