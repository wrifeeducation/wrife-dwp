import { useWebSpeech } from '@/lib/audio/useWebSpeech'

interface Props {
  onTranscript: (text: string) => void
  label?: string
}

/**
 * Mic button — captures pupil's spoken sentence, returns transcript when
 * recording stops. Used inside the OralRehearsalPanel before pupils type.
 *
 * Renders nothing if browser doesn't support Web Speech (Safari fallback
 * happens via server-side STT — Phase 2 swap).
 */
export default function MicButton({ onTranscript, label = 'Say it first' }: Props) {
  const { transcript, listening, start, stop, supported } = useWebSpeech()

  function handleClick() {
    if (!listening) {
      start()
    } else {
      stop()
      if (transcript.trim()) onTranscript(transcript.trim())
    }
  }

  if (!supported) {
    return (
      <p className="text-pwp-xs text-neutral-500 italic">
        Voice rehearsal isn't supported on this browser yet.
      </p>
    )
  }

  return (
    <button
      onClick={handleClick}
      aria-pressed={listening}
      className="inline-flex items-center gap-2 text-white text-pwp-sm font-bold rounded-pwp-cta px-4"
      style={{
        background: listening ? '#e74c3c' : 'var(--color-brand-primary)',
        borderBottom: listening ? '3px solid #a13328' : '3px solid #3d35a0',
        minHeight: 'var(--pwp-touch)',
      }}
    >
      <span aria-hidden="true">{listening ? '⏹' : '🎤'}</span>
      <span>{listening ? 'Stop & use' : label}</span>
    </button>
  )
}
