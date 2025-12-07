-- ============================================
-- High ROI Features Seed Data
-- ============================================
-- This file seeds:
-- 1. Game Play Guides (How to Play Together)
-- 2. Enhanced Communities (with tags, descriptions, member counts)
-- 3. Events (LFG-style events with game versions)
--
-- IMPORTANT: Replace the game slugs/IDs with actual values from your database
-- You can find game IDs by running: SELECT id, slug, title FROM games LIMIT 20;
-- ============================================

-- ============================================
-- PART 1: Game Play Guides
-- ============================================
-- Insert "How to Play Together" guides for popular games
-- Replace 'GAME_SLUG_HERE' with actual game slugs from your database

-- Example: Get game IDs first (run this to find your game IDs)
-- SELECT id, slug, title FROM games WHERE slug IN ('call-of-duty-4-modern-warfare', 'apex-legends', 'fortnite', 'valorant', 'rocket-league', 'among-us', 'fall-guys', 'minecraft', 'counter-strike-2', 'overwatch-2');

-- Once you have game IDs, use them below:

-- Call of Duty 4: Modern Warfare
INSERT INTO game_play_guides (game_id, content)
SELECT id, E'## How to Play Together\n\n' ||
  E'• **Enable Multiplayer**: Launch the game and select "Multiplayer" from the main menu\n' ||
  E'• **Create Private Match**: Go to "Private Match" to set up a custom game with friends\n' ||
  E'• **Invite Friends**: Use the in-game invite system or Steam/console friend list to invite players\n' ||
  E'• **Set Game Mode**: Choose from Team Deathmatch, Search & Destroy, Domination, or Free-for-All\n' ||
  E'• **Voice Chat**: Enable voice chat in settings for team coordination\n' ||
  E'• **Cross-Platform**: Note that CoD4 does not support cross-platform play - all players must be on the same platform'
FROM games WHERE slug = 'call-of-duty-4-modern-warfare'
ON CONFLICT (game_id) DO UPDATE SET content = EXCLUDED.content;

-- Apex Legends
INSERT INTO game_play_guides (game_id, content)
SELECT id, E'## How to Play Together\n\n' ||
  E'• **Add Friends**: Use the Friends menu to add players by username or EA account\n' ||
  E'• **Create Squad**: Invite friends from the lobby to form a 3-player squad\n' ||
  E'• **Select Game Mode**: Choose Battle Royale, Arenas, or Limited Time Modes\n' ||
  E'• **Enable Crossplay**: Go to Settings > Gameplay and enable "Cross-Platform Play"\n' ||
  E'• **Party Chat**: Use in-game voice chat or external apps like Discord for communication\n' ||
  E'• **Platform Requirements**: All players need the latest game update and active internet connection'
FROM games WHERE slug = 'apex-legends'
ON CONFLICT (game_id) DO UPDATE SET content = EXCLUDED.content;

-- Fortnite
INSERT INTO game_play_guides (game_id, content)
SELECT id, E'## How to Play Together\n\n' ||
  E'• **Epic Friends**: Add friends through Epic Games launcher or in-game Friends menu\n' ||
  E'• **Create Party**: Click the "+" button next to your name in the lobby to invite friends\n' ||
  E'• **Select Mode**: Choose Battle Royale, Creative, or Save the World mode\n' ||
  E'• **Cross-Platform**: Fortnite supports full cross-platform play across all devices\n' ||
  E'• **Voice Chat**: Enable voice chat in Audio settings and assign push-to-talk key\n' ||
  E'• **Platform Sync**: Ensure all players have linked their Epic accounts for cross-platform progression'
FROM games WHERE slug = 'fortnite'
ON CONFLICT (game_id) DO UPDATE SET content = EXCLUDED.content;

-- Valorant
INSERT INTO game_play_guides (game_id, content)
SELECT id, E'## How to Play Together\n\n' ||
  E'• **Add Riot Friends**: Add friends using their Riot ID (username#tag) in the Friends menu\n' ||
  E'• **Create Party**: Click "Invite" in the lobby to add friends to your party\n' ||
  E'• **Queue Together**: Select Unrated, Competitive, or Spike Rush and queue as a party\n' ||
  E'• **Party Size Limits**: Competitive allows up to 5 players, Unrated allows any party size\n' ||
  E'• **Voice Chat**: Press V for team voice chat or use party voice in the lobby\n' ||
  E'• **Platform Note**: Valorant is PC-only - all players must be on PC'
