import { useState } from 'react'
import type { ActivityProps } from './types'

interface LogicItem { pair: string; answer: 'yes' | 'no' }

/**
 * L3 — Does this word-pair make sense?
 * Tap YES or NO. Selecting one locks the answer.
 */
export default function NounVerbLogic({ level, onSubmit, submitting }: ActivityProps) {
  const items = (level.items as LogicItem[]) ?? []
  const [picks, setPicks] = useState<Record<number, 'yes' | 'no'>>({})

  const allAnswered = items.length > 0 && items.every((_, i) => picks[i])

  return (
    <div className="flex flex-col gap-3">
      <p className="text-pwp-sm font-extrabold text-neutral-500 uppercase tracking-wide text-center">
        Does each pair make sense?
      </p>
      {items.map((it, i) => (
        <div key={i} className="bg-surface-practice-bg rounded-pwp-tile p-3 flex items-center justify-between gap-3">
          <span className="text-pwp-base font-bold text-neutral-900">{it.pair}</span>
          <div className="flex gap-2">
            <YesNoButton selected={picks[i] === 'yes'} variant="yes" onClick={() => setPicks((p) => ({ ...p, [i]: 'yes' }))} />
            <YesNoButton selected={picks[i] === 'no'} variant="no"  onClick={() => setPicks((p) => ({ ...p, [i]: 'no'  }))} />
          </div>
        </div>
      ))}
      <button onClick={() => onSubmit({ picks })} disabled={!allAnswered || submitting} className="btn-wrife-cta btn-wrife-cta--primary mt-2">
        {submitting ? 'Checking…' : 'Check my answers'}
      </button>
    </div>
  )
}

function YesNoButton({ selected, variant, onClick }: { selected: boolean; variant: 'yes' | 'no'; onClick: () => void }) {
  const isYes = variant === 'yes'
  return (
    <button onClick={onClick} aria-pressed={selected}
      className="px-4 py-1.5 rounded-pwp-tile font-extrabold text-pwp-sm transition-colors min-h-[var(--pwp-touch-min)]"
      style={{
        background: selected ? (isYes ? '#00b894' : '#F5A623') : 'white',
        color: selected ? 'white' : isYes ? '#00b894' : '#c47a0a',
        border: `2px solid ${isYes ? '#00b894' : '#F5A623'}`,
        borderBottom: `3px solid ${isYes ? '#007d67' : '#c47a0a'}`,
      }}>
      {isYes ? '✓ Yes' : '✗ No'}
    </button>
  )
}
