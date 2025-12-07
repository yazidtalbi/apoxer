-- Seed Matchmaking Activity Data
-- This script creates player records with various timestamps to show matchmaking activity over time
-- Run this SQL in your Supabase SQL editor

-- First, let's get a user ID to use
-- This assumes you have at least one user in auth.users

-- Generate matchmaking activity for the past 7 days for popular games
-- This creates a realistic activity pattern with peaks and valleys

-- ============================================
-- Helper function to generate random timestamps
-- ============================================

-- For each game, we'll create multiple player entries with different timestamps
-- This simulates players joining matchmaking at different times

-- Call of Duty: Modern Warfare 3 - Activity over past 7 days
DO $$
DECLARE
  game_record RECORD;
  user_record RECORD;
  i INTEGER;
  random_offset INTERVAL;
  platforms TEXT[] := ARRAY['PC', 'PlayStation', 'Xbox', 'Nintendo Switch'];
  statuses TEXT[] := ARRAY['online', 'looking'];
  current_time TIMESTAMP;
BEGIN
  -- Get the first game and user
  SELECT id INTO game_record FROM games WHERE slug = 'call-of-duty-modern-warfare-3' OR title ILIKE '%Modern Warfare 3%' LIMIT 1;
  SELECT id INTO user_record FROM auth.users LIMIT 1;
  
  IF game_record.id IS NOT NULL AND user_record.id IS NOT NULL THEN
    -- Generate 100+ entries spread over the past 7 days
    FOR i IN 1..120 LOOP
      -- Random offset: 0 to 7 days ago
      random_offset := (RANDOM() * INTERVAL '7 days') - INTERVAL '7 days';
      current_time := NOW() + random_offset;
      
      -- Insert player record
      INSERT INTO players (
        id,
        user_id,
        game_id,
        platform,
        status,
        updated_at,
        created_at
      )
      VALUES (
        gen_random_uuid(),
        user_record.id,
        game_record.id,
        platforms[1 + floor(random() * array_length(platforms, 1))::int],
        statuses[1 + floor(random() * array_length(statuses, 1))::int],
        current_time,
        current_time - (RANDOM() * INTERVAL '30 days')
      )
      ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;
END $$;

-- Valorant - Activity over past 7 days with more recent activity
DO $$
DECLARE
  game_record RECORD;
  user_record RECORD;
  i INTEGER;
  random_offset INTERVAL;
  platforms TEXT[] := ARRAY['PC'];
  statuses TEXT[] := ARRAY['online', 'looking'];
  current_time TIMESTAMP;
BEGIN
  SELECT id INTO game_record FROM games WHERE slug = 'valorant' OR title ILIKE '%Valorant%' LIMIT 1;
  SELECT id INTO user_record FROM auth.users LIMIT 1;
  
  IF game_record.id IS NOT NULL AND user_record.id IS NOT NULL THEN
    -- More recent activity (last 3 days weighted)
    FOR i IN 1..150 LOOP
      -- Weight towards recent days
      IF RANDOM() > 0.3 THEN
        random_offset := (RANDOM() * INTERVAL '3 days') - INTERVAL '3 days';
      ELSE
        random_offset := (RANDOM() * INTERVAL '4 days') - INTERVAL '7 days';
      END IF;
      current_time := NOW() + random_offset;
      
      INSERT INTO players (
        id,
        user_id,
        game_id,
        platform,
        status,
        updated_at,
        created_at
      )
      VALUES (
        gen_random_uuid(),
        user_record.id,
        game_record.id,
        platforms[1 + floor(random() * array_length(platforms, 1))::int],
        statuses[1 + floor(random() * array_length(statuses, 1))::int],
        current_time,
        current_time - (RANDOM() * INTERVAL '60 days')
      )
      ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;
END $$;

-- Apex Legends - Activity spread over past 30 days
DO $$
DECLARE
  game_record RECORD;
  user_record RECORD;
  i INTEGER;
  random_offset INTERVAL;
  platforms TEXT[] := ARRAY['PC', 'PlayStation', 'Xbox'];
  statuses TEXT[] := ARRAY['online', 'looking'];
  current_time TIMESTAMP;
BEGIN
  SELECT id INTO game_record FROM games WHERE slug = 'apex-legends' OR title ILIKE '%Apex Legends%' LIMIT 1;
  SELECT id INTO user_record FROM auth.users LIMIT 1;
  
  IF game_record.id IS NOT NULL AND user_record.id IS NOT NULL THEN
    FOR i IN 1..200 LOOP
      random_offset := (RANDOM() * INTERVAL '30 days') - INTERVAL '30 days';
      current_time := NOW() + random_offset;
      
      INSERT INTO players (
        id,
        user_id,
        game_id,
        platform,
        status,
        updated_at,
        created_at
      )
      VALUES (
        gen_random_uuid(),
        user_record.id,
        game_record.id,
        platforms[1 + floor(random() * array_length(platforms, 1))::int],
        statuses[1 + floor(random() * array_length(statuses, 1))::int],
        current_time,
        current_time - (RANDOM() * INTERVAL '90 days')
      )
      ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;
END $$;

-- Counter-Strike 2 - Recent activity (last 48 hours with spikes)
DO $$
DECLARE
  game_record RECORD;
  user_record RECORD;
  i INTEGER;
  random_offset INTERVAL;
  platforms TEXT[] := ARRAY['PC'];
  statuses TEXT[] := ARRAY['online', 'looking'];
  current_time TIMESTAMP;
