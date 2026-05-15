-- DWP — seed all 40 levels.
-- Source: DWP Bible — Writing_Activity_Bank_TIERS_1-8_COMPLETE.md
--         + DWP_Tier1_Level1_Complete.md + DWP_Tier1_Levels2-5_Complete.md
-- Tier 1 (L1-L5) seeded in full; Tier 2-8 seeded with structural stubs
-- (prompt_title + objective + activity_type + rubric); content team fills
-- items + word_bank by reading the matching Bible doc.

-- ─── TIER 1: Word Awareness ──────────────────────────────────────────
INSERT INTO dwp_levels (level_id, level_number, tier_number, activity_name, activity_type, learning_objective,
  prompt_title, prompt_instructions, prompt_example, word_bank, items, rubric,
  passing_threshold, difficulty_band, age_range, tier_finale, milestone, display_order)
VALUES
('dwp_l1', 1, 1, 'Sorting Nouns: People, Places, Things', 'word_sorting',
 'Pupils can classify common nouns into people/places/things.',
 'Sort the words',
 'Sort each word into PEOPLE (who), PLACES (where), or THINGS (what).',
 'TEACHER → PEOPLE (it names WHO)',
 '[]'::jsonb,
 '[{"id":"a","words":["grandmother","park","football","teacher","London","book","doctor","school","bicycle","friend"]}]'::jsonb,
 '{"passing_threshold":80,"scoring":{"mastery":{"range":[9,10],"badge":"🏆 Word Sorting Expert!","message":"Amazing! You can sort words brilliantly!"},"secure":{"range":[8,8],"badge":"⭐ Great Sorting!","message":"Excellent! You understand word types. Ready for Level 2!"},"developing":{"range":[6,7],"badge":"💪 Getting There!","message":"Good work! Let''s practice more sorting."},"emerging":{"range":[0,5],"badge":"🌱 Keep Learning!","message":"Let''s learn about word types together!"}},"pattern_analysis":{"confuses_people_places":"Remember: PEOPLE are WHO. PLACES are WHERE.","marks_all_as_things":"Different types of words exist - people, places, actions!","inconsistent_sorting":"Let''s focus on what each word group means."}}'::jsonb,
 80, 'foundation', '6-7', false, false, 1),

('dwp_l2', 2, 1, 'Finding Verbs', 'verb_identification',
 'Pupils can identify the action word (verb) in a simple sentence.',
 'Find the action',
 'Tap the word that shows the ACTION in each sentence.',
 'The girl JUMPS over the puddle. → jumps',
 '[]'::jsonb,
 '[{"sentence":"The girl jumps over the puddle.","verb":"jumps"},{"sentence":"My brother reads a big book.","verb":"reads"},{"sentence":"Birds sing in the morning.","verb":"sing"},{"sentence":"The cat sleeps on the mat.","verb":"sleeps"},{"sentence":"We play football at break.","verb":"play"}]'::jsonb,
 '{"passing_threshold":80,"scoring":{"mastery":{"range":[9,10],"badge":"🏆 Verb Spotter!","message":"You can spot action words brilliantly!"},"secure":{"range":[8,8],"badge":"⭐ Action Hero!","message":"Great work! On to Level 3!"},"developing":{"range":[6,7],"badge":"💪 Almost There!","message":"Try again — actions are words that someone DOES."},"emerging":{"range":[0,5],"badge":"🌱 Let''s Practice!","message":"An action word is something you can DO."}}}'::jsonb,
 80, 'foundation', '6-7', false, false, 2),

