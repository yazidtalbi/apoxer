-- Seed data for events system
-- This assumes you already have games and users in your database
-- Run this SQL in your Supabase SQL editor

-- ============================================
-- 1. Create Game Versions
-- ============================================

-- Valorant versions
INSERT INTO game_versions (game_id, version_name, created_by)
SELECT 
  g.id,
  'Episode 8',
  (SELECT id FROM auth.users LIMIT 1)
FROM games g
WHERE g.slug = 'valorant'
ON CONFLICT (game_id, version_name) DO NOTHING;

INSERT INTO game_versions (game_id, version_name, created_by)
SELECT 
  g.id,
  'Season 3',
  (SELECT id FROM auth.users LIMIT 1)
FROM games g
WHERE g.slug = 'valorant'
ON CONFLICT (game_id, version_name) DO NOTHING;

-- Counter-Strike 2 versions
INSERT INTO game_versions (game_id, version_name, created_by)
SELECT 
  g.id,
  'Update 2.0',
  (SELECT id FROM auth.users LIMIT 1)
FROM games g
WHERE g.slug = 'counter-strike-2'
ON CONFLICT (game_id, version_name) DO NOTHING;

-- Apex Legends versions
INSERT INTO game_versions (game_id, version_name, created_by)
SELECT 
  g.id,
  'Season 20',
  (SELECT id FROM auth.users LIMIT 1)
FROM games g
WHERE g.slug = 'apex-legends'
ON CONFLICT (game_id, version_name) DO NOTHING;

-- ============================================
-- 2. Create Sample Events
-- ============================================

-- Valorant Event 1: Ranked match
INSERT INTO events (
  game_id,
  game_version_id,
  created_by,
  description,
  tags,
  players_needed,
  players_have,
  start_date,
  start_time,
  start_datetime,
  language,
  platform,
  status
)
SELECT 
  g.id,
  NULL,
  (SELECT id FROM auth.users LIMIT 1),
  'Looking for ranked players, positive K/D only',
  ARRAY['#Ranked', '#rankonly', '#Plat1andup', '#winstreak', '#EnglishSpeakers', '#TEAMWORK', 'Mic required'],
  1,
  1,
  CURRENT_DATE,
  CURRENT_TIME,
  NOW(),
  'English',
  'PC',
  'active'
FROM games g
WHERE g.slug = 'valorant'
LIMIT 1;

-- Valorant Event 2: Casual play
INSERT INTO events (
  game_id,
  game_version_id,
  created_by,
  description,
  tags,
  players_needed,
  players_have,
  start_date,
  start_time,
  start_datetime,
  language,
  platform,
  status
)
SELECT 
  g.id,
  NULL,
  (SELECT id FROM auth.users LIMIT 1),
  'Casual 5v5, all welcome',
  ARRAY['Mic optional', 'All content OK', 'Swearing OK', 'Competitive', 'All ages'],
  6,
  1,
  CURRENT_DATE,
  CURRENT_TIME,
  NOW(),
  'English',
  'PC',
  'active'
FROM games g
WHERE g.slug = 'valorant'
LIMIT 1;

-- Valorant Event 3: Kid-friendly
INSERT INTO events (
  game_id,
  game_version_id,
  created_by,
  description,
  tags,
  players_needed,
  players_have,
  start_date,
  start_time,
  start_datetime,
  language,
  platform,
  status
)
SELECT 
  g.id,
  NULL,
  (SELECT id FROM auth.users LIMIT 1),
  'Kid-friendly session',
  ARRAY['Kid-friendly content', 'No swearing', 'No trash-talking', 'Mic optional', 'New players welcome'],
  1,
  0,
  CURRENT_DATE,
  CURRENT_TIME,
  NOW(),
  'English',
  'PC',
  'active'
FROM games g
WHERE g.slug = 'valorant'
LIMIT 1;

-- Apex Legends Event 1: Ranked
INSERT INTO events (
  game_id,
  game_version_id,
  created_by,
  description,
  tags,
  players_needed,
  players_have,
  start_date,
  start_time,
  start_datetime,
  language,
  platform,
  status
)
SELECT 
  g.id,
  NULL,
  (SELECT id FROM auth.users LIMIT 1),
  'Ranked grind, Diamond+ only',
  ARRAY['#Ranked', 'Mic required', 'Competitive', '#DiamondPlus'],
  2,
  1,
  CURRENT_DATE + INTERVAL '2 hours',
  (CURRENT_TIME + INTERVAL '2 hours')::time,
  NOW() + INTERVAL '2 hours',
  'English',
  'PC',
  'active'
FROM games g
WHERE g.slug = 'apex-legends'
LIMIT 1;

-- Apex Legends Event 2: Casual
INSERT INTO events (
  game_id,
  game_version_id,
  created_by,
  description,
  tags,
  players_needed,
  players_have,
  start_date,
  start_time,
  start_datetime,
  language,
  platform,
  status
)
SELECT 
  g.id,
  NULL,
  (SELECT id FROM auth.users LIMIT 1),
  'Casual trios, just for fun',
  ARRAY['Casual', 'Mic optional', 'All content OK'],
  2,
  1,
  CURRENT_DATE + INTERVAL '4 hours',
  (CURRENT_TIME + INTERVAL '4 hours')::time,
  NOW() + INTERVAL '4 hours',
  'English',
  NULL,
  'active'
FROM games g
WHERE g.slug = 'apex-legends'
LIMIT 1;

-- Counter-Strike 2 Event: Competitive
INSERT INTO events (
  game_id,
  game_version_id,
  created_by,
  description,
  tags,
  players_needed,
  players_have,
  start_date,
  start_time,
  start_datetime,
  language,
  platform,
  status
)
SELECT 
  g.id,
  NULL,
  (SELECT id FROM auth.users LIMIT 1),
  'Competitive matchmaking, LE+',
  ARRAY['Competitive', 'Mic required', '#LEPlus', '#EnglishSpeakers'],
  4,
  1,
  CURRENT_DATE + INTERVAL '1 hour',
  (CURRENT_TIME + INTERVAL '1 hour')::time,
  NOW() + INTERVAL '1 hour',
  'English',
  'PC',
  'active'
FROM games g
WHERE g.slug = 'counter-strike-2'
LIMIT 1;
