import { useParams, Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import Mascot from '@/components/shell/Mascot'
import { useLevel } from '@/hooks/useLevel'
import type { Band } from '@/types/dwp'

/**
 * Level complete celebration screen.
 * Shown after StepPractice → AI assess → Mastery or Secure band.
 * Developing/Emerging routes back to LevelStart for a retry instead.
 */
export default function LevelComplete() {
  const { levelId } = useParams()
  const { level } = useLevel(levelId)
  const loc = useLocation() as { state?: { band: Band; badge: string; percentage: number; xpEarned: number; seedEarned?: string } }
  const result = loc.state

  return (
    <main className="min-h-screen bg-surface-pupil grid place-items-center px-5">
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="text-center max-w-md"
      >
        <div className="flex justify-center mb-4">
          <Mascot pose={result?.band === 'mastery' ? 'badge_mastery' : 'celebrate'} size={140} />
        </div>
        <h1 className="text-pwp-2xl font-extrabold text-brand-primary mb-2">
          {result?.band === 'mastery' ? 'Mastery!' : 'Level passed!'}
        </h1>
        <p className="text-pwp-md font-bold text-neutral-700 mb-1">{level?.activity_name}</p>
        {result?.badge && <p className="text-3xl mb-2">{result.badge}</p>}
        {typeof result?.percentage === 'number' && (
          <p className="text-pwp-base text-neutral-600 mb-4">{result.percentage}% accuracy</p>
        )}
        {result?.xpEarned ? (
          <div className="inline-block bg-brand-secondary text-white px-4 py-2 rounded-pwp-pill mb-6"
               style={{ borderBottom: '3px solid #c47a0a' }}>
            <span className="font-extrabold">+{result.xpEarned} XP</span>
          </div>
        ) : null}
        {result?.seedEarned && (
          <p className="text-pwp-sm text-mode-correct font-bold mb-6">
            🌱 You earned a seed: <span className="italic">{result.seedEarned}</span>
          </p>
        )}

        <Link to="/" className="btn-wrife-cta btn-wrife-cta--primary inline-block text-center w-full">
          Back to your path →
        </Link>
      </motion.div>
    </main>
  )
}
