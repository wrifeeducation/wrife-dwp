import { useState } from 'react'
import type { ActivityProps } from './types'

interface CPItem { word: string; type: 'common' | 'proper' }

/**
 * L4 — Decide whether each word is a common noun or a proper noun.
 * Proper-noun pick capitalises the displayed word as a visual reinforcement.
 */
export default function CommonProper({ level, onSubmit, submitting }: ActivityProps) {
  const items = (level.items as CPItem[]) ?? []
  const [picks, setPicks] = useState<Record<number, 'common' | 'proper'>>({})

  const allAnswered = items.length > 0 && items.every((_, i) => picks[i])

  return (
    <div className="flex flex-col gap-3">
      <p className="text-pwp-sm font-extrabold text-neutral-500 uppercase tracking-wide text-center">
        Is each word common or proper?
      </p>
      {items.map((it, i) => {
        const pick = picks[i]
        const displayWord = pick === 'proper' ? it.word.charAt(0).toUpperCase() + it.word.slice(1) : it.word
        return (
          <div key={i} className="bg-surface-practice-bg rounded-pwp-tile p-3 flex items-center justify-between gap-3">
            <span className="text-pwp-md font-bold text-neutral-900">{displayWord}</span>
            <div className="flex gap-2">
              <PickButton label="common"  selected={pick === 'common'} colour="#1565c0" onClick={() => setPicks((p) => ({ ...p, [i]: 'common' }))} />
              <PickButton label="proper" selected={pick === 'proper'} colour="#4a40b8" onClick={() => setPicks((p) => ({ ...p, [i]: 'proper' }))} />
            </div>
          </div>
        )
      })}
      <button onClick={() => onSubmit({ picks })} disabled={!allAnswered || submitting} className="btn-wrife-cta btn-wrife-cta--primary mt-2">
        {submitting ? 'Checking…' : 'Check my answers'}
      </button>
    </div>
  )
}

function PickButton({ label, selected, colour, onClick }: { label: string; selected: boolean; colour: string; onClick: () => void }) {
  return (
    <button onClick={onClick} aria-pressed={selected}
      className="px-3 py-1.5 rounded-pwp-tile font-extrabold text-pwp-xs uppercase tracking-wide transition-colors min-h-[var(--pwp-touch-min)]"
      style={{
        background: selected ? colour : 'white',
        color: selected ? 'white' : colour,
        border: `2px solid ${colour}`,
        borderBottom: `3px solid ${colour}`,
      }}>
      {label}
    </button>
  )
}