('dwp_l3', 3, 1, 'Noun + Verb Logic', 'noun_verb_logic',
 'Pupils can decide whether a noun+verb pairing is sensible.',
 'Does it make sense?',
 'Read each pair. Tap YES if it makes sense, NO if it doesn''t.',
 '"Birds sing" → YES (birds can sing). "Tables run" → NO (tables don''t run).',
 '[]'::jsonb,
 '[{"pair":"Birds sing","answer":"yes"},{"pair":"Tables run","answer":"no"},{"pair":"Water flows","answer":"yes"},{"pair":"Bicycles talk","answer":"no"},{"pair":"Children play","answer":"yes"},{"pair":"Books eat","answer":"no"},{"pair":"Cars drive","answer":"yes"},{"pair":"Clouds dance","answer":"no"},{"pair":"Dogs bark","answer":"yes"},{"pair":"Chairs cook","answer":"no"}]'::jsonb,
 '{"passing_threshold":80,"scoring":{"mastery":{"range":[9,10],"badge":"🏆 Logic Champion!","message":"Brilliant! You know what makes sense!"},"secure":{"range":[8,8],"badge":"⭐ Sense Seeker!","message":"Good thinking! On to Level 4."},"developing":{"range":[6,7],"badge":"💪 Keep Thinking!","message":"Some words just don''t go with each other."},"emerging":{"range":[0,5],"badge":"🌱 Try Again!","message":"Think: who or what can DO the action?"}},"pattern_analysis":{"accepts_all_combinations":"Some pairings really don''t make sense — like tables running."}}'::jsonb,
 80, 'foundation', '6-7', false, false, 3),

('dwp_l4', 4, 1, 'Common vs. Proper Nouns', 'proper_noun_capitalisation',
 'Pupils can distinguish common from proper nouns and capitalise correctly.',
 'Common or Proper?',
 'Is this a general word (Common) or a specific name (Proper)? Proper nouns need a capital letter!',
 '"city" → Common.  "London" → Proper (capital L).',
 '[]'::jsonb,
 '[{"word":"city","type":"common"},{"word":"London","type":"proper"},{"word":"boy","type":"common"},{"word":"Sam","type":"proper"},{"word":"school","type":"common"},{"word":"WriFe Primary","type":"proper"},{"word":"river","type":"common"},{"word":"Thames","type":"proper"},{"word":"month","type":"common"},{"word":"January","type":"proper"}]'::jsonb,
 '{"passing_threshold":80,"scoring":{"mastery":{"range":[9,10],"badge":"🏆 Capital Champion!","message":"You know your capitals!"},"secure":{"range":[8,8],"badge":"⭐ Proper Pro!","message":"Solid work — Level 5 awaits."},"developing":{"range":[6,7],"badge":"💪 Almost There!","message":"Specific names always need a capital."},"emerging":{"range":[0,5],"badge":"🌱 Let''s Learn!","message":"Common = general. Proper = specific name (with a CAPITAL)."}}}'::jsonb,
 80, 'foundation', '7-8', false, false, 4),

('dwp_l5', 5, 1, 'Mixed Sorting Challenge', 'mixed_sorting',
 'Pupils can sort across all four categories: people, places, things, actions.',
 'The Big Sort!',
 'Sort each word: is it a PERSON, PLACE, THING, or ACTION?',
 'firefighter → PERSON;  hospital → PLACE;  violin → THING;  run → ACTION.',
 '[]'::jsonb,
 '[{"id":"a","words":["firefighter","hospital","violin","run","London","sing","grandmother","park","football","jump"]}]'::jsonb,
 '{"passing_threshold":80,"scoring":{"mastery":{"range":[9,10],"badge":"🏆 Tier 1 Master!","message":"You''ve mastered Tier 1!"},"secure":{"range":[8,8],"badge":"⭐ Tier 1 Champion!","message":"Excellent! Tier 2 awaits."},"developing":{"range":[6,7],"badge":"💪 So Close!","message":"Almost there — review Levels 1-4."},"emerging":{"range":[0,5],"badge":"🌱 Keep Going!","message":"Let''s review the word types together."}}}'::jsonb,
 80, 'foundation', '7-8', true, false, 5);

-- ─── TIER 2: Word Combinations ───────────────────────────────────────
INSERT INTO dwp_levels (level_id, level_number, tier_number, activity_name, activity_type, learning_objective,
  prompt_title, prompt_instructions, rubric, passing_threshold, difficulty_band, age_range, tier_finale, milestone, display_order)
