import { motion, AnimatePresence } from 'framer-motion'
import type { Band } from '@/types/dwp'

interface Props {
  open: boolean
  band: Band
  heading: string
  message: string
  xp?: number
  ctaLabel: string
  onContinue: () => void
}

const PALETTE: Record<Band, { bg: string; ctaText: string; icon: string }> = {
  mastery:    { bg: '#00b894',                ctaText: '#007d67', icon: '🏆' },
  secure:     { bg: '#00b894',                ctaText: '#007d67', icon: '⭐' },
  developing: { bg: '#F5A623',                ctaText: '#c47a0a', icon: '💪' },
  emerging:   { bg: '#ffd9b8',                ctaText: '#c47a0a', icon: '🌱' },
}

/**
 * Full-width bottom feedback panel that slides up from the bottom.
 * Mastery/Secure → green. Developing → orange. Emerging → pale orange (never red).
 */
export default function FeedbackPanel({ open, band, heading, message, xp, ctaLabel, onContinue }: Props) {
  const c = PALETTE[band]
  const textColour = band === 'emerging' ? '#7a3e00' : 'white'
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
          className="fixed bottom-0 inset-x-0 z-40 px-4 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))]"
          style={{ background: c.bg, color: textColour }}
          role="dialog"
          aria-live="polite"
        >
          <div className="flex items-center gap-3 mb-2">
            <span aria-hidden="true" className="text-2xl">{c.icon}</span>
            <div className="flex-1">
              <div className="text-pwp-md font-extrabold">{heading}</div>
              <div className="text-pwp-sm opacity-90">{message}</div>
            </div>
            {xp != null && (
              <span
                className="text-pwp-xs font-extrabold px-2.5 py-1 rounded-lg"
                style={{ background: 'rgba(255,255,255,0.25)' }}
              >
                +{xp} XP
              </span>
            )}
          </div>
          <button
            onClick={onContinue}
            className="w-full rounded-pwp-cta py-3 font-extrabold bg-white"
            style={{ color: c.ctaText, borderBottom: '3px solid rgba(0,0,0,0.15)' }}
          >
            {ctaLabel}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
