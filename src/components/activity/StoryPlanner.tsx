import { useState } from 'react'
import type { ActivityProps } from './types'

type Section = 'beginning' | 'middle' | 'end'
interface PlannerItems {
  prompt: string
  sections: Section[]
  min_sentences?: number
}

const SECTION_META: Record<Section, { label: string; emoji: string; placeholder: string }> = {
  beginning: { label: 'Beginning', emoji: '🌅', placeholder: 'Set the scene. Introduce the character. Where are we?' },
  middle:    { label: 'Middle',    emoji: '🌊', placeholder: 'What happens? What\'s the problem or surprise?' },
  end:       { label: 'End',       emoji: '🏁', placeholder: 'How does it resolve? How does the character feel?' },
}

/**
 * Tier 6 — Story planner.
 *
 * For L29/L30/L31 each shows just one section. For L32 (full BME plan) and
 * L33 (first complete story milestone), all three sections appear. Treated
 * as one composite submission so the AI grader can evaluate structure.
 */
export default function StoryPlanner({ level, onSubmit, submitting }: ActivityProps) {
  const rawMetaS = Array.isArray(level.items) ? level.items[0] : level.items
  const meta = (rawMetaS as unknown as PlannerItems) ?? {
    prompt: level.prompt_instructions,
    sections: ['beginning', 'middle', 'end'],
  }
  const [drafts, setDrafts] = useState<Record<Section, string>>(
    Object.fromEntries(meta.sections.map((s) => [s, ''])) as Record<Section, string>
  )

  const totalWords = Object.values(drafts).reduce(
    (acc, txt) => acc + (txt.trim() ? txt.trim().split(/\s+/).length : 0),
    0
  )
  const totalSentences = Object.values(drafts).reduce(
    (acc, txt) => acc + (txt.trim() ? txt.trim().split(/[.!?]+/).filter((s) => s.trim()).length : 0),
    0
  )
  const minSentences = meta.min_sentences ?? 0
  const ready = meta.sections.every((s) => drafts[s].trim().length > 4) && totalSentences >= minSentences

  return (
    <div className="flex flex-col gap-4">
      {meta.prompt && (
        <div className="bg-surface-prompt-chip rounded-pwp-tile px-4 py-3 border-l-[3px] border-brand-secondary">
          <p className="text-pwp-xs font-extrabold text-orange-700 uppercase tracking-wide mb-1">Story prompt</p>
          <p className="text-pwp-md font-bold text-neutral-800">{meta.prompt}</p>
        </div>
      )}
      {meta.sections.map((s) => (
        <div key={s} className="bg-white border-2 border-brand-primary/15 rounded-pwp-tile p-3">
          <p className="text-pwp-xs font-extrabold text-brand-primary uppercase tracking-wide mb-2">
            {SECTION_META[s].emoji} {SECTION_META[s].label}
          </p>
          <textarea
            value={drafts[s]}
            onChange={(e) => setDrafts((d) => ({ ...d, [s]: e.target.value }))}
            placeholder={SECTION_META[s].placeholder}
            className="w-full bg-surface-practice-bg border-2 border-brand-primary/20 focus:border-brand-primary rounded-pwp-tile px-3 py-2 text-pwp-base outline-none min-h-[100px]"
          />
        </div>
      ))}
      <div className="flex justify-between text-pwp-xs text-neutral-500">
        <span>{totalWords} word{totalWords === 1 ? '' : 's'} · {totalSentences} sentence{totalSentences === 1 ? '' : 's'}</span>
        {minSentences > 0 && totalSentences < minSentences && (
          <span className="text-orange-600">Aim for at least {minSentences} sentences</span>
        )}
      </div>
      <button onClick={() => onSubmit({ drafts, sections: meta.sections })} disabled={!ready || submitting} className="btn-wrife-cta btn-wrife-cta--primary">
        {submitting ? 'Checking…' : 'Submit my story →'}
      </button>
    </div>
  )
}
