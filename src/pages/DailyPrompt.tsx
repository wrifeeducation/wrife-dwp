import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import BackToWriFe from '@/components/shell/BackToWriFe'
import HomeNav from '@/components/shell/HomeNav'
import OralRehearsalPanel from '@/components/audio/OralRehearsalPanel'
import TTSPlayer from '@/components/audio/TTSPlayer'
import FreeWriting from '@/components/activity/FreeWriting'
import FeedbackPanel from '@/components/feedback/FeedbackPanel'
import { useDailyPrompt } from '@/hooks/useDailyPrompt'
import { submitDailyPrompt, type AssessmentResult } from '@/lib/claude/assess'
import { dailyPromptUrl } from '@/lib/audio/tts'
import type { DwpLevel } from '@/types/dwp'

/**
 * 365-day Daily Prompt mode.
 *
 * Per WriFe design system: TEAL banner (paragraph-phase colour, not the
 * standard purple) — a clear visual cue that this is composition mode,
 * not isolated grammar practice.
 */
export default function DailyPrompt() {
  const { prompt, alreadyDoneToday, loading } = useDailyPrompt()
  const [oralDraft, setOralDraft] = useState<string | undefined>(undefined)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<AssessmentResult | null>(null)
  const nav = useNavigate()

  if (loading) return <main className="min-h-screen grid place-items-center"><p>Loading today's prompt…</p></main>

  if (alreadyDoneToday) {
    return (
      <main className="min-h-screen bg-surface-pupil">
        <header className="bg-mode-paragraph text-white px-5 py-5 rounded-b-pwp-banner flex justify-between items-center">
          <Link to="/" className="bg-white/15 text-white/90 text-pwp-xs font-bold px-3 py-1.5 rounded-pwp-pill">← Path</Link>
          <BackToWriFe />
          <HomeNav />
        </header>
        <section className="p-6 text-center max-w-md mx-auto">
          <div className="flex justify-center mb-3"><img src="/mascots/mascot_std_3.png" alt="" width={140} height={140} /></div>
          <h1 className="text-pwp-xl font-extrabold text-mode-paragraph mb-2">Today's prompt done!</h1>
          <p className="text-pwp-base text-neutral-600 mb-5">Come back tomorrow for another. In the meantime, keep going on your path or visit your Garden.</p>
          <Link to="/" className="btn-wrife-cta btn-wrife-cta--correct inline-block">Back to your path</Link>
        </section>
      </main>
    )
  }

  if (!prompt) {
    return <main className="min-h-screen grid place-items-center p-6 text-center"><p>No daily prompt found for you today. Try again later.</p></main>
  }

  // Synthesize a "virtual level" for the FreeWriting component
  const virtualLevel: DwpLevel = {
    id: prompt.id,
    level_id: prompt.prompt_slug,
    level_number: 0,
    tier_number: 0,
    activity_name: 'Daily Prompt',
    activity_type: 'narrative_showcase',
    learning_objective: 'Write freely about today\'s prompt.',
    prompt_title: 'Today\'s writing',
    prompt_instructions: prompt.prompt_text,
    prompt_example: null,
    word_bank: [],
    items: [],
    rubric: {} as any,
    passing_threshold: 60,
    difficulty_band: 'developing',
    age_range: null,
    tier_finale: false,
    programme_finale: false,
    milestone: false,
    display_order: 0,
  }

  async function handleSubmit(submission: unknown) {
    if (!prompt) return
    setSubmitting(true)
    try {
      const r = await submitDailyPrompt({
        promptId: prompt.id,
        text: (submission as { text: string }).text,
        oralRehearsalTranscript: oralDraft,
      })
      setResult(r)
    } catch (e) {
      console.error(e)
      setResult({ band: 'developing', badge: '💪', percentage: 0, heading: 'Something went wrong', message: 'Please try again.', xpEarned: 0, passed: false })
    } finally { setSubmitting(false) }
  }

  return (
    <main className="min-h-screen bg-surface-pupil pb-32">
      <header className="bg-mode-paragraph text-white px-5 py-5 rounded-b-pwp-banner">
        <div className="flex justify-between items-center mb-2">
          <Link to="/" className="bg-white/15 text-white/90 text-pwp-xs font-bold px-3 py-1.5 rounded-pwp-pill">← Path</Link>
          <BackToWriFe />
          <HomeNav />
        </div>
        <span className="inline-block bg-white/15 text-white/85 text-pwp-xs font-extrabold uppercase tracking-wide px-3 py-1 rounded-pwp-pill mb-2">
          Today · {prompt.category}
        </span>
        <h1 className="text-pwp-xl font-extrabold">Today's writing prompt</h1>
      </header>

      <section className="px-5 py-5">
        <div className="bg-surface-prompt-chip rounded-pwp-tile px-4 py-3 border-l-[3px] border-brand-secondary flex items-start gap-3 mb-4">
          <p className="text-pwp-base text-neutral-800 flex-1">{prompt.prompt_text}</p>
          <TTSPlayer src={dailyPromptUrl(prompt.prompt_slug)} label="Hear it" size="sm" autoPlay />
        </div>

        <OralRehearsalPanel onDraftReady={setOralDraft} />

        <FreeWriting
          level={virtualLevel}
          onSubmit={handleSubmit}
          submitting={submitting}
          minWords={15}
          oralRehearsalTranscript={oralDraft}
        />
      </section>

      <FeedbackPanel
        open={result !== null}
        band={result?.band ?? 'developing'}
        heading={result?.heading ?? ''}
        message={result?.message ?? ''}
        xp={result?.xpEarned}
        ctaLabel={'Continue →'}
        onContinue={() => nav('/garden')}
      />
    </main>
  )
}
