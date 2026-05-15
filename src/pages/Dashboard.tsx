import { Link } from 'react-router-dom'
import BackToWriFe from '@/components/shell/BackToWriFe'
import HomeNav from '@/components/shell/HomeNav'
import StatsChips from '@/components/dashboard/StatsChips'
import UnitBanner from '@/components/dashboard/UnitBanner'
import PathNode from '@/components/dashboard/PathNode'
import PathConnector from '@/components/dashboard/PathConnector'
import { useLevels } from '@/hooks/useLevels'
import { useProgress } from '@/hooks/useProgress'
import { deriveLevelStates, groupByTier } from '@/lib/progress/levels'

/**
 * DWP Dashboard — scrolling vertical level path of 40 nodes grouped by tier.
 * WriFe World patterns 1, 4. Background pale purple behind the path area.
 */
export default function Dashboard() {
  const { levels, loading: lLoading, error: lErr } = useLevels()
  const { progress, loading: pLoading } = useProgress()

  if (lLoading || pLoading) return <LoadingShell />
  if (lErr) return <ErrorShell error={lErr.message} />
  if (!levels) return <ErrorShell error="No levels found." />

  const states = deriveLevelStates(levels, progress)
  const grouped = groupByTier(levels)
  const tierKeys = [...grouped.keys()].sort((a, b) => a - b)

  return (
    <main className="min-h-screen bg-surface-pupil">
      {/* Top stats bar */}
      <header className="bg-brand-primary text-white px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <BackToWriFe />
          <HomeNav />
          <span className="font-extrabold text-pwp-md">WriFe World</span>
        </div>
        <StatsChips
          streak={progress?.current_streak_days ?? 0}
          xp={progress?.xp_total ?? 0}
        />
      </header>

      {/* Daily prompt + garden tabs */}
      <nav className="bg-white px-4 py-2 flex gap-2 border-b border-neutral-100">
        <Link to="/daily" className="flex-1 text-center py-2 rounded-pwp-tile bg-mode-correct text-white text-pwp-sm font-extrabold"
              style={{ borderBottom: '3px solid #007d67' }}>
          📝 Today's prompt
        </Link>
        <Link to="/garden" className="flex-1 text-center py-2 rounded-pwp-tile bg-brand-primary text-white text-pwp-sm font-extrabold"
              style={{ borderBottom: '3px solid #3d35a0' }}>
          🌱 My Garden
        </Link>
      </nav>

      {/* Path */}
      <section className="bg-surface-path-bg px-5 py-6">
        {tierKeys.map((tier) => {
          const tierLevels = grouped.get(tier) ?? []
          const isTierComplete = tierLevels.every((l) => states.get(l.level_id) === 'completed')
          return (
            <div key={tier} className="mb-8">
              <UnitBanner tier={tier} completed={isTierComplete} />
              <div className="flex flex-col items-center">
                {tierLevels.map((lvl, i) => {
                  const state = states.get(lvl.level_id) ?? 'locked'
                  const nextLvl = tierLevels[i + 1]
                  const nextState = nextLvl ? states.get(nextLvl.level_id) ?? 'locked' : null
                  const isLastInTier = !nextLvl
                  return (
                    <div key={lvl.level_id} className="flex flex-col items-center">
                      <PathNode level={lvl} state={state} />
                      {!isLastInTier && (
                        <PathConnector state={state === 'completed' ? 'completed' : 'locked'} />
                      )}
                      {/* Show next-state connector colour better */}
                      {!isLastInTier && state === 'completed' && nextState === 'current' && null}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </section>
    </main>
  )
}

function LoadingShell() {
  return (
    <main className="min-h-screen bg-surface-pupil grid place-items-center">
      <p className="text-pwp-base text-neutral-500">Loading your path…</p>
    </main>
  )
}

function ErrorShell({ error }: { error: string }) {
  return (
    <main className="min-h-screen bg-surface-pupil grid place-items-center p-6">
      <div className="text-center">
        <p className="text-pwp-md font-bold text-red-700 mb-2">Something went wrong</p>
        <p className="text-pwp-sm text-neutral-600">{error}</p>
      </div>
    </main>
  )
}
