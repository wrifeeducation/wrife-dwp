import { supabase } from '@/lib/supabase'

/**
 * Build the public URL for a pre-generated TTS clip stored in Supabase Storage.
 * Bucket layout: dwp-audio/levels/<level_id>/<slug>.mp3
 *                dwp-audio/daily/<prompt_slug>.mp3
 *                dwp-audio/feedback/<phrase_slug>.mp3
 */
export function ttsUrl(path: string): string {
  const { data } = supabase.storage.from('dwp-audio').getPublicUrl(path)
  return data.publicUrl
}

export function levelIntroUrl(levelId: string): string {
  return ttsUrl(`levels/${levelId}/intro.mp3`)
}

export function levelModelSentenceUrl(levelId: string, slug: string): string {
  return ttsUrl(`levels/${levelId}/${slug}.mp3`)
}

export function dailyPromptUrl(promptSlug: string): string {
  return ttsUrl(`daily/${promptSlug}.mp3`)
}

/**
 * On-demand TTS for individualised AI feedback (e.g. the pupil-specific
 * "one growth point"). Calls dwp-tts-feedback Edge Function which generates,
 * caches in Storage, and returns the URL.
 */
export async function getOrCreateFeedbackAudio(attemptId: string, text: string): Promise<string> {
  const { data, error } = await supabase.functions.invoke('dwp-tts-feedback', {
    body: { attempt_id: attemptId, text },
  })
  if (error) throw error
  return (data as { url: string }).url
}
