import { useState, useMemo } from 'react'
import type { ActivityProps } from './types'
import { shuffle } from '@/lib/progress/shuffle'

interface CPItem { word: string; type: 'common' | 'proper' }

export default function CommonProper({ level, onSubmit, submitting }: ActivityProps) {
  const rawItems = (level.items as CPItem[]) ?? []
  const items = useMemo(() => shuffle(rawItems), [level.level_id])
  const [picks, setPicks] = useState<Record<number, 'common' | 'proper'>>({})
  const allAnswered = items.length > 0 && items.every((_, i) => picks[i])

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-surface-practice-bg rounded-pwp-tile px-4 py-3 text-center">
        <p className="text-pwp-sm font-extrabold text-brand-primary uppercase tracking-wide">
          Common (general) or Proper (specific name)?
        </p>
      </div>
      {items.map((it, i) => {
        const pick = picks[i]
        const display = pick === 'proper' ? it.word.charAt(0).toUpperCase() + it.word.slice(1) : it.word
        return (
          <div key={i} className="bg-white rounded-pwp-banner p-4 border-2 border-brand-primary/15 flex items-center justify-between gap-3">
            <span className="text-pwp-xl font-extrabold text-neutral-900">{display}</span>
            <div className="flex gap-2">
              <Pill label="Common" selected={pick === 'common'} fill="#74B9FF" fillDark="#0d3f7a" onClick={() => setPicks((p) => ({ ...p, [i]: 'common' }))} />
              <Pill label="Proper" selected={pick === 'proper'} fill="#A29BFE" fillDark="#3d35a0" onClick={() => setPicks((p) => ({ ...p, [i]: 'proper' }))} />
            </div>
          </div>
        )
      })}
      <button onClick={() => onSubmit({ picks: items.map((it, i) => ({ word: it.word, expected: it.type, pupil_answer: picks[i] ?? null })) })} disabled={!allAnswered || submitting} className="btn-wrife-cta btn-wrife-cta--primary">
        {submitting ? 'Checking…' : 'Check my answers →'}
      </button>
    </div>
  )
}

function Pill({ label, selected, fill, fillDark, onClick }: { label: string; selected: boolean; fill: string; fillDark: string; onClick: () => void }) {
  return (
    <button onClick={onClick} aria-pressed={selected}
      className="rounded-pwp-tile font-extrabold uppercase tracking-wide transition-all"
      style={{
        background: selected ? fill : 'white',
        color: selected ? 'white' : fill,
        border: `3px solid ${fill}`, borderBottom: `4px solid ${fillDark}`,
        padding: '10px 16px', fontSize: 'var(--pwp-text-sm)', minHeight: 'var(--pwp-touch)',
        transform: selected ? 'translateY(-2px)' : 'none',
      }}>
      {label}
    </button>
  )
}
