import { useState } from 'react'
import MicButton from './MicButton'

interface Props {
  onDraftReady: (draftText: string) => void
}

/**
 * "Say it, then write it" workflow.
 *
 * Pupil presses mic → speaks sentence → transcript appears as editable draft.
 * Once they tap "Use this draft", the text seeds the free-writing textarea
 * AND the spoken transcript is stored on dwp_attempts.oral_rehearsal_transcript
 * for teacher visibility / Transfer Gap analysis.
 */
export default function OralRehearsalPanel({ onDraftReady }: Props) {
  const [draft, setDraft] = useState('')

  return (
    <div className="bg-brand-primary/5 border-2 border-brand-primary/20 rounded-pwp-tile p-4 mb-4">
      <p className="text-pwp-xs font-extrabold text-brand-primary uppercase tracking-wide mb-2">
        🎤 Say it first
      </p>
      <p className="text-pwp-base text-neutral-700 mb-3">
        Speak your sentence aloud. We'll show it as a draft you can edit before you type.
      </p>
      <MicButton onTranscript={setDraft} />
      {draft && (
        <div className="mt-3">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="w-full bg-white border-2 border-brand-primary/30 rounded-pwp-tile px-3 py-2 text-pwp-base"
            rows={2}
          />
          <button
            onClick={() => onDraftReady(draft)}
            className="mt-2 text-pwp-xs font-bold text-brand-primary underline"
          >
            Use this draft →
          </button>
        </div>
      )}
    </div>
  )
}
