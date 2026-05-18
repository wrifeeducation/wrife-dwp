/**
 * FeedbackWidget — floating "Report a problem" button for Daily Write.
 * Appears on every page. Submits to the submit-feedback Edge Function.
 * Auto-fills app, page URL, username and role from auth session.
 */
import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

const EDGE_URL = 'https://gzmgjkbtsvezfclmreru.supabase.co/functions/v1/submit-feedback'

export default function FeedbackWidget() {
  const [open, setOpen]       = useState(false)
  const [text, setText]       = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent]       = useState(false)
  const [error, setError]     = useState('')

  const handleOpen  = useCallback(() => { setOpen(true); setSent(false); setError(''); setText('') }, [])
  const handleClose = useCallback(() => setOpen(false), [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    setSending(true); setError('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const meta = session?.user?.user_metadata ?? {}
      const role = (meta.role as string) ?? 'unknown'
      const userType = role === 'pupil' ? 'pupil' : role === 'teacher' ? 'teacher' : 'unknown'
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`
      const res = await fetch(EDGE_URL, {
        method: 'POST', headers,
        body: JSON.stringify({
          app: 'dwp',
          user_type: userType,
          username: (meta.display_name as string) || undefined,
          page_url: window.location.href,
          description: text.trim(),
          device_info: navigator.userAgent.slice(0, 120),
        }),
      })
      if (!res.ok) throw new Error('submit failed')
      setSent(true); setText('')
    } catch {
      setError('Could not send — please try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <button
        onClick={handleOpen}
        aria-label="Report a problem"
        data-testid="feedback-trigger"
        className="fixed bottom-5 right-5 z-[9000] w-12 h-12 rounded-full bg-brand-primary shadow-lg border-0 cursor-pointer flex items-center justify-center text-xl hover:scale-110 transition-transform"
        style={{ boxShadow: '0 4px 12px rgba(108,92,231,0.4)' }}
      >
        💬
      </button>

      {open && (
        <div
          role="dialog" aria-modal="true" aria-label="Report a problem"
          className="fixed inset-0 z-[9100] bg-black/50 flex items-end justify-center px-4 pb-6"
          onClick={(e) => { if (e.target === e.currentTarget) handleClose() }}
        >
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl">
            {sent ? (
              <div className="text-center py-4">
                <div className="text-4xl mb-3">✅</div>
                <p className="text-pwp-base font-extrabold text-neutral-800 mb-1">Thanks! Message sent.</p>
                <p className="text-pwp-sm text-neutral-500 mb-5">We'll look into it as soon as possible.</p>
                <button onClick={handleClose} className="btn-wrife-cta btn-wrife-cta--secondary">Close</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-pwp-base font-extrabold text-neutral-800 m-0">💬 Report a problem</h2>
                  <button type="button" onClick={handleClose} aria-label="Close"
                    className="text-neutral-400 hover:text-neutral-600 text-lg bg-transparent border-0 cursor-pointer px-2">✕</button>
                </div>
                <p className="text-pwp-xs text-neutral-500 mb-3 leading-relaxed">
                  Tell us what's wrong — we'll fix it quickly!
                </p>
                <textarea
                  value={text} onChange={(e) => setText(e.target.value)}
                  placeholder="e.g. The audio wouldn't play on my tablet…"
                  rows={4} maxLength={1000} autoFocus
                  className="w-full p-3 text-pwp-sm border-2 border-brand-primary/30 rounded-pwp-tile focus:border-brand-primary outline-none resize-y mb-1"
                />
                <p className="text-right text-pwp-xs text-neutral-400 mb-3">{text.length}/1000</p>
                {error && <p className="text-pwp-xs text-red-500 mb-3">⚠️ {error}</p>}
                <div className="flex gap-3">
                  <button type="button" onClick={handleClose}
                    className="flex-1 py-2.5 text-pwp-sm font-bold text-neutral-500 bg-neutral-100 rounded-full border-0 cursor-pointer">
                    Cancel
                  </button>
                  <button type="submit" disabled={sending || !text.trim()}
                    className="flex-[2] btn-wrife-cta disabled:opacity-50">
                    {sending ? 'Sending…' : 'Send report'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