FROM games WHERE slug = 'valorant'
ON CONFLICT (game_id) DO UPDATE SET content = EXCLUDED.content;

-- Rocket League
INSERT INTO game_play_guides (game_id, content)
SELECT id, E'## How to Play Together\n\n' ||
  E'• **Add Epic Friends**: Link your Epic Games account and add friends through Epic launcher\n' ||
  E'• **Create Party**: Click "Create Party" in the main menu and invite friends\n' ||
  E'• **Select Playlist**: Choose from Casual, Competitive, Extra Modes, or Custom Games\n' ||
  E'• **Cross-Platform**: Rocket League supports full cross-platform play and progression\n' ||
  E'• **Party Chat**: Use in-game voice chat or external apps for communication\n' ||
  E'• **Platform Requirements**: All players need active internet and the latest game version'
FROM games WHERE slug = 'rocket-league'
ON CONFLICT (game_id) DO UPDATE SET content = EXCLUDED.content;

-- Among Us
INSERT INTO game_play_guides (game_id, content)
SELECT id, E'## How to Play Together\n\n' ||
  E'• **Create or Join Lobby**: Host a private game or join a friend''s lobby using the room code\n' ||
  E'• **Share Room Code**: The host shares the 6-character room code with friends\n' ||
  E'• **Set Player Count**: Choose 4-15 players depending on your group size\n' ||
  E'• **Customize Settings**: Adjust discussion time, voting time, and impostor count\n' ||
  E'• **Cross-Platform**: Among Us supports cross-platform play across all devices\n' ||
  E'• **Voice Chat**: Use external apps like Discord for voice chat during discussions'
FROM games WHERE slug = 'among-us'
ON CONFLICT (game_id) DO UPDATE SET content = EXCLUDED.content;

-- Minecraft
INSERT INTO game_play_guides (game_id, content)
SELECT id, E'## How to Play Together\n\n' ||
  E'• **Create Realm or Server**: Set up a Minecraft Realm or private server for friends\n' ||
  E'• **Add Friends**: Add friends through Xbox Live, PlayStation Network, or Nintendo Switch Online\n' ||
  E'• **Invite to World**: Open your world settings and invite friends to join\n' ||
  E'• **Cross-Platform**: Bedrock Edition supports cross-platform play across all platforms\n' ||
  E'• **Voice Chat**: Use platform-specific voice chat or external apps like Discord\n' ||
  E'• **Platform Sync**: Ensure all players have the same game version installed'
FROM games WHERE slug = 'minecraft'
ON CONFLICT (game_id) DO UPDATE SET content = EXCLUDED.content;

-- Counter-Strike 2
INSERT INTO game_play_guides (game_id, content)
SELECT id, E'## How to Play Together\n\n' ||
  E'• **Add Steam Friends**: Add friends through Steam Friends list or in-game\n' ||
  E'• **Create Lobby**: Click "Play" and create a lobby, then invite friends\n' ||
  E'• **Select Game Mode**: Choose Competitive, Casual, Wingman, or Deathmatch\n' ||
  E'• **Queue Together**: Queue as a party (up to 5 players for Competitive)\n' ||
  E'• **Voice Chat**: Press and hold the voice chat key (default: K) to communicate\n' ||
  E'• **Platform Note**: CS2 is PC-only - all players must be on Steam'
FROM games WHERE slug = 'counter-strike-2'
ON CONFLICT (game_id) DO UPDATE SET content = EXCLUDED.content;

-- Overwatch 2
INSERT INTO game_play_guides (game_id, content)
SELECT id, E'## How to Play Together\n\n' ||
  E'• **Add Battle.net Friends**: Add friends using their BattleTag in the Social menu\n' ||
  E'• **Create Group**: Click "Invite" in the Social menu to form a party\n' ||
  E'• **Select Mode**: Choose Quick Play, Competitive, Arcade, or Custom Games\n' ||
  E'• **Cross-Platform**: Overwatch 2 supports cross-platform play (console players can play with PC in Quick Play)\n' ||
  E'• **Voice Chat**: Join team voice chat automatically or use group voice chat\n' ||
  E'• **Platform Requirements**: All players need Battle.net account and active internet'
FROM games WHERE slug = 'overwatch-2'
ON CONFLICT (game_id) DO UPDATE SET content = EXCLUDED.content;

