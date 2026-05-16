/**
 * Pre-generate all DWP TTS audio assets via ElevenLabs and upload to
 * Supabase Storage. Resumable + retry-resilient.
 *
 * Usage:  npm run audio:generate
 *
 * Skips files that already exist in public/audio/ (local cache acts as the
 * "done" marker — the upload happens BEFORE the local cache is written, so
 * a cached file means the Storage upload succeeded).
 *
 * Uploads use retry-with-exponential-backoff for transient Storage 5xx
 * errors. Default: 3 attempts, 2s/4s/8s delays.
 */
import { createClient } from '@supabase/supabase-js'
import { mkdir, writeFile, access } from 'node:fs/promises'
import { join, dirname } from 'node:path'

const VOICE_ID = process.env.ELEVENLABS_VOICE_ID!
const API_KEY = process.env.ELEVENLABS_API_KEY!
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL!
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!VOICE_ID || !API_KEY || !SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing env vars. See script header for required keys.')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

const RETRY_DELAYS_MS = [2000, 4000, 8000]

async function fileExistsLocally(path: string): Promise<boolean> {
  try { await access(join('public', 'audio', path)); return true } catch { return false }
}

async function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)) }

async function tts(text: string): Promise<ArrayBuffer> {
  const resp = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
    method: 'POST',
    headers: { 'xi-api-key': API_KEY, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
    body: JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: { stability: 0.55, similarity_boost: 0.75, style: 0.1 },
    }),
  })
  if (!resp.ok) throw new Error(`ElevenLabs ${resp.status}: ${await resp.text()}`)
  return await resp.arrayBuffer()
}

async function uploadWithRetry(path: string, buffer: ArrayBuffer): Promise<void> {
  let lastErr: any
  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    if (attempt > 0) {
      const delay = RETRY_DELAYS_MS[attempt - 1]
      console.log(`  retry ${attempt} in ${delay / 1000}s…`)
      await sleep(delay)
    }
    const { error } = await supabase.storage
      .from('dwp-audio')
      .upload(path, buffer, { contentType: 'audio/mpeg', upsert: true })
    if (!error) return
    lastErr = error
    // Retry only on transient server errors
    const status = (error as any)?.status ?? (error as any)?.statusCode
    if (status && +status >= 500 && +status < 600) continue
    if (String(error.message).toLowerCase().includes('gateway')) continue
    throw error
  }
  throw lastErr
}

async function ensureLocalCache(path: string, buffer: ArrayBuffer) {
  const cachePath = join('public', 'audio', path)
  await mkdir(dirname(cachePath), { recursive: true })
  await writeFile(cachePath, Buffer.from(buffer))
}

async function generateOne(path: string, text: string): Promise<'generated' | 'skipped'> {
  if (await fileExistsLocally(path)) {
    return 'skipped'
  }
  const audio = await tts(text)
  await uploadWithRetry(path, audio)
  await ensureLocalCache(path, audio)
  return 'generated'
}

let generated = 0, skipped = 0

async function generateForLevels() {
  console.log('Fetching levels…')
  const { data: levels, error } = await supabase
    .from('dwp_levels')
    .select('level_id, prompt_title, prompt_instructions, prompt_example')
  if (error) throw error
  console.log(`Got ${levels?.length ?? 0} levels.`)
  for (const lvl of levels ?? []) {
    const intro = `${lvl.prompt_title}. ${lvl.prompt_instructions}`
    const path = `levels/${lvl.level_id}/intro.mp3`
    const status = await generateOne(path, intro)
    console.log(`${status === 'skipped' ? '↷' : '✓'} ${path}`)
    if (status === 'skipped') skipped++; else generated++
  }
}

async function generateForPrompts() {
  console.log('Fetching daily prompts…')
  const { data: prompts, error } = await supabase
    .from('dwp_daily_prompts')
    .select('prompt_slug, prompt_text')
  if (error) throw error
  console.log(`Got ${prompts?.length ?? 0} daily prompts.`)
  for (const p of prompts ?? []) {
    const path = `daily/${p.prompt_slug}.mp3`
    const status = await generateOne(path, p.prompt_text)
    console.log(`${status === 'skipped' ? '↷' : '✓'} ${path}`)
    if (status === 'skipped') skipped++; else generated++
  }
}

;(async () => {
  await generateForLevels()
  await generateForPrompts()
  console.log(`\nDone. ${generated} generated · ${skipped} skipped (already cached).`)
})().catch((e) => { console.error(e); process.exit(1) })
