-- Update play_guides table to add game_version_id and platform fields
-- Run this SQL in your Supabase SQL editor

-- Add game_version_id column (nullable, references game_versions)
ALTER TABLE play_guides 
ADD COLUMN IF NOT EXISTS game_version_id UUID REFERENCES game_versions(id) ON DELETE SET NULL;

-- Add platform column (nullable, stores the selected platform)
ALTER TABLE play_guides 
ADD COLUMN IF NOT EXISTS platform TEXT;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_play_guides_game_version_id ON play_guides(game_version_id);
CREATE INDEX IF NOT EXISTS idx_play_guides_platform ON play_guides(platform);

