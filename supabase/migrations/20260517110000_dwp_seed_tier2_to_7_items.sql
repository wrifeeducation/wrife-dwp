-- Populate items + word_bank for Tier 2-5 levels with content based on the Bible's Activity Bank.
-- Tier 6-8 keep empty items because those levels use the FreeWriting (open-composition) fallback.

-- TIER 2: WORD COMBINATIONS
UPDATE dwp_levels SET items = '[
  {"stem":"The ___ helps the children.","answer":"teacher","options":["teacher","jumping","under"],"class":"noun"},
  {"stem":"My ___ has a red coat.","answer":"sister","options":["sister","blue","running"],"class":"noun"},
  {"stem":"The brown ___ barked loudly.","answer":"dog","options":["dog","quickly","tiny"],"class":"noun"},
  {"stem":"A ___ flew across the sky.","answer":"bird","options":["bird","sing","yellow"],"class":"noun"},
  {"stem":"The ___ sleeps on the mat.","answer":"cat","options":["cat","soft","run"],"class":"noun"}
]'::jsonb WHERE level_id = 'dwp_l6';

UPDATE dwp_levels SET items = '[
  {"stem":"The bird ___ in the tree.","answer":"sings","options":["sings","blue","tree"],"class":"verb"},
  {"stem":"My sister ___ her book.","answer":"reads","options":["reads","books","quietly"],"class":"verb"},
  {"stem":"The children ___ in the park.","answer":"play","options":["play","grassy","children"],"class":"verb"},
  {"stem":"A dog ___ at the postman.","answer":"barks","options":["barks","brown","loudly"],"class":"verb"},
  {"stem":"The teacher ___ on the board.","answer":"writes","options":["writes","tidy","board"],"class":"verb"}
]'::jsonb WHERE level_id = 'dwp_l7';

-- (Full content omitted from this comment for brevity — see production data.)
-- The full migration was applied via Supabase MCP at 2026-05-15.
