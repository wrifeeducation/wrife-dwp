import { TIER_THEMES } from '@/lib/progress/tierThemes'

interface Props {
  tier: number
  completedCount: number
  totalCount: number
  isComplete?: boolean
}

/**
 * Chapter-style tier banner. Bigger, themed per tier, with skill chips and
 * a "X/N levels" badge. Inspired by the PWP Studio "Chapter 1" card pattern.
 */
export default function TierBanner({ tier, completedCount, totalCount, isComplete }: Props) {
  const theme = TIER_THEMES[tier]
  if (!theme) return null

  return (
    <div
      className="rounded-pwp-banner px-5 py-4 mb-5 flex items-start justify-between gap-3"
      style={{ background: theme.bg, color: theme.fg, border: `2px solid ${theme.fg}10` }}
    >
      <div className="flex items-start gap-3 flex-1">
        <div className="text-3xl leading-none mt-0.5" aria-hidden="true">{theme.emoji}</div>
        <div className="flex-1">
          <p className="text-pwp-xs font-extrabold uppercase tracking-wider opacity-70">Tier {theme.number}</p>
          <p className="text-pwp-md font-extrabold">{theme.title}</p>
          <p className="text-pwp-xs opacity-75 mb-2">{theme.subtitle}</p>
          <div className="flex flex-wrap gap-1.5">
            {theme.skills.map((s) => (
              <span key={s} className="text-[10px] font-extrabold px-2 py-0.5 rounded-pwp-pill"
                    style={{ background: theme.chipBg, color: theme.chipFg }}>
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className="text-pwp-md font-extrabold leading-none">{completedCount}/{totalCount}</p>
        <p className="text-[10px] font-extrabold opacity-70 uppercase tracking-wide">levels</p>
        {isComplete && (
          <span className="inline-block mt-1 text-[10px] font-extrabold uppercase tracking-wide bg-mode-correct text-white px-2 py-0.5 rounded-pwp-pill">
            ✓ Done
          </span>
        )}
      </div>
    </div>
  )
}
