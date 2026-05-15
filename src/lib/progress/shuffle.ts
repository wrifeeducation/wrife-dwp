/**
 * Fisher-Yates shuffle, non-mutating. Used in activity components to
 * randomise item / option order at mount, so pupils can't shortcut by
 * memorising the position of the correct answer.
 */
export function shuffle<T>(array: readonly T[]): T[] {
  const copy = [...array]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}
