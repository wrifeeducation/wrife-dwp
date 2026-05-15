import { useEffect, useRef, useState } from 'react'

interface Props {
  src: string
  label?: string
  size?: 'sm' | 'md'
}

/**
 * Plays a pre-generated ElevenLabs TTS MP3 from Supabase Storage.
 *
 * We deliberately do NOT set crossOrigin on the <audio> element — Supabase
 * Storage public URLs don't return the CORS headers a credentialled fetch
 * would need, and the <audio> element doesn't need them for simple playback.
 *
 * We construct a fresh Audio() inside each click handler so the browser
 * autoplay policy is satisfied (the play() comes from a real user gesture)
 * and we avoid "play() interrupted by load" races that hit JSX <audio>
 * elements re-rendered between renders.
 */
export default function TTSPlayer({ src, label = 'Hear it', size = 'md' }: Props) {
  const ref = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Stop and clean up if this player unmounts while playing.
  useEffect(() => {
    return () => {
      const a = ref.current
      if (a) {
        try { a.pause() } catch { /* noop */ }
        ref.current = null
      }
    }
  }, [])

  async function toggle() {
    // Stop existing if currently playing.
    if (playing && ref.current) {
      try { ref.current.pause() } catch { /* noop */ }
      ref.current = null
      setPlaying(false)
      return
    }

    setError(null)
    console.log('[TTSPlayer] starting play, src=', src)

    // Build a new Audio object inside the user gesture so the autoplay
    // policy is satisfied.
    const audio = new Audio(src)
    audio.preload = 'auto'
    ref.current = audio

    audio.addEventListener('ended', () => {
      setPlaying(false)
      ref.current = null
    })
    audio.addEventListener('error', (ev) => {
      console.error('[TTSPlayer] <audio> error event', ev, 'src:', src, 'audio.error=', audio.error)
      setError('Audio unavailable')
      setPlaying(false)
      ref.current = null
    })

    try {
      const p = audio.play()
      if (p !== undefined) await p
      setPlaying(true)
    } catch (e) {
      console.error('[TTSPlayer] play() rejected:', e, 'src:', src)
      setError('Tap again to play')
      setPlaying(false)
      ref.current = null
    }
  }

  const dim = size === 'sm' ? 36 : 44
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
