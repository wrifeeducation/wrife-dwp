import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useLevel } from '@/hooks/useLevel'
import { getActivityComponent } from '@/components/activity/registry'
import FeedbackPanel from '@/components/feedback/FeedbackPanel'
import StepTransition from '@/components/feedback/StepTransition'
import TTSPlayer from '@/components/audio/TTSPlayer'
import { levelIntroUrl } from '@/lib/audio/tts'
import { submitAttempt, type AssessmentResult } from '@/lib/claude/assess'
import { isMultiStep, type LevelStep } from '@/lib/progress/multiStep'
import type { Band, DwpLevel } from '@/types/dwp'

/**
 * Step Practice page. Handles two modes:
 *
 *   Single-step (legacy):  level.items is a flat array. One activity component,
 *                          one submission, one AI assessment.
 *
 *   Multi-step (new):      level.items has { steps: [warmup, practise, stretch] }.
 *                          Pupil walks through each step; client-checks the
 *                          first two for immediate transition feedback; the
 *                          stretch step submits to the AI for the final
 *                          assessment, bundling all three step submissions.
 */
export default function StepPractice() {
  const { levelId } = useParams()
  const nav = useNavigate()
  const { level, loading, error } = useLevel(levelId)

  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<AssessmentResult | null>(null)
  const [stepIdx, setStepIdx] = useState(0)
  const [stepSubmissions, setStepSubmissions] = useState<unknown[]>([])
  const [showTransition, setShowTransition] = useState(false)

  if (loading) return <main className="min-h-screen grid place-items-center"><p>Loading…</p></main>
  if (error || !level) return <main className="min-h-screen grid place-items-center"><p>Could not load the level.</p></main>

  const multi = isMultiStep(level.items) ? level.items : null
  const totalSteps = multi?.steps.length ?? 1
  const currentStep: LevelStep | null = multi?.steps[stepIdx] ?? null

  // For each step (or the legacy case) we synthesize a level-like object so
  // existing activity components keep reading `level.items` without changes.
  const stepLevel: DwpLevel = currentStep
    ? { ...level, activity_type: currentStep.type, items: Array.isArray(currentStep.data) ? currentStep.data : [currentStep.data] }
    : level

  const Activity = getActivityComponent(stepLevel.activity_type)

  async function handleStepSubmit(submission: unknown) {
    if (!level) return
    // Multi-step path
    if (multi) {
      const newSubmissions = [...stepSubmissions, submission]
      setStepSubmissions(newSubmissions)
      if (stepIdx + 1 < totalSteps) {
        // Inter-step transition
        setShowTransition(true)
      } else {
        // Final step — bundle and send to AI
        await submitFinal(newSubmissions)
      }
    } else {
      // Legacy single-step path
      await submitFinal([submission])
    }
  }

  async function submitFinal(submissions: unknown[]) {
    if (!level) return
    setSubmitting(true)
    try {
      const r = await submitAttempt({
        levelId: level.level_id,
        submission: multi
          ? { multi_step: true, step_labels: multi.steps.map((s) => s.label), step_submissions: submissions }
          : submissions[0],
      })
      setResult(r)
    } catch (e) {
      console.error(e)
      setResult({ band: 'developing', badge: '💪', percentage: 0, heading: 'Try again', message: 'We had trouble checking that — please try again.', xpEarned: 0, passed: false })
    } finally { setSubmitting(false) }
  }

  function handleAdvanceStep() {
    setShowTransition(false)
    setStepIdx((i) => i + 1)
  }

  function handleContinue() {
    if (!result || !level) return
    if (result.passed) {
      nav(`/level/${level.level_id}/complete`, {
        state: {
          band: result.band, badge: result.badge, percentage: result.percentage,
          xpEarned: result.xpEarned, seedEarned: result.seedEarned,
        },
      })
    } else {
      // Reset for retry
      setResult(null); setStepIdx(0); setStepSubmissions([])
    }
  }

  const passedBands: Band[] = ['mastery', 'secure']
  const heading = result?.heading ??
    (result?.band === 'mastery' ? 'Brilliant!' :
     result?.band === 'secure'  ? 'Great work!' :
     result?.band === 'developing' ? 'Almost there' : 'Keep going')

  const progressPct = ((stepIdx + 1) / totalSteps) * 100

  return (
    <main className="min-h-screen bg-surface-pupil pb-32">
      {/* Top bar */}
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
        {multi && (
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-2 bg-brand-primary/15 rounded-full overflow-hidden">
              <div className="h-full bg-brand-primary rounded-full transition-all" style={{ width: `${progressPct}%` }} />
            </div>
            <span className="text-pwp-xs font-extrabold text-brand-primary whitespace-nowrap">
              Step {stepIdx + 1} of {totalSteps} · {multi.steps[stepIdx].label}
            </span>
          </div>
        )}
      </header>

      <section className="px-5 py-5 max-w-3xl mx-auto">
        <h1 className="text-pwp-lg font-extrabold text-neutral-900 mb-1">{level.prompt_title}</h1>
        <p className="text-pwp-sm text-neutral-600 mb-5">{level.prompt_instructions}</p>
        <Activity level={stepLevel} onSubmit={handleStepSubmit} submitting={submitting} />
      </section>

      {/* Inter-step transition between Step N and Step N+1 */}
      <StepTransition
        open={showTransition && multi !== null && stepIdx + 1 < totalSteps}
        fromLabel={multi?.steps[stepIdx]?.label ?? 'this step'}
        toLabel={multi?.steps[stepIdx + 1]?.label ?? 'next step'}
        onContinue={handleAdvanceStep}
      />

      {/* Final assessment feedback */}
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
