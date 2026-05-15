import type { DwpLevel, DwpProgress } from '@/types/dwp'

export type LevelState = 'locked' | 'current' | 'completed'

/**
 * Given the catalogue and the pupil's progress, decide each level's state.
 * Rule: levels unlock strictly in display_order. Pupils must pass the current
 * level (move it into levels_completed) before the next one becomes current.
 */
export function deriveLevelStates(
  levels: DwpLevel[],
  progress: DwpProgress | null
): Map<string, LevelState> {
  const sorted = [...levels].sort((a, b) => a.display_order - b.display_order)
  const out = new Map<string, LevelState>()
  const completed = new Set(progress?.levels_completed ?? [])
  const currentId = progress?.current_level_id ?? sorted[0]?.level_id

  let foundCurrent = false
  for (const lvl of sorted) {
    if (completed.has(lvl.level_id)) {
      out.set(lvl.level_id, 'completed')
    } else if (!foundCurrent && (lvl.level_id === currentId || !currentId)) {
      out.set(lvl.level_id, 'current')
      foundCurrent = true
    } else if (!foundCurrent) {
      // Backfill: if currentId points to a completed level (data drift), the
      // first non-completed level becomes current.
      out.set(lvl.level_id, 'current')
      foundCurrent = true
    } else {
      out.set(lvl.level_id, 'locked')
    }
  }
  return out
}

/** Group levels by tier for the dashboard layout. */
export function groupByTier(levels: DwpLevel[]): Map<number, DwpLevel[]> {
  const sorted = [...levels].sort((a, b) => a.display_order - b.display_order)
  const grouped = new Map<number, DwpLevel[]>()
  for (const lvl of sorted) {
    if (!grouped.has(lvl.tier_number)) grouped.set(lvl.tier_number, [])
    grouped.get(lvl.tier_number)!.push(lvl)
  }
  return grouped
}

export const TIER_TITLES: Record<number, string> = {
  1: 'Word Awareness',
  2: 'Word Combinations',
  3: 'Simple Sentences',
  4: 'Sentence Expansion',
  5: 'Basic Sequencing',
  6: 'Beginning–Middle–End',
  7: 'Enhanced Sentences',
  8: 'Narrative Mastery',
}