VALUES
('dwp_l6',  6, 2, 'Add a Noun', 'add_noun', 'Pupils complete phrases by adding an appropriate noun.', 'Add the missing word', 'Pick the best NOUN to complete each phrase.', '{"passing_threshold":80,"scoring":{"mastery":{"range":[9,10],"badge":"🏆 Word Builder!"},"secure":{"range":[8,8],"badge":"⭐ Solid Start!"},"developing":{"range":[6,7],"badge":"💪 Try Again!"},"emerging":{"range":[0,5],"badge":"🌱 Let''s Learn!"}}}'::jsonb, 80, 'foundation', '7-8', false, false, 6),
('dwp_l7',  7, 2, 'Add a Verb', 'add_verb', 'Pupils pair subjects with sensible verbs.', 'Add the action', 'Pick a VERB that fits.', '{"passing_threshold":80,"scoring":{"mastery":{"range":[9,10],"badge":"🏆 Action Architect!"},"secure":{"range":[8,8],"badge":"⭐ Doing Well!"},"developing":{"range":[6,7],"badge":"💪 Almost!"},"emerging":{"range":[0,5],"badge":"🌱 Practice!"}}}'::jsonb, 80, 'foundation', '7-8', false, false, 7),
('dwp_l8',  8, 2, 'Det + Noun + Verb', 'det_noun_verb', 'Pupils build three-word phrases (determiner + noun + verb).', 'Three-word phrases', 'Build a sensible Det + Noun + Verb phrase.', '{"passing_threshold":80,"scoring":{"mastery":{"range":[9,10],"badge":"🏆 Phrase Pro!"},"secure":{"range":[8,8],"badge":"⭐ Strong Build!"},"developing":{"range":[6,7],"badge":"💪 Keep Going!"},"emerging":{"range":[0,5],"badge":"🌱 Let''s Try!"}}}'::jsonb, 80, 'foundation', '7-8', false, false, 8),
('dwp_l9',  9, 2, 'Add an Adjective', 'add_adjective', 'Pupils enrich noun phrases with adjectives.', 'Describe it', 'Add a describing word (ADJECTIVE).', '{"passing_threshold":80,"scoring":{"mastery":{"range":[9,10],"badge":"🏆 Word Painter!"},"secure":{"range":[8,8],"badge":"⭐ Colourful!"},"developing":{"range":[6,7],"badge":"💪 More Detail!"},"emerging":{"range":[0,5],"badge":"🌱 Let''s Try!"}}}'::jsonb, 80, 'foundation', '7-8', false, false, 9),
('dwp_l10',10, 2, 'Word Chain Challenge', 'word_chain', 'Pupils extend a phrase one slot at a time.', 'Build a chain', 'Add the next word to grow the phrase.', '{"passing_threshold":80,"scoring":{"mastery":{"range":[9,10],"badge":"🏆 Tier 2 Master!"},"secure":{"range":[8,8],"badge":"⭐ Chain Champion!"},"developing":{"range":[6,7],"badge":"💪 So Close!"},"emerging":{"range":[0,5],"badge":"🌱 Keep Going!"}}}'::jsonb, 80, 'foundation', '7-8', true, false, 10);

-- ─── TIER 3: Simple Sentences ────────────────────────────────────────
INSERT INTO dwp_levels (level_id, level_number, tier_number, activity_name, activity_type, learning_objective,
  prompt_title, prompt_instructions, rubric, passing_threshold, difficulty_band, age_range, tier_finale, milestone, display_order)
