import Mascot, { type MascotPose } from '@/components/shell/Mascot'

interface Props {
  pose: MascotPose
  side: 'left' | 'right'
  size?: number
  rotate?: number
}

/**
 * Decorative mascot sprite placed alongside the winding path. Used to
 * personalise the journey — celebrating mascots near completed sections,
 * thinking mascots before locked areas, badge mascots at tier finales.
 */
export default function PathSprite({ pose, side, size = 56, rotate = 0 }: Props) {
  return (
    <div
      className={`pointer-events-none select-none ${side === 'left' ? 'self-start ml-2' : 'self-end mr-2'}`}
      style={{ transform: `rotate(${rotate}deg)` }}
      aria-hidden="true"
    >
      <Mascot pose={pose} size={size} />
    </div>
  )
}
