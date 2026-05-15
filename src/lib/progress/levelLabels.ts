import type { DwpLevel } from '@/types/dwp'

/**
 * Short two-line label for the path: title (left of arrow) + subtitle.
 * Falls back to the activity_name if no good short title is mapped.
 */
const SHORT: Record<string, string> = {
  word_sorting: 'Sorting Nouns',
  verb_identification: 'Find the Verb',
  noun_verb_logic: 'Does it Make Sense?',
  proper_noun_capitalisation: 'Common or Proper?',
  mixed_sorting: 'Mixed Sorting',
  add_noun: 'Add a Noun',
  add_verb: 'Add a Verb',
  det_noun_verb: 'Det + Noun + Verb',
  add_adjective: 'Add an Adjective',
  word_chain: 'Word Chain',
  sentence_copy: 'Copy Carefully',
  sentence_fix: 'Fix the Sentence',
  sentence_completion: 'Finish the Sentence',
  independent_milestone: 'My First Sentences',
  add_where: 'Add Where',
  add_when: 'Add When',
  who_what_where: 'Who · What · Where',
  enhance_adjectives: 'Make it Vivid',
  join_and: 'Join with And',
  use_but: 'Use But',
  because_clauses: 'Because Clauses',
  when_time: 'When for Time',
  multiple_details: 'Many Details',
  formula_sentence: 'Formula Sentence',
  temporal_connectives: 'First / Next / Last',
  three_connected: 'Three Sentences',
  before_after: 'Before & After',
  five_sentence_recount: 'Five-Sentence Recount',
  story_beginning: 'Hook the Reader',
  story_middle: 'Build the Middle',
  story_ending: 'Close the Story',
  bme_plan: 'BME Plan',
  first_complete_story: 'First Story',
  when_starter: 'Start with When',
  although_starter: 'Start with Although',
  sentence_variety: 'Mix Sentences',
  detailed_opening: 'Detailed Opening',
  narrative_showcase: 'Showcase',
}

export function shortLevelTitle(level: DwpLevel): string {
  return SHORT[level.activity_type] ?? level.activity_name
}

export function levelSubtitle(level: DwpLevel): string {
  // Just the first short clause of the learning objective, for a clean subtitle.
  const obj = level.learning_objective
  if (!obj) return ''
  const trimmed = obj.split('.')[0].split(',')[0]
  return trimmed.length > 50 ? trimmed.slice(0, 47) + '…' : trimmed
}
