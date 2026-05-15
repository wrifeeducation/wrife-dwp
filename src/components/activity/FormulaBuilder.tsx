import { useState } from 'react'
import type { ActivityProps } from './types'
import { WORD_CLASS_COLOURS, type WordClass } from '@/styles/wordClasses'

interface FormulaItem {
  formula: WordClass[]                              // ordered slots, e.g. ['determiner','noun','verb']
  word_bank: { word: string; class: WordClass }[]   // available chips
}

/**
 * Build a sentence by tapping word-class-coloured chips into ordered slots.
 *
 * Each item is one sentence to build. Tap a chip → it fills the first empty
 * slot of matching class. Tap a slot to clear it.
 */
export default function FormulaBuilder({ level, onSubmit, submitting }: ActivityProps) {
  const items = (level.items as FormulaItem[]) ?? []
  const [placements, setPlacements] = useState<Record<number, string[]>>(() =>
    Object.fromEntries(items.map((it, i) => [i, new Array(it.formula.length).fill('')]))
  )

  function placeChip(itemIdx: number, chipClass: WordClass, word: string) {
    setPlacements((p) => {
      const slots = [...(p[itemIdx] ?? [])]
      const slotIdx = slots.findIndex((s, si) => !s && items[itemIdx].formula[si] === chipClass)
      if (slotIdx < 0) return p
      slots[slotIdx] = word
      return { ...p, [itemIdx]: slots }
    })
  }
  function clearSlot(itemIdx: number, slotIdx: number) {
    setPlacements((p) => {
      const slots = [...(p[itemIdx] ?? [])]
      slots[slotIdx] = ''
      return { ...p, [itemIdx]: slots }
    })
  }

  const allFull = items.length > 0 && items.every((_, i) => (placements[i] ?? []).every((s) => !!s))

  return (
    <div className="flex flex-col gap-5">
      <p className="text-pwp-sm font-extrabold text-neutral-500 uppercase tracking-wide text-center">
        Build the pattern by tapping the right words
      </p>
      {items.map((it, i) => {
        const filled = placements[i] ?? []
        return (
          <div key={i} className="bg-surface-practice-bg rounded-pwp-tile p-3">
            <p className="text-pwp-xs text-neutral-500 mb-2">Sentence {i + 1}</p>
            {/* Slots */}
            <div className="flex flex-wrap gap-2 justify-center mb-3">
              {it.formula.map((wc, si) => {
                const colours = WORD_CLASS_COLOURS[wc]
                const word = filled[si]
                return (
                  <button key={si} onClick={() => clearSlot(i, si)}
                    className="px-3 py-2 rounded-pwp-tile text-center min-w-[64px]"
                    style={{
                      background: word ? colours.bg : 'white',
                      color: colours.text,
                      border: `2px dashed ${colours.border}`,
                      borderBottom: `3px solid ${colours.border}`,
                      minHeight: 'var(--pwp-touch-min)',
                    }}>
                    <div className="text-[8px] font-extrabold uppercase tracking-wider opacity-70">{colours.label}</div>
                    <div className="text-pwp-sm font-extrabold">{word || '___'}</div>
                  </button>
                )
              })}
            </div>
            {/* Word bank */}
            <div className="flex flex-wrap gap-1.5">
              {it.word_bank.map((chip) => {
                const used = filled.includes(chip.word)
                const colours = WORD_CLASS_COLOURS[chip.class]
                return (
                  <button key={chip.word} onClick={() => placeChip(i, chip.class, chip.word)} disabled={used}
                    className="px-2 py-1.5 rounded-pwp-tile text-pwp-xs font-bold disabled:opacity-30"
                    style={{
                      background: colours.bg,
                      color: colours.text,
                      border: `2px solid ${colours.border}`,
                      borderBottom: `3px solid ${colours.border}`,
                      minHeight: 'var(--pwp-touch-min)',
                    }}>
                    {chip.word}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
      <button onClick={() => onSubmit({ placements })} disabled={!allFull || submitting} className="btn-wrife-cta btn-wrife-cta--primary mt-2">
        {submitting ? 'Checking…' : 'Check my sentences'}
      </button>
    </div>
  )
}
