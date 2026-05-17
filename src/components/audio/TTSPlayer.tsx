import { useEffect, useRef, useState } from 'react'

interface Props {
  src: string
  label?: string
  size?: 'sm' | 'md'
  /** Attempt to play immediately on mount. Falls back to a tap-to-hear CTA
   *  if the browser blocks autoplay (standard on mobile until first interaction). */
  autoPlay?: boolean
}

/**
 * Plays a pre-generated ElevenLabs TTS MP3 from Supabase Storage.
 *
 * autoPlay behaviour:
 *  - On mount we try audio.play() without a user gesture.
 *  - If the browser allows it (desktop after prior interaction, or a site
 *    with Autoplay granted): audio starts immediately, button shows ⏸.
 *  - If blocked (NotAllowedError — typical on mobile or first visit):
 *    we surface a prominent pulsing "Tap to hear" CTA so the pupil
 *    knows audio is ready. One tap plays it.
 *
 * Click-to-play still works as the fallback in all cases.
 */
export default function TTSPlayer({ src, label = 'Hear it', size = 'md', autoPlay = false }: Props) {
  const ref = useRef<HTMLAudioElement | null>(null)
  const [playing,     setPlaying]     = useState(false)
  const [tapToHear,   setTapToHear]   = useState(false)   // autoplay was blocked
  const [error,       setError]       = useState<string | null>(null)

  // ── autoPlay on mount ────────────────────────────────────────────
  useEffect(() => {
    if (!autoPlay) return

    const audio = new Audio(src)
    audio.preload = 'auto'
    ref.current = audio

    audio.addEventListener('ended', () => { setPlaying(false); ref.current = null })
    audio.addEventListener('error', () => { setPlaying(false); ref.current = null })

    audio.play().then(() => {
      setPlaying(true)
      setTapToHear(false)
    }).catch((e: Error) => {
      // NotAllowedError = browser blocked autoplay — show tap-to-hear prompt
      if (e.name === 'NotAllowedError') {
        setTapToHear(true)
      }
      ref.current = null
    })

    return () => {
      const a = ref.current
      if (a) { try { a.pause() } catch { /* noop */ } ; ref.current = null }
    }
    // Only run once on mount — src won't change within a level screen
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── cleanup on unmount ────────────────────────────────────────────
  useEffect(() => {
    return () => {
      const a = ref.current
      if (a) { try { a.pause() } catch { /* noop */ } ; ref.current = null }
    }
  }, [])

  // ── click handler ─────────────────────────────────────────────────
  async function toggle() {
    if (playing && ref.current) {
      try { ref.current.pause() } catch { /* noop */ }
      ref.current = null
      setPlaying(false)
      return
    }

    setError(null)
    setTapToHear(false)

    const audio = new Audio(src)
    audio.preload = 'auto'
    ref.current = audio

    audio.addEventListener('ended', () => { setPlaying(false); ref.current = null })
    audio.addEventListener('error', (ev) => {
      console.error('[TTSPlayer] error', ev, 'src:', src)
      setError('Audio unavailable')
      setPlaying(false)
      ref.current = null
    })

    try {
      const p = audio.play()
      if (p !== undefined) await p
      setPlaying(true)
    } catch (e) {
      console.error('[TTSPlayer] play() rejected:', e)
      setError('Tap again to play')
      setPlaying(false)
      ref.current = null
    }
  }

  const dim = size === 'sm' ? 36 : 44

  // ── tap-to-hear CTA (autoplay was blocked) ────────────────────────
  if (tapToHear) {
    return (
      <button
        type="button"
        onClick={toggle}
        aria-label="Tap to hear the introduction"
        className="inline-flex items-center gap-2 bg-brand-secondary text-white font-extrabold rounded-pwp-pill px-4 animate-pulse"
        style={{ minHeight: 44, fontSize: '15px', borderBottom: '3px solid #c97d10' }}
      >
        <span aria-hidden="true">🔊</span>
        <span>Tap to hear</span>
      </button>
    )
  }

  // ── normal play / stop button ─────────────────────────────────────
  return (
    <div className="inline-flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={toggle}
        aria-label={`${playing ? 'Stop' : 'Play'} audio: ${label}`}
        className="inline-flex items-center gap-1.5 bg-brand-primary text-white text-pwp-xs font-bold rounded-pwp-pill px-3"
        style={{ minHeight: dim, borderBottom: '3px solid #3d35a0' }}
      >
        <span aria-hidden="true">{playing ? '⏸' : '▶'}</span>
        <span>{label}</span>
      </button>
      {error && (
        <span role="status" className="text-[10px] text-orange-700 font-bold">{error}</span>
      )}
    </div>
  )
}
