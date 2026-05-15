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
  const [text, setText] = useState(oralRehearsalTranscript ?? '')
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0

  return (
    <div className="flex flex-col gap-3">
      <p className="text-pwp-sm text-neutral-600">{level.prompt_instructions}</p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write here…"
        className="w-full bg-surface-practice-bg border-2 border-brand-primary/30 focus:border-brand-primary outline-none rounded-pwp-tile px-3 py-3 text-pwp-base font-medium min-h-[180px]"
      />
      <div className="flex justify-between text-pwp-xs text-neutral-500">
        <span>{wordCount} word{wordCount === 1 ? '' : 's'}</span>
        {wordCount < minWords && <span className="text-orange-600">Aim for at least {minWords} words</span>}
      </div>
      <button
        onClick={() => onSubmit({ text })}
        disabled={submitting || wordCount < minWords}
        className="btn-wrife-cta btn-wrife-cta--primary"
      >
        {submitting ? 'Checking…' : 'Submit my writing'}
      </button>
    </div>
  )
}
