-- Game Versions Table
-- Allows users to create and share game versions (e.g., "Season 3", "Update 2.0", etc.)
CREATE TABLE IF NOT EXISTS game_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  version_name TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(game_id, version_name)
);

-- Events Table (Looking for Group style)
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  game_version_id UUID REFERENCES game_versions(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Event details
  description TEXT,
  tags TEXT[] DEFAULT '{}', -- Array of tags like ["Mic required", "Ranked", "English"]
  
  -- Player counts
  players_needed INTEGER NOT NULL DEFAULT 1,
  players_have INTEGER NOT NULL DEFAULT 0,
  
  -- Scheduling
  start_date DATE NOT NULL,
  start_time TIME NOT NULL,
  start_datetime TIMESTAMPTZ NOT NULL, -- Calculated from start_date + start_time
  
  -- Settings
  language TEXT DEFAULT 'English',
  platform TEXT, -- Platform filter
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'full', 'cancelled', 'completed')),
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Event Participants Table
-- Tracks who joined which event
CREATE TABLE IF NOT EXISTS event_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_events_game_id ON events(game_id);
CREATE INDEX IF NOT EXISTS idx_events_start_datetime ON events(start_datetime);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_created_by ON events(created_by);
CREATE INDEX IF NOT EXISTS idx_game_versions_game_id ON game_versions(game_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_event_id ON event_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_user_id ON event_participants(user_id);

-- RLS Policies (Row Level Security)
ALTER TABLE game_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;

-- Game Versions: Anyone can read, authenticated users can create
CREATE POLICY "Game versions are viewable by everyone"
  ON game_versions FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create game versions"
  ON game_versions FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Events: Anyone can read, authenticated users can create their own
CREATE POLICY "Events are viewable by everyone"
  ON events FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create events"
  ON events FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = created_by);

CREATE POLICY "Users can update their own events"
  ON events FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own events"
  ON events FOR DELETE
  USING (auth.uid() = created_by);

-- Event Participants: Anyone can read, authenticated users can join/leave
CREATE POLICY "Event participants are viewable by everyone"
  ON event_participants FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can join events"
  ON event_participants FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

CREATE POLICY "Users can leave events"
  ON event_participants FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to auto-update updated_at
CREATE TRIGGER update_game_versions_updated_at BEFORE UPDATE ON game_versions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update players_have count when participants change
CREATE OR REPLACE FUNCTION update_event_players_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE events
    SET players_have = (
      SELECT COUNT(*) FROM event_participants WHERE event_id = NEW.event_id
    )
    WHERE id = NEW.event_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE events
    SET players_have = (
      SELECT COUNT(*) FROM event_participants WHERE event_id = OLD.event_id
    )
    WHERE id = OLD.event_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ language 'plpgsql';

-- Trigger to update players_have count
CREATE TRIGGER update_event_players_count_trigger
  AFTER INSERT OR DELETE ON event_participants
  FOR EACH ROW EXECUTE FUNCTION update_event_players_count();