-- Fall Guys
INSERT INTO game_play_guides (game_id, content)
SELECT id, E'## How to Play Together\n\n' ||
  E'• **Add Epic Friends**: Link Epic Games account and add friends through Epic launcher\n' ||
  E'• **Create Party**: Click "Invite Players" in the lobby to form a party\n' ||
  E'• **Select Show**: Choose from Main Show, Duos, Squads, or Limited Time Events\n' ||
  E'• **Cross-Platform**: Fall Guys supports full cross-platform play and progression\n' ||
  E'• **Party Size**: Main Show allows up to 4 players, Duos requires 2, Squads requires 4\n' ||
  E'• **Platform Requirements**: All players need active internet and latest game version'
FROM games WHERE slug = 'fall-guys'
ON CONFLICT (game_id) DO UPDATE SET content = EXCLUDED.content;

-- ============================================
-- PART 2: Enhanced Communities
-- ============================================
-- Update existing communities with enhanced data
-- This assumes you already have communities in your database
-- If not, create them first, then run these updates

-- Example: Find communities for a specific game
-- SELECT id, name, game_id FROM communities WHERE game_id = (SELECT id FROM games WHERE slug = 'apex-legends') LIMIT 5;

-- Update communities with enhanced fields (replace with actual community IDs)
-- For Apex Legends communities
UPDATE communities
SET 
  description = 'A friendly community for beginners to learn Apex Legends. All skill levels welcome!',
  tags = ARRAY['Beginner friendly', 'Casual', 'Crossplay OK', 'EU'],
  member_count = 1250,
  region = 'EU',
  voice_required = false
WHERE game_id = (SELECT id FROM games WHERE slug = 'apex-legends')
  AND name ILIKE '%casual%' OR name ILIKE '%beginner%'
LIMIT 1;

UPDATE communities
SET 
  description = 'Competitive players looking for ranked matches and tournaments. Mic required for coordination.',
  tags = ARRAY['Competitive', 'Mic required', 'Ranked', 'NA'],
  member_count = 850,
  region = 'NA',
  voice_required = true
WHERE game_id = (SELECT id FROM games WHERE slug = 'apex-legends')
  AND (name ILIKE '%competitive%' OR name ILIKE '%ranked%')
LIMIT 1;

UPDATE communities
SET 
  description = 'General community for all Apex Legends players. Join us for events, discussions, and LFG!',
  tags = ARRAY['General', 'Events', 'All platforms', 'Global'],
  member_count = 2100,
  region = 'Global',
  voice_required = false
WHERE game_id = (SELECT id FROM games WHERE slug = 'apex-legends')
  AND name ILIKE '%official%' OR name ILIKE '%general%'
LIMIT 1;

-- For Fortnite communities
UPDATE communities
SET 
  description = 'Casual Fortnite players looking for fun matches. No skill requirements!',
  tags = ARRAY['Casual', 'Fun', 'Crossplay', 'All ages'],
  member_count = 1800,
  region = 'Global',
  voice_required = false
WHERE game_id = (SELECT id FROM games WHERE slug = 'fortnite')
  AND (name ILIKE '%casual%' OR name ILIKE '%fun%')
LIMIT 1;

UPDATE communities
SET 
  description = 'Competitive Fortnite players for Arena and tournaments. Mic required.',
  tags = ARRAY['Competitive', 'Arena', 'Tournaments', 'Mic required'],
  member_count = 950,
  region = 'NA',
  voice_required = true
WHERE game_id = (SELECT id FROM games WHERE slug = 'fortnite')
  AND (name ILIKE '%competitive%' OR name ILIKE '%arena%')
LIMIT 1;

-- For Valorant communities
UPDATE communities
SET 
  description = 'Valorant players looking for ranked teammates. Mic required for callouts.',
  tags = ARRAY['Ranked', 'Mic required', 'Competitive', 'PC'],
  member_count = 1200,
  region = 'NA',
  voice_required = true
WHERE game_id = (SELECT id FROM games WHERE slug = 'valorant')
  AND name ILIKE '%ranked%'
LIMIT 1;

UPDATE communities
SET 
  description = 'Beginner-friendly Valorant community. Learn the game with other new players!',
  tags = ARRAY['Beginner friendly', 'Learning', 'Casual', 'All regions'],
  member_count = 750,
  region = 'Global',
  voice_required = false
WHERE game_id = (SELECT id FROM games WHERE slug = 'valorant')
  AND (name ILIKE '%beginner%' OR name ILIKE '%new%')
LIMIT 1;

-- For Rocket League communities
UPDATE communities
SET 
  description = 'Rocket League players for ranked 2v2 and 3v3 matches. All ranks welcome!',
  tags = ARRAY['Ranked', '2v2', '3v3', 'Crossplay'],
  member_count = 1400,
  region = 'EU',
  voice_required = false