VALUES
('dwp_l11',11, 3, 'Copy Perfect Sentences', 'sentence_copy', 'Pupils copy sentences accurately with punctuation.', 'Copy carefully', 'Copy each sentence EXACTLY. Watch capitals and full stops!', '{"passing_threshold":80,"scoring":{"mastery":{"range":[9,10],"badge":"🏆 Pen Pal Pro!"},"secure":{"range":[8,8],"badge":"⭐ Steady Hand!"},"developing":{"range":[6,7],"badge":"💪 Take Care!"},"emerging":{"range":[0,5],"badge":"🌱 Slow Down!"}}}'::jsonb, 80, 'foundation', '7-8', false, false, 11),
('dwp_l12',12, 3, 'Fix the Sentences', 'sentence_fix', 'Pupils add missing capitals and full stops.', 'Fix it!', 'Add the missing capital letters and full stops.', '{"passing_threshold":80,"scoring":{"mastery":{"range":[9,10],"badge":"🏆 Fix-It Champion!"},"secure":{"range":[8,8],"badge":"⭐ Detail Detective!"},"developing":{"range":[6,7],"badge":"💪 Look Again!"},"emerging":{"range":[0,5],"badge":"🌱 Start with Capitals!"}}}'::jsonb, 80, 'foundation', '7-8', false, false, 12),
('dwp_l13',13, 3, 'Complete Sentence Stems', 'sentence_completion', 'Pupils complete sentence stems with their own ending.', 'Finish the sentence', 'Complete each sentence in your own words.', '{"passing_threshold":80,"scoring":{"mastery":{"range":[9,10],"badge":"🏆 Sentence Builder!"},"secure":{"range":[8,8],"badge":"⭐ Solid!"},"developing":{"range":[6,7],"badge":"💪 Try Again!"},"emerging":{"range":[0,5],"badge":"🌱 Together!"}}}'::jsonb, 80, 'developing', '7-9', false, false, 13),
('dwp_l14',14, 3, 'First Independent Sentences', 'independent_milestone', 'MILESTONE: Pupils write their first complete sentences from scratch.', 'Write your own', 'Write 3 of your own complete sentences with capitals and full stops.', '{"passing_threshold":80,"scoring":{"mastery":{"range":[9,10],"badge":"🏆 Milestone Master!"},"secure":{"range":[8,8],"badge":"⭐ First Author!"},"developing":{"range":[6,7],"badge":"💪 Almost There!"},"emerging":{"range":[0,5],"badge":"🌱 Start Small!"}}}'::jsonb, 80, 'developing', '7-9', false, true, 14),
('dwp_l15',15, 3, 'Add WHERE', 'add_where', 'Pupils add place information to sentences.', 'Where?', 'Add a WHERE phrase to each sentence.', '{"passing_threshold":80,"scoring":{"mastery":{"range":[9,10],"badge":"🏆 Place Pro!"},"secure":{"range":[8,8],"badge":"⭐ Going Places!"},"developing":{"range":[6,7],"badge":"💪 Keep Going!"},"emerging":{"range":[0,5],"badge":"🌱 Try Again!"}}}'::jsonb, 80, 'developing', '7-9', false, false, 15),
('dwp_l16',16, 3, 'Add WHEN', 'add_when', 'Pupils add time information to sentences.', 'When?', 'Add a WHEN phrase to each sentence.', '{"passing_threshold":80,"scoring":{"mastery":{"range":[9,10],"badge":"🏆 Time Traveller!"},"secure":{"range":[8,8],"badge":"⭐ On Time!"},"developing":{"range":[6,7],"badge":"💪 Keep Going!"},"emerging":{"range":[0,5],"badge":"🌱 Try Again!"}}}'::jsonb, 80, 'developing', '7-9', false, false, 16),
('dwp_l17',17, 3, 'Who-What-Where', 'who_what_where', 'Pupils write sentences combining subject, action, and place.', 'Build the picture', 'Write a sentence with WHO + WHAT + WHERE.', '{"passing_threshold":80,"scoring":{"mastery":{"range":[9,10],"badge":"🏆 Tier 3 Master!"},"secure":{"range":[8,8],"badge":"⭐ Tier 3 Champion!"},"developing":{"range":[6,7],"badge":"💪 So Close!"},"emerging":{"range":[0,5],"badge":"🌱 Keep Going!"}}}'::jsonb, 80, 'developing', '7-9', true, false, 17);

