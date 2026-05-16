/**
 * upload-audio-to-storage.mjs
 *
 * Uploads all MP3 files from public/audio/ to the dwp-audio Supabase Storage bucket.
 * Run from the wrife-dwp project root:
 *
 *   node scripts/upload-audio-to-storage.mjs
 *
 * Requires:
 *   - SUPABASE_SERVICE_ROLE_KEY in .env.local (or set as env var)
 *   - VITE_SUPABASE_URL in .env.local (or set as env var)
 *   - Node 18+ (for native fetch)
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'fs'
import { join, relative } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

// ── Load .env / .env.local ───────────────────────────────────────────────────
function loadEnv() {
  // Try .env.local first, fall back to .env
  const envPath = ['.env.local', '.env']
    .map(f => join(ROOT, f))
    .find(p => existsSync(p))
  if (!envPath) {
    console.error('❌ No .env or .env.local found in', ROOT)
    process.exit(1)
  }
  console.log(`📄 Loading env from ${envPath.split('/').pop()}`)
  const lines = readFileSync(envPath, 'utf-8').split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const [key, ...valueParts] = trimmed.split('=')
    if (key && valueParts.length) {
      process.env[key.trim()] = valueParts.join('=').trim()
    }
  }
}

loadEnv()

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const BUCKET = 'dwp-audio'
const AUDIO_DIR = join(ROOT, 'public', 'audio')

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

// ── Collect all MP3 files recursively ────────────────────────────────────────
function collectMp3s(dir) {
  const results = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      results.push(...collectMp3s(full))
    } else if (entry.endsWith('.mp3')) {
      results.push(full)
    }
  }
  return results
}

// ── Upload a single file ──────────────────────────────────────────────────────
async function uploadFile(localPath, storagePath) {
  const bytes = readFileSync(localPath)
  const url = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${storagePath}`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': 'audio/mpeg',
      'x-upsert': 'true',
    },
    body: bytes,
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`HTTP ${res.status}: ${text}`)
  }
  return res.status
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  if (!existsSync(AUDIO_DIR)) {
    console.error('❌ Audio directory not found:', AUDIO_DIR)
    process.exit(1)
  }

  const files = collectMp3s(AUDIO_DIR)
  console.log(`\n🎵 Found ${files.length} MP3 files in public/audio/`)
  console.log(`📤 Uploading to Supabase bucket: ${BUCKET}\n`)

  let uploaded = 0
  let failed = 0
  const errors = []

  for (const localPath of files) {
    // e.g. public/audio/daily/s048.mp3 → daily/s048.mp3
    const storagePath = relative(AUDIO_DIR, localPath)

    try {
      await uploadFile(localPath, storagePath)
      uploaded++
      process.stdout.write(`\r✅ ${uploaded}/${files.length} uploaded`)
    } catch (err) {
      failed++
      errors.push({ file: storagePath, error: err.message })
      process.stdout.write(`\r⚠️  ${uploaded} uploaded, ${failed} failed (${storagePath})     `)
    }

    // Small delay to avoid rate-limiting
    await new Promise(r => setTimeout(r, 30))
  }

  console.log(`\n\n📊 Done!`)
  console.log(`   ✅ Uploaded: ${uploaded}`)
  console.log(`   ❌ Failed:   ${failed}`)

  if (errors.length > 0) {
    console.log('\nFailed files:')
    for (const e of errors) {
      console.log(`  ${e.file}: ${e.error}`)
    }
  }

  console.log('\n🔗 Verify at:')
  console.log(`   https://supabase.com/dashboard/project/gzmgjkbtsvezfclmreru/storage/buckets/${BUCKET}`)
}

main().catch(err => {
  console.error('\n❌ Fatal error:', err)
  process.exit(1)
})
