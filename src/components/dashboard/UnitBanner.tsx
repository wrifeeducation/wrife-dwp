import { TIER_TITLES } from '@/lib/progress/levels'

interface Props {
  tier: number
  completed?: boolean
}

/**
 * WriFe World Pattern 1 — bold unit banner.
 * Rounded purple card with tier label + title.
 */
export default function UnitBanner({ tier, completed }: Props) {
  return (
    <div className="bg-brand-primary text-white rounded-pwp-banner px-4 py-3.5 mb-5 flex items-center justify-between">
      <div>
        <div className="text-pwp-xs font-bold uppercase tracking-wide opacity-70">
          Tier {tier}
        </div>
        <div className="text-pwp-md font-extrabold mt-0.5">
          {TIER_TITLES[tier]}
        </div>
      </div>
      {completed && <span className="text-pwp-xs font-bold bg-white/20 px-3 py-1 rounded-pwp-pill">Complete</span>}
    </div>
  )
}
