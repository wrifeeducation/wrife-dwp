import type { ActivityType, DwpLevel } from '@/types/dwp'
import WordSorting from './WordSorting'
import SentenceFix from './SentenceFix'
import FreeWriting from './FreeWriting'

type ActivityComponent = React.ComponentType<{
  level: DwpLevel
  onSubmit: (submission: unknown) => void
  submitting: boolean
}>

/**
 * Maps activity_type → the React component that renders the practice UI.
 *
 * Phase 3 ships three live variants (word_sorting, sentence_fix, free_writing).
 * Most other activity types fall through to FreeWriting as a sensible default
 * while individual variants are built out in subsequent phases.
 *
 * - Tiers 1 (word sorting + mixed) → WordSorting
 * - L12 (sentence_fix) → SentenceFix
 * - Everything else → FreeWriting (catches L14, L24, L28, L33, L40, etc.)
 */
const REGISTRY: Partial<Record<ActivityType, ActivityComponent>> = {
  word_sorting: WordSorting,
  mixed_sorting: WordSorting,
  proper_noun_capitalisation: WordSorting, // common/proper sorter — same UI shape
  sentence_fix: SentenceFix,
  sentence_copy: SentenceFix,
  // Free-writing fallback covers all open-text activities (Tier 3+):
  independent_milestone: FreeWriting,
  formula_sentence: FreeWriting,
  three_connected: FreeWriting,
  five_sentence_recount: FreeWriting,
  bme_plan: FreeWriting,
  first_complete_story: FreeWriting,
  detailed_opening: FreeWriting,
  narrative_showcase: FreeWriting,
  sentence_variety: FreeWriting,
  // ... the remaining 27 are intentionally registered against FreeWriting in
  // Phase 3 and progressively replaced with bespoke variants in later phases.
}

export function getActivityComponent(type: ActivityType): ActivityComponent {
  return REGISTRY[type] ?? FreeWriting
}
