import { Link } from 'react-router-dom'
import BackToWriFe from '@/components/shell/BackToWriFe'
import MeadowBiome from '@/components/garden/MeadowBiome'
import { useGarden } from '@/hooks/useGarden'
import { BIOMES } from '@/lib/garden/biomes'

export default function Garden() {
  const { seeds, loading, plantSeed } = useGarden()

  if (loading) return <main className="min-h-screen grid place-items-center"><p>Loading your garden…</p></main>

  const meadowPlanted = seeds.filter((s) => s.biome === 'meadow' && s.planted_at)
  const meadowUnplanted = seeds.filter((s) => s.biome === 'meadow' && !s.planted_at)
  const otherBiomes = BIOMES.filter((b) => b.slug !== 'meadow')

  return (
    <main className="min-h-screen bg-surface-pupil pb-12">
      <header className="bg-brand-primary text-white px-5 py-5 rounded-b-pwp-banner">
        <div className="flex justify-between items-center mb-2">
          <Link to="/" className="bg-white/15 text-white/90 text-pwp-xs font-bold px-3 py-1.5 rounded-pwp-pill">← Path</Link>
          <BackToWriFe />
        </div>
        <h1 className="text-pwp-xl font-extrabold">Your Enchanted Story Garden</h1>
        <p className="text-white/70 text-pwp-sm mt-1">Plant the words you've earned and watch your garden grow.</p>
      </header>

      <section className="px-5 py-6">
        {/* Meadow */}
        <div className="mb-6">
          <h2 className="text-pwp-lg font-extrabold text-green-800 mb-1">🌼 {BIOMES[0].title}</h2>
          <p className="text-pwp-sm text-neutral-600 mb-3">{BIOMES[0].subtitle}</p>
          <MeadowBiome seeds={meadowPlanted} />

          {/* Unplanted seeds */}
          {meadowUnplanted.length > 0 && (
            <div className="mt-4 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-pwp-tile">
              <p className="text-pwp-xs font-extrabold text-yellow-800 uppercase tracking-wide mb-2">
                {meadowUnplanted.length} seed{meadowUnplanted.length === 1 ? '' : 's'} ready to plant
              </p>
              <div className="flex flex-wrap gap-2">
                {meadowUnplanted.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => plantSeed(s.id)}
                    className="bg-white border-2 border-green-300 text-green-800 text-pwp-sm font-bold px-3 py-1.5 rounded-pwp-pill"
                    style={{ borderBottom: '3px solid #5a8a3a' }}
                  >
                    🌱 Plant "{s.word}"
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Other biomes — locked */}
        <h2 className="text-pwp-md font-extrabold text-neutral-700 mb-3">Coming soon</h2>
        <div className="grid grid-cols-2 gap-3">
          {otherBiomes.map((b) => (
            <div key={b.slug} className="bg-neutral-100 rounded-pwp-tile p-4 opacity-70" aria-disabled="true">
              <p className="text-pwp-sm font-extrabold text-neutral-700 mb-1">🔒 {b.title}</p>
              <p className="text-pwp-xs text-neutral-500">{b.subtitle}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