-- ─── TIER 4: Sentence Expansion ──────────────────────────────────────
INSERT INTO dwp_levels (level_id, level_number, tier_number, activity_name, activity_type, learning_objective,
  prompt_title, prompt_instructions, rubric, passing_threshold, difficulty_band, age_range, tier_finale, milestone, display_order)
VALUES
('dwp_l18',18, 4, 'Enhance with Adjectives', 'enhance_adjectives', 'Pupils add adjectives to improve sentences.', 'Make it vivid', 'Add at least one strong adjective to each sentence.', '{"passing_threshold":80,"scoring":{"mastery":{"range":[9,10],"badge":"🏆 Word Painter!"},"secure":{"range":[8,8],"badge":"⭐ Vivid!"},"developing":{"range":[6,7],"badge":"💪 More Colour!"},"emerging":{"range":[0,5],"badge":"🌱 Try Again!"}}}'::jsonb, 80, 'developing', '7-9', false, false, 18),
('dwp_l19',19, 4, 'Join with AND', 'join_and', 'Pupils combine sentences using "and".', 'Join the sentences', 'Use AND to combine two ideas.', '{"passing_threshold":80,"scoring":{"mastery":{"range":[9,10],"badge":"🏆 Connector Pro!"},"secure":{"range":[8,8],"badge":"⭐ Strong Join!"},"developing":{"range":[6,7],"badge":"💪 Try Again!"},"emerging":{"range":[0,5],"badge":"🌱 Practice!"}}}'::jsonb, 80, 'developing', '7-9', false, false, 19),
('dwp_l20',20, 4, 'Contrast with BUT', 'use_but', 'Pupils use BUT for contrast.', 'Use BUT', 'Use BUT to show a contrast or difference.', '{"passing_threshold":80,"scoring":{"mastery":{"range":[9,10],"badge":"🏆 Contrast Champ!"},"secure":{"range":[8,8],"badge":"⭐ Solid!"},"developing":{"range":[6,7],"badge":"💪 Try Again!"},"emerging":{"range":[0,5],"badge":"🌱 Practice!"}}}'::jsonb, 80, 'developing', '7-9', false, false, 20),
('dwp_l21',21, 4, 'Because Clauses', 'because_clauses', 'Pupils explain reasons using "because".', 'Say why', 'Add a reason using BECAUSE.', '{"passing_threshold":80,"scoring":{"mastery":{"range":[9,10],"badge":"🏆 Reason Master!"},"secure":{"range":[8,8],"badge":"⭐ Clear Thinker!"},"developing":{"range":[6,7],"badge":"💪 Try Again!"},"emerging":{"range":[0,5],"badge":"🌱 Practice!"}}}'::jsonb, 80, 'developing', '7-9', false, false, 21),
('dwp_l22',22, 4, 'When for Time', 'when_time', 'Pupils use "when" for time clauses.', 'Add WHEN', 'Add a WHEN time clause to each sentence.', '{"passing_threshold":80,"scoring":{"mastery":{"range":[9,10],"badge":"🏆 Time Master!"},"secure":{"range":[8,8],"badge":"⭐ On Time!"},"developing":{"range":[6,7],"badge":"💪 Try Again!"},"emerging":{"range":[0,5],"badge":"🌱 Practice!"}}}'::jsonb, 80, 'developing', '7-9', false, false, 22),
('dwp_l23',23, 4, 'Multiple Details', 'multiple_details', 'Pupils combine WHERE + WHEN + WHY in one sentence.', 'All the details', 'Pack WHERE, WHEN and WHY into your sentence.', '{"passing_threshold":80,"scoring":{"mastery":{"range":[9,10],"badge":"🏆 Detail Detective!"},"secure":{"range":[8,8],"badge":"⭐ Rich Writing!"},"developing":{"range":[6,7],"badge":"💪 Try Again!"},"emerging":{"range":[0,5],"badge":"🌱 Practice!"}}}'::jsonb, 80, 'developing', '8-10', false, false, 23),
('dwp_l24',24, 4, 'Formula Sentence', 'formula_sentence', 'Pupils follow Adj+N+V+Where+When formula.', 'Follow the formula', 'Use the formula: Adjective + Noun + Verb + Where + When.', '{"passing_threshold":80,"scoring":{"mastery":{"range":[9,10],"badge":"🏆 Tier 4 Master!"},"secure":{"range":[8,8],"badge":"⭐ Tier 4 Champion!"},"developing":{"range":[6,7],"badge":"💪 Almost!"},"emerging":{"range":[0,5],"badge":"🌱 Keep Going!"}}}'::jsonb, 80, 'developing', '8-10', true, false, 24);

