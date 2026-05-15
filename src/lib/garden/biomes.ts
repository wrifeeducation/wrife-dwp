export type Biome = 'meadow' | 'grove' | 'stone_path' | 'reflection_pool' | 'workshop'

export interface BiomeMeta {
  slug: Biome
  title: string
  subtitle: string
  category: string                  // matches dwp_daily_prompts.category
  available: boolean                // false → "Coming soon" card
  primaryColour: string
  accentColour: string
}

export const BIOMES: BiomeMeta[] = [
  { slug: 'meadow',          title: 'The Meadow',          subtitle: 'Grown from sensory writing',  category: 'sensory',     available: true,  primaryColour: '#a3d977', accentColour: '#5a8a3a' },
  { slug: 'grove',           title: 'The Ancient Grove',   subtitle: 'Grows with story mastery',    category: 'narrative',   available: false, primaryColour: '#4a7c59', accentColour: '#2d4a35' },
  { slug: 'stone_path',      title: 'The Stone Path',      subtitle: 'Built by argument writing',   category: 'argument',    available: false, primaryColour: '#9e9e9e', accentColour: '#616161' },
  { slug: 'reflection_pool', title: 'The Reflection Pool', subtitle: 'Filled by reflection',        category: 'reflection',  available: false, primaryColour: '#5d9cec', accentColour: '#2980b9' },
  { slug: 'workshop',        title: 'The Workshop',        subtitle: 'Crafted from description',    category: 'description', available: false, primaryColour: '#e67e22', accentColour: '#a04f12' },
]

/** Meadow plant catalogue — sensory words from Bible Section 7. */
export interface MeadowPlant {
  word: string
  variety: 'common' | 'rare' | 'legendary'
  colour: string                    // SVG fill for the bloom
  height: number                    // base height in SVG units
}

export const MEADOW_PLANTS: MeadowPlant[] = [
  { word: 'bumpy',      variety: 'common', colour: '#f08080', height: 30 },
  { word: 'rough',      variety: 'common', colour: '#b08968', height: 28 },
  { word: 'burst',      variety: 'common', colour: '#ffb347', height: 34 },
  { word: 'sparkle',    variety: 'rare',   colour: '#ffd700', height: 38 },
  { word: 'gentle',     variety: 'common', colour: '#ffc0cb', height: 26 },
  { word: 'wiggle',     variety: 'common', colour: '#90ee90', height: 32 },
  { word: 'delighted',  variety: 'rare',   colour: '#ff69b4', height: 40 },
  { word: 'gloomy',     variety: 'common', colour: '#778899', height: 30 },
  { word: 'worried',    variety: 'common', colour: '#bdb76b', height: 28 },
  { word: 'enormous',   variety: 'rare',   colour: '#9370db', height: 44 },
  { word: 'astonished', variety: 'legendary', colour: '#ff4500', height: 50 },
  { word: 'tremble',    variety: 'rare',   colour: '#8fbc8f', height: 36 },
]

export function plantForWord(word: string): MeadowPlant | null {
  const norm = word.toLowerCase().trim()
  return MEADOW_PLANTS.find((p) => p.word === norm) ?? null
}

export function categoryToBiome(category: string): Biome {
  return ({
    sensory: 'meadow',
    narrative: 'grove',
    argument: 'stone_path',
    reflection: 'reflection_pool',
    description: 'workshop',
  } as Record<string, Biome>)[category] ?? 'meadow'
}
