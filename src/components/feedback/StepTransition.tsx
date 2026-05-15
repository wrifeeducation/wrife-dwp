import { motion, AnimatePresence } from 'framer-motion'
import Mascot from '@/components/shell/Mascot'

interface Props {
  open: boolean
  fromLabel: string
  toLabel: string
  onContinue: () => void
}

/**
 * Small inter-step celebration panel that slides up from the bottom between
 * Step 1 → 2 and Step 2 → 3. Encouraging copy, no XP yet (XP is earned at
 * the end when the AI assesses the final stretch step).
 */
export default function StepTransition({ open, fromLabel, toLabel, onContinue }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
          className="fixed bottom-0 inset-x-0 z-40 px-4 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))] bg-mode-correct text-white"
          role="dialog"
          aria-live="polite"
        >
          <div className="flex items-center gap-3 mb-3 max-w-3xl mx-auto">
            <Mascot pose="thumbs_up" size={48} className="bg-white/15 rounded-full p-1 flex-shrink-0" />
            <div className="flex-1">
              <div className="text-pwp-md font-extrabold">Nice work!</div>
              <div className="text-pwp-sm opacity-90">{fromLabel} complete — onto {toLabel}.</div>
            </div>
          </div>
          <button
            onClick={onContinue}
            className="w-full rounded-pwp-cta py-3 font-extrabold bg-white text-mode-correct-dark max-w-3xl mx-auto block"
            style={{ borderBottom: '3px solid rgba(0,0,0,0.15)' }}
          >
            Next step →
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
