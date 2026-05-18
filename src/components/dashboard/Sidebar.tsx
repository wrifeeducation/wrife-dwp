import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import type { DwpProgress } from '@/types/dwp'
import { isHubEntry, wrifeHubUrl } from '@/lib/auth/hubEntry'

interface Props {
  pupilName: string
  progress: DwpProgress | null
}

/**
 * Left sidebar with pupil achievements — ported from the PWP Studio
 * DashboardPage Sidebar to DWP. WriFe-purple background, avatar ring,
 * writer rank pill, XP bar, 2×2 stats grid, weekly streak tracker, sign out.
 *
 * Hidden on mobile via Tailwind `hidden md:flex` — mobile users get the
 * existing top header chips.
 */
export default function Sidebar({ pupilName, progress }: Props) {
  const navigate = useNavigate()
  const completed = progress?.levels_completed.length ?? 0
  const xpTotal = progress?.xp_total ?? 0
  const streakDays = progress?.current_streak_days ?? 0
  const badgesCount = progress?.badges_earned?.length ?? 0
  const rank = writerRank(completed)

  // XP-to-next-rank: each 500 XP unlocks a new "tier" stripe in the avatar ring
  const tier = Math.floor(xpTotal / 500)
  const xpCurrent = xpTotal - tier * 500
  const xpMax = 500
  const xpPct = Math.min(100, Math.round((xpCurrent / xpMax) * 100))
  const ringDeg = Math.round((xpPct / 100) * 360)

  // Weekly streak dots — Mon–Sun, today highlighted with flame
  const today = new Date()
  const dow = today.getDay() // 0 = Sun
  const todayIdx = dow === 0 ? 6 : dow - 1 // Mon=0 … Sun=6
  const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  const streakDots = DAYS.map((label, i) => {
    const daysAgo = (todayIdx - i + 7) % 7
    const isToday = i === todayIdx
    const isFilled = daysAgo < streakDays
    return { label, isToday, isFilled }
  })

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/', { replace: true })
  }

  return (
    <aside
      className="hidden md:flex flex-col gap-3 p-5 sticky top-0 max-h-screen overflow-y-auto"
      style={{ width: 'var(--pwp-sidebar-width)', minHeight: '100dvh', backgroundColor: '#6C5CE7', flexShrink: 0 }}
    >
      {/* Back to WriFe Hub — only when Route A entry */}
      {isHubEntry() && (
        <a href={wrifeHubUrl()} className="text-white/60 text-pwp-xs hover:text-white/95">
          ← WriFe Hub
        </a>
      )}

      {/* Avatar ring */}
      <div className="flex flex-col items-center gap-2 mt-1">
        <div
          className="w-[78px] h-[78px] rounded-full flex items-center justify-center"
          style={{ background: `conic-gradient(#F5C500 0deg ${ringDeg}deg, rgba(255,255,255,0.15) ${ringDeg}deg 360deg)` }}
        >
          <div className="w-[66px] h-[66px] rounded-full bg-[#5a4bd1] grid place-items-center overflow-hidden">
            <img src="/mascots/mascot_std_11.png" alt="" width={56} height={56} className="rounded-full" />
          </div>
        </div>
        <p className="text-white font-extrabold text-pwp-sm">{pupilName || 'Test Pupil'}</p>
        <span className="bg-white/20 text-[#F5C500] text-[11px] font-extrabold px-3 py-[2px] rounded-full">
          {rank}
        </span>
      </div>

      {/* XP bar toward next rank */}
      <div>
        <div className="bg-white/10 rounded-md p-[2px]">
          <div
            className="h-[6px] rounded-sm transition-all duration-500"
            style={{ width: `${xpPct}%`, background: 'linear-gradient(90deg, #F5C500, #F5A623)' }}
          />
        </div>
        <div className="flex justify-between text-white/55 text-[10px] mt-1">
          <span>{xpCurrent.toLocaleString()} XP</span>
          <span>{xpMax} XP</span>
        </div>
      </div>

      {/* 2×2 Stats grid */}
      <div className="grid grid-cols-2 gap-1.5">
        <StatCard icon="⭐" label="Total XP"    val={xpTotal >= 1000 ? `${(xpTotal / 1000).toFixed(1)}k` : String(xpTotal)} />
        <StatCard icon="🔥" label="Streak"      val={`${streakDays}d`} />
        <StatCard icon="🏅" label="Badges"      val={String(badgesCount)} />
        <StatCard icon="📖" label="Levels Done" val={String(completed)} />
      </div>

      {/* This Week tracker */}
      <div className="bg-white/10 rounded-[10px] px-2.5 py-2">
        <p className="text-white/55 text-[9px] uppercase tracking-wide mb-1.5">This week</p>
        <div className="flex gap-[3px]">
          {streakDots.map(({ label, isToday, isFilled }, i) => (
            <div
              key={i}
              className="w-6 h-6 rounded-[5px] grid place-items-center text-[10px] font-extrabold"
              style={{
                background: isToday ? '#F5C500' : isFilled ? '#F5A623' : 'rgba(255,255,255,0.12)',
                color: isToday || isFilled ? '#fff' : 'rgba(255,255,255,0.3)',
                fontSize: isToday ? '13px' : '10px',
              }}
            >
              {isToday ? '🔥' : isFilled ? '✓' : label}
            </div>
          ))}
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-1.5 mt-1">
        <Link to="/daily" className="text-center py-2 rounded-pwp-tile bg-mode-correct text-white text-[11px] font-extrabold"
              style={{ borderBottom: '3px solid #007d67' }}>📝 Today</Link>
        <Link to="/garden" className="text-center py-2 rounded-pwp-tile bg-white/15 text-white text-[11px] font-extrabold"
              style={{ borderBottom: '3px solid rgba(0,0,0,0.18)' }}>🌱 Garden</Link>
      </div>

      <Link to="/" className="text-white/55 text-[11px] hover:text-white/85 mt-2">
        🏠 Home
      </Link>
      <button onClick={handleSignOut} className="mt-auto text-white/40 text-[11px] hover:text-white/70 text-left pt-2">
        Sign out
      </button>
    </aside>
  )
}

function StatCard({ icon, label, val }: { icon: string; label: string; val: string }) {
  return (
    <div className="bg-white/[0.12] rounded-[10px] p-2 text-center">
      <div className="text-[18px]">{icon}</div>
      <div className="text-white/55 text-[9px] uppercase tracking-wide mt-[1px]">{label}</div>
      <div className="text-white text-pwp-sm font-extrabold">{val}</div>
    </div>
  )
}

function writerRank(levelsCompleted: number): string {
  if (levelsCompleted === 0)   return 'Apprentice Writer'
  if (levelsCompleted < 5)     return 'Word Spotter'
  if (levelsCompleted < 10)    return 'Phrase Crafter'
  if (levelsCompleted < 17)    return 'Sentence Builder'
  if (levelsCompleted < 24)    return 'Sentence Stylist'
  if (levelsCompleted < 28)    return 'Story Shaper'
  if (levelsCompleted < 33)    return 'Story Architect'
  if (levelsCompleted < 37)    return 'Story Stylist'
  if (levelsCompleted < 40)    return 'Narrative Master'
  return 'WriFe Champion'
}