-- ─── TIER 5: Basic Sequencing ────────────────────────────────────────
INSERT INTO dwp_levels (level_id, level_number, tier_number, activity_name, activity_type, learning_objective,
  prompt_title, prompt_instructions, rubric, passing_threshold, difficulty_band, age_range, tier_finale, milestone, display_order)
VALUES
('dwp_l25',25, 5, 'Temporal Connectives', 'temporal_connectives', 'Pupils use First, Next, Then, Last.', 'Order in time', 'Use FIRST, NEXT, THEN, LAST to order your ideas.', '{"passing_threshold":80,"scoring":{"mastery":{"range":[9,10],"badge":"🏆 Sequence Star!"},"secure":{"range":[8,8],"badge":"⭐ In Order!"},"developing":{"range":[6,7],"badge":"💪 Re-Sequence!"},"emerging":{"range":[0,5],"badge":"🌱 Practice!"}}}'::jsonb, 80, 'developing', '8-10', false, false, 25),
('dwp_l26',26, 5, 'Three Connected Sentences', 'three_connected', 'Pupils write 3 connected sentences.', 'Make it flow', 'Write three sentences that flow together.', '{"passing_threshold":80,"scoring":{"mastery":{"range":[9,10],"badge":"🏆 Flow Pro!"},"secure":{"range":[8,8],"badge":"⭐ Connected!"},"developing":{"range":[6,7],"badge":"💪 Try Again!"},"emerging":{"range":[0,5],"badge":"🌱 Practice!"}}}'::jsonb, 80, 'developing', '8-10', false, false, 26),
('dwp_l27',27, 5, 'Before and After', 'before_after', 'Pupils show cause and effect via sequencing.', 'Before & After', 'Show what came BEFORE and what came AFTER.', '{"passing_threshold":80,"scoring":{"mastery":{"range":[9,10],"badge":"🏆 Time Twister!"},"secure":{"range":[8,8],"badge":"⭐ Cause & Effect!"},"developing":{"range":[6,7],"badge":"💪 Try Again!"},"emerging":{"range":[0,5],"badge":"🌱 Practice!"}}}'::jsonb, 80, 'developing', '8-10', false, false, 27),
('dwp_l28',28, 5, 'Five-Sentence Recount', 'five_sentence_recount', 'Pupils write a 5-sentence chronological recount.', 'Recount in 5', 'Write a 5-sentence recount in time order.', '{"passing_threshold":80,"scoring":{"mastery":{"range":[9,10],"badge":"🏆 Tier 5 Master!"},"secure":{"range":[8,8],"badge":"⭐ Tier 5 Champion!"},"developing":{"range":[6,7],"badge":"💪 Almost!"},"emerging":{"range":[0,5],"badge":"🌱 Keep Going!"}}}'::jsonb, 80, 'developing', '8-10', true, false, 28);

-- ─── TIER 6: BME Structure ───────────────────────────────────────────
INSERT INTO dwp_levels (level_id, level_number, tier_number, activity_name, activity_type, learning_objective,
  prompt_title, prompt_instructions, rubric, passing_threshold, difficulty_band, age_range, tier_finale, milestone, display_order)
