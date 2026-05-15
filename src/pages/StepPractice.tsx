import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useLevel } from '@/hooks/useLevel'
import { getActivityComponent } from '@/components/activity/registry'
import FeedbackPanel from '@/components/feedback/FeedbackPanel'
import TTSPlayer from '@/components/audio/TTSPlayer'
import { levelIntroUrl } from '@/lib/audio/tts'
import { submitAttempt, type AssessmentResult } from '@/lib/claude/assess'
import type { Band } from '@/types/dwp'

/**
 * Step practice screen.
 * Renders the activity variant for level.activity_type, calls dwp-assess
 * Edge Function on submit, then shows the full-width feedback panel.
 */
export default function StepPractice() {
  const { levelId } = useParams()
  const nav = useNavigate()
  const { level, loading, error } = useLevel(levelId)

  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<AssessmentResult | null>(null)

  if (loading) return <main className="min-h-screen grid place-items-center"><p>Loading…</p></main>
  if (error || !level) return <main className="min-h-screen grid place-items-center"><p>Could not load the level.</p></main>

  const Activity = getActivityComponent(level.activity_type)

  async function handleSubmit(submission: unknown) {
    if (!level) return
    setSubmitting(true)
    try {
      const r = await submitAttempt({ levelId: level.level_id, submission })
      setResult(r)
    } catch (e) {
      console.error(e)
      setResult({ band: 'developing', badge: '💪', percentage: 0, heading: 'Try again', message: 'We had trouble checking that — please try again.', xpEarned: 0, passed: false })
    } finally {
      setSubmitting(false)
    }
  }

  function handleContinue() {
    if (!result || !level) return
    if (result.passed) {
      nav(`/level/${level.level_id}/complete`, {
        state: {
          band: result.band,
          badge: result.badge,
          percentage: result.percentage,
          xpEarned: result.xpEarned,
          seedEarned: result.seedEarned,
        },
      })
    } else {
      // Retry the same level
      setResult(null)
    }
  }

  const passedBands: Band[] = ['mastery', 'secure']
  const heading = result?.heading ??
    (result?.band === 'mastery' ? 'Brilliant!' :
     result?.band === 'secure'  ? 'Great work!' :
     result?.band === 'developing' ? 'Almost there' : 'Keep going')

  return (
    <main className="min-h-screen bg-surface-pupil pb-32">
      {/* Top bar: quit, level label, Hear it, lives */}
      <header className="px-4 pt-3 pb-3 border-b border-neutral-100">
        <div className="flex items-center gap-3">
          <button onClick={() => nav(`/level/${level.level_id}`)} aria-label="Quit level" className="text-brand-primary text-pwp-md font-extrabold">×</button>
          <span className="text-pwp-xs font-extrabold text-neutral-500 uppercase tracking-wide">
            Tier {level.tier_number} · Level {level.level_number}
          </span>
          <div className="flex-1" />
          <TTSPlayer src={levelIntroUrl(level.level_id)} label="Hear it" size="sm" />
          <div className="flex gap-0.5 text-red-500" aria-label="lives">❤️❤️❤️</div>
        </div>
      </header>

      <section className="px-5 py-5">
        <h1 className="text-pwp-lg font-extrabold text-neutral-900 mb-1">{level.prompt_title}</h1>
        <p className="text-pwp-sm text-neutral-600 mb-5">{level.prompt_instructions}</p>

        <Activity level={level} onSubmit={handleSubmit} submitting={submitting} />
      </section>

      <FeedbackPanel
        open={result !== null}
        band={result?.band ?? 'developing'}
        heading={heading}
        message={result?.message ?? ''}
        xp={result?.xpEarned}
        ctaLabel={result && passedBands.includes(result.band) ? 'Continue →' : 'Try again'}
        onContinue={handleContinue}
      />
    </main>
  )
}
