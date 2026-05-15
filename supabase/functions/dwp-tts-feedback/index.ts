/// <reference lib="deno.ns" />
/**
 * dwp-tts-feedback — Generate ElevenLabs TTS for individualised AI feedback,
 * cache in dwp-audio/feedback/<attempt_id>.mp3, return public URL.
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

Deno.serve(async (req) => {
  const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, content-type' }
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const elevenApiKey = Deno.env.get('ELEVENLABS_API_KEY')!
    const voiceId = Deno.env.get('ELEVENLABS_VOICE_ID')!

    const { attempt_id, text } = await req.json()
    const path = `feedback/${attempt_id}.mp3`
    const supa = createClient(supabaseUrl, serviceKey)

    // Cache hit?
    const { data: head } = await supa.storage.from('dwp-audio').list('feedback', { search: `${attempt_id}.mp3`, limit: 1 })
    if (head && head.find((f) => f.name === `${attempt_id}.mp3`)) {
      const { data } = supa.storage.from('dwp-audio').getPublicUrl(path)
      return new Response(JSON.stringify({ url: data.publicUrl, cached: true }), { headers: { ...cors, 'Content-Type': 'application/json' } })
    }

    const resp = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: { 'xi-api-key': elevenApiKey, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
      body: JSON.stringify({ text, model_id: 'eleven_multilingual_v2', voice_settings: { stability: 0.55, similarity_boost: 0.75 } }),
    })
    if (!resp.ok) return new Response(JSON.stringify({ error: 'tts_failed', detail: await resp.text() }), { status: 502, headers: cors })
    const audio = await resp.arrayBuffer()
    const { error: upErr } = await supa.storage.from('dwp-audio').upload(path, audio, { contentType: 'audio/mpeg', upsert: true })
    if (upErr) return new Response(JSON.stringify({ error: 'upload_failed', detail: upErr.message }), { status: 500, headers: cors })
    const { data } = supa.storage.from('dwp-audio').getPublicUrl(path)
    return new Response(JSON.stringify({ url: data.publicUrl, cached: false }), { headers: { ...cors, 'Content-Type': 'application/json' } })
  } catch (err) {
    return new Response(JSON.stringify({ error: 'internal', detail: String(err) }), { status: 500 })
  }
})
