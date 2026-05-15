import { useState, useMemo } from 'react'
import type { ActivityProps } from './types'
import { shuffle } from '@/lib/progress/shuffle'

interface VerbItem { sentence: string; verb: string }

/**
 * L2 — Tap the action word in each sentence.
 * Big sentence card per item, with each word a tappable chip.
 * The verb's chip turns into the canonical verb-red tile when selected.
 */
export default function VerbIdentification({ level, onSubmit, submitting }: ActivityProps) {
  const rawItems = (level.items as VerbItem[]) ?? []
  const items = useMemo(() => shuffle(rawItems), [level.level_id])
  const [picks, setPicks] = useState<Record<number, string>>({})
  const allAnswered = items.length > 0 && items.every((_, i) => picks[i])

  return (
    <div className="flex flex-col gap-5">
      <div className="bg-surface-practice-bg rounded-pwp-tile px-4 py-3 text-center">
        <p className="text-pwp-sm font-extrabold text-brand-primary uppercase tracking-wide">
          Tap the action word in each sentence
        </p>
      </div>
      {items.map((it, i) => {
        const tokens = it.sentence.split(/\s+/)
        return (
          <div key={i} className="bg-white rounded-pwp-banner p-4 border-2 border-brand-primary/15">
            <p className="text-pwp-xs font-extrabold text-neutral-400 uppercase tracking-wide mb-3">
              Sentence {i + 1}
            </p>
            <div className="flex flex-wrap gap-2">
              {tokens.map((raw, idx) => {
                const clean = raw.replace(/[.,!?]$/, '')
                const isPicked = picks[i] === clean
                return (
                  <button
                    key={idx}
                    onClick={() => setPicks((p) => ({ ...p, [i]: clean }))}
                    className="rounded-pwp-tile font-extrabold transition-all"
                    style={{
                      background: isPicked ? '#E17055' : 'white',
                      color: isPicked ? 'white' : '#333',
                      border: '3px solid',
                      borderColor: isPicked ? '#E17055' : '#ddd',
                      borderBottom: '4px solid',
                      borderBottomColor: isPicked ? '#8d2828' : '#ccc',
                      padding: '10px 14px',
                      fontSize: 'var(--pwp-text-md)',
                      minHeight: 'var(--pwp-touch)',
                      transform: isPicked ? 'translateY(-2px)' : 'none',
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
      <button onClick={() => onSubmit({ picks: items.map((it, i) => ({ sentence: it.sentence, expected_verb: it.verb, pupil_pick: picks[i] ?? null })) })} disabled={!allAnswered || submitting} className="btn-wrife-cta btn-wrife-cta--primary">
        {submitting ? 'Checking…' : 'Check my answers →'}
      </button>
    </div>
  )
}
