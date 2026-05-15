import { useState } from 'react'
import type { ActivityProps } from './types'

interface OrderingItem {
  sentences: string[]       // shuffled order as shown to pupil
}

export default function SentenceOrdering({ level, onSubmit, submitting }: ActivityProps) {
  const items = (level.items as OrderingItem[]) ?? []
  const [orders, setOrders] = useState<Record<number, string[]>>(() =>
    Object.fromEntries(items.map((it, i) => [i, [...it.sentences]]))
  )

  function move(itemIdx: number, fromIdx: number, dir: -1 | 1) {
    setOrders((o) => {
      const arr = [...(o[itemIdx] ?? [])]
      const targetIdx = fromIdx + dir
      if (targetIdx < 0 || targetIdx >= arr.length) return o
      ;[arr[fromIdx], arr[targetIdx]] = [arr[targetIdx], arr[fromIdx]]
      return { ...o, [itemIdx]: arr }
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-pwp-sm font-extrabold text-neutral-500 uppercase tracking-wide text-center">
        Put each set of sentences in the right order
      </p>
      {items.map((_it, i) => {
        const arr = orders[i] ?? []
        return (
          <div key={i} className="bg-surface-practice-bg rounded-pwp-tile p-3">
            <p className="text-pwp-xs text-neutral-500 mb-2">Set {i + 1}</p>
            <ol className="space-y-1.5">
              {arr.map((sentence, idx) => (
                <li key={`${i}-${idx}`} className="flex items-center gap-2 bg-white rounded-pwp-tile px-3 py-2">
                  <span className="font-extrabold text-pwp-sm text-brand-primary">{idx + 1}.</span>
                  <span className="flex-1 text-pwp-base text-neutral-900">{sentence}</span>
                  <button onClick={() => move(i, idx, -1)} disabled={idx === 0} className="text-brand-primary text-lg disabled:opacity-30" aria-label="Move up">↑</button>
                  <button onClick={() => move(i, idx, 1)} disabled={idx === arr.length - 1} className="text-brand-primary text-lg disabled:opacity-30" aria-label="Move down">↓</button>
                </li>
              ))}
            </ol>
          </div>
        )
      })}
      <button onClick={() => onSubmit({ orders })} disabled={submitting} className="btn-wrife-cta btn-wrife-cta--primary mt-2">
        {submitting ? 'Checking…' : 'Check my order'}
      </button>
    </div>
  )
}
