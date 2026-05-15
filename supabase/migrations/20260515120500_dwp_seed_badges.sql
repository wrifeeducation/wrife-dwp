-- DWP badge catalogue — band badges + milestone badges + tier badges + programme finale
INSERT INTO dwp_badges (badge_slug, badge_name, emoji, band, description) VALUES
-- Band badges (awarded per attempt)
('mastery_trophy',     'Mastery Trophy',     '🏆', 'mastery',    'Awarded for 90-100% score on any level'),
('secure_star',        'Secure Star',        '⭐', 'secure',     'Awarded for 80-89% score on any level'),
('developing_biceps',  'Developing Biceps',  '💪', 'developing', 'Awarded for 60-79% — keep practising'),
('emerging_seedling',  'Emerging Seedling',  '🌱', 'emerging',   'Awarded for 0-59% — let''s learn together'),
-- Milestone badges (key moments)
('first_sentence',     'First Sentence',     '✍️', 'milestone',  'L14 — first independent sentences'),
('first_story',        'First Story',        '📖', 'milestone',  'L33 — first complete story'),
-- Tier badges (awarded on completing a tier finale)
('tier1_master',       'Tier 1 Master',      '🥉', 'tier',       'Completed Word Awareness'),
('tier2_master',       'Tier 2 Master',      '🥈', 'tier',       'Completed Word Combinations'),
('tier3_master',       'Tier 3 Master',      '🥇', 'tier',       'Completed Simple Sentences'),
('tier4_master',       'Tier 4 Master',      '🛡️', 'tier',       'Completed Sentence Expansion'),
('tier5_master',       'Tier 5 Master',      '⚡', 'tier',       'Completed Basic Sequencing'),
('tier6_master',       'Tier 6 Master',      '🌟', 'tier',       'Completed BME Structure'),
('tier7_master',       'Tier 7 Master',      '💎', 'tier',       'Completed Enhanced Sentences'),
('tier8_master',       'Tier 8 Master',      '👑', 'tier',       'Completed Narrative Mastery'),
-- Programme finale
('dwp_programme_master','DWP Programme Master','🎓','programme',  'Completed the full 40-level DWP programme')
ON CONFLICT (badge_slug) DO NOTHING;
