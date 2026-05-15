import { useNavigate, useParams, Link } from 'react-router-dom'
import BackToWriFe from '@/components/shell/BackToWriFe'
import HomeNav from '@/components/shell/HomeNav'
import Mascot from '@/components/shell/Mascot'
import { useLevel } from '@/hooks/useLevel'
import { TIER_TITLES } from '@/lib/progress/levels'

/**
 * Level start screen — pre-activity introduction.
 * WriFe World banner hero + formula chips (when applicable) + step list + CTA.
 */
export default function LevelStart() {
  const { levelId } = useParams()
  const nav = useNavigate()
  const { level, loading, error } = useLevel(levelId)

  if (loading) return <Shell><p className="text-neutral-500">Loading…</p></Shell>
  if (error || !level) return <Shell><p className="text-red-700">Couldn't load this level.</p></Shell>

  return (
    <main className="min-h-screen bg-surface-pupil">
      {/* Banner — bold purple card */}
      <header className="bg-brand-primary text-white px-5 py-5 rounded-b-pwp-banner">
        <div className="flex justify-between items-center mb-2">
          <Link to="/" className="bg-white/15 hover:bg-white/25 transition-colors text-white/90 text-pwp-xs font-bold px-3 py-1.5 rounded-pwp-pill">
            ← Path
          </Link>
          <BackToWriFe />
          <HomeNav />
        </div>
        <span className="inline-block bg-white/15 text-white/85 text-pwp-xs font-extrabold uppercase tracking-wide px-3 py-1 rounded-pwp-pill mb-2">
          Tier {level.tier_number} · Level {level.level_number}
        </span>
        <h1 className="text-pwp-xl font-extrabold">{level.activity_name}</h1>
        <p className="text-white/70 text-pwp-sm mt-1">{TIER_TITLES[level.tier_number]}</p>
      </header>

      {/* Mascot + objective */}
      <section className="px-5 py-5 flex gap-4 items-start bg-white">
        <Mascot pose="reading" size={96} />
        <div>
          <p className="text-pwp-base font-bold text-neutral-800">{level.prompt_title}</p>
          <p className="text-pwp-sm text-neutral-600 mt-1.5">{level.prompt_instructions}</p>
          {level.prompt_example && (
            <p className="text-pwp-sm text-neutral-500 mt-2 italic">e.g. {level.prompt_example}</p>
          )}
        </div>
      </section>

      {/* Learning objective chip */}
      <section className="px-5">
        <div className="bg-surface-prompt-chip rounded-pwp-tile px-4 py-3 border-l-[3px] border-brand-secondary">
          <p className="text-pwp-xs font-extrabold text-orange-700 uppercase tracking-wide mb-1">Today you'll</p>
          <p className="text-pwp-sm text-neutral-800">{level.learning_objective}</p>
        </div>
      </section>

      {/* Start CTA */}
      <section className="px-5 mt-6 mb-8">
        <button
          onClick={() => nav(`/level/${level.level_id}/practice`)}
          className="btn-wrife-cta"
        >
          Start Level {level.level_number} →
        </button>
      </section>
    </main>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return <main className="min-h-screen bg-surface-pupil grid place-items-center p-6">{children}</main>
}
