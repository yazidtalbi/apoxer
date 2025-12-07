# Play Guides Update - Steam-Style Guide Pages

This update transforms the "Play Together" section to show a list of guides (Steam-style) with individual guide detail pages.

## Database Changes

### 1. Run the Migration SQL

Execute `database-schema-play-guides-update.sql` in your Supabase SQL editor:

```sql
-- Adds game_version_id and platform columns to play_guides table
ALTER TABLE play_guides 
ADD COLUMN IF NOT EXISTS game_version_id UUID REFERENCES game_versions(id) ON DELETE SET NULL;

ALTER TABLE play_guides 
ADD COLUMN IF NOT EXISTS platform TEXT;
```

This adds:
- `game_version_id`: Links guides to specific game versions (optional)
- `platform`: Stores the selected platform for the guide (optional)

## Features

### 1. Guide List (Play Together Section)
- Shows all guides in a Steam-style list
- Each guide card displays:
  - Guide title
  - Summary (truncated)
  - Platform
  - Route (From → To)
  - Game version (if set)
  - Last updated date
- Clicking a guide navigates to the full guide detail page

### 2. Guide Detail Page
- **Route**: `/games/[slug]/guides/[guideId]`
- **Steam-style layout** with:
  - Game cover image
  - Guide title and metadata
  - Platform, Route, Version, and Last Updated info
  - Full guide summary
  - Numbered step-by-step instructions
  - Back button to game page

### 3. Updated Types
- `PlayGuide` interface now includes:
  - `gameVersionId?: string | null`
  - `platform?: string | null`
  - `gameVersion?: GameVersion | null` (joined data)

## Component Structure

- **`components/game/PlayTogetherSection.tsx`**: Updated to show guide list
- **`app/games/[slug]/guides/[guideId]/page.tsx`**: New guide detail page
- **`lib/games.ts`**: Updated queries to fetch game versions with guides

## Usage

1. **Run the database migration** to add the new columns
2. **Update existing guides** (optional): You can manually set `game_version_id` and `platform` for existing guides in Supabase
3. **Create new guides**: When creating guides, you can now specify:
   - A game version (select from existing or create new)
   - A platform (from the game's available platforms)

## Example Guide Data

When creating a guide, you can now include:
- `game_version_id`: UUID of a game version (e.g., "Season 3")
- `platform`: Platform name (e.g., "PC", "PlayStation 5", "Xbox Series X")

These fields are optional, so existing guides will continue to work.