WHERE game_id = (SELECT id FROM games WHERE slug = 'rocket-league')
  AND name ILIKE '%ranked%'
LIMIT 1;

-- For Among Us communities
UPDATE communities
SET 
  description = 'Among Us players looking for fun games. Voice chat recommended for better experience!',
  tags = ARRAY['Casual', 'Fun', 'Voice chat', 'All platforms'],
  member_count = 2000,
  region = 'Global',
  voice_required = false
WHERE game_id = (SELECT id FROM games WHERE slug = 'among-us')
  AND name ILIKE '%casual%'
LIMIT 1;

-- ============================================
-- PART 3: Game Versions
-- ============================================
-- Create game versions for popular games
-- Note: Replace 'USER_ID_HERE' with an actual user ID from auth.users
-- You can get a user ID by running: SELECT id, email FROM auth.users LIMIT 1;

-- For Apex Legends
INSERT INTO game_versions (game_id, version_name, created_by)
SELECT id, 'Season 20', (SELECT id FROM auth.users LIMIT 1)
FROM games WHERE slug = 'apex-legends'
ON CONFLICT (game_id, version_name) DO NOTHING;

INSERT INTO game_versions (game_id, version_name, created_by)
SELECT id, 'Season 19', (SELECT id FROM auth.users LIMIT 1)
FROM games WHERE slug = 'apex-legends'
ON CONFLICT (game_id, version_name) DO NOTHING;

-- For Fortnite
INSERT INTO game_versions (game_id, version_name, created_by)
SELECT id, 'Chapter 5 Season 1', (SELECT id FROM auth.users LIMIT 1)
FROM games WHERE slug = 'fortnite'
ON CONFLICT (game_id, version_name) DO NOTHING;

INSERT INTO game_versions (game_id, version_name, created_by)
SELECT id, 'Chapter 4 Season 5', (SELECT id FROM auth.users LIMIT 1)
FROM games WHERE slug = 'fortnite'
ON CONFLICT (game_id, version_name) DO NOTHING;

-- For Valorant
INSERT INTO game_versions (game_id, version_name, created_by)
SELECT id, 'Episode 8 Act 1', (SELECT id FROM auth.users LIMIT 1)
FROM games WHERE slug = 'valorant'
ON CONFLICT (game_id, version_name) DO NOTHING;

INSERT INTO game_versions (game_id, version_name, created_by)
SELECT id, 'Episode 7 Act 3', (SELECT id FROM auth.users LIMIT 1)
FROM games WHERE slug = 'valorant'
ON CONFLICT (game_id, version_name) DO NOTHING;

-- For Rocket League
INSERT INTO game_versions (game_id, version_name, created_by)
SELECT id, 'Season 13', (SELECT id FROM auth.users LIMIT 1)
FROM games WHERE slug = 'rocket-league'
ON CONFLICT (game_id, version_name) DO NOTHING;

-- For Overwatch 2
INSERT INTO game_versions (game_id, version_name, created_by)
SELECT id, 'Season 9', (SELECT id FROM auth.users LIMIT 1)
FROM games WHERE slug = 'overwatch-2'
ON CONFLICT (game_id, version_name) DO NOTHING;

INSERT INTO game_versions (game_id, version_name, created_by)
SELECT id, 'Season 8', (SELECT id FROM auth.users LIMIT 1)
FROM games WHERE slug = 'overwatch-2'
ON CONFLICT (game_id, version_name) DO NOTHING;

-- ============================================
-- PART 4: Events (LFG-style)
-- ============================================
-- Create sample events for various games
-- Note: Replace 'USER_ID_HERE' with an actual user ID from auth.users
-- Events are scheduled for the next few days

-- Apex Legends Ranked Event
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
  gv.id,
  (SELECT id FROM auth.users LIMIT 1),
  'Looking for 2 more players for ranked matches. Gold-Platinum rank preferred. Mic required!',
  ARRAY['Ranked', 'Mic required', 'Gold-Platinum'],
  2,
  1,
  CURRENT_DATE + INTERVAL '1 day',
  '20:00:00',
  (CURRENT_DATE + INTERVAL '1 day')::timestamp + '20:00:00'::time,
  'English',
  'PC',
  'active'
FROM games g
LEFT JOIN game_versions gv ON gv.game_id = g.id AND gv.version_name = 'Season 20'
WHERE g.slug = 'apex-legends'
LIMIT 1
ON CONFLICT DO NOTHING;

