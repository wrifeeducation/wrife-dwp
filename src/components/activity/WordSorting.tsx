import { useState } from 'react'
import type { ActivityProps } from './types'

interface SortItem { id: string; words: string[] }

type Category = 'people' | 'places' | 'things' | 'actions'
const CATEGORY_LABELS: Record<Category, string> = {
  people: '👥 People',
  places: '🏠 Places',
  things: '🎾 Things',
  actions: '⚡ Actions',
}

/**
 * L1 / L5 — pupils sort words into 3 or 4 noun-class columns.
 * UI: tap a word → tap a column. Tapped words highlight; unsorted remain in
 * the pool. Submit becomes active once all words are placed.
 */
export default function WordSorting({ level, onSubmit, submitting }: ActivityProps) {
  const items = (level.items as SortItem[])[0]
  const includeActions = level.activity_type === 'mixed_sorting'
  const categories: Category[] = includeActions
    ? ['people', 'places', 'things', 'actions']
    : ['people', 'places', 'things']

  const [placements, setPlacements] = useState<Record<string, Category>>({})
  const [selected, setSelected] = useState<string | null>(null)

  function place(category: Category) {
    if (!selected) return
    setPlacements((p) => ({ ...p, [selected]: category }))
    setSelected(null)
  }

  const unsorted = items.words.filter((w) => !placements[w])
  const allPlaced = unsorted.length === 0

  return (
    <div className="flex flex-col gap-4">
      <p className="text-pwp-sm font-extrabold text-neutral-500 uppercase tracking-wide text-center">
        Pick a word, then tap a column
      </p>

      {/* Word pool */}
      <div className="flex flex-wrap gap-2 justify-center bg-surface-practice-bg rounded-pwp-tile p-3 min-h-[64px]">
        {unsorted.map((w) => (
          <button
            key={w}
            onClick={() => setSelected(w === selected ? null : w)}
            className="px-3 py-1.5 rounded-pwp-tile font-bold text-pwp-sm transition-colors"
            style={{
              background: selected === w ? 'var(--color-brand-primary)' : 'white',
              color: selected === w ? 'white' : '#333',
              border: selected === w ? '2px solid var(--color-brand-primary)' : '2px solid #ddd',
              borderBottom: selected === w ? '3px solid #3d35a0' : '3px solid #ccc',
              minHeight: 'var(--pwp-touch-min)',
            }}
          >
            {w}
          </button>
        ))}
        {unsorted.length === 0 && (
          <span className="text-pwp-sm text-mode-correct font-bold">All sorted! ✓</span>
        )}
      </div>

      {/* Category columns */}
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${categories.length}, 1fr)` }}>
        {categories.map((cat) => {
          const placed = Object.entries(placements).filter(([, c]) => c === cat).map(([w]) => w)
          return (
            <button
              key={cat}
              onClick={() => place(cat)}
              disabled={!selected}
              className="rounded-pwp-tile p-3 text-center border-2 disabled:opacity-60 transition-colors"
              style={{
                background: selected ? '#f5f3ff' : '#fafafa',
                borderColor: selected ? 'var(--color-brand-primary)' : '#e5e5e5',
              }}
            >
              <div className="text-pwp-xs font-extrabold mb-2">{CATEGORY_LABELS[cat]}</div>
              <div className="flex flex-col gap-1 min-h-[60px]">
                {placed.map((w) => (
                  <span key={w} className="text-pwp-xs bg-white rounded px-2 py-1">{w}</span>
                ))}
              </div>
            </button>
          )
        })}
      </div>

      <button
        onClick={() => onSubmit({ placements })}
        disabled={!allPlaced || submitting}
        className="btn-wrife-cta btn-wrife-cta--primary mt-2"
      >
        {submitting ? 'Checking…' : 'Check my sorting'}
      </button>
    </div>
  )
}
