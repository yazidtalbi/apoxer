/**
 * SteamGridDB Hero Fetcher Script
 * 
 * This script fetches Heroes artwork from SteamGridDB API and updates
 * the Supabase games table with hero_url values.
 * 
 * SETUP:
 * 1. Ensure .env.local has:
 *    - NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL)
 *    - NEXT_PUBLIC_SUPABASE_ANON_KEY (or SUPABASE_ANON_KEY)
 *    - STEAMGRIDDB_API_KEY
 * 
 *    Get your SteamGridDB API key from: https://www.steamgriddb.com/profile/preferences/api
 * 
 * 2. Install tsx (if not already installed):
 *    npm install -D tsx
 * 
 * 3. Run the script:
 *    npx tsx scripts/fetchHeroesFromSteamGridDB.ts
 * 
 * NOTE: This script is safe to run multiple times - it only processes games
 * that don't have a hero_url set.
 */

// Load environment variables from .env.local
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

// Explicitly load .env.local file
dotenv.config({ path: ".env.local" });

// Configuration
const STEAMGRIDDB_API_BASE = "https://www.steamgriddb.com/api/v2";
const RATE_LIMIT_DELAY_MS = 350; // Delay between API requests (matching cover script)

// Environment variables with fallbacks
const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const STEAMGRIDDB_API_KEY = process.env.STEAMGRIDDB_API_KEY;

// Validate required environment variables
if (!STEAMGRIDDB_API_KEY) {
  console.error("\n❌ Missing STEAMGRIDDB_API_KEY. Set it in .env.local.");
  console.error("   Get your API key from https://www.steamgriddb.com/profile/preferences/api\n");
  process.exit(1);
}

if (!SUPABASE_URL) {
  console.error("\n❌ Missing Supabase URL. Add SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL in .env.local\n");
  process.exit(1);
}

if (!SUPABASE_ANON_KEY) {
  console.error("\n❌ Missing Supabase anon key. Add SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local\n");
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Types (matching cover script structure)
type GameRow = {
  id: string;
  title: string;
  slug: string;
  hero_url: string | null;
};

interface SteamGridDbGame {
  id: number;
  name: string;
  types: string[];
}

interface SteamGridDbHero {
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

interface SteamGridDbHeroesResponse {
  success: boolean;
  data: SteamGridDbHero[];
}

// Helper: sleep
async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Search for a game on SteamGridDB by title
 * Uses the same logic as the cover script - returns first result without filtering by type
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
      console.error(`  SteamGridDB search failed for "${title}": ${response.status} ${response.statusText}`);
      return null;
    }

    const data: SteamGridDbSearchResponse = await response.json();

    if (!data.success || !data.data || data.data.length === 0) {
      return null;
    }

    // Return the first (most relevant) result - same as cover script
    return data.data[0];
  } catch (error) {
    console.error(`  Error searching for game "${title}":`, error);
    return null;
  }
}

/**
 * Fetch hero artwork for a game from SteamGridDB
 * Uses the /heroes/game/{gameId} endpoint and selects the widest hero
 */
async function fetchHeroUrlForGame(gameId: number): Promise<string | null> {
  try {
    const response = await fetch(
      `${STEAMGRIDDB_API_BASE}/heroes/game/${gameId}`,
      {
        headers: {
          Authorization: `Bearer ${STEAMGRIDDB_API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      console.error(`  SteamGridDB heroes fetch failed for game ID ${gameId}: ${response.status} ${response.statusText}`);
      return null;
    }

    const data: SteamGridDbHeroesResponse = await response.json();

    if (!data.success || !data.data || data.data.length === 0) {
      return null;
    }

    // Sort heroes by width descending and pick the widest one
    const sortedHeroes = [...data.data].sort((a, b) => b.width - a.width);
    return sortedHeroes[0].url;
  } catch (error) {
    console.error(`  Error fetching heroes for game ID ${gameId}:`, error);
    return null;
  }
}

/**
 * Fetch hero artwork for a single game
 * Uses the same pattern as fetchCoverForGame in the cover script
 */
async function fetchHeroForGame(game: { id: string; slug: string; title: string }): Promise<string | null> {
  // Search for the game (same as cover script)
  const gameResult = await searchGame(game.title);
  if (!gameResult) {
    return null;
  }

  // Rate limit
  await sleep(RATE_LIMIT_DELAY_MS);

  // Get heroes for the game
  const heroUrl = await fetchHeroUrlForGame(gameResult.id);
  if (!heroUrl) {
    return null;
  }

  return heroUrl;
}

/**
 * Get games without hero_url
 */
async function getGamesWithoutHero(): Promise<GameRow[]> {
  const { data, error } = await supabase
    .from("games")
    .select("id, title, slug, hero_url")
    .is("hero_url", null);

  if (error) {
    throw new Error(`Failed to fetch games: ${error.message}`);
  }

  return (data || []) as GameRow[];
}

/**
 * Update game hero_url in Supabase
 */
async function updateGameHeroUrl(gameId: string, heroUrl: string): Promise<void> {
  const { error } = await supabase
    .from("games")
    .update({ hero_url: heroUrl })
    .eq("id", gameId);

  if (error) {
    throw new Error(`Failed to update game hero_url: ${error.message}`);
  }
}

/**
 * Main runner function
 */
async function main() {
  console.log("Starting SteamGridDB Heroes fetcher...\n");

  const games = await getGamesWithoutHero();
  console.log(`Found ${games.length} games without hero_url\n`);

  if (games.length === 0) {
    console.log("No games to process. Exiting.");
    return;
  }

  let processed = 0;
  let updated = 0;
  let notFound = 0;
  let failed = 0;

  for (const game of games) {
    console.log(`Game: ${game.title} (${game.slug})`);

    try {
      const heroUrl = await fetchHeroForGame(game);

      if (!heroUrl) {
        console.log("  ✖ No Heroes artwork found");
        notFound++;
      } else {
        await updateGameHeroUrl(game.id, heroUrl);
        console.log(`  ✓ Updated hero_url with Heroes artwork: ${heroUrl}`);
        updated++;
      }
    } catch (err) {
      console.error("  ✖ Error processing game:", err);
      failed++;
    }

    processed++;
    console.log(`  Batch progress: ${processed}/${games.length}\n`);

    // Rate limit between games
    await sleep(RATE_LIMIT_DELAY_MS);
  }

  console.log("=== Heroes Fetch Summary ===");
  console.log(`Total games processed:   ${processed}`);
  console.log(`Successfully updated:    ${updated}`);
  console.log(`No Heroes artwork found: ${notFound}`);
  console.log(`Failed:                 ${failed}`);
  console.log("\nDone!");
}

// Run the script
main().catch((err) => {
  console.error("Fatal error in hero fetcher:", err);
  process.exit(1);
});
