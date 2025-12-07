-- ============================================
-- PART 1: Game Play Guides Table
-- ============================================
-- Simple table for mini "How to Play Together" guides per game
-- Run this SQL in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS game_play_guides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  content TEXT NOT NULL, -- Markdown content with 3-6 bullet points
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(game_id) -- One guide per game
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_game_play_guides_game_id ON game_play_guides(game_id);

-- ============================================
-- Sample seed data for testing
-- ============================================
-- Example: Insert a mini guide for a test game
-- Replace 'your-game-id-here' with an actual game ID from your database

/*
INSERT INTO game_play_guides (game_id, content)
VALUES (
  'your-game-id-here',
  E'## How to Play Together\n\n' ||
  E'• **Enable Crossplay**: Go to Settings > Network and enable "Cross-Platform Play"\n' ||
  E'• **Add Friends**: Use the in-game friend system or share your game tag\n' ||
  E'• **Create Party**: Press the Party button in the main menu to invite friends\n' ||
  E'• **Join Matchmaking**: Select "Play Together" mode and queue as a party\n' ||
  E'• **Voice Chat**: Enable voice chat in party settings for better coordination\n' ||
  E'• **Platform Requirements**: Ensure all players have the latest game update installed'
)
ON CONFLICT (game_id) DO NOTHING;
*/

