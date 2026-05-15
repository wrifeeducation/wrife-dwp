import { useEffect, useRef, useState } from 'react'

interface Props {
  src: string
  label?: string
  size?: 'sm' | 'md'
}

/**
 * Plays a pre-generated ElevenLabs TTS MP3 from Supabase Storage.
 *
 * Hardened against the common failure modes:
 *  - audio.play() returning a rejected promise (browser autoplay rules):
 *    caught, surfaces "Tap again" message.
 *  - User taps the button before audio loads: preload="metadata" so the
 *    audio element knows enough to start playback immediately.
 *  - Audio missing from Storage (404): shows a brief "audio not ready" hint.
 *  - User taps Stop, then Play again: currentTime is reset to 0 so it starts fresh.
 */
export default function TTSPlayer({ src, label = 'Hear it', size = 'md' }: Props) {
  const ref = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const onEnded = () => setPlaying(false)
    const onErr = () => setError('Audio unavailable — try again later.')
    el.addEventListener('ended', onEnded)
    el.addEventListener('error', onErr)
    return () => {
      el.removeEventListener('ended', onEnded)
      el.removeEventListener('error', onErr)
    }
  }, [])

  async function toggle() {
    const el = ref.current
    if (!el) return
    if (playing) {
      el.pause()
      el.currentTime = 0
      setPlaying(false)
      return
    }
    setError(null)
    try {
      el.currentTime = 0
      await el.play()
      setPlaying(true)
    } catch (e) {
      console.error('TTS play rejected:', e)
      setError('Tap again to play')
      setPlaying(false)
    }
  }

  const dim = size === 'sm' ? 36 : 44
  return (
    <div className="inline-flex flex-col items-end gap-1">
      <button
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
      <audio ref={ref} src={src} preload="metadata" crossOrigin="anonymous" />
    </div>
  )
}
