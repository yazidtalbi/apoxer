-- Add screenshots column to games table
-- This column stores an array of screenshot URLs from RAWG.io

ALTER TABLE games
ADD COLUMN IF NOT EXISTS screenshots TEXT[] DEFAULT '{}';

-- Create an index for better query performance (optional, for array searches)
CREATE INDEX IF NOT EXISTS idx_games_screenshots ON games USING GIN(screenshots);

