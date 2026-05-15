import type { ActivityType } from '@/types/dwp'

export interface LevelStep {
  label: string
  type: ActivityType
  data: unknown
}

export interface MultiStepItems {
  steps: LevelStep[]
}

/**
 * Detect whether a level's `items` is the new multi-step shape
 * (object with `steps` array) or the legacy flat-array shape.
 */
export function isMultiStep(items: unknown): items is MultiStepItems {
  return (
    typeof items === 'object' &&
    items !== null &&
    !Array.isArray(items) &&
    Array.isArray((items as MultiStepItems).steps) &&
    (items as MultiStepItems).steps.length > 0
  )
}
