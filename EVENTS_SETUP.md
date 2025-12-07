# Events System Setup Guide

This guide explains how to set up and use the Xbox-style "Looking for Group" events system.

## Database Setup

### 1. Run the SQL Schema

Execute the SQL in `database-schema-events.sql` in your Supabase SQL editor:

```sql
-- This creates three tables:
-- 1. game_versions - Stores game versions (e.g., "Season 3", "Update 2.0")
-- 2. events - Stores event posts
-- 3. event_participants - Tracks who joined which event
```

The schema includes:
- Row Level Security (RLS) policies
- Automatic timestamp updates
- Automatic player count updates when participants join/leave
- Indexes for performance

### 2. Optional: Seed Sample Data

You can use `database-seed-events.sql` as a reference for creating sample events. Uncomment and adjust the queries to match your actual game IDs and user IDs.

## Features

### Game Versions
- Users can select from existing game versions
- Users can create new versions that become available to all users
- Versions are shared across all users for a game

### Event Creation
- **Game Version**: Optional selection or creation
- **Tags**: Multi-select from common tags (Mic required, Ranked, etc.)
- **Description**: Free-form text
- **Players Needed**: Number of additional players needed
- **Date & Time**: When the event starts
- **Platform**: Filter by platform (optional)
- **Language**: Language preference

### Event Display
- Shows events in Xbox-style cards
- Displays tags, description, version, player counts
- Shows "Need X, Have Y, Starts [time]"
- Timestamp showing when posted
- Join button (disabled when full)

## Component Structure

- `components/game/EventsSection.tsx` - Main events component with modal
- `lib/events.ts` - Helper functions for fetching/creating events
- `types/index.ts` - TypeScript types for Event and GameVersion

## Usage

The EventsSection is already integrated into the game detail page. Users can:

1. Click "Create Event" to open the modal
2. Fill in event details
3. Select or create a game version
4. Choose tags
5. Set date/time and other preferences
6. Create the event

Other users can then:
- View all events for a game
- Join events (if not full)
- See real-time player counts

## API Functions

### `getEventsByGame(gameId: string)`
Fetches all active events for a game, ordered by start time.

### `getGameVersions(gameId: string)`
Fetches all versions for a game.

### `createGameVersion(gameId, versionName, userId)`
Creates a new game version.

### `createEvent(eventData)`
Creates a new event.

### `joinEvent(eventId, userId)`
Adds a user as a participant.

### `leaveEvent(eventId, userId)`
Removes a user as a participant.

## Database Tables

### `game_versions`
- `id` (UUID)
- `game_id` (UUID, FK to games)
- `version_name` (TEXT)
- `created_by` (UUID, FK to auth.users)
- `created_at`, `updated_at` (TIMESTAMPTZ)

### `events`
- `id` (UUID)
- `game_id` (UUID, FK to games)
- `game_version_id` (UUID, FK to game_versions, nullable)
- `created_by` (UUID, FK to auth.users)
- `description` (TEXT, nullable)
- `tags` (TEXT[])
- `players_needed` (INTEGER)
- `players_have` (INTEGER, auto-updated)
- `start_date` (DATE)
- `start_time` (TIME)
- `start_datetime` (TIMESTAMPTZ, calculated)
- `language` (TEXT)
- `platform` (TEXT, nullable)
- `status` (TEXT: 'active', 'full', 'cancelled', 'completed')
- `created_at`, `updated_at` (TIMESTAMPTZ)

### `event_participants`
- `id` (UUID)
- `event_id` (UUID, FK to events)
- `user_id` (UUID, FK to auth.users)
- `joined_at` (TIMESTAMPTZ)

## Security

All tables have Row Level Security (RLS) enabled:
- **Read**: Anyone can view events, versions, and participants
- **Create**: Only authenticated users can create events/versions
- **Update/Delete**: Users can only modify their own events

## Next Steps

1. Run the SQL schema in Supabase
2. Test creating events
3. Customize tags in `EventsSection.tsx` if needed
4. Add filtering/search functionality if desired
5. Add notifications when events are created/joined

