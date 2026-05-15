import { Link } from 'react-router-dom'
import type { DwpProgress } from '@/types/dwp'

interface Props {
  progress: DwpProgress | null
  totalLevels: number
  pupilName?: string
}

/**
 * Hero progress card at the top of the dashboard. Like PWP Studio's "Your
 * Learning Path" card. Shows pupil name, encouragement, progress bar, and
 * a Quick Resume button to jump straight into the current level.
 */
export default function ProgressHero({ progress, totalLevels, pupilName }: Props) {
  const completed = progress?.levels_completed.length ?? 0
  const xp = progress?.xp_total ?? 0
  const pct = Math.min(100, Math.round((completed / totalLevels) * 100))
  const currentLevelId = progress?.current_level_id ?? 'dwp_l1'
  const greeting = pupilName ? `Hi ${pupilName.split(' ')[0]}!` : 'Your writing journey'

  return (
    <section className="mb-5">
      {/* Hero card */}
      <div className="bg-brand-primary text-white rounded-pwp-banner p-5 mb-3"
           style={{ background: 'linear-gradient(135deg, #6C5CE7 0%, #8a7eff 100%)' }}>
        <p className="text-pwp-xs font-extrabold uppercase tracking-wider opacity-80 mb-1">
          {greeting} <span aria-hidden="true">✨</span>
        </p>
        <h2 className="text-pwp-xl font-extrabold mb-1">Your writing journey</h2>
        <p className="text-pwp-sm opacity-90 mb-3">
          {completed === 0
            ? 'Start with Level 1 — every word makes you stronger.'
            : completed >= totalLevels
              ? "You've mastered every level. Incredible!"
              : `You've finished ${completed} of ${totalLevels} levels. Keep going!`}
        </p>
        {/* Progress bar */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-3 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-pwp-xs font-extrabold whitespace-nowrap">{xp} XP</span>
        </div>
      </div>

      {/* Quick Resume — only when not at the end */}
      {completed < totalLevels && (
        <Link
          to={`/level/${currentLevelId}`}
          className="block w-full text-center bg-brand-secondary text-white text-pwp-md font-extrabold py-3 px-4 rounded-pwp-cta"
          style={{ borderBottom: '4px solid #c47a0a' }}
        >
          ▶ Quick Resume — {currentLevelLabel(currentLevelId)}
        </Link>
      )}
    </section>
  )
}

function currentLevelLabel(levelId: string): string {
  const m = levelId.match(/^dwp_l(\d+)$/)
  return m ? `Level ${m[1]}` : 'Continue'
}