-- Fortnite Tournament Event
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
  gv.id,
  (SELECT id FROM auth.users LIMIT 1),
  'Casual tournament event. All skill levels welcome! Cross-platform OK.',
  ARRAY['Tournament', 'Casual', 'Crossplay'],
  3,
  1,
  CURRENT_DATE + INTERVAL '2 days',
  '19:00:00',
  (CURRENT_DATE + INTERVAL '2 days')::timestamp + '19:00:00'::time,
  'English',
  NULL,
  'active'
FROM games g
LEFT JOIN game_versions gv ON gv.game_id = g.id AND gv.version_name = 'Chapter 5 Season 1'
WHERE g.slug = 'fortnite'
LIMIT 1
ON CONFLICT DO NOTHING;

-- Valorant Competitive Event
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
  gv.id,
  (SELECT id FROM auth.users LIMIT 1),
  'Competitive ranked match. Looking for 4 more players. Diamond rank or higher. Mic required!',
  ARRAY['Competitive', 'Ranked', 'Diamond+', 'Mic required'],
  4,
  1,
  CURRENT_DATE + INTERVAL '1 day',
  '21:00:00',
  (CURRENT_DATE + INTERVAL '1 day')::timestamp + '21:00:00'::time,
  'English',
  'PC',
  'active'
FROM games g
LEFT JOIN game_versions gv ON gv.game_id = g.id AND gv.version_name = 'Episode 8 Act 1'
WHERE g.slug = 'valorant'
LIMIT 1
ON CONFLICT DO NOTHING;

-- Rocket League 3v3 Event
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
  gv.id,
  (SELECT id FROM auth.users LIMIT 1),
  '3v3 ranked matches. Looking for 2 teammates. Champion rank preferred. Cross-platform welcome!',
  ARRAY['Ranked', '3v3', 'Champion', 'Crossplay'],
  2,
  1,
  CURRENT_DATE + INTERVAL '3 days',
  '18:30:00',
  (CURRENT_DATE + INTERVAL '3 days')::timestamp + '18:30:00'::time,
  'English',
  NULL,
  'active'
FROM games g
LEFT JOIN game_versions gv ON gv.game_id = g.id AND gv.version_name = 'Season 13'
WHERE g.slug = 'rocket-league'
LIMIT 1
ON CONFLICT DO NOTHING;

-- Among Us Casual Event
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
  'Casual Among Us games. Looking for 7 more players. Voice chat recommended!',
  ARRAY['Casual', 'Fun', 'Voice chat', 'All platforms'],
  7,
  1,
  CURRENT_DATE + INTERVAL '1 day',
  '20:00:00',
  (CURRENT_DATE + INTERVAL '1 day')::timestamp + '20:00:00'::time,
  'English',
  NULL,
  'active'
FROM games g
WHERE g.slug = 'among-us'
LIMIT 1
ON CONFLICT DO NOTHING;

-- Overwatch 2 Competitive Event
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
  gv.id,
  (SELECT id FROM auth.users LIMIT 1),
  'Competitive 5v5 matches. Looking for 4 more players. Support and Tank roles needed!',
  ARRAY['Competitive', '5v5', 'Support', 'Tank', 'Mic required'],
  4,
  1,
  CURRENT_DATE + INTERVAL '2 days',
  '19:30:00',
  (CURRENT_DATE + INTERVAL '2 days')::timestamp + '19:30:00'::time,
  'English',
  NULL,
  'active'
FROM games g
LEFT JOIN game_versions gv ON gv.game_id = g.id AND gv.version_name = 'Season 9'
WHERE g.slug = 'overwatch-2'
LIMIT 1
ON CONFLICT DO NOTHING;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify your seed data:

-- Check game play guides
-- SELECT g.title, gpg.content FROM game_play_guides gpg JOIN games g ON gpg.game_id = g.id LIMIT 5;

-- Check enhanced communities
-- SELECT c.name, c.description, c.tags, c.member_count, c.region, c.voice_required, g.title as game_title
-- FROM communities c JOIN games g ON c.game_id = g.id
-- WHERE c.description IS NOT NULL
-- LIMIT 10;

-- Check game versions
-- SELECT g.title, gv.version_name FROM game_versions gv JOIN games g ON gv.game_id = g.id LIMIT 10;

-- Check events
-- SELECT g.title, e.description, e.start_datetime, e.players_needed, e.players_have, e.status
-- FROM events e JOIN games g ON e.game_id = g.id
-- ORDER BY e.start_datetime
-- LIMIT 10;

