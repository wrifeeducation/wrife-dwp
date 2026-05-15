import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Seed {
  id: string
  word: string
  biome: string
  rarity: 'common' | 'rare' | 'legendary'
  source_type: string
  source_id: string
  earned_at: string
  planted_at: string | null
  growth_stage: 'sprout' | 'bloom' | 'mature'
}

export function useGarden() {
  const [seeds, setSeeds] = useState<Seed[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancel = false
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { if (!cancel) setLoading(false); return }
      const { data: pupil } = await supabase.from('pupils').select('id').eq('auth_user_id', user.id).maybeSingle()
      if (!pupil) { if (!cancel) setLoading(false); return }
      const { data } = await supabase.from('dwp_garden_seeds').select('*').eq('pupil_id', pupil.id).order('earned_at', { ascending: true })
      if (!cancel) { setSeeds((data ?? []) as Seed[]); setLoading(false) }
    }
    load()
    return () => { cancel = true }
  }, [])

  async function plantSeed(seedId: string) {
    await supabase.from('dwp_garden_seeds').update({
      planted_at: new Date().toISOString(),
      growth_stage: 'bloom',
    }).eq('id', seedId)
    setSeeds((s) => s.map((x) => x.id === seedId ? { ...x, planted_at: new Date().toISOString(), growth_stage: 'bloom' as const } : x))
  }

  return { seeds, loading, plantSeed }
}
