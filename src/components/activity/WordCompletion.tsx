import { useState } from 'react'
import type { ActivityProps } from './types'
import { WORD_CLASS_COLOURS, type WordClass } from '@/styles/wordClasses'

interface CompletionItem {
  stem: string             // e.g. "The big ___ runs fast."
  answer: string           // canonical correct word
  options: string[]        // word bank, includes answer
  class?: WordClass        // word-class hint for chip colour
}

/**
 * WriFe World fill-in-the-blank.
 *
 * The pupil sees a sentence with a blank. Below it, a word-bank row of
 * coloured chips (using the canonical word-class palette when level.items[i].class
 * is set). Tapping a chip slots it into the blank for that item.
 */
export default function WordCompletion({ level, onSubmit, submitting }: ActivityProps) {
  const items = (level.items as CompletionItem[]) ?? []
  const [picks, setPicks] = useState<Record<number, string>>({})

  const allAnswered = items.length > 0 && items.every((_, i) => picks[i])

  return (
    <div className="flex flex-col gap-4">
      <p className="text-pwp-sm font-extrabold text-neutral-500 uppercase tracking-wide text-center">
        Tap the best word for each blank
      </p>
      {items.map((it, i) => {
        const pick = picks[i]
        const stemWithPick = it.stem.replace('___', pick ? `[${pick}]` : '_____')
        const colours = it.class ? WORD_CLASS_COLOURS[it.class] : null
        return (
          <div key={i} className="bg-surface-practice-bg rounded-pwp-tile p-3">
            <p className="text-pwp-base font-bold text-neutral-900 mb-2">{stemWithPick}</p>
            <div className="flex flex-wrap gap-1.5">
              {it.options.map((opt) => {
                const selected = pick === opt
                return (
                  <button key={opt} onClick={() => setPicks((p) => ({ ...p, [i]: opt }))}
                    className="px-2.5 py-1.5 rounded-pwp-tile text-pwp-sm font-bold transition-colors"
                    style={{
                      background: selected ? (colours?.bg ?? 'var(--color-brand-primary)') : 'white',
                      color: selected ? (colours?.text ?? 'white') : (colours?.text ?? '#333'),
                      border: `2px solid ${colours?.border ?? '#ddd'}`,
                      borderBottom: `3px solid ${colours?.border ?? '#ccc'}`,
                      minHeight: 'var(--pwp-touch-min)',
                    }}>
                    {opt}
                  </button>
                )
              })}
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
