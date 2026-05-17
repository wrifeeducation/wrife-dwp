import { Link } from 'react-router-dom'
import type { LevelState } from '@/lib/progress/levels'
import type { DwpLevel } from '@/types/dwp'
import { shortLevelTitle, levelSubtitle } from '@/lib/progress/levelLabels'

interface Props {
  level: DwpLevel
  state: LevelState
}

/**
 * PathNode with the WriFe World circular node + a side card showing
 * Level number, short title, subtitle, and a status chip. Used inside the
 * WindingPath.
 *
 * Visual states:
 *   completed → purple circle + ✓ + star badge + "Done" chip
 *   current   → orange circle (larger) + pencil + halo + "Start!" chip
 *   locked    → grey circle + lock + 0.45 opacity + "Locked" chip
 *
 * Tier finales render the node a notch larger to feel like a boss.
 */
export default function PathNode({ level, state }: Props) {
  const isFinale = level.tier_finale || level.programme_finale
  const baseSize = isFinale ? 76 : 60
  const currentSize = isFinale ? 86 : 70

  const title = shortLevelTitle(level)
  const subtitle = levelSubtitle(level)

  const node = (
    <div className="flex flex-col items-center">
      {state === 'current' && (
        <span className="bg-brand-secondary text-white text-pwp-xs font-extrabold rounded-pwp-tile px-3 py-1 mb-1.5"
              style={{ borderBottom: '3px solid #c47a0a' }}>
          Start!
        </span>
      )}
      {state === 'completed' && (
        <div
          className="rounded-full flex items-center justify-center relative"
          style={{
            width: baseSize, height: baseSize,
            background: 'radial-gradient(ellipse at 38% 32%, #9B8FF7 0%, #6C5CE7 55%, #4A3DAD 100%)',
            boxShadow: 'inset 0 3px 8px rgba(255,255,255,0.28), inset 0 -2px 6px rgba(0,0,0,0.18), 0 5px 0 #3d35a0, 0 8px 18px rgba(61,53,160,0.33)',
          }}
        >
          <span className="text-white text-2xl" aria-hidden="true">✓</span>
          <span
            className="absolute -top-1.5 -right-1.5 rounded-full w-5 h-5 flex items-center justify-center border-2 border-white"
            style={{ background: 'radial-gradient(ellipse at 38% 32%, #FFD08A 0%, #F5A623 55%, #C47010 100%)' }}
          >
            <span className="text-white text-[9px]" aria-hidden="true">⭐</span>
          </span>
        </div>
      )}
      {state === 'current' && (
        <div
          className="rounded-full flex items-center justify-center transition-transform group-hover:scale-105"
          style={{
            width: currentSize, height: currentSize,
            background: 'radial-gradient(ellipse at 38% 32%, #FFD08A 0%, #F5A623 55%, #C47010 100%)',
            boxShadow: 'inset 0 4px 10px rgba(255,255,255,0.28), inset 0 -3px 8px rgba(0,0,0,0.18), 0 6px 0 #A85F0A, 0 10px 24px rgba(168,95,10,0.35)',
            outline: '4px solid #fff3e0',
            outlineOffset: '2px',
          }}
        >
          <span className="text-white text-2xl" aria-hidden="true">✏️</span>
        </div>
      )}
      {state === 'locked' && (
        <div
          className="rounded-full flex items-center justify-center"
          style={{
            width: baseSize - 4, height: baseSize - 4,
            background: 'radial-gradient(ellipse at 38% 32%, #E5E7EB 0%, #C8CBD0 55%, #9CA3AF 100%)',
            boxShadow: 'inset 0 3px 7px rgba(255,255,255,0.45), inset 0 -2px 5px rgba(0,0,0,0.12), 0 4px 0 #9CA3AF',
          }}
        >
          <span className="text-neutral-500 text-xl" aria-hidden="true">🔒</span>
        </div>
      )}
    </div>
  )

  const statusChip =
    state === 'completed' ? <span className="text-[10px] font-extrabold uppercase tracking-wide bg-mode-correct/15 text-mode-correct-dark px-2 py-0.5 rounded-pwp-pill">✓ Done</span> :
    state === 'current'   ? <span className="text-[10px] font-extrabold uppercase tracking-wide bg-brand-secondary text-white px-2 py-0.5 rounded-pwp-pill">▶ You are here</span> :
                            <span className="text-[10px] font-extrabold uppercase tracking-wide bg-neutral-200 text-neutral-500 px-2 py-0.5 rounded-pwp-pill">🔒 Locked</span>

  const card = (
    <div className={`flex-1 ${state === 'locked' ? 'opacity-50' : ''}`}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-pwp-xs font-extrabold text-neutral-500">Level {level.level_number}</span>
        {statusChip}
      </div>
      <p className="text-pwp-base font-extrabold text-neutral-900 leading-tight">{title}</p>
      {subtitle && <p className="text-pwp-xs text-neutral-500 mt-0.5">{subtitle}</p>}
    </div>
  )

  if (state === 'current') {
    return (
      <Link to={`/level/${level.level_id}`} className="group flex items-center gap-4 bg-white rounded-pwp-banner border-2 border-brand-secondary p-3 shadow-pwp-card transition-transform hover:-translate-y-0.5">
        {node}
        {card}
      </Link>
    )
  }
  if (state === 'completed') {
    return (
      <Link
        to={`/level/${level.level_id}`}
        className="group flex items-center gap-4 bg-white rounded-pwp-banner border border-brand-primary/15 p-3 transition-transform hover:-translate-y-0.5 hover:border-brand-primary/40"
        aria-label={`Review Level ${level.level_number} — ${shortLevelTitle(level)}`}
      >
        {node}
        {card}
      </Link>
    )
  }
  return (
    <div className="flex items-center gap-4 rounded-pwp-banner p-3 bg-neutral-50 border border-neutral-100">
      {node}
      {card}
    </div>
  )
}
