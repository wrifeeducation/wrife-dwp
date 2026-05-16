import { useState } from 'react'
import type { ActivityProps } from './types'

interface Props extends ActivityProps {
  minWords?: number
  oralRehearsalTranscript?: string
}

/**
 * Free-writing variant — open textarea + word count.
 * Used for milestone levels (L14, L33, L40) and the 365-day Daily Prompt.
 */
export default function FreeWriting({ level, onSubmit, submitting, minWords = 1, oralRehearsalTranscript }: Props) {
  // When invoked as a multi-step "stretch" step, level.items is an array containing
  // one object with prompt + min_words. Honour those, falling back to level fields.
  const stepData = Array.isArray(level.items) && level.items[0] && typeof level.items[0] === 'object' ? (level.items[0] as { prompt?: string; min_words?: number }) : null
  const promptText = stepData?.prompt ?? level.prompt_instructions
  const effectiveMin = stepData?.min_words ?? minWords
  const [text, setText] = useState(oralRehearsalTranscript ?? '')
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0

  return (
    <div className="flex flex-col gap-3">
      <p className="text-pwp-md font-bold text-neutral-800">{promptText}</p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write here…"
        className="w-full bg-surface-practice-bg border-2 border-brand-primary/30 focus:border-brand-primary outline-none rounded-pwp-tile px-3 py-3 text-pwp-md font-medium min-h-[180px] leading-relaxed"
      />
      <div className="flex justify-between text-pwp-sm text-neutral-500">
        <span>{wordCount} word{wordCount === 1 ? '' : 's'}</span>
        {wordCount < effectiveMin && <span className="text-orange-600">Aim for at least {effectiveMin} words</span>}
      </div>
      <button
        onClick={() => onSubmit({ text })}
        disabled={submitting || wordCount < effectiveMin}
        className="btn-wrife-cta btn-wrife-cta--primary"
      >
        {submitting ? 'Checking…' : 'Submit my writing'}
      </button>
    </div>
  )
}
