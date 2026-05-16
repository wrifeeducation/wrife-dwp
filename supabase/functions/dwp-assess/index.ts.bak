// deno-lint-ignore-file no-explicit-any
/// <reference lib="deno.ns" />

/**
 * DWP — Edge Function: dwp-assess
 *
 * Two modes:
 *   mode = 'level'         → assess a numbered level attempt against its rubric
 *   mode = 'daily_prompt'  → assess an open-text daily prompt
 *
 * Flow:
 *   1. Authenticate caller (JWT from supabase client).
 *   2. Look up the DWP pupil row for this auth_user_id.
 *   3. Load the level rubric (or use a daily-prompt rubric variant).
 *   4. Call Claude with the assessment system prompt + level context.
 *   5. Parse Claude's JSON response into our schema.
 *   6. Insert dwp_attempts (or dwp_daily_attempts) row.
 *   7. Update dwp_progress on Mastery/Secure (passed).
 *   8. Earn Word Seeds for passed mode='level' / submitted daily prompts.
 *   9. Return AssessmentResult to the client.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'
import Anthropic from 'https://esm.sh/@anthropic-ai/sdk@0.27.0'

type Band = 'mastery' | 'secure' | 'developing' | 'emerging'

const ASSESSMENT_SYSTEM_PROMPT = `You are an expert UK primary writing teacher assessing pupils aged 6-11. Your job is to score a single attempt against the provided rubric and return a STRICT JSON object — no prose, no markdown, no commentary outside the JSON.

# Principles
- Tone: enthusiastic, age-appropriate, never red-pen. Pupils in Emerging band get gentle encouragement, never negative framing.
- One Teaching Point Rule: highlight only the single most important growth area, never a list.
- Pattern recognition over error-counting: identify systematic misunderstandings (e.g. confuses_people_places), not isolated typos.
- Feature tags: for every feature in the supplied feature_taxonomy, tag whether the level REQUIRED it and whether the pupil APPLIED it correctly.

# Output schema (return EXACTLY this JSON shape)
{
  "performance": { "percentage": <0-100>, "band": "mastery"|"secure"|"developing"|"emerging", "badge": "<emoji and short name from rubric>" },
  "pattern_analysis": ["<slug>", ...],
  "feedback": { "praise": "<one warm sentence>", "one_growth_point": "<one specific, manageable target — or empty if mastery>" },
  "teacher_notes": { "intervention_needed": <boolean>, "suggested_focus": "<short string for teacher>" },
  "feature_tags": [
    { "feature_slug": "<slug>", "applied_correctly": <bool>, "was_required": <bool> }
  ]
}`

function bandForPercentage(pct: number, rubric: any): { band: Band; badge: string; message: string } {
  // Find which rubric.scoring band the percentage's 0-10 equivalent falls into
  const tenPointScore = Math.round((pct / 100) * 10)
  for (const band of ['mastery', 'secure', 'developing', 'emerging'] as Band[]) {
    const def = rubric?.scoring?.[band]
    if (!def) continue
    const [min, max] = def.range
    if (tenPointScore >= min && tenPointScore <= max) {
      return { band, badge: def.badge ?? '', message: def.message ?? '' }
    }
  }
  return { band: 'emerging', badge: '🌱', message: 'Keep practising — you\'re learning!' }
}

function xpForBand(band: Band): number {
  return band === 'mastery' ? 30 : band === 'secure' ? 20 : band === 'developing' ? 10 : 5
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })
  const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, content-type' }
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  try {
    const url = Deno.env.get('SUPABASE_URL')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY')!
    const authHeader = req.headers.get('Authorization') ?? ''
    const accessToken = authHeader.replace(/^Bearer\s+/i, '')

    // Caller-scoped client for auth.getUser
    const callerClient = createClient(url, serviceKey, { global: { headers: { Authorization: `Bearer ${accessToken}` } } })
    const { data: { user } } = await callerClient.auth.getUser(accessToken)
    if (!user) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: cors })

    // Service-role client for writes
    const admin = createClient(url, serviceKey)
    const body = await req.json() as any
    const mode = body.mode as 'level' | 'daily_prompt'

    // Look up the DWP pupil row
    const { data: pupil } = await admin.from('pupils').select('*').eq('auth_user_id', user.id).maybeSingle()
    if (!pupil) return new Response(JSON.stringify({ error: 'no_pupil_record' }), { status: 404, headers: cors })

    // Feature taxonomy for tagging
    const { data: features } = await admin.from('dwp_feature_taxonomy').select('slug, name')
    const featureSlugs = (features ?? []).map((f: any) => f.slug)

    let rubric: any
    let levelContext: any
    let levelId: string | null = null
    let promptId: string | null = null

    if (mode === 'level') {
      levelId = body.level_id
      const { data: level, error } = await admin.from('dwp_levels').select('*').eq('level_id', levelId).maybeSingle()
      if (error || !level) return new Response(JSON.stringify({ error: 'level_not_found' }), { status: 404, headers: cors })
      rubric = level.rubric
      levelContext = {
        level_id: level.level_id,
        activity_name: level.activity_name,
        activity_type: level.activity_type,
        learning_objective: level.learning_objective,
        prompt_instructions: level.prompt_instructions,
        items: level.items,
      }
    } else {
      promptId = body.prompt_id
      const { data: prompt } = await admin.from('dwp_daily_prompts').select('*').eq('id', promptId).maybeSingle()
      if (!prompt) return new Response(JSON.stringify({ error: 'prompt_not_found' }), { status: 404, headers: cors })
      rubric = {
        passing_threshold: 60,
        scoring: {
          mastery:    { range: [9,10], badge: '🏆 Daily Mastery!' },
          secure:     { range: [7,8],  badge: '⭐ Strong Effort!' },
          developing: { range: [5,6],  badge: '💪 Good Try!' },
          emerging:   { range: [0,4],  badge: '🌱 Keep Writing!' },
        },
      }
      levelContext = { kind: 'daily_prompt', category: prompt.category, text: prompt.prompt_text }
    }

    // Call Claude
    const anthropic = new Anthropic({ apiKey: anthropicKey })
    const userMessage = JSON.stringify({
      mode,
      level_or_prompt_context: levelContext,
      rubric,
      submission: body.submission,
      oral_rehearsal_transcript: body.oral_rehearsal_transcript ?? null,
      feature_taxonomy: featureSlugs,
    })
    let parsedAssessment: any
    try {
      const claudeResp = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1200,
        system: ASSESSMENT_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userMessage }],
      })
      const text = claudeResp.content
        .filter((b: any) => b.type === 'text')
        .map((b: any) => b.text)
        .join('')
      // Strict JSON — strip code fences if Claude added them
      const json = text.replace(/^```json\s*|\s*```$/g, '')
      parsedAssessment = JSON.parse(json)
    } catch (e) {
      console.error('Claude failed, using fallback:', e)
      parsedAssessment = fallbackAssessment(body.submission, rubric)
    }

    const pct = Math.max(0, Math.min(100, Math.round(parsedAssessment.performance?.percentage ?? 0)))
    const { band, badge: rubricBadge, message: rubricMessage } = bandForPercentage(pct, rubric)
    const passed = band === 'mastery' || band === 'secure'
    const badge = parsedAssessment.performance?.badge ?? rubricBadge
    const heading = passed ? 'Brilliant!' : band === 'developing' ? 'Almost there' : 'Keep going'
    const message = parsedAssessment.feedback?.praise ?? rubricMessage

    const xpEarned = xpForBand(band)
    let seedEarned: string | undefined

    if (mode === 'level' && levelId) {
      // Insert attempt
      await admin.from('dwp_attempts').insert({
        pupil_id: pupil.id,
        class_id: pupil.class_id,
        level_id: levelId,
        submission: body.submission,
        oral_rehearsal_transcript: body.oral_rehearsal_transcript ?? null,
        ai_assessment: parsedAssessment,
        feature_tags: parsedAssessment.feature_tags ?? [],
        score: Math.round(pct / 10),
        total_items: 10,
        percentage: pct,
        band,
        badge,
        passed,
        pattern_errors: parsedAssessment.pattern_analysis ?? [],
        time_spent_seconds: body.time_spent_seconds ?? null,
      })

      if (passed) {
        // Update dwp_progress
        const { data: existing } = await admin.from('dwp_progress').select('*').eq('pupil_id', pupil.id).maybeSingle()
        const completed = new Set(existing?.levels_completed ?? [])
        completed.add(levelId)
        await admin.from('dwp_progress').upsert({
          pupil_id: pupil.id,
          class_id: pupil.class_id,
          current_level_id: nextLevelId(levelId),
          levels_completed: [...completed],
          xp_total: (existing?.xp_total ?? 0) + xpEarned,
          last_active_at: new Date().toISOString(),
        }, { onConflict: 'pupil_id' })
      }
    } else if (mode === 'daily_prompt' && promptId) {
      const submissionText = (body.submission as any)?.text ?? ''
      const wordCount = submissionText.trim() ? submissionText.trim().split(/\s+/).length : 0
      const { data: prompt } = await admin.from('dwp_daily_prompts').select('prompt_slug, category, word_seeds').eq('id', promptId).maybeSingle()
      await admin.from('dwp_daily_attempts').insert({
        pupil_id: pupil.id,
        class_id: pupil.class_id,
        prompt_id: promptId,
        prompt_slug: prompt?.prompt_slug ?? '',
        category: prompt?.category ?? 'narrative',
        submission_text: submissionText,
        word_count: wordCount,
        oral_rehearsal_transcript: body.oral_rehearsal_transcript ?? null,
        ai_assessment: parsedAssessment,
        feature_tags: parsedAssessment.feature_tags ?? [],
        band,
      })
      // Earn a seed for the matching biome — daily prompts always earn one
      const biome = categoryToBiome(prompt?.category ?? 'narrative')
      const seedWord = pickSeedWord(prompt?.word_seeds ?? [], submissionText)
      if (seedWord) {
        await admin.from('dwp_garden_seeds').insert({
          pupil_id: pupil.id, word: seedWord, biome, rarity: 'common',
          source_type: 'daily_prompt', source_id: prompt?.prompt_slug ?? '',
        }).select().maybeSingle()
        seedEarned = seedWord
      }
    }

    return new Response(JSON.stringify({
      band, badge, percentage: pct, heading, message,
      xpEarned, passed, seedEarned,
    } as any), { headers: { ...cors, 'Content-Type': 'application/json' } })
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: 'internal', detail: String(err) }), { status: 500 })
  }
})

// ─── Helpers ───────────────────────────────────────────────────────────

function fallbackAssessment(submission: any, rubric: any) {
  // Deterministic local scorer — used when Claude API errors. Conservative
  // 60% so the pupil isn't unfairly blocked.
  const pct = 60
  return {
    performance: { percentage: pct, band: 'developing', badge: rubric?.scoring?.developing?.badge ?? '💪' },
    pattern_analysis: [],
    feedback: { praise: 'Good effort!', one_growth_point: 'We had a connection hiccup — try again in a moment.' },
    teacher_notes: { intervention_needed: false, suggested_focus: 'Retry — assessment unavailable.' },
    feature_tags: [],
  }
}

function nextLevelId(currentId: string): string {
  const m = currentId.match(/^dwp_l(\d+)$/)
  if (!m) return currentId
  const n = parseInt(m[1], 10)
  if (n >= 40) return currentId
  return `dwp_l${n + 1}`
}

function categoryToBiome(category: string): string {
  return ({
    sensory: 'meadow',
    narrative: 'grove',
    argument: 'stone_path',
    reflection: 'reflection_pool',
    description: 'workshop',
  } as Record<string, string>)[category] ?? 'meadow'
}

function pickSeedWord(catalogue: string[], submission: string): string | null {
  // Prefer a word from the prompt's curated word_seeds list that the pupil used.
  for (const w of catalogue) {
    if (submission.toLowerCase().includes(w.toLowerCase())) return w
  }
  // Otherwise, use the first catalogue word as a "freebie" — they earned a seed
  // for submitting.
  return catalogue[0] ?? null
}
