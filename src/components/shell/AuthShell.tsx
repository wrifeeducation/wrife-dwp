import { Link } from 'react-router-dom'
import Mascot from '@/components/shell/Mascot'

interface Props {
  title: string
  subtitle?: string
  mood?: 'welcome' | 'excited' | 'thinking'
  children: React.ReactNode
  bottomLinks?: { label: string; to: string }[]
}

/**
 * Consistent layout shell for every DWP auth page.
 *
 * - WriFe World purple banner at top
 * - Centred card on white surface (no cream — pupil-facing rule)
 * - Mascot above the title for warmth
 * - Optional bottom links (Sign up, Forgot password, Switch user, etc.)
 */
export default function AuthShell({ title, subtitle, mood = 'welcome', children, bottomLinks }: Props) {
  return (
    <main className="min-h-screen bg-surface-pupil flex flex-col">
      <header className="bg-brand-primary text-white px-5 py-4 rounded-b-pwp-banner">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <img src="/mascots/mascot_std_11.png" alt="" width={32} height={32} className="rounded-full" />
            <span className="text-pwp-md font-extrabold">WriFe Daily Writing</span>
          </Link>
          <Link to="/" className="text-pwp-xs font-bold bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-pwp-pill transition-colors">
            ← Home
          </Link>
        </div>
      </header>

      <section className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="max-w-md w-full">
          <div className="flex flex-col items-center gap-3 mb-6">
            <Mascot mood={mood} size={96} />
            <h1 className="text-pwp-2xl font-extrabold text-brand-primary text-center">{title}</h1>
            {subtitle && <p className="text-pwp-base text-neutral-600 text-center">{subtitle}</p>}
          </div>

          <div className="bg-white rounded-pwp-banner border-2 border-brand-primary/15 shadow-pwp-card p-6">
            {children}
          </div>

          {bottomLinks && bottomLinks.length > 0 && (
            <div className="mt-5 flex flex-col gap-2 items-center">
              {bottomLinks.map((link) => (
                <Link key={link.to} to={link.to} className="text-pwp-sm font-bold text-brand-primary hover:underline">
                  {link.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
