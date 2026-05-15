import { useState, useMemo } from 'react'
import type { ActivityProps } from './types'
import { shuffle } from '@/lib/progress/shuffle'

interface SortItem { id: string; words: string[] }

type Category = 'people' | 'places' | 'things' | 'actions'
interface CatMeta { label: string; emoji: string; bg: string; bgDark: string }

const CATEGORY_META: Record<Category, CatMeta> = {
  people:  { label: 'People',  emoji: '👥', bg: '#74B9FF', bgDark: '#0d3f7a' },
  places:  { label: 'Places',  emoji: '🏠', bg: '#A29BFE', bgDark: '#3d35a0' },
  things:  { label: 'Things',  emoji: '🎾', bg: '#55EFC4', bgDark: '#007d67' },
  actions: { label: 'Actions', emoji: '⚡', bg: '#FD79A8', bgDark: '#880e4f' },
}

/**
 * L1 / L5 — sort words into 3 or 4 noun-class columns.
 *
 * Early-years friendly:
 *  - Big saturated category tiles (white emoji + label on coloured background)
 *  - Big chunky word chips (16-18px font, 48-56px tall, white bg until selected,
 *    full-colour fill when selected)
 *  - Generous spacing
 *  - The "Pick a word, then tap a column" instruction sits on a pale-purple shelf
 */
export default function WordSorting({ level, onSubmit, submitting }: ActivityProps) {
  const rawItems = (level.items as SortItem[])[0]
  const items = useMemo(() => ({ ...rawItems, words: shuffle(rawItems.words) }), [level.level_id])
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
    <div className="flex flex-col gap-5">
      {/* Instruction shelf */}
      <div className="bg-surface-practice-bg rounded-pwp-tile px-4 py-3 text-center">
        <p className="text-pwp-sm font-extrabold text-brand-primary uppercase tracking-wide">
          {selected ? `Now tap a column for "${selected}"` : 'Pick a word, then tap a column'}
        </p>
      </div>

      {/* Word pool — big chunky chips */}
      <div className="bg-white rounded-pwp-banner p-4 min-h-[88px] border-2 border-brand-primary/15">
        <div className="flex flex-wrap gap-2 justify-center items-center">
          {unsorted.length === 0 ? (
            <span className="text-pwp-md font-extrabold text-mode-correct">All sorted! ✓</span>
          ) : (
            unsorted.map((w) => {
              const isSelected = selected === w
              return (
                <button
                  key={w}
                  onClick={() => setSelected(w === selected ? null : w)}
                  className="px-4 py-2.5 rounded-pwp-tile font-extrabold transition-all"
                  style={{
                    background: isSelected ? 'var(--color-brand-primary)' : 'white',
                    color: isSelected ? 'white' : '#333',
                    border: '3px solid #ddd',
                    borderColor: isSelected ? 'var(--color-brand-primary)' : '#ddd',
                    borderBottom: isSelected ? '4px solid #3d35a0' : '4px solid #ccc',
                    minHeight: 'var(--pwp-touch)',
                    fontSize: 'var(--pwp-text-md)',
                    transform: isSelected ? 'translateY(-2px)' : 'none',
                  }}
                >
                  {w}
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Category drop columns — big saturated cards */}
      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${categories.length}, 1fr)` }}>
        {categories.map((cat) => {
          const meta = CATEGORY_META[cat]
          const placed = Object.entries(placements).filter(([, c]) => c === cat).map(([w]) => w)
          const armed = !!selected
          return (
            <button
              key={cat}
              onClick={() => place(cat)}
              disabled={!selected}
              className="rounded-pwp-banner overflow-hidden text-left disabled:opacity-60 transition-transform"
              style={{
                background: 'white',
                border: `3px solid ${meta.bg}`,
                borderBottom: `5px solid ${meta.bgDark}`,
                boxShadow: armed ? `0 6px 16px ${meta.bg}55` : 'none',
                transform: armed ? 'translateY(-1px)' : 'none',
              }}
            >
              {/* Header */}
              <div className="px-3 py-3 text-center" style={{ background: meta.bg, color: 'white' }}>
                <div className="text-2xl leading-none" aria-hidden="true">{meta.emoji}</div>
                <div className="text-pwp-md font-extrabold mt-1">{meta.label}</div>
              </div>
              {/* Drop area */}
              <div className="px-2 py-3 flex flex-col gap-1.5 min-h-[100px] bg-white">
                {placed.length === 0 ? (
                  <span className="text-pwp-xs text-neutral-400 text-center italic">tap to place</span>
                ) : (
                  placed.map((w) => (
                    <span key={w} className="text-pwp-base font-extrabold text-center rounded-pwp-tile py-1.5 px-2"
                          style={{ background: meta.bg + '20', color: meta.bgDark }}>
                      {w}
                    </span>
                  ))
                )}
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
        {submitting ? 'Checking…' : 'Check my sorting →'}
      </button>
    </div>
  )
}
