/**
 * SteamGridDB Cover Fetcher Script
 * 
 * This script fetches game cover images from SteamGridDB API and updates
 * the Supabase games table with cover URLs.
 * 
 * SETUP:
 * 1. Create a .env.local file in the project root with:
 *    STEAMGRIDDB_API_KEY=your_api_key_here
 *    SUPABASE_URL=your_supabase_url (optional, falls back to NEXT_PUBLIC_SUPABASE_URL)
 *    SUPABASE_ANON_KEY=your_anon_key (optional, falls back to NEXT_PUBLIC_SUPABASE_ANON_KEY)
 * 
 *    Or use NEXT_PUBLIC_ prefixed variables:
 *    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
 *    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
 * 
 *    Get your SteamGridDB API key from: https://www.steamgriddb.com/profile/preferences/api
 * 
 * 2. Install dependencies (if not already installed):
 *    npm install @supabase/supabase-js dotenv
 * 
 *    For running TypeScript directly, install one of:
 *    npm install -D tsx        (recommended, faster)
 *    OR
 *    npm install -D ts-node   (alternative)
 * 
 * 3. Run the script:
 *    Using tsx (recommended):
 *    npx tsx scripts/fetchCoversFromSteamGridDB.ts
 * 
 *    Using ts-node:
 *    npx ts-node scripts/fetchCoversFromSteamGridDB.ts
 * 
 *    Or compile and run:
 *    npx tsc scripts/fetchCoversFromSteamGridDB.ts --outDir dist --esModuleInterop --module commonjs --target es2020
 *    node dist/scripts/fetchCoversFromSteamGridDB.js
 * 
 * NOTE: This script is safe to run multiple times - it only processes games
 * that don't have a cover_url set.
 */

// Load environment variables from .env.local
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

// Explicitly load .env.local file
dotenv.config({ path: ".env.local" });

// Configuration
const STEAMGRIDDB_API_BASE = "https://www.steamgriddb.com/api/v2";
const BATCH_SIZE = 25;
const RATE_LIMIT_DELAY_MS = 350; // Delay between API requests

// Environment variables with fallbacks (NEXT_PUBLIC_* variables as fallback)
const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const STEAMGRIDDB_API_KEY = process.env.STEAMGRIDDB_API_KEY;

// Validate required environment variables with clear error messages
if (!STEAMGRIDDB_API_KEY) {
  console.error("\n❌ Missing STEAMGRIDDB_API_KEY. Set it in .env.local.");
  console.error("   Get your API key from https://www.steamgriddb.com/profile/preferences/api\n");
  process.exit(1);
}

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("\n❌ Missing Supabase credentials. Add SUPABASE_URL and SUPABASE_ANON_KEY");
  console.error("   or NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local\n");
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper function to sleep
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// SteamGridDB API types
interface SteamGridDbGame {
  id: number;
  name: string;
  types: string[];
}

interface SteamGridDbGrid {
  id: number;
  score: number;
  style: string;
  width: number;
  height: number;
  nsfw: boolean;
  humor: boolean;
  notes: string | null;
  mime: string;
  language: string;
  url: string;
  thumb: string;
  lock: boolean;
  epilepsy: boolean;
}

interface SteamGridDbSearchResponse {
  success: boolean;
  data: SteamGridDbGame[];
}

interface SteamGridDbGridsResponse {
  success: boolean;
  data: SteamGridDbGrid[];
}

/**
 * Search for a game on SteamGridDB by title
 */
