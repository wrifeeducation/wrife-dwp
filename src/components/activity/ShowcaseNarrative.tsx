import { useState } from 'react'
import type { ActivityProps } from './types'

interface ShowcaseItems {
  prompt?: string
  target_sentences: number
  showcase?: boolean        // true for L40 — extra celebration framing
  bme_checklist?: boolean   // true for L39/L40 — visible BME hints
}

function countSentences(text: string): number {
  const trimmed = text.trim()
  if (!trimmed) return 0
  return trimmed.split(/[.!?]+/).filter((s) => s.trim()).length
}

/**
 * Tier 8 — The narrative showcase variants. Big textarea, live sentence
 * count vs. target, optional BME checklist on the side. L40 gets extra
 * celebration framing as the programme finale.
 */
export default function ShowcaseNarrative({ level, onSubmit, submitting }: ActivityProps) {
  const meta = (level.items as unknown as ShowcaseItems) ?? { target_sentences: 10 }
  const [text, setText] = useState('')
  const sentenceCount = countSentences(text)
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0
  const targetMet = sentenceCount >= meta.target_sentences

  return (
    <div className="flex flex-col gap-4">
      {meta.showcase && (
        <div className="bg-brand-primary/10 border-2 border-brand-primary rounded-pwp-banner p-3 text-center">
          <p className="text-pwp-xs font-extrabold text-brand-primary uppercase tracking-wide">👑 Programme Finale</p>
          <p className="text-pwp-base text-neutral-700">This is the final challenge. Take your time and show off everything you've learned.</p>
        </div>
      )}
      {meta.prompt && (
        <div className="bg-surface-prompt-chip rounded-pwp-tile px-4 py-3 border-l-[3px] border-brand-secondary">
          <p className="text-pwp-xs font-extrabold text-orange-700 uppercase tracking-wide mb-1">Story prompt</p>
          <p className="text-pwp-md font-bold text-neutral-800">{meta.prompt}</p>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write your story here…"
          className="w-full bg-surface-practice-bg border-2 border-brand-primary/30 focus:border-brand-primary rounded-pwp-tile px-3 py-3 text-pwp-base outline-none min-h-[260px]"
        />
        {meta.bme_checklist && (
          <aside className="md:w-44 bg-white border-2 border-brand-primary/15 rounded-pwp-tile p-3 text-pwp-sm text-neutral-700">
            <p className="font-extrabold text-brand-primary mb-2 uppercase tracking-wide">Aim for</p>
            <ul className="space-y-1.5">
              <li>🌅 Strong beginning</li>
              <li>🌊 Surprise or problem</li>
              <li>🏁 Satisfying ending</li>
              <li>💎 Varied sentence types</li>
              <li>🎨 Vivid detail words</li>
            </ul>
          </aside>
        )}
      </div>
      <div className="flex justify-between items-center text-pwp-xs">
        <span className="text-neutral-500">{wordCount} word{wordCount === 1 ? '' : 's'}</span>
        <span className={targetMet ? 'text-mode-correct font-bold' : 'text-orange-600'}>
          {sentenceCount} / {meta.target_sentences} sentences {targetMet ? '✓' : ''}
        </span>
      </div>
      <button onClick={() => onSubmit({ text })} disabled={!targetMet || submitting} className="btn-wrife-cta btn-wrife-cta--primary">
        {submitting ? 'Submitting…' : meta.showcase ? 'Submit my finale →' : 'Submit my story →'}
      </button>
    </div>
  )
}