VALUES
('dwp_l29',29, 6, 'Story Beginnings', 'story_beginning', 'Pupils craft engaging story openings.', 'Hook the reader', 'Write a strong story BEGINNING.', '{"passing_threshold":80,"scoring":{"mastery":{"range":[9,10],"badge":"🏆 Opening Act!"},"secure":{"range":[8,8],"badge":"⭐ Strong Start!"},"developing":{"range":[6,7],"badge":"💪 Try Again!"},"emerging":{"range":[0,5],"badge":"🌱 Practice!"}}}'::jsonb, 80, 'advanced', '9-11', false, false, 29),
('dwp_l30',30, 6, 'Story Middles', 'story_middle', 'Pupils develop story middles.', 'Build the middle', 'Develop the MIDDLE of a story.', '{"passing_threshold":80,"scoring":{"mastery":{"range":[9,10],"badge":"🏆 Middle Master!"},"secure":{"range":[8,8],"badge":"⭐ Solid Middle!"},"developing":{"range":[6,7],"badge":"💪 Add More!"},"emerging":{"range":[0,5],"badge":"🌱 Practice!"}}}'::jsonb, 80, 'advanced', '9-11', false, false, 30),
('dwp_l31',31, 6, 'Story Endings', 'story_ending', 'Pupils craft satisfying endings.', 'Close the story', 'Write a strong ENDING.', '{"passing_threshold":80,"scoring":{"mastery":{"range":[9,10],"badge":"🏆 Ending Expert!"},"secure":{"range":[8,8],"badge":"⭐ Strong Close!"},"developing":{"range":[6,7],"badge":"💪 Try Again!"},"emerging":{"range":[0,5],"badge":"🌱 Practice!"}}}'::jsonb, 80, 'advanced', '9-11', false, false, 31),
('dwp_l32',32, 6, 'BME Plan', 'bme_plan', 'Pupils plan a complete Beginning-Middle-End structure.', 'Plan it out', 'Plan Beginning, Middle, and End on the Connect Grid.', '{"passing_threshold":80,"scoring":{"mastery":{"range":[9,10],"badge":"🏆 Plan Pro!"},"secure":{"range":[8,8],"badge":"⭐ Structured!"},"developing":{"range":[6,7],"badge":"💪 Tighten Up!"},"emerging":{"range":[0,5],"badge":"🌱 Practice!"}}}'::jsonb, 80, 'advanced', '9-11', false, false, 32),
('dwp_l33',33, 6, 'First Complete Story', 'first_complete_story', 'MILESTONE: Pupils write a 5+ sentence complete story.', 'Your first story', 'Write your first complete story with BEGINNING, MIDDLE, END (5+ sentences).', '{"passing_threshold":80,"scoring":{"mastery":{"range":[9,10],"badge":"🏆 Tier 6 Master!"},"secure":{"range":[8,8],"badge":"⭐ Author!"},"developing":{"range":[6,7],"badge":"💪 So Close!"},"emerging":{"range":[0,5],"badge":"🌱 Keep Going!"}}}'::jsonb, 80, 'advanced', '9-11', true, true, 33);

-- ─── TIER 7: Enhanced Sentences ──────────────────────────────────────
INSERT INTO dwp_levels (level_id, level_number, tier_number, activity_name, activity_type, learning_objective,
  prompt_title, prompt_instructions, rubric, passing_threshold, difficulty_band, age_range, tier_finale, milestone, display_order)
