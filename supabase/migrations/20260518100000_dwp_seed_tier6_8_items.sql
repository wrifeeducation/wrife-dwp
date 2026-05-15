-- Tier 6-8 content seed — full content was applied via Supabase MCP at 2026-05-15.
-- This file exists so the migration history reflects the schema reality.

UPDATE dwp_levels SET items = '{"prompt":"Tell me about a time you felt very brave. Hook the reader from the very first sentence.","sections":["beginning"]}'::jsonb WHERE level_id = 'dwp_l29';
UPDATE dwp_levels SET items = '{"prompt":"Continue this story: \"The old door creaked open, and a shaft of dusty light fell across the floor…\" What happens next?","sections":["middle"]}'::jsonb WHERE level_id = 'dwp_l30';
UPDATE dwp_levels SET items = '{"prompt":"A character has just discovered something amazing. Write the ending of their story — how do they feel and what do they do?","sections":["end"]}'::jsonb WHERE level_id = 'dwp_l31';
UPDATE dwp_levels SET items = '{"prompt":"Plan a story about a child who finds a mysterious garden. Use the Beginning / Middle / End boxes.","sections":["beginning","middle","end"]}'::jsonb WHERE level_id = 'dwp_l32';
UPDATE dwp_levels SET items = '{"prompt":"Write your first complete story. Choose any subject. At least one sentence in each section.","sections":["beginning","middle","end"],"min_sentences":5}'::jsonb WHERE level_id = 'dwp_l33';

UPDATE dwp_levels SET items = '[
  {"starter":"When ","example":"When the bell rang, the children rushed outside."},
  {"starter":"When ","example":"When the lights went out, the room felt very still."},
  {"starter":"When ","example":"When my puppy is happy, his tail wags in circles."},
  {"starter":"When ","example":"When summer arrives, the garden bursts with colour."}
]'::jsonb WHERE level_id = 'dwp_l34';

UPDATE dwp_levels SET items = '[
  {"starter":"Although ","example":"Although it was raining, we played outside."},
  {"starter":"Although ","example":"Although the dog was small, he was very brave."},
  {"starter":"Although ","example":"Although I was nervous, I read aloud to the class."},
  {"starter":"Although ","example":"Although the cake looked plain, it tasted delicious."}
]'::jsonb WHERE level_id = 'dwp_l35';

UPDATE dwp_levels SET items = '{"topic":"A morning in your school","required":["simple","compound","complex"]}'::jsonb WHERE level_id = 'dwp_l36';
UPDATE dwp_levels SET items = '{"topic":"Your favourite place","required":["simple","compound","complex"]}'::jsonb WHERE level_id = 'dwp_l37';

UPDATE dwp_levels SET items = '{"prompt":"Write a vivid 3-sentence opening for a mystery story. Use detail words and varied sentence types to pull the reader in.","target_sentences":3}'::jsonb WHERE level_id = 'dwp_l38';
UPDATE dwp_levels SET items = '{"prompt":"Write an 8-10 sentence story about an unexpected friendship. Show clear beginning, middle, and end.","target_sentences":8,"bme_checklist":true}'::jsonb WHERE level_id = 'dwp_l39';
UPDATE dwp_levels SET items = '{"prompt":"Your best 10-12 sentence story. Choose any subject. Show beginning, middle, end, vivid detail, and varied sentence types.","target_sentences":10,"showcase":true,"bme_checklist":true}'::jsonb WHERE level_id = 'dwp_l40';
