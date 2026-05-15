import { useState } from 'react'
import type { ActivityProps } from './types'

interface LogicItem { pair: string; answer: 'yes' | 'no' }

export default function NounVerbLogic({ level, onSubmit, submitting }: ActivityProps) {
  const items = (level.items as LogicItem[]) ?? []
  const [picks, setPicks] = useState<Record<number, 'yes' | 'no'>>({})
  const allAnswered = items.length > 0 && items.every((_, i) => picks[i])

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-surface-practice-bg rounded-pwp-tile px-4 py-3 text-center">
        <p className="text-pwp-sm font-extrabold text-brand-primary uppercase tracking-wide">
          Does each pair make sense?
        </p>
      </div>
      {items.map((it, i) => (
        <div key={i} className="bg-white rounded-pwp-banner p-4 border-2 border-brand-primary/15 flex items-center justify-between gap-3">
          <span className="text-pwp-lg font-extrabold text-neutral-900">{it.pair}</span>
          <div className="flex gap-2">
            <PickPill selected={picks[i] === 'yes'} variant="yes" onClick={() => setPicks((p) => ({ ...p, [i]: 'yes' }))} />
            <PickPill selected={picks[i] === 'no'} variant="no"  onClick={() => setPicks((p) => ({ ...p, [i]: 'no'  }))} />
          </div>
        </div>
      ))}
      <button onClick={() => onSubmit({ picks })} disabled={!allAnswered || submitting} className="btn-wrife-cta btn-wrife-cta--primary">
        {submitting ? 'Checking…' : 'Check my answers →'}
      </button>
    </div>
  )
}

function PickPill({ selected, variant, onClick }: { selected: boolean; variant: 'yes' | 'no'; onClick: () => void }) {
  const isYes = variant === 'yes'
  const fill = isYes ? '#00b894' : '#E17055'
  const fillDark = isYes ? '#007d67' : '#8d2828'
  return (
    <button onClick={onClick} aria-pressed={selected}
      className="rounded-pwp-tile font-extrabold uppercase tracking-wide transition-all"
      style={{
        background: selected ? fill : 'white',
        color: selected ? 'white' : fill,
        border: `3px solid ${fill}`, borderBottom: `4px solid ${fillDark}`,
        padding: '10px 18px', fontSize: 'var(--pwp-text-md)', minHeight: 'var(--pwp-touch)',
        transform: selected ? 'translateY(-2px)' : 'none',
      }}>
      {isYes ? '✓ Yes' : '✗ No'}
    </button>
  )
}
