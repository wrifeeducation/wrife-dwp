/**
 * Validates .env to catch common mistakes before they cause a confusing
 * crash at runtime. Run: npx tsx scripts/check-env.ts
 *
 * Checks each value for:
 *  - is still a <PASTE_HERE_*> placeholder
 *  - has stray whitespace at start/end
 *  - matches the expected format (e.g. anon keys are JWTs starting with eyJ)
 */
import { readFileSync } from 'node:fs'

const ENV_PATH = '.env'

interface Check {
  key: string
  required: boolean
  validate: (v: string) => string | null   // returns error message or null
}

const checks: Check[] = [
  {
    key: 'VITE_SUPABASE_URL',
    required: true,
    validate: (v) => {
      if (!/^https:\/\/[a-z0-9]{20}\.supabase\.co$/.test(v)) {
        return 'Expected format: https://<20-char-ref>.supabase.co (no trailing slash, no path)'
      }
      return null
    },
  },
  {
    key: 'VITE_SUPABASE_ANON_KEY',
    required: true,
    validate: (v) => {
      if (!v.startsWith('eyJ')) return 'Anon key should start with "eyJ" (it\'s a JWT). Did you paste the service_role key by mistake?'
      if (v.length < 100) return 'Anon key looks too short — make sure you copied the whole thing.'
      return null
    },
  },
  {
    key: 'VITE_PUBLIC_SITE_URL',
    required: true,
    validate: (v) => v === 'https://dailywrite.wrife.co.uk' ? null : 'Should be exactly https://dailywrite.wrife.co.uk',
  },
  {
    key: 'VITE_WRIFE_HUB_URL',
    required: true,
    validate: (v) => v === 'https://wrife.co.uk' ? null : 'Should be exactly https://wrife.co.uk',
  },
  {
    key: 'ANTHROPIC_API_KEY',
    required: true,
    validate: (v) => v.startsWith('sk-ant-') ? null : 'Anthropic key must start with "sk-ant-"',
  },
  {
    key: 'ELEVENLABS_API_KEY',
    required: true,
    validate: (v) => v.length > 20 ? null : 'ElevenLabs key looks too short.',
  },
  {
    key: 'ELEVENLABS_VOICE_ID',
    required: true,
    validate: (v) => /^[a-zA-Z0-9]{15,25}$/.test(v) ? null : 'Voice ID should be a 15-25 char alphanumeric string.',
  },
  {
    key: 'SUPABASE_SERVICE_ROLE_KEY',
    required: true,
    validate: (v) => v.startsWith('eyJ') ? null : 'Service role key should start with "eyJ" (it\'s a JWT).',
  },
]

const env: Record<string, string> = {}
try {
  for (const line of readFileSync(ENV_PATH, 'utf-8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim()
  }
} catch {
  console.error('❌ Could not read .env — does it exist? Run: cp .env.example .env')
  process.exit(1)
}

let pass = 0, warn = 0, fail = 0
console.log('Checking .env…\n')
for (const c of checks) {
  const v = env[c.key]
  if (v == null) {
    console.log(`❌ ${c.key} — missing entirely`)
    fail++; continue
  }
  if (v.startsWith('<PASTE') || v.endsWith('>')) {
    console.log(`⚠️  ${c.key} — still the placeholder, please fill in`)
    warn++; continue
  }
  if (v !== env[c.key].trim()) {
    console.log(`❌ ${c.key} — has stray whitespace at start/end`)
    fail++; continue
  }
  const err = c.validate(v)
  if (err) {
    console.log(`❌ ${c.key} — ${err}`)
    fail++; continue
  }
  console.log(`✓ ${c.key}`)
  pass++
}

console.log(`\n${pass} OK · ${warn} placeholder · ${fail} invalid`)
if (fail > 0) { console.error('\nFix the ❌ items before proceeding.'); process.exit(1) }
if (warn > 0) { console.error('\nFill in the ⚠️ placeholders before running migrations.'); process.exit(1) }
console.log('\n✅ All env values look good. Ready for next step.')
