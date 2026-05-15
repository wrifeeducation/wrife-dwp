import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import BackToWriFe from '@/components/shell/BackToWriFe'
import HomeNav from '@/components/shell/HomeNav'
import StatsChips from '@/components/dashboard/StatsChips'
import TierBanner from '@/components/dashboard/TierBanner'
import WindingPath from '@/components/dashboard/WindingPath'
import ProgressHero from '@/components/dashboard/ProgressHero'
import PathSprite from '@/components/dashboard/PathSprite'
import { useLevels } from '@/hooks/useLevels'
import { useProgress } from '@/hooks/useProgress'
import { deriveLevelStates, groupByTier } from '@/lib/progress/levels'
import { supabase } from '@/lib/supabase'

/**
 * Redesigned DWP dashboard. From top to bottom:
 *   - Sticky top bar: mascot home pill, "WriFe World", stats chips
 *   - Daily Prompt + My Garden CTA tiles
 *   - Progress hero card with greeting, progress bar, Quick Resume
 *   - Per-tier chapter banner + winding level path with mascot sprites
 *
 * Visually mirrors the energy of PWP Studio's chapter map while adding
 * the staggered Duolingo-style path that primary pupils respond to.
 */
export default function Dashboard() {
  const { levels, loading: lLoading, error: lErr } = useLevels()
  const { progress, loading: pLoading } = useProgress()
  const [pupilName, setPupilName] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function loadName() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const meta = user.user_metadata?.display_name as string | undefined
      if (meta) { if (!cancelled) setPupilName(meta); return }
      const { data: pupil } = await supabase.from('pupils').select('display_name').eq('auth_user_id', user.id).maybeSingle()
      if (!cancelled && pupil?.display_name) setPupilName(pupil.display_name)
    }
    loadName()
    return () => { cancelled = true }
  }, [])

  if (lLoading || pLoading) return <LoadingShell />
  if (lErr) return <ErrorShell error={lErr.message} />
  if (!levels || levels.length === 0) return <ErrorShell error="No levels found." />

  const states = deriveLevelStates(levels, progress)
  const grouped = groupByTier(levels)
  const tierKeys = [...grouped.keys()].sort((a, b) => a - b)

  return (
    <main className="min-h-screen bg-surface-pupil pb-12">
      {/* Top bar */}
      <header className="bg-brand-primary text-white px-4 py-3 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BackToWriFe />
            <HomeNav />
            <span className="font-extrabold text-pwp-md hidden sm:inline">WriFe World</span>
          </div>
          <StatsChips
            streak={progress?.current_streak_days ?? 0}
            xp={progress?.xp_total ?? 0}
          />
        </div>
      </header>

      {/* CTA tiles row */}
      <nav className="max-w-3xl mx-auto px-4 mt-4 grid grid-cols-2 gap-2">
        <Link to="/daily" className="text-center py-3 rounded-pwp-tile bg-mode-correct text-white text-pwp-sm font-extrabold"
              style={{ borderBottom: '3px solid #007d67' }}>
          📝 Today's prompt
        </Link>
        <Link to="/garden" className="text-center py-3 rounded-pwp-tile bg-brand-primary text-white text-pwp-sm font-extrabold"
              style={{ borderBottom: '3px solid #3d35a0' }}>
          🌱 My Garden
        </Link>
      </nav>

      {/* Main column */}
      <section className="max-w-3xl mx-auto px-4 mt-5">
        <ProgressHero progress={progress} totalLevels={levels.length} pupilName={pupilName ?? undefined} />

        {tierKeys.map((tier, tIdx) => {
          const tierLevels = grouped.get(tier) ?? []
          const completedInTier = tierLevels.filter((l) => states.get(l.level_id) === 'completed').length
          const hasCurrentInTier = tierLevels.some((l) => states.get(l.level_id) === 'current')
          const isTierComplete = completedInTier === tierLevels.length
          const allLocked = !hasCurrentInTier && completedInTier === 0

          return (
            <div key={tier} className="mb-8">
              <TierBanner tier={tier} completedCount={completedInTier} totalCount={tierLevels.length} isComplete={isTierComplete} />
              {/* Subtle decorative sprite — only on un-touched future tiers */}
              {allLocked && tIdx > 0 && (
                <div className="flex justify-center mb-3 -mt-1 opacity-60">
                  <PathSprite pose="thinking" side="left" size={44} rotate={-6} />
                </div>
              )}
              <WindingPath levels={tierLevels} states={states} />
            </div>
          )
        })}

        {/* End-of-path mascot */}
        <div className="flex justify-center mt-6 opacity-70">
          <PathSprite pose="reading" side="left" size={64} />
        </div>
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
