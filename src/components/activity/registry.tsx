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
import StoryPlanner from './StoryPlanner'
import SentenceStarter from './SentenceStarter'
import SentenceVariety from './SentenceVariety'
import ShowcaseNarrative from './ShowcaseNarrative'

type ActivityComponent = React.ComponentType<{
  level: DwpLevel
  onSubmit: (submission: unknown) => void
  submitting: boolean
}>

/**
 * Maps every activity_type to the bespoke React component that renders it.
 * FreeWriting remains the catch-all fallback only for activity types not
 * explicitly mapped here.
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
  who_what_where: FreeWriting,
  independent_milestone: FreeWriting,

  // Tier 4
  enhance_adjectives: FreeWriting,
  join_and: SentenceJoin,
  use_but: SentenceJoin,
  because_clauses: SentenceJoin,
  when_time: SentenceJoin,
  multiple_details: FreeWriting,
  formula_sentence: FormulaBuilder,

  // Tier 5
  temporal_connectives: SentenceOrdering,
  three_connected: FreeWriting,
  before_after: SentenceOrdering,
  five_sentence_recount: FreeWriting,

  // Tier 6 — Beginning / Middle / End story planner
  story_beginning: StoryPlanner,
  story_middle: StoryPlanner,
  story_ending: StoryPlanner,
  bme_plan: StoryPlanner,
  first_complete_story: StoryPlanner,

  // Tier 7 — Forced sentence starters + variety mixing
  when_starter: SentenceStarter,
  although_starter: SentenceStarter,
  sentence_variety: SentenceVariety,

  // Tier 8 — Showcase narrative
  detailed_opening: ShowcaseNarrative,
  narrative_showcase: ShowcaseNarrative,
}

export function getActivityComponent(type: ActivityType): ActivityComponent {
  return REGISTRY[type] ?? FreeWriting
}
