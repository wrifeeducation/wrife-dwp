interface Props {
  streak: number
  xp: number
  lives?: number
}

/**
 * Stats chips for header — streak, XP, lives.
 * Rendered against a coloured banner background (white/15 chip).
 */
export default function StatsChips({ streak, xp, lives = 3 }: Props) {
  return (
    <div className="flex gap-1.5">
      <Chip icon="🔥" value={streak} label="streak" />
      <Chip icon="⭐" value={xp} label="XP" />
      <Chip icon="❤️" value={lives} label="lives" />
    </div>
  )
}

function Chip({ icon, value, label }: { icon: string; value: number; label: string }) {
  return (
    <div
      className="bg-white/15 rounded-lg px-2.5 py-1 inline-flex items-center gap-1 text-white text-pwp-xs font-bold"
      aria-label={`${value} ${label}`}
    >
      <span aria-hidden="true">{icon}</span>
      <span>{value}</span>
    </div>
  )
}
