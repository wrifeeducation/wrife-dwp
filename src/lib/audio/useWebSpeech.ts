import { useEffect, useRef, useState } from 'react'

/**
 * Thin wrapper over the browser Web Speech API for live speech-to-text.
 * Returns { listening, transcript, start, stop, supported, error }.
 * Falls back gracefully when SpeechRecognition isn't available (Safari).
 *
 * Phase 2 candidate: swap to ElevenLabs Scribe if pilot reveals child-voice
 * accuracy issues. Drop-in replacement at this interface.
 */
type SR = typeof window & {
  SpeechRecognition?: any
  webkitSpeechRecognition?: any
}

export function useWebSpeech(lang = 'en-GB') {
  const [transcript, setTranscript] = useState('')
  const [listening, setListening] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [supported, setSupported] = useState(true)
  const ref = useRef<any>(null)

  useEffect(() => {
    const SR = (window as SR).SpeechRecognition || (window as SR).webkitSpeechRecognition
    if (!SR) { setSupported(false); return }
    const r = new SR()
    r.continuous = true
    r.interimResults = true
    r.lang = lang
    r.onresult = (event: any) => {
      let t = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        t += event.results[i][0].transcript
      }
      setTranscript(t)
    }
    r.onerror = (e: any) => setError(e.error ?? 'speech-error')
    r.onend = () => setListening(false)
    ref.current = r
  }, [lang])

  function start() {
    if (!ref.current) return
    setTranscript(''); setError(null); setListening(true)
    try { ref.current.start() } catch { /* already started */ }
  }

  function stop() {
    if (!ref.current) return
    try { ref.current.stop() } catch { /* not started */ }
    setListening(false)
  }

  return { transcript, listening, start, stop, supported, error }
}
