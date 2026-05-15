import { Link } from 'react-router-dom'
import Mascot from '@/components/shell/Mascot'

/**
 * DWP landing page for unauthenticated visitors.
 *
 * Follows the wrife-landing-page skill structure (sticky nav → hero → CTA
 * cards → trust strip → feature grid → teacher dark strip → footer) but uses
 * the WriFe World colour tokens (brand-primary purple, brand-secondary orange,
 * mode-paragraph teal) instead of legacy --color-* vars.
 */
export default function LandingPage() {
  return (
    <main className="min-h-screen bg-surface-pupil">
      {/* 1. Sticky purple nav */}
      <nav className="sticky top-0 z-10 bg-brand-primary text-white px-5 h-[52px] flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <img src="/mascots/mascot_std_11.png" alt="" width={32} height={32} className="rounded-full" />
          <span className="text-pwp-md font-extrabold">WriFe</span>
          <span className="text-pwp-xs opacity-75 hidden sm:inline">Daily Writing Practice</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link to="/account/login" className="text-pwp-xs font-bold px-3 py-1.5 rounded-pwp-pill border border-white/60 hover:bg-white/10">
            Log in
          </Link>
          <Link to="/home-signup" className="text-pwp-xs font-extrabold bg-white text-brand-primary px-3 py-1.5 rounded-pwp-pill" style={{ borderBottom: '2px solid rgba(0,0,0,0.15)' }}>
            Sign up free
          </Link>
        </div>
      </nav>

      {/* 2. Hero */}
      <section className="px-5 py-8 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 items-center">
          <div>
            <span className="inline-block bg-brand-primary/10 text-brand-primary text-pwp-xs font-extrabold uppercase tracking-wide px-3 py-1 rounded-pwp-pill mb-4">
              40 levels · 365 daily prompts · ages 6–11
            </span>
            <h1 className="text-pwp-2xl font-extrabold text-neutral-900 mb-3 leading-tight">
              Build writing automaticity <span className="text-brand-primary">five minutes a day</span>.
            </h1>
            <p className="text-pwp-base text-neutral-600 max-w-md">
              The Daily Writing Practice your child loves. Mastery-based grammar, AI-marked
              feedback, oral rehearsal, and a garden that grows with every word they earn.
            </p>
          </div>
          <div className="relative justify-self-center">
            <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full bg-brand-primary/10 grid place-items-center overflow-hidden">
              <Mascot pose="welcome" size={180} />
            </div>
            <span className="absolute bottom-2 right-2 w-10 h-10 bg-brand-secondary rounded-full grid place-items-center text-white text-xl" style={{ borderBottom: '3px solid #c47a0a' }}>
              ⭐
            </span>
          </div>
        </div>
      </section>

      {/* 3. CTA cards */}
      <section className="px-5 max-w-5xl mx-auto">
        <p className="text-pwp-xs font-extrabold text-neutral-500 uppercase tracking-wide mb-3 text-center">
          Where would you like to start?
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          <Link to="/login" className="block bg-brand-secondary text-white rounded-pwp-banner p-5 transition-transform hover:-translate-y-0.5"
                style={{ borderBottom: '5px solid #c47a0a' }}>
            <p className="text-[10px] uppercase tracking-[0.07em] font-extrabold opacity-80 mb-1">🎒 For pupils</p>
            <p className="text-pwp-md font-extrabold leading-tight mb-3">I'm a pupil — start my adventure</p>
            <span className="inline-block bg-white text-brand-secondary text-pwp-xs font-extrabold px-3 py-1.5 rounded-pwp-pill">Sign in →</span>
          </Link>
          <Link to="/home-signup" className="block bg-mode-paragraph text-white rounded-pwp-banner p-5 transition-transform hover:-translate-y-0.5"
                style={{ borderBottom: '5px solid #007d67' }}>
            <p className="text-[10px] uppercase tracking-[0.07em] font-extrabold opacity-80 mb-1">👨‍👧 For parents</p>
            <p className="text-pwp-md font-extrabold leading-tight mb-3">Set my child up at home</p>
            <span className="inline-block bg-white text-mode-paragraph text-pwp-xs font-extrabold px-3 py-1.5 rounded-pwp-pill">Sign up free →</span>
          </Link>
          <Link to="/teacher-signup" className="block bg-brand-primary text-white rounded-pwp-banner p-5 transition-transform hover:-translate-y-0.5"
                style={{ borderBottom: '5px solid #3d35a0' }}>
            <p className="text-[10px] uppercase tracking-[0.07em] font-extrabold opacity-80 mb-1">👩‍🏫 For teachers</p>
            <p className="text-pwp-md font-extrabold leading-tight mb-3">Set up my class</p>
            <span className="inline-block bg-white text-brand-primary text-pwp-xs font-extrabold px-3 py-1.5 rounded-pwp-pill">Get started →</span>
          </Link>
        </div>
      </section>

      {/* 4. Trust strip */}
      <section className="bg-brand-primary text-white py-5 px-5">
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <TrustStat number="40" label="Mastery levels" />
          <TrustStat number="8" label="Linguistic tiers" />
          <TrustStat number="365" label="Daily prompts" />
          <TrustStat number="20+" label="Grammar features tracked" />
        </div>
      </section>

      {/* 5. Tier feature grid */}
      <section className="px-5 py-10 max-w-5xl mx-auto">
        <h2 className="text-pwp-xl font-extrabold text-neutral-900 mb-2">A journey through eight tiers</h2>
        <p className="text-pwp-base text-neutral-600 mb-6">From sorting nouns to writing 12-sentence stories, every step builds on the last.</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <TierCard n={1} title="Word awareness"      emoji="🔤" bg="#ede9ff" fg="#4a40b8" />
          <TierCard n={2} title="Word combinations"   emoji="🧩" bg="#e3f2fd" fg="#1565c0" />
          <TierCard n={3} title="Simple sentences"    emoji="✍️" bg="#e8f5e9" fg="#2e7d32" />
          <TierCard n={4} title="Sentence expansion"  emoji="🌳" bg="#fff3e0" fg="#e65100" />
          <TierCard n={5} title="Sequencing"          emoji="🪜" bg="#ffebee" fg="#c62828" />
          <TierCard n={6} title="Story structure"     emoji="📖" bg="#fce4ec" fg="#880e4f" />
          <TierCard n={7} title="Enhanced sentences"  emoji="💎" bg="#fdf3e8" fg="#78440f" />
          <TierCard n={8} title="Narrative mastery"   emoji="👑" bg="#fffde7" fg="#827717" />
        </div>
      </section>

      {/* 6. How it works */}
      <section className="bg-surface-path-bg py-10 px-5">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-pwp-xl font-extrabold text-neutral-900 mb-6 text-center">How it works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FeatureCard icon="🏆" title="Mastery-based progression" body="80% accuracy unlocks the next level. No moving on with gaps." highlighted />
            <FeatureCard icon="🤖" title="AI-marked feedback" body="Claude reads every attempt and gives one specific growth point." />
            <FeatureCard icon="🎤" title="Oral rehearsal" body="Children say it first, then write. Reduces cognitive load." />
            <FeatureCard icon="🌱" title="Word seed garden" body="Plant the words you earn and watch your meadow grow." />
          </div>
        </div>
      </section>

      {/* 7. Teacher dark strip */}
      <section className="bg-neutral-900 text-white py-7 px-5">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h3 className="text-pwp-md font-extrabold mb-1">Set up your class in 60 seconds</h3>
            <p className="text-pwp-sm text-white/55">Free for teachers piloting the programme.</p>
          </div>
          <Link to="/teacher-signup" className="bg-brand-secondary text-white text-pwp-sm font-extrabold rounded-pwp-cta px-5 py-3"
                style={{ borderBottom: '4px solid #c47a0a' }}>
            Create my class →
          </Link>
        </div>
      </section>

      {/* 8. Footer */}
      <footer className="bg-surface-pupil border-t border-neutral-100 px-5 py-6">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <p className="font-extrabold text-neutral-700">WriFe</p>
          <p className="text-pwp-xs text-neutral-500">dailywrite.wrife.co.uk · part of WriFe Education</p>
        </div>
      </footer>
    </main>
  )
}