VALUES
('dwp_l34',34, 7, 'Start with WHEN', 'when_starter', 'Pupils start sentences with "when" clauses.', 'When... I...', 'Start a sentence with WHEN.', '{"passing_threshold":80,"scoring":{"mastery":{"range":[9,10],"badge":"🏆 Subordinate Star!"},"secure":{"range":[8,8],"badge":"⭐ Strong Start!"},"developing":{"range":[6,7],"badge":"💪 Try Again!"},"emerging":{"range":[0,5],"badge":"🌱 Practice!"}}}'::jsonb, 80, 'advanced', '9-11', false, false, 34),
('dwp_l35',35, 7, 'Start with ALTHOUGH', 'although_starter', 'Pupils start sentences with concessive clauses.', 'Although... I...', 'Start a sentence with ALTHOUGH.', '{"passing_threshold":80,"scoring":{"mastery":{"range":[9,10],"badge":"🏆 Concession Champ!"},"secure":{"range":[8,8],"badge":"⭐ Nuanced!"},"developing":{"range":[6,7],"badge":"💪 Try Again!"},"emerging":{"range":[0,5],"badge":"🌱 Practice!"}}}'::jsonb, 80, 'advanced', '9-11', false, false, 35),
('dwp_l36',36, 7, 'Sentence Variety', 'sentence_variety', 'Pupils mix simple, compound, and complex sentences.', 'Mix it up', 'Use a SIMPLE, a COMPOUND, and a COMPLEX sentence.', '{"passing_threshold":80,"scoring":{"mastery":{"range":[9,10],"badge":"🏆 Variety Virtuoso!"},"secure":{"range":[8,8],"badge":"⭐ Versatile!"},"developing":{"range":[6,7],"badge":"💪 Try Again!"},"emerging":{"range":[0,5],"badge":"🌱 Practice!"}}}'::jsonb, 80, 'advanced', '9-11', false, false, 36),
('dwp_l37',37, 7, 'Sentence Variety Practice', 'sentence_variety', 'Pupils sustain variety across a paragraph.', 'Sustained variety', 'Write 5 sentences with mixed structures.', '{"passing_threshold":80,"scoring":{"mastery":{"range":[9,10],"badge":"🏆 Tier 7 Master!"},"secure":{"range":[8,8],"badge":"⭐ Stylist!"},"developing":{"range":[6,7],"badge":"💪 Tighten!"},"emerging":{"range":[0,5],"badge":"🌱 Keep Going!"}}}'::jsonb, 80, 'advanced', '9-11', true, false, 37);

-- ─── TIER 8: Narrative Mastery ───────────────────────────────────────
INSERT INTO dwp_levels (level_id, level_number, tier_number, activity_name, activity_type, learning_objective,
  prompt_title, prompt_instructions, rubric, passing_threshold, difficulty_band, age_range, tier_finale, programme_finale, milestone, display_order)
VALUES
('dwp_l38',38, 8, 'Detailed Opening', 'detailed_opening', 'Pupils craft rich, detailed story openings.', 'Open with detail', 'Write a 3-sentence opening with vivid detail.', '{"passing_threshold":80,"scoring":{"mastery":{"range":[9,10],"badge":"🏆 Opener Extraordinaire!"},"secure":{"range":[8,8],"badge":"⭐ Compelling!"},"developing":{"range":[6,7],"badge":"💪 More Detail!"},"emerging":{"range":[0,5],"badge":"🌱 Practice!"}}}'::jsonb, 80, 'advanced', '10-11', false, false, false, 38),
('dwp_l39',39, 8, 'Story with Detailed Beginning', 'detailed_opening', 'Pupils write a complete short story (8-10 sentences).', 'Complete story', 'Write an 8-10 sentence story with rich detail.', '{"passing_threshold":80,"scoring":{"mastery":{"range":[9,10],"badge":"🏆 Storyteller!"},"secure":{"range":[8,8],"badge":"⭐ Author!"},"developing":{"range":[6,7],"badge":"💪 Polish!"},"emerging":{"range":[0,5],"badge":"🌱 Keep Going!"}}}'::jsonb, 80, 'advanced', '10-11', false, false, false, 39),
('dwp_l40',40, 8, 'Your Best Short Narrative', 'narrative_showcase', 'PROGRAMME FINALE: pupils write a 10-12 sentence showcase narrative.', 'The big finale', 'Write your best 10-12 sentence story — beginning, middle, end, varied sentences, vivid detail.', '{"passing_threshold":80,"scoring":{"mastery":{"range":[9,10],"badge":"🏆 DWP Programme Master!"},"secure":{"range":[8,8],"badge":"⭐ DWP Champion!"},"developing":{"range":[6,7],"badge":"💪 Polish!"},"emerging":{"range":[0,5],"badge":"🌱 Keep Going!"}}}'::jsonb, 80, 'advanced', '10-11', true, true, true, 40);