BEGIN
  SELECT id INTO game_record FROM games WHERE slug = 'counter-strike-2' OR title ILIKE '%Counter-Strike 2%' LIMIT 1;
  SELECT id INTO user_record FROM auth.users LIMIT 1;
  
  IF game_record.id IS NOT NULL AND user_record.id IS NOT NULL THEN
    -- Create activity spikes for different hours
    FOR i IN 1..80 LOOP
      -- Most activity in last 48 hours
      random_offset := (RANDOM() * INTERVAL '48 hours') - INTERVAL '48 hours';
      current_time := NOW() + random_offset;
      
      INSERT INTO players (
        id,
        user_id,
        game_id,
        platform,
        status,
        updated_at,
        created_at
      )
      VALUES (
        gen_random_uuid(),
        user_record.id,
        game_record.id,
        platforms[1 + floor(random() * array_length(platforms, 1))::int],
        statuses[1 + floor(random() * array_length(statuses, 1))::int],
        current_time,
        current_time - (RANDOM() * INTERVAL '20 days')
      )
      ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;
END $$;

-- Fortnite - High activity over past week
DO $$
DECLARE
  game_record RECORD;
  user_record RECORD;
  i INTEGER;
  random_offset INTERVAL;
  platforms TEXT[] := ARRAY['PC', 'PlayStation', 'Xbox', 'Nintendo Switch'];
  statuses TEXT[] := ARRAY['online', 'looking'];
  current_time TIMESTAMP;
BEGIN
  SELECT id INTO game_record FROM games WHERE slug = 'fortnite' OR title ILIKE '%Fortnite%' LIMIT 1;
  SELECT id INTO user_record FROM auth.users LIMIT 1;
  
  IF game_record.id IS NOT NULL AND user_record.id IS NOT NULL THEN
    -- High activity game
    FOR i IN 1..180 LOOP
      random_offset := (RANDOM() * INTERVAL '7 days') - INTERVAL '7 days';
      current_time := NOW() + random_offset;
      
      INSERT INTO players (
        id,
        user_id,
        game_id,
        platform,
        status,
        updated_at,
        created_at
      )
      VALUES (
        gen_random_uuid(),
        user_record.id,
        game_record.id,
        platforms[1 + floor(random() * array_length(platforms, 1))::int],
        statuses[1 + floor(random() * array_length(statuses, 1))::int],
        current_time,
        current_time - (RANDOM() * INTERVAL '45 days')
      )
      ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;
END $$;

-- Create some activity for any game (generic seed)
-- This ensures even if specific games aren't found, we still have data
DO $$
DECLARE
  game_record RECORD;
  user_record RECORD;
  i INTEGER;
  random_offset INTERVAL;
  platforms TEXT[] := ARRAY['PC', 'PlayStation', 'Xbox'];
  statuses TEXT[] := ARRAY['online', 'looking'];
  current_time TIMESTAMP;
BEGIN
  -- Get any game
  SELECT id INTO game_record FROM games ORDER BY RANDOM() LIMIT 1;
  SELECT id INTO user_record FROM auth.users LIMIT 1;
  
  IF game_record.id IS NOT NULL AND user_record.id IS NOT NULL THEN
    FOR i IN 1..50 LOOP
      random_offset := (RANDOM() * INTERVAL '7 days') - INTERVAL '7 days';
      current_time := NOW() + random_offset;
      
      INSERT INTO players (
        id,
        user_id,
        game_id,
        platform,
        status,
        updated_at,
        created_at
      )
      VALUES (
        gen_random_uuid(),
        user_record.id,
        game_record.id,
        platforms[1 + floor(random() * array_length(platforms, 1))::int],
        statuses[1 + floor(random() * array_length(statuses, 1))::int],
        current_time,
        current_time - (RANDOM() * INTERVAL '30 days')
      )
      ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;
END $$;

-- Add some very recent activity (last few hours) for immediate visibility
DO $$
DECLARE
  game_record RECORD;
  user_record RECORD;
  i INTEGER;
  random_offset INTERVAL;
  platforms TEXT[] := ARRAY['PC', 'PlayStation', 'Xbox', 'Nintendo Switch'];
  statuses TEXT[] := ARRAY['online', 'looking'];
  current_time TIMESTAMP;
BEGIN
  -- Get a popular game
  SELECT id INTO game_record FROM games 
  WHERE slug IN ('valorant', 'apex-legends', 'counter-strike-2', 'call-of-duty-modern-warfare-3', 'fortnite')
  ORDER BY RANDOM() LIMIT 1;
  SELECT id INTO user_record FROM auth.users LIMIT 1;
  
  IF game_record.id IS NOT NULL AND user_record.id IS NOT NULL THEN
    -- Recent activity (last 6 hours)
    FOR i IN 1..30 LOOP
      random_offset := (RANDOM() * INTERVAL '6 hours') - INTERVAL '6 hours';
      current_time := NOW() + random_offset;
      
      INSERT INTO players (
        id,
        user_id,
        game_id,
        platform,
        status,
        updated_at,
        created_at
      )
      VALUES (
        gen_random_uuid(),
        user_record.id,
        game_record.id,
        platforms[1 + floor(random() * array_length(platforms, 1))::int],
        statuses[1 + floor(random() * array_length(statuses, 1))::int],
        current_time,
        current_time - (RANDOM() * INTERVAL '7 days')
      )
      ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;
END $$;

-- Verify the data was created
SELECT 
  g.title as game,
  COUNT(p.id) as total_players,
  COUNT(CASE WHEN p.status IN ('online', 'looking') THEN 1 END) as active_players,
  MIN(p.updated_at) as earliest_activity,
  MAX(p.updated_at) as latest_activity
FROM games g
LEFT JOIN players p ON p.game_id = g.id
WHERE p.status IN ('online', 'looking')
GROUP BY g.id, g.title
ORDER BY total_players DESC
LIMIT 10;