async function searchGame(title: string): Promise<SteamGridDbGame | null> {
  try {
    const response = await fetch(
      `${STEAMGRIDDB_API_BASE}/search/autocomplete/${encodeURIComponent(title)}`,
      {
        headers: {
          Authorization: `Bearer ${STEAMGRIDDB_API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      console.error(`SteamGridDB search failed for "${title}": ${response.status} ${response.statusText}`);
      return null;
    }

    const data: SteamGridDbSearchResponse = await response.json();

    if (!data.success || !data.data || data.data.length === 0) {
      return null;
    }

    // Return the first (most relevant) result
    return data.data[0];
  } catch (error) {
    console.error(`Error searching for game "${title}":`, error);
    return null;
  }
}

/**
 * Get grids (cover images) for a game from SteamGridDB
 */
async function getGameGrids(gameId: number): Promise<SteamGridDbGrid | null> {
  try {
    const response = await fetch(
      `${STEAMGRIDDB_API_BASE}/grids/game/${gameId}`,
      {
        headers: {
          Authorization: `Bearer ${STEAMGRIDDB_API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      console.error(`SteamGridDB grids fetch failed for game ID ${gameId}: ${response.status} ${response.statusText}`);
      return null;
    }

    const data: SteamGridDbGridsResponse = await response.json();

    if (!data.success || !data.data || data.data.length === 0) {
      return null;
    }

    // Filter out NSFW and humor grids, then sort by score (highest first)
    const suitableGrids = data.data
      .filter((grid) => !grid.nsfw && !grid.humor)
      .sort((a, b) => b.score - a.score);

    if (suitableGrids.length === 0) {
      // If no suitable grids, use the first one regardless
      return data.data[0];
    }

    // Return the highest-scoring suitable grid
    return suitableGrids[0];
  } catch (error) {
    console.error(`Error fetching grids for game ID ${gameId}:`, error);
    return null;
  }
}

/**
 * Fetch cover image for a single game
 */
async function fetchCoverForGame(game: { id: string; slug: string; title: string }): Promise<string | null> {
  // Search for the game
  const gameResult = await searchGame(game.title);
  if (!gameResult) {
    return null;
  }

  // Rate limit
  await sleep(RATE_LIMIT_DELAY_MS);

  // Get grids for the game
  const grid = await getGameGrids(gameResult.id);
  if (!grid) {
    return null;
  }

  return grid.url;
}

/**
 * Fetch games without cover URLs from Supabase
 */
async function fetchGamesWithoutCovers(): Promise<Array<{ id: string; slug: string; title: string }>> {
  const { data, error } = await supabase
    .from("games")
    .select("id, slug, title, cover_url")
    .order("title", { ascending: true })
    .range(4000, 4999); // 👈 FETCH UP TO 5000 ROWS

  if (error) {
    throw new Error(`Failed to fetch games: ${error.message}`);
  }

  return (data || [])
    .filter((game) => !game.cover_url || game.cover_url.trim() === "")
    .map(({ cover_url, ...rest }) => rest);
}


/**
 * Update game cover URL in Supabase
 */
async function updateGameCover(gameId: string, coverUrl: string): Promise<boolean> {
  const { error } = await supabase
    .from("games")
    .update({ cover_url: coverUrl })
    .eq("id", gameId);

  if (error) {
    console.error(`Failed to update game ${gameId}: ${error.message}`);
    return false;
  }

  return true;
}

/**
 * Main function
 */
async function main() {
  console.log("Starting SteamGridDB cover fetcher...\n");

  // Fetch games without covers
  console.log("Fetching games without cover URLs...");
  const games = await fetchGamesWithoutCovers();
  console.log(`Found ${games.length} games without cover URLs\n`);

  if (games.length === 0) {
    console.log("No games to process. Exiting.");
    return;
  }

  let successCount = 0;
  let failureCount = 0;
  let skippedCount = 0;

  // Process games in batches
  for (let i = 0; i < games.length; i += BATCH_SIZE) {
    const batch = games.slice(i, i + BATCH_SIZE);
    console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1} (${batch.length} games)...`);

    for (const game of batch) {
      try {
        console.log(`  Searching for: ${game.title} (${game.slug})`);

        const coverUrl = await fetchCoverForGame(game);

        if (coverUrl) {
          const updated = await updateGameCover(game.id, coverUrl);
          if (updated) {
            console.log(`    ✓ Updated: ${coverUrl}`);
            successCount++;
          } else {
            console.log(`    ✗ Failed to update database`);
            failureCount++;
          }
        } else {
          console.log(`    - No cover found`);
          skippedCount++;
        }

        // Rate limit between games
        await sleep(RATE_LIMIT_DELAY_MS);
      } catch (error) {
        console.error(`    ✗ Error processing ${game.title}:`, error);
        failureCount++;
      }
    }

    console.log(`  Batch complete. Progress: ${Math.min(i + BATCH_SIZE, games.length)}/${games.length}\n`);
  }

  // Summary
  console.log("\n=== Summary ===");
  console.log(`Total games processed: ${games.length}`);
  console.log(`Successfully updated: ${successCount}`);
  console.log(`No cover found: ${skippedCount}`);
  console.log(`Failed: ${failureCount}`);
  console.log("\nDone!");
}

// Run the script
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

