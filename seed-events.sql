-- Seed Events for Various Games
-- This script creates sample events for different games in the database

-- First, let's get a user ID to use as created_by
-- Replace 'your-user-email@example.com' with an actual user email from your auth.users table
-- Or use a specific user ID if you know it

-- Insert events for Call of Duty: Warzone
INSERT INTO public.events (
  id,
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
  status,
  created_at,
  updated_at
)
SELECT
  gen_random_uuid(),
  g.id,
  NULL,
  (SELECT id FROM auth.users LIMIT 1), -- Use first available user
  'Ranked grind to Diamond',
  ARRAY['Ranked', 'Competitive', 'Mic required']::text[],
  3,
  0,
  (CURRENT_DATE + INTERVAL '7 days')::date,
  '21:00:00'::time,
  ((CURRENT_DATE + INTERVAL '7 days')::timestamp + INTERVAL '21 hours')::timestamptz,
  'English',
  'PC',
  'active',
  NOW(),
  NOW()
FROM public.games g
WHERE g.title = 'Call of Duty: Warzone'
LIMIT 1;

-- Insert events for Call of Duty: Modern Warfare 3
INSERT INTO public.events (
  id,
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
  status,
  created_at,
  updated_at
)
SELECT
  gen_random_uuid(),
  g.id,
  NULL,
  (SELECT id FROM auth.users LIMIT 1),
  'Looking for chill squad - Unrated',
  ARRAY['Casual', 'Unrated', 'Mic optional']::text[],
  5,
  0,
  (CURRENT_DATE + INTERVAL '5 days')::date,
  '19:30:00'::time,
  ((CURRENT_DATE + INTERVAL '5 days')::timestamp + INTERVAL '19 hours 30 minutes')::timestamptz,
  'English',
  'PC',
  'active',
  NOW(),
  NOW()
FROM public.games g
WHERE g.title = 'Call of Duty: Modern Warfare 3'
LIMIT 1;

-- Insert events for Call of Duty: World at War
INSERT INTO public.events (
  id,
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
  status,
  created_at,
  updated_at
)
SELECT
  gen_random_uuid(),
  g.id,
  NULL,
  (SELECT id FROM auth.users LIMIT 1),
  'LF3M for Raid - Experienced players only',
  ARRAY['Raid', 'Mic required', 'Endgame']::text[],
  6,
  0,
  (CURRENT_DATE + INTERVAL '6 days')::date,
  '20:00:00'::time,
  ((CURRENT_DATE + INTERVAL '6 days')::timestamp + INTERVAL '20 hours')::timestamptz,
  'English',
  'PC',
  'active',
  NOW(),
  NOW()
FROM public.games g
WHERE g.title = 'Call of Duty: World at War'
LIMIT 1;

-- Insert more events for variety (multiple events per game)
-- Call of Duty: Warzone - Event 2
INSERT INTO public.events (
  id,
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
  status,
  created_at,
  updated_at
)
SELECT
  gen_random_uuid(),
  g.id,
  NULL,
  (SELECT id FROM auth.users LIMIT 1),
  'Battle Royale Trios - All skill levels welcome',
  ARRAY['Battle Royale', 'Casual', 'Mic optional']::text[],
  2,
  1,
  (CURRENT_DATE + INTERVAL '3 days')::date,
  '18:00:00'::time,
  ((CURRENT_DATE + INTERVAL '3 days')::timestamp + INTERVAL '18 hours')::timestamptz,
  'English',
  'PC',
  'active',
  NOW(),
  NOW()
FROM public.games g
WHERE g.title = 'Call of Duty: Warzone'
LIMIT 1;

-- Call of Duty: Modern Warfare 3 - Event 2
INSERT INTO public.events (
  id,
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
  status,
  created_at,
  updated_at
)
SELECT
  gen_random_uuid(),
  g.id,
  NULL,
  (SELECT id FROM auth.users LIMIT 1),
  'Search and Destroy - Competitive',
  ARRAY['Competitive', 'Search and Destroy', 'Mic required']::text[],
  5,
  0,
  (CURRENT_DATE + INTERVAL '4 days')::date,
  '22:00:00'::time,
  ((CURRENT_DATE + INTERVAL '4 days')::timestamp + INTERVAL '22 hours')::timestamptz,
  'English',
  'PC',
  'active',
  NOW(),
  NOW()
FROM public.games g
WHERE g.title = 'Call of Duty: Modern Warfare 3'
LIMIT 1;

