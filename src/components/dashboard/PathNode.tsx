import { Link } from 'react-router-dom'
import type { LevelState } from '@/lib/progress/levels'
import type { DwpLevel } from '@/types/dwp'

interface Props {
  level: DwpLevel
  state: LevelState
}

/**
 * WriFe World Pattern 4 — circular level path node.
 *
 * Completed   — purple solid + tick + small star badge
 * Current     — orange solid + glow halo + "Start!" callout pill
 * Locked      — grey + lock icon + 0.45 opacity
 * Tier finale — slightly larger node + star icon
 */
export default function PathNode({ level, state }: Props) {
  const isFinale = level.tier_finale || level.programme_finale
  const baseSize = isFinale ? 72 : 56
  const currentSize = isFinale ? 80 : 64

  if (state === 'completed') {
    return (
      <div className="flex flex-col items-center gap-1">
        <div
          className="rounded-full bg-brand-primary flex items-center justify-center relative"
          style={{
            width: baseSize, height: baseSize,
            borderBottom: '4px solid #3d35a0',
          }}
        >
          <span className="text-white text-xl" aria-hidden="true">✓</span>
          <span className="absolute -top-1.5 -right-1.5 bg-brand-secondary rounded-full w-5 h-5 flex items-center justify-center border-2 border-white">
            <span className="text-white text-[9px]" aria-hidden="true">⭐</span>
          </span>
        </div>
        <span className="text-pwp-xs font-bold text-brand-primary">
          L{level.level_number} · {shortName(level.activity_name)}
        </span>
      </div>
    )
  }

  if (state === 'current') {
    return (
      <Link to={`/level/${level.level_id}`} className="flex flex-col items-center gap-1.5 group">
        <span className="bg-brand-secondary text-white text-pwp-xs font-extrabold rounded-pwp-tile px-3.5 py-1"
              style={{ borderBottom: '3px solid #c47a0a' }}>
          Start!
        </span>
        <div
          className="rounded-full bg-brand-secondary flex items-center justify-center transition-transform group-hover:scale-105"
          style={{
            width: currentSize, height: currentSize,
            borderBottom: '5px solid #c47a0a',
            outline: '4px solid #fff3e0',
          }}
        >
          <span className="text-white text-2xl" aria-hidden="true">✏️</span>
        </div>
        <span className="text-pwp-xs font-extrabold text-brand-secondary-dark">
          L{level.level_number} · {shortName(level.activity_name)}
        </span>
      </Link>
    )
  }

  // Locked
  return (
    <div className="flex flex-col items-center gap-1 opacity-45" aria-disabled="true">
      <div
        className="rounded-full bg-neutral-300 flex items-center justify-center"
        style={{
          width: baseSize - 4, height: baseSize - 4,
          borderBottom: '4px solid #bbb',
        }}
      >
        <span className="text-neutral-500 text-lg" aria-hidden="true">🔒</span>
      </div>
      <span className="text-pwp-xs font-bold text-neutral-400">L{level.level_number}</span>
    </div>
  )
}

function shortName(activityName: string): string {
  // Trim to first 14 chars for the node label
  return activityName.length > 14 ? activityName.slice(0, 12) + '…' : activityName
}
