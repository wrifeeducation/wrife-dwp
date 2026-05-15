import type { DwpLevel } from '@/types/dwp'
import type { LevelState } from '@/lib/progress/levels'
import type { MascotPose } from '@/components/shell/Mascot'
import PathNode from './PathNode'
import PathSprite from './PathSprite'

interface Props {
  levels: DwpLevel[]
  states: Map<string, LevelState>
}

/**
 * Staggered Duolingo-style level path. Nodes alternate between left and
 * right with horizontal offsets, and decorative mascot sprites appear at
 * key points (after each completed run, alongside the current node, and at
 * tier finales).
 */
export default function WindingPath({ levels, states }: Props) {
  // Stagger offsets — repeats a wave pattern: centre, right, far right, right, centre, left, far left, left
  const offsets = [0, 60, 100, 60, 0, -60, -100, -60]

  return (
    <div className="relative flex flex-col gap-3">
      {levels.map((lvl, i) => {
        const state = states.get(lvl.level_id) ?? 'locked'
        const offset = offsets[i % offsets.length]
        const prevState = i > 0 ? states.get(levels[i - 1].level_id) : null
        const showSpriteBefore = state === 'current' && i > 0 && prevState === 'completed'
        const isFinale = lvl.tier_finale || lvl.programme_finale

        // Choose a sprite for finale tiers (badge mascots)
        let finaleSprite: MascotPose | null = null
        if (isFinale && state === 'completed') {
          finaleSprite = lvl.programme_finale ? 'badge_gold' : 'badge_mastery'
        } else if (isFinale && state === 'current') {
          finaleSprite = 'celebrate'
        }

        return (
          <div key={lvl.level_id} className="flex flex-col">
            {showSpriteBefore && (
              <div className="flex justify-center mb-1 -mt-1">
                <PathSprite pose="celebrate" side="right" size={48} rotate={-6} />
              </div>
            )}
            <div className="flex items-center" style={{ paddingLeft: Math.max(0, offset), paddingRight: Math.max(0, -offset) }}>
              <div className="flex-1">
                <PathNode level={lvl} state={state} />
              </div>
              {finaleSprite && (
                <div className="ml-2 -mr-2 self-center">
                  <PathSprite pose={finaleSprite} side="right" size={60} rotate={4} />
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
