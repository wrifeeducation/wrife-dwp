import { motion } from 'framer-motion'
import { MEADOW_PLANTS, plantForWord, type MeadowPlant } from '@/lib/garden/biomes'

interface PlantedSeed {
  id: string
  word: string
  growth_stage: 'sprout' | 'bloom' | 'mature'
  planted_at: string
}

interface Props {
  seeds: PlantedSeed[]
}

/**
 * The Meadow — a 2D layered SVG scene.
 * Each planted seed renders as one of the MEADOW_PLANTS at a deterministic
 * position. Unplanted seeds bloom over time (caller passes only planted ones).
 *
 * Layered parallax: sky gradient → rolling hills → grass mid-ground → plants foreground.
 */
export default function MeadowBiome({ seeds }: Props) {
  // Filter to plantable seeds (in catalogue) and dedupe per word for visual variety
  const distinct = new Map<string, PlantedSeed>()
  for (const s of seeds) {
    if (!distinct.has(s.word)) distinct.set(s.word, s)
  }
  const plants = [...distinct.entries()]
    .map(([word, seed]) => ({ seed, def: plantForWord(word) }))
    .filter((x): x is { seed: PlantedSeed; def: MeadowPlant } => x.def !== null)

  return (
    <div className="w-full bg-gradient-to-b from-sky-300 via-sky-200 to-green-100 rounded-pwp-banner overflow-hidden">
      <svg viewBox="0 0 700 300" className="w-full h-auto" aria-label="The Meadow biome">
        {/* Sun */}
        <circle cx="600" cy="60" r="36" fill="#ffe680" />

        {/* Rolling hills back */}
        <path d="M0 220 Q150 170 300 210 T700 200 L700 300 L0 300 Z" fill="#a3d977" />
        {/* Rolling hills front */}
        <path d="M0 260 Q200 230 400 255 T700 245 L700 300 L0 300 Z" fill="#7cb55b" />

        {/* Plants — deterministic positions across the width */}
        {plants.map(({ seed, def }, i) => {
          const x = 60 + (i * 600) / Math.max(plants.length, 1)
          const y = 270
          return <Plant key={seed.id} x={x} y={y} plant={def} stage={seed.growth_stage} />
        })}

        {plants.length === 0 && (
          <text x="350" y="170" textAnchor="middle" fontSize="16" fill="#5a8a3a" fontWeight="bold">
            Your meadow is waiting for its first seed 🌱
          </text>
        )}
      </svg>
    </div>
  )
}

function Plant({ x, y, plant, stage }: { x: number; y: number; plant: MeadowPlant; stage: 'sprout' | 'bloom' | 'mature' }) {
  const scale = stage === 'sprout' ? 0.5 : stage === 'bloom' ? 0.9 : 1.0
  const height = plant.height * scale
  return (
    <motion.g
      initial={{ opacity: 0, scale: 0.4, y: y + 10 }}
      animate={{ opacity: 1, scale, y: y - height }}
      transition={{ duration: 0.45, type: 'spring', stiffness: 120 }}
      style={{ originX: x, originY: y }}
    >
      <g transform={`translate(${x}, ${y - height})`}>
        {/* Stem */}
        <rect x="-1.5" y="0" width="3" height={height} fill="#3a5a25" />
        {/* Bloom */}
        <circle cx="0" cy="-4" r={plant.variety === 'legendary' ? 11 : plant.variety === 'rare' ? 9 : 7} fill={plant.colour} stroke="#fff" strokeWidth="1.5" />
        {/* Leaves */}
        <ellipse cx="-6" cy={height / 2} rx="6" ry="3" fill="#4a7c59" transform={`rotate(-30 -6 ${height / 2})`} />
        <ellipse cx="6"  cy={height / 2 + 4} rx="6" ry="3" fill="#4a7c59" transform={`rotate(30 6 ${height / 2 + 4})`} />
        {/* Word label */}
        <text x="0" y="-18" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#2d4a35">{plant.word}</text>
      </g>
    </motion.g>
  )
}
