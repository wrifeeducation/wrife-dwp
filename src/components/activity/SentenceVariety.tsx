import { useState } from 'react'
import type { ActivityProps } from './types'

type SentenceType = 'simple' | 'compound' | 'complex'
interface VarietyItems {
  topic?: string
  required: SentenceType[]              // which types must be produced
}

const TYPE_META: Record<SentenceType, { label: string; description: string; example: string }> = {
  simple:   { label: 'Simple',   description: 'One idea on its own.',           example: 'The dog barked.' },
  compound: { label: 'Compound', description: 'Two ideas joined with and/but/so.', example: 'The dog barked and the cat ran.' },
  complex:  { label: 'Complex',  description: 'Includes a starter clause (when/although/because…).', example: 'When the doorbell rang, the dog barked.' },
}

/**
 * Tier 7 — Write one sentence of each requested type (simple / compound /
 * complex) on a single topic.
 */
export default function SentenceVariety({ level, onSubmit, submitting }: ActivityProps) {
  const rawMetaV = Array.isArray(level.items) ? level.items[0] : level.items
  const meta = (rawMetaV as unknown as VarietyItems) ?? { required: ['simple', 'compound', 'complex'] }
  const [drafts, setDrafts] = useState<Record<SentenceType, string>>(
    Object.fromEntries(meta.required.map((t) => [t, ''])) as Record<SentenceType, string>
  )
  const ready = meta.required.every((t) => (drafts[t] ?? '').trim().length > 5)

  return (
    <div className="flex flex-col gap-3">
      {meta.topic && (
        <div className="bg-surface-prompt-chip rounded-pwp-tile px-4 py-3 border-l-[3px] border-brand-secondary">
          <p className="text-pwp-xs font-extrabold text-orange-700 uppercase tracking-wide mb-1">Today's topic</p>
          <p className="text-pwp-base font-medium text-neutral-800">{meta.topic}</p>
        </div>
      )}
      {meta.required.map((t) => {
        const m = TYPE_META[t]
        return (
          <div key={t} className="bg-white border-2 border-brand-primary/15 rounded-pwp-tile p-3">
            <p className="text-pwp-xs font-extrabold text-brand-primary uppercase tracking-wide mb-1">{m.label} sentence</p>
            <p className="text-pwp-base text-neutral-600 mb-1">{m.description}</p>
            <p className="text-pwp-sm text-neutral-400 italic mb-2">e.g. {m.example}</p>
            <textarea
              value={drafts[t]}
              onChange={(e) => setDrafts((d) => ({ ...d, [t]: e.target.value }))}
              className="w-full bg-surface-practice-bg border-2 border-brand-primary/20 focus:border-brand-primary rounded-pwp-tile px-3 py-2 text-pwp-base outline-none min-h-[60px]"
            />
          </div>
        )
      })}
      <button onClick={() => onSubmit({ drafts })} disabled={!ready || submitting} className="btn-wrife-cta btn-wrife-cta--primary mt-1">
        {submitting ? 'Checking…' : 'Check my sentences'}
      </button>
    </div>
  )
}
