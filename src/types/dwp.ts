import type { WordClass } from '@/styles/wordClasses'

export type Band = 'mastery' | 'secure' | 'developing' | 'emerging'

export type ActivityType =
  | 'word_sorting'
  | 'verb_identification'
  | 'noun_verb_logic'
  | 'proper_noun_capitalisation'
  | 'mixed_sorting'
  | 'add_noun'
  | 'add_verb'
  | 'det_noun_verb'
  | 'add_adjective'
  | 'word_chain'
  | 'sentence_copy'
  | 'sentence_fix'
  | 'sentence_completion'
  | 'independent_milestone'
  | 'add_where'
  | 'add_when'
  | 'who_what_where'
  | 'enhance_adjectives'
  | 'join_and'
  | 'use_but'
  | 'because_clauses'
  | 'when_time'
  | 'multiple_details'
  | 'formula_sentence'
  | 'temporal_connectives'
  | 'three_connected'
  | 'before_after'
  | 'five_sentence_recount'
  | 'story_beginning'
  | 'story_middle'
  | 'story_ending'
  | 'bme_plan'
  | 'first_complete_story'
  | 'when_starter'
  | 'although_starter'
  | 'sentence_variety'
  | 'detailed_opening'
  | 'narrative_showcase'

export interface DwpLevel {
  id: string
  level_id: string
  level_number: number
  tier_number: number
  activity_name: string
  activity_type: ActivityType
  learning_objective: string
  prompt_title: string
  prompt_instructions: string
  prompt_example: string | null
  word_bank: WordBankEntry[]
  items: unknown[]
  rubric: Rubric
  passing_threshold: number
  difficulty_band: 'foundation' | 'developing' | 'advanced' | null
  age_range: string | null
  tier_finale: boolean
  programme_finale: boolean
  milestone: boolean
  display_order: number
}

export interface WordBankEntry { word: string; class: WordClass }

export interface Rubric {
  passing_threshold: number
  scoring: Record<Band, RubricBand>
  pattern_analysis?: Record<string, string>
}
export interface RubricBand {
  range: [number, number]
  badge: string
  message?: string
}

export interface DwpProgress {
  pupil_id: string
  class_id: string | null
  current_level_id: string
  levels_completed: string[]
  badges_earned: BadgeEarned[]
  tier1_completed: boolean; tier2_completed: boolean; tier3_completed: boolean; tier4_completed: boolean
  tier5_completed: boolean; tier6_completed: boolean; tier7_completed: boolean; tier8_completed: boolean
  total_attempts: number
  total_time_minutes: number
  current_streak_days: number
  longest_streak_days: number
  xp_total: number
  coins_total: number
}
export interface BadgeEarned { level_id: string; badge: string; earned_at: string }

export interface DwpAttempt {
  id: string
  pupil_id: string
  level_id: string
  attempt_number: number
  submission: unknown
  oral_rehearsal_transcript: string | null
  ai_assessment: AiAssessment | null
  feature_tags: FeatureTag[]
  score: number | null
  total_items: number | null
  percentage: number | null
  band: Band | null
  badge: string | null
  passed: boolean
  pattern_errors: string[]
  time_spent_seconds: number | null
  created_at: string
}

export interface AiAssessment {
  performance: { percentage: number; band: Band; badge: string }
  pattern_analysis: string[]
  feedback: { praise: string; one_growth_point: string }
  teacher_notes: { intervention_needed: boolean; suggested_focus: string }
}

export interface FeatureTag {
  feature_slug: string
  applied_correctly: boolean
  was_required: boolean
}
