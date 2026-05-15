import { useRef, useState } from 'react'

interface Props {
  src: string
  label?: string
  size?: 'sm' | 'md'
}

/**
 * Plays a pre-generated TTS MP3 from Supabase Storage.
 * Brand-coloured play button, accessibility-labelled, idempotent.
 */
export default function TTSPlayer({ src, label = 'Hear it', size = 'md' }: Props) {
  const ref = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)

  function toggle() {
    const el = ref.current
    if (!el) return
    if (playing) { el.pause(); el.currentTime = 0; setPlaying(false) }
    else { el.play(); setPlaying(true) }
  }

  const dim = size === 'sm' ? 36 : 44
  return (
    <button
      onClick={toggle}
      aria-label={`${playing ? 'Stop' : 'Play'} audio: ${label}`}
      className="inline-flex items-center gap-1.5 bg-brand-primary text-white text-pwp-xs font-bold rounded-pwp-pill px-3"
      style={{ minHeight: dim, borderBottom: '3px solid #3d35a0' }}
    >
      <span aria-hidden="true">{playing ? '⏸' : '▶'}</span>
      <span>{label}</span>
      <audio ref={ref} src={src} preload="none" onEnded={() => setPlaying(false)} />
    </button>
  )
}
