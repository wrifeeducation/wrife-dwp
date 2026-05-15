import type { ActivityType, DwpLevel } from '@/types/dwp'
import WordSorting from './WordSorting'
import SentenceFix from './SentenceFix'
import FreeWriting from './FreeWriting'
import VerbIdentification from './VerbIdentification'
import NounVerbLogic from './NounVerbLogic'
import CommonProper from './CommonProper'
import WordCompletion from './WordCompletion'
import FormulaBuilder from './FormulaBuilder'
import SentenceJoin from './SentenceJoin'
import SentenceOrdering from './SentenceOrdering'

type ActivityComponent = React.ComponentType<{
  level: DwpLevel
  onSubmit: (submission: unknown) => void
  submitting: boolean
}>

/**
 * Maps activity_type → React component for the practice UI.
 *
 * Bespoke variants cover Tiers 1-5 (the levels with structured items). Tiers
 * 6-8 (story_beginning, bme_plan, narrative_showcase, etc.) intentionally
 * fall through to FreeWriting — those are open-composition tasks where the
 * pupil writes prose into a textarea.
 */
const REGISTRY: Partial<Record<ActivityType, ActivityComponent>> = {
  // Tier 1
  word_sorting: WordSorting,
  mixed_sorting: WordSorting,
  verb_identification: VerbIdentification,
  noun_verb_logic: NounVerbLogic,
  proper_noun_capitalisation: CommonProper,

  // Tier 2
  add_noun: WordCompletion,
  add_verb: WordCompletion,
  add_adjective: WordCompletion,
  det_noun_verb: FormulaBuilder,
  word_chain: FormulaBuilder,

  // Tier 3
  sentence_copy: SentenceFix,
  sentence_fix: SentenceFix,
  sentence_completion: WordCompletion,
  add_where: WordCompletion,
  add_when: WordCompletion,
  who_what_where: FormulaBuilder,
  independent_milestone: FreeWriting,

  // Tier 4
  enhance_adjectives: WordCompletion,
  join_and: SentenceJoin,
  use_but: SentenceJoin,
  because_clauses: SentenceJoin,
  when_time: SentenceJoin,
  multiple_details: FormulaBuilder,
  formula_sentence: FormulaBuilder,

  // Tier 5
  temporal_connectives: SentenceOrdering,
  three_connected: SentenceOrdering,
  before_after: SentenceOrdering,
  five_sentence_recount: FreeWriting,

  // Tier 6-8: open-composition — FreeWriting fallback
  story_beginning: FreeWriting,
  story_middle: FreeWriting,
  story_ending: FreeWriting,
  bme_plan: FreeWriting,
  first_complete_story: FreeWriting,
  when_starter: FreeWriting,
  although_starter: FreeWriting,
  sentence_variety: FreeWriting,
  detailed_opening: FreeWriting,
  narrative_showcase: FreeWriting,
}

export function getActivityComponent(type: ActivityType): ActivityComponent {
  return REGISTRY[type] ?? FreeWriting
}
