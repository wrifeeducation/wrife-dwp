-- DWP Feature Taxonomy + Transfer Gap metrics
-- Since DWP is standalone, these live on DWP's project. If cross-app
-- aggregation with PWP/IP is added later, a sync mechanism pushes summaries
-- to wrife-website.

CREATE TABLE IF NOT EXISTS dwp_feature_taxonomy (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT NOT NULL UNIQUE,
  name            TEXT NOT NULL,
  description     TEXT NOT NULL,
  category        TEXT NOT NULL CHECK (category IN ('transcription','syntax','vocabulary','composition','sequencing')),
  tier_introduced INTEGER NOT NULL CHECK (tier_introduced BETWEEN 1 AND 8),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dwp_transfer_gap_metrics (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pupil_id             UUID NOT NULL REFERENCES pupils(id) ON DELETE CASCADE,
  feature_id           UUID NOT NULL REFERENCES dwp_feature_taxonomy(id),
  accuracy_isolated    NUMERIC(5,2),                       -- % when required by level
  accuracy_in_context  NUMERIC(5,2),                       -- % unprompted in free writing
  gap_value            NUMERIC(5,2),                       -- isolated - in_context
  sample_count         INTEGER NOT NULL DEFAULT 0,
  last_calculated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (pupil_id, feature_id)
);
CREATE INDEX IF NOT EXISTS idx_dwp_tg_pupil ON dwp_transfer_gap_metrics(pupil_id);

ALTER TABLE dwp_feature_taxonomy     ENABLE ROW LEVEL SECURITY;
ALTER TABLE dwp_transfer_gap_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "dwp_feature_taxonomy readable by authed"
  ON dwp_feature_taxonomy FOR SELECT TO authenticated USING (true);

CREATE POLICY "dwp_transfer_gap pupil reads own"
  ON dwp_transfer_gap_metrics FOR SELECT TO authenticated USING (pupil_id IN (
    SELECT id FROM pupils WHERE auth_user_id = auth.uid()
  ));
CREATE POLICY "dwp_transfer_gap parent reads linked"
  ON dwp_transfer_gap_metrics FOR SELECT TO authenticated USING (pupil_id IN (
    SELECT ppl.pupil_id FROM pupil_parent_links ppl
    JOIN home_accounts ha ON ha.id = ppl.parent_account_id
    WHERE ha.auth_user_id = auth.uid()
  ));
CREATE POLICY "dwp_transfer_gap teacher reads class"
  ON dwp_transfer_gap_metrics FOR SELECT TO authenticated USING (pupil_id IN (
    SELECT p.id FROM pupils p
    JOIN classes c ON c.id = p.class_id
    JOIN home_accounts ha ON ha.id = c.owner_id
    WHERE ha.auth_user_id = auth.uid() AND ha.account_type = 'independent_teacher'
  ));

-- ─── Seed 20 features ────────────────────────────────────────────────
INSERT INTO dwp_feature_taxonomy (slug, name, description, category, tier_introduced) VALUES
('capital_sentence_start',  'Sentence-initial capital',     'Capital letter at the start of every sentence',                       'transcription', 3),
('end_punctuation',         'End punctuation',              'Full stop, question mark, or exclamation mark at sentence end',       'transcription', 3),
('proper_noun_capital',     'Proper noun capitalisation',   'Capital letters on specific names (people, places, days, months)',   'transcription', 1),
('subject_verb_agreement',  'Subject-verb agreement',       'Subject and verb agree in number (dog runs / dogs run)',             'syntax',        3),
('tense_consistency',       'Tense consistency',            'Stays in the same tense through a sentence or paragraph',            'syntax',        4),
('adjective_use',           'Adjective use',                'Uses adjectives to add detail to nouns',                              'syntax',        4),
('conjunction_variety',     'Conjunction variety',          'Uses a variety of conjunctions beyond "and"',                         'syntax',        4),
('noun_phrase_expansion',   'Noun-phrase expansion',        'Expands noun phrases with determiners, adjectives, or prep phrases',  'syntax',        4),
('prep_phrase_use',         'Prepositional phrases',        'Uses prep phrases for where/when/how information',                    'syntax',        4),
('temporal_connective',     'Temporal connectives',         'Uses first/next/then/finally to sequence',                            'sequencing',    5),
('sentence_length_variety', 'Sentence-length variety',      'Varies short and long sentences for effect',                          'composition',   7),
('paragraphing',            'Paragraphing',                 'Groups related sentences into paragraphs',                            'composition',   8),
('common_proper_noun',      'Common vs proper noun',        'Distinguishes common from proper nouns reliably',                    'transcription', 1),
('comma_in_lists',          'Commas in lists',              'Uses commas to separate list items',                                  'transcription', 4),
('exclamation_question',    'Exclamation/question marks',   'Uses ! and ? where the meaning demands them',                         'transcription', 3),
('simile_use',              'Similes',                      'Uses comparisons (like, as) to enrich description',                   'vocabulary',    7),
('sensory_detail',          'Sensory detail',               'Includes sight/sound/smell/touch detail in writing',                  'vocabulary',    6),
('sequencing_connective',   'Sequencing connectives',       'Uses sequence words across multiple sentences for flow',              'sequencing',    5),
('narrative_arc',           'Narrative arc (BME)',          'Has discernible Beginning, Middle, and End',                          'composition',   6),
('dialogue_punctuation',    'Dialogue punctuation',         'Uses inverted commas/quotation marks around speech',                  'transcription', 7);