function TrustStat({ number, label }: { number: string; label: string }) {
  return (
    <div>
      <p className="text-pwp-lg font-extrabold">{number}</p>
      <p className="text-pwp-xs opacity-75">{label}</p>
    </div>
  )
}

function TierCard({ n, title, emoji, bg, fg }: { n: number; title: string; emoji: string; bg: string; fg: string }) {
  return (
    <div className="rounded-pwp-tile p-4" style={{ background: bg, color: fg }}>
      <p className="text-3xl mb-1">{emoji}</p>
      <p className="text-pwp-xs font-extrabold uppercase tracking-wide opacity-70">Tier {n}</p>
      <p className="text-pwp-sm font-extrabold">{title}</p>
    </div>
  )
}

function FeatureCard({ icon, title, body, highlighted }: { icon: string; title: string; body: string; highlighted?: boolean }) {
  return (
    <div className={`bg-white rounded-pwp-banner p-5 ${highlighted ? 'border-2 border-brand-primary' : 'border border-neutral-100'}`}>
      <div className={`w-9 h-9 rounded-full grid place-items-center text-xl mb-2 ${highlighted ? 'bg-brand-primary/10' : 'bg-neutral-100'}`}>{icon}</div>
      <h3 className="text-pwp-md font-extrabold text-neutral-900 mb-1">{title}</h3>
      <p className="text-pwp-sm text-neutral-600">{body}</p>
    </div>
  )
}
