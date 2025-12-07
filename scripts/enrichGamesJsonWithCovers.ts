/**
 * Enrich Games JSON with SteamGridDB Covers
 *
 * This script reads a JSON file exported from Supabase and enriches it with
 * cover URLs from SteamGridDB API.
 *
 * It:
 *  - Reads games from data/games_export.json
 *  - For each game without cover_url:
 *      - Searches SteamGridDB for the game
 *      - Gets the best cover grid (non-NSFW, non-humor)
 *      - Updates cover_url and sgdb_id
 *  - Saves progress every 25 games
 *  - Outputs final enriched JSON to data/games_export.with_covers.json
 *
 * SETUP:
 * 1. .env.local:
 *    STEAMGRIDDB_API_KEY=your_api_key_here
 *
 * 2. Install dependencies:
 *    npm install dotenv
 *
 * 3. Run:
 *    npx tsx scripts/enrichGamesJsonWithCovers.ts
 */

import dotenv from "dotenv";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

// Explicitly load .env.local file
dotenv.config({ path: ".env.local" });

// ---------- CONFIG ----------
const STEAMGRIDDB_API_BASE = "https://www.steamgriddb.com/api/v2";
const RATE_LIMIT_DELAY_MS = 350; // Delay between API requests
const SAVE_INTERVAL = 25; // Save progress every N games
const INPUT_FILE = "data/games_export.json";
const OUTPUT_FILE = "data/games_export.with_covers.json";
// ----------------------------

// Environment variables
const STEAMGRIDDB_API_KEY = process.env.STEAMGRIDDB_API_KEY;

// Validate required environment variables
if (!STEAMGRIDDB_API_KEY) {
  console.error("\n❌ Missing STEAMGRIDDB_API_KEY. Set it in .env.local.");
  console.error(
    "   Get your API key from https://www.steamgriddb.com/profile/preferences/api\n"
  );
  process.exit(1);
}

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

// Game type - preserves all fields from the original JSON
interface Game {
  id: string;
  slug: string;
  title: string;
  cover_url?: string | null;
  sgdb_id?: number | null;
  [key: string]: any; // Allow other fields
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
      console.error(
        `  ❌ SteamGridDB search failed for "${title}": ${response.status} ${response.statusText}`
      );
      return null;
    }

    const data: SteamGridDbSearchResponse = await response.json();

    if (!data.success || !data.data || data.data.length === 0) {
      return null;
    }

    // Return the first (most relevant) result
    return data.data[0];
  } catch (error) {
    console.error(`  ❌ Error searching for game "${title}":`, error);
    return null;
  }
}

/**
 * Get grids (cover images) for a game from SteamGridDB
 * Returns the highest-scoring grid that is not NSFW and not humor
 */
async function getGameGrids(
  gameId: number
): Promise<SteamGridDbGrid | null> {
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
      console.error(
        `  ❌ SteamGridDB grids fetch failed for game ID ${gameId}: ${response.status} ${response.statusText}`
      );
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
      // No suitable grids found
      return null;
    }

    // Return the highest-scoring suitable grid
    return suitableGrids[0];
  } catch (error) {
    console.error(`  ❌ Error fetching grids for game ID ${gameId}:`, error);
    return null;
  }
}

/**
 * Enrich a single game with cover URL from SteamGridDB
 */
async function enrichGameWithCover(game: Game): Promise<{
  updated: boolean;
  coverUrl: string | null;
  sgdbId: number | null;
}> {
  // Skip if cover_url already exists
  if (game.cover_url) {
    return { updated: false, coverUrl: game.cover_url, sgdbId: game.sgdb_id || null };
  }

  try {
    // Search for the game
    const sgdbGame = await searchGame(game.title);
    await sleep(RATE_LIMIT_DELAY_MS);

    if (!sgdbGame) {
      return { updated: false, coverUrl: null, sgdbId: null };
    }

    // Get the best grid
    const grid = await getGameGrids(sgdbGame.id);
    await sleep(RATE_LIMIT_DELAY_MS);

    if (!grid) {
      return { updated: false, coverUrl: null, sgdbId: sgdbGame.id };
    }

    return {
      updated: true,
      coverUrl: grid.url,
      sgdbId: sgdbGame.id,
    };
  } catch (error) {
    console.error(`  ❌ Unexpected error processing "${game.title}":`, error);
    return { updated: false, coverUrl: null, sgdbId: null };
  }
}

/**
 * Save games array to output file
 */
function saveGames(games: Game[], filePath: string): void {
  const outputPath = join(process.cwd(), filePath);
  writeFileSync(outputPath, JSON.stringify(games, null, 2), "utf-8");
  console.log(`  💾 Saved progress to ${filePath}`);
}

/**
 * Main function
 */
async function main() {
  console.log("\n🎮 Starting game enrichment with SteamGridDB covers...\n");

  // Read input file
  const inputPath = join(process.cwd(), INPUT_FILE);
  if (!existsSync(inputPath)) {
    console.error(`❌ Input file not found: ${INPUT_FILE}`);
    console.error(`   Expected at: ${inputPath}\n`);
    process.exit(1);
  }

  console.log(`📖 Reading games from ${INPUT_FILE}...`);
  let games: Game[];
  try {
    const fileContent = readFileSync(inputPath, "utf-8");
    games = JSON.parse(fileContent);
  } catch (error) {
    console.error(`❌ Failed to read or parse ${INPUT_FILE}:`, error);
    process.exit(1);
  }

  console.log(`   Found ${games.length} games\n`);

  // Statistics
  let updated = 0;
  let skipped = 0;
  let missing = 0;

  // Process each game
  for (let i = 0; i < games.length; i++) {
    const game = games[i];
    const progress = `[${i + 1}/${games.length}]`;

    console.log(`${progress} Processing: "${game.title}"`);

    // Check if already has cover
    if (game.cover_url) {
      console.log(`  ⏭️  Skipped (already has cover)`);
      skipped++;
      continue;
    }

    // Enrich with cover
    const result = await enrichGameWithCover(game);

    if (result.updated) {
      // Update game with new cover URL and sgdb_id
      game.cover_url = result.coverUrl;
      game.sgdb_id = result.sgdbId;
      console.log(`  ✅ Updated: ${result.coverUrl}`);
      updated++;
    } else if (result.sgdbId && !result.coverUrl) {
      // Found game but no suitable grid
      game.sgdb_id = result.sgdbId;
      console.log(`  ⚠️  Found game (ID: ${result.sgdbId}) but no suitable grid`);
      missing++;
    } else {
      // No game found
      console.log(`  ❌ No game found on SteamGridDB`);
      missing++;
    }

    // Save progress every SAVE_INTERVAL games
    if ((i + 1) % SAVE_INTERVAL === 0) {
      saveGames(games, OUTPUT_FILE);
      console.log("");
    }
  }

  // Final save
  console.log("\n💾 Saving final enriched data...");
  saveGames(games, OUTPUT_FILE);

  // Print summary
  console.log("\n" + "=".repeat(60));
  console.log("📊 SUMMARY");
  console.log("=".repeat(60));
  console.log(`Total games:      ${games.length}`);
  console.log(`✅ Updated:        ${updated}`);
  console.log(`⏭️  Skipped:        ${skipped}`);
  console.log(`❌ Missing:        ${missing}`);
  console.log("=".repeat(60));
  console.log(`\n✨ Enrichment complete! Output saved to: ${OUTPUT_FILE}\n`);
}

// Run the script
main().catch((error) => {
  console.error("\n❌ Fatal error:", error);
  process.exit(1);
});

