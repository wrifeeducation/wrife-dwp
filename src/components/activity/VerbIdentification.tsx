import { useState } from 'react'
import type { ActivityProps } from './types'

interface VerbItem { sentence: string; verb: string }

/**
 * L2 — Tap the action word in each sentence.
 * Each word is rendered as a tappable chip. Selecting one marks it as the
 * pupil's answer for that sentence. Verb tile lights up in the canonical
 * red word-class colour to reinforce the colour-grammar link.
 */
export default function VerbIdentification({ level, onSubmit, submitting }: ActivityProps) {
  const items = (level.items as VerbItem[]) ?? []
  const [picks, setPicks] = useState<Record<number, string>>({})

  const allAnswered = items.length > 0 && items.every((_, i) => picks[i])

  function tokenize(sentence: string): string[] {
    return sentence.split(/\s+/)
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-pwp-sm font-extrabold text-neutral-500 uppercase tracking-wide text-center">
        Tap the action word in each sentence
      </p>
      {items.map((it, i) => {
        const tokens = tokenize(it.sentence)
        return (
          <div key={i} className="bg-surface-practice-bg rounded-pwp-tile p-3">
            <p className="text-pwp-xs text-neutral-500 mb-2">Sentence {i + 1}</p>
            <div className="flex flex-wrap gap-1.5">
              {tokens.map((raw, idx) => {
                const clean = raw.replace(/[.,!?]$/, '')
                const isPicked = picks[i] === clean
                return (
                  <button
                    key={idx}
                    onClick={() => setPicks((p) => ({ ...p, [i]: clean }))}
                    className="px-2.5 py-1.5 rounded-pwp-tile text-pwp-base font-bold transition-colors"
                    style={{
                      background: isPicked ? '#ffebee' : 'white',
                      color: isPicked ? '#c62828' : '#333',
                      border: isPicked ? '2px solid #ef9a9a' : '2px solid #ddd',
                      borderBottom: isPicked ? '3px solid #ef9a9a' : '3px solid #ccc',
                      minHeight: 'var(--pwp-touch-min)',
                    }}
                  >
                    {raw}
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