-- Call of Duty - Event
INSERT INTO public.events (
  id,
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
  status,
  created_at,
  updated_at
)
SELECT
  gen_random_uuid(),
  g.id,
  NULL,
  (SELECT id FROM auth.users LIMIT 1),
  'Classic Multiplayer - Team Deathmatch',
  ARRAY['Multiplayer', 'Team Deathmatch', 'Casual']::text[],
  7,
  0,
  (CURRENT_DATE + INTERVAL '2 days')::date,
  '20:30:00'::time,
  ((CURRENT_DATE + INTERVAL '2 days')::timestamp + INTERVAL '20 hours 30 minutes')::timestamptz,
  'English',
  'PC',
  'active',
  NOW(),
  NOW()
FROM public.games g
WHERE g.title = 'Call of Duty'
LIMIT 1;

-- Call of Duty 2 - Event
INSERT INTO public.events (
  id,
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
  status,
  created_at,
  updated_at
)
SELECT
  gen_random_uuid(),
  g.id,
  NULL,
  (SELECT id FROM auth.users LIMIT 1),
  'World War II Campaign Co-op',
  ARRAY['Co-op', 'Campaign', 'World War II']::text[],
  3,
  0,
  (CURRENT_DATE + INTERVAL '8 days')::date,
  '19:00:00'::time,
  ((CURRENT_DATE + INTERVAL '8 days')::timestamp + INTERVAL '19 hours')::timestamptz,
  'English',
  'PC',
  'active',
  NOW(),
  NOW()
FROM public.games g
WHERE g.title = 'Call of Duty 2'
LIMIT 1;

-- Call of Duty 4: Modern Warfare - Event
INSERT INTO public.events (
  id,
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
  status,
  created_at,
  updated_at
)
SELECT
  gen_random_uuid(),
  g.id,
  NULL,
  (SELECT id FROM auth.users LIMIT 1),
  'Competitive SnD - Pro rules',
  ARRAY['Competitive', 'Search and Destroy', 'Pro rules', 'Mic required']::text[],
  5,
  0,
  (CURRENT_DATE + INTERVAL '9 days')::date,
  '21:30:00'::time,
  ((CURRENT_DATE + INTERVAL '9 days')::timestamp + INTERVAL '21 hours 30 minutes')::timestamptz,
  'English',
  'PC',
  'active',
  NOW(),
  NOW()
FROM public.games g
WHERE g.title = 'Call of Duty 4: Modern Warfare'
LIMIT 1;

-- Commandos: Beyond the Call of Duty - Event
INSERT INTO public.events (
  id,
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
  status,
  created_at,
  updated_at
)
SELECT
  gen_random_uuid(),
  g.id,
  NULL,
  (SELECT id FROM auth.users LIMIT 1),
  'Tactical missions - Strategy focused',
  ARRAY['Strategy', 'Tactical', 'Co-op', 'Mic optional']::text[],
  4,
  0,
  (CURRENT_DATE + INTERVAL '10 days')::date,
  '18:30:00'::time,
  ((CURRENT_DATE + INTERVAL '10 days')::timestamp + INTERVAL '18 hours 30 minutes')::timestamptz,
  'English',
  'PC',
  'active',
  NOW(),
  NOW()
FROM public.games g
WHERE g.title = 'Commandos: Beyond the Call of Duty'
LIMIT 1;

-- Call of Cthulhu: Dark Corners of the Earth - Event
INSERT INTO public.events (
  id,
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
  status,
  created_at,
  updated_at
)
SELECT
  gen_random_uuid(),
  g.id,
  NULL,
  (SELECT id FROM auth.users LIMIT 1),
  'Horror adventure - Story focused',
  ARRAY['Horror', 'Adventure', 'Story', 'Casual']::text[],
  2,
  0,
  (CURRENT_DATE + INTERVAL '11 days')::date,
  '20:00:00'::time,
  ((CURRENT_DATE + INTERVAL '11 days')::timestamp + INTERVAL '20 hours')::timestamptz,
  'English',
  'PC',
  'active',
  NOW(),
  NOW()
FROM public.games g
WHERE g.title = 'Call of Cthulhu: Dark Corners of the Earth'
LIMIT 1;

-- Additional events for more variety (more games)
-- You can add more events by copying the pattern above and changing:
-- 1. The WHERE clause game title
-- 2. The description
-- 3. The tags array
-- 4. The start_date offset (INTERVAL 'X days')
-- 5. The start_time

-- Note: This script assumes:
-- 1. You have at least one user in auth.users table
-- 2. The game titles match exactly (case-sensitive)
-- 3. You want to create future events (dates are calculated from CURRENT_DATE)

-- To run this script:
-- 1. Open your Supabase SQL Editor
-- 2. Paste this entire script
-- 3. Execute it

-- If you want to delete all events first (for testing), run:
-- DELETE FROM public.events;

-- If you want to see the created events:
-- SELECT e.*, g.title as game_title 
-- FROM public.events e
-- JOIN public.games g ON e.game_id = g.id
-- ORDER BY e.start_datetime ASC;

