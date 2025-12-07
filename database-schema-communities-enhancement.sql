-- ============================================
-- PART 1: Communities Table Enhancement
-- ============================================
-- Add new fields to communities table for tags, member count, region, and voice requirements
-- Run this SQL in your Supabase SQL editor

-- Add description field (optional, for community descriptions)
ALTER TABLE communities
ADD COLUMN IF NOT EXISTS description TEXT;

-- Add tags array field (e.g., ["Beginner friendly", "Mic required", "EU evenings"])
ALTER TABLE communities
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Add member_count field (approximate size of the community)
ALTER TABLE communities
ADD COLUMN IF NOT EXISTS member_count INTEGER DEFAULT 0;

-- Add region field (e.g., "EU", "NA", "MENA", "APAC")
ALTER TABLE communities
ADD COLUMN IF NOT EXISTS region TEXT;

-- Add voice_required field (whether mic is expected)
ALTER TABLE communities
ADD COLUMN IF NOT EXISTS voice_required BOOLEAN DEFAULT false;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_communities_member_count ON communities(member_count DESC);
CREATE INDEX IF NOT EXISTS idx_communities_tags ON communities USING GIN(tags);

-- ============================================
-- Sample seed data for testing
-- ============================================
-- Example: Update a few communities with new fields
-- Replace 'your-game-id-here' with an actual game ID from your database

/*
UPDATE communities
SET 
  description = 'A friendly community for beginners to learn and play together. All skill levels welcome!',
  tags = ARRAY['Beginner friendly', 'Casual', 'Crossplay OK'],
  member_count = 1250,
  region = 'EU',
  voice_required = false
WHERE game_id = 'your-game-id-here' AND name LIKE '%Casual%'
LIMIT 1;

UPDATE communities
SET 
  description = 'Competitive players looking for ranked matches and tournaments.',
  tags = ARRAY['Competitive', 'Mic required', 'Ranked'],
  member_count = 850,
  region = 'NA',
  voice_required = true
WHERE game_id = 'your-game-id-here' AND name LIKE '%Competitive%'
LIMIT 1;

UPDATE communities
SET 
  description = 'General community for all players. Join us for events and discussions!',
  tags = ARRAY['General', 'Events', 'All platforms'],
  member_count = 2100,
  region = 'Global',
  voice_required = false
WHERE game_id = 'your-game-id-here' AND name LIKE '%Official%'
LIMIT 1;
*/

