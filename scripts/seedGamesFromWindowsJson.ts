/**
 * Seed the `games` table from a Windows games JSON file.
 *
 * JSON path: data/windows-games.json
 *
 * JSON format: array of objects:
 * [
 *   {
 *     "Game": "Ys Origin",
 *     "Year": 2006,
 *     "Dev": "Nihon Falcom",
 *     "DevLink": "https://en.wikipedia.org/wiki/Nihon_Falcom",
 *     "Publisher": "Nihon Falcom",
 *     "PublisherLink": null,
 *     "GameLink": "https://en.wikipedia.org/wiki/Ys_Origin",
 *     "Platform": "Windows"
 *   },
 *   ...
 * ]
 *
 * Env:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY
 *
 * Run:
 *   npx tsx scripts/seedGamesFromWindowsJson.ts
 */

import fs from "fs/promises";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local" });
dotenv.config();

const SUPABASE_URL =
  process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error("Missing Supabase env vars (URL or ANON KEY).");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

type WindowsGameRaw = {
  Game: string;
  Year?: number | string | null;
  Dev?: string | null;
  DevLink?: string | null;
  Publisher?: string | null;
  PublisherLink?: string | null;
  GameLink?: string | null;
  Platform?: string | null;
};

function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

// Normalize "Platform" into your text[] `platforms` field
function normalizePlatforms(p?: string | null): string[] {
  if (!p) return [];
  const v = p.toLowerCase();

  if (v.includes("windows") || v.includes("pc")) return ["pc"];
  if (v.includes("xbox")) return ["xbox"];
  if (
    v.includes("playstation") ||
    v.includes("ps1") ||
    v.includes("ps2") ||
    v.includes("ps3") ||
    v.includes("ps4") ||
    v.includes("ps5")
  ) {
    return ["playstation"];
  }
  if (v.includes("switch")) return ["switch"];

  // fallback: literal platform string
  return [v];
}

// Clean up Year → integer or null
function normalizeYear(
  y: number | string | null | undefined
): number | null {
  if (y === null || y === undefined) return null;

  if (typeof y === "number") {
    return Number.isFinite(y) ? y : null;
  }

  if (typeof y === "string") {
    // look for a 4-digit year in the string
    const match = y.match(/\d{4}/);
    if (!match) return null;
    const parsed = parseInt(match[0], 10);
    if (!Number.isFinite(parsed)) return null;
    if (parsed < 1950 || parsed > 2100) return null;
    return parsed;
  }

  return null;
}

/**
 * Load all existing slugs from the `games` table to avoid inserting duplicates.
 */
async function fetchExistingSlugs(): Promise<Set<string>> {
  const slugs = new Set<string>();

  let from = 0;
  const batchSize = 1000;

  while (true) {
    const { data, error } = await supabase
      .from("games")
      .select("slug")
      .range(from, from + batchSize - 1);

    if (error) {
      console.error("Error loading existing slugs:", error);
      break;
    }

    if (!data || data.length === 0) {
      break;
    }

    for (const row of data) {
      if (row.slug) slugs.add(row.slug);
    }

    from += batchSize;
  }

  return slugs;
}

async function main() {
  console.log("Reading data/windows-games.json ...");

  const jsonPath = "data/windows-games.json";
  const raw = await fs.readFile(jsonPath, "utf-8");
  const rawGames: WindowsGameRaw[] = JSON.parse(raw);

  console.log(`Loaded ${rawGames.length} entries from JSON.`);

  console.log("Fetching existing slugs from Supabase...");
  const existingSlugs = await fetchExistingSlugs();
  console.log(`Found ${existingSlugs.size} existing games in DB.`);

  // de-dupe by slug (inside this JSON batch)
  const bySlug = new Map<string, any>();

  let skippedExisting = 0;
  let skippedEmpty = 0;

  for (const g of rawGames) {
    if (!g.Game) {
      skippedEmpty++;
      continue;
    }

    const title = g.Game.trim();
    if (!title) {
      skippedEmpty++;
      continue;
    }

    const slug = slugify(title);
    if (!slug) {
      skippedEmpty++;
      continue;
    }

    // Skip if already in DB
    if (existingSlugs.has(slug)) {
      skippedExisting++;
      continue;
    }

    // Skip duplicates inside this JSON file
    if (bySlug.has(slug)) continue; // keep first occurrence

    const platforms = normalizePlatforms(g.Platform ?? null);
    const description = g.GameLink
      ? `More info: ${g.GameLink}`
      : "Game information coming soon.";

    bySlug.set(slug, {
      // core
      slug,
      title,
      description,
      cover_url: null,
      hero_url: null,

      // arrays
      platforms, // text[]
      genres: [] as string[],
      tags: [] as string[],

      // meta from JSON
      release_year: normalizeYear(g.Year),
      developer: g.Dev ?? null,
      developer_link: g.DevLink ?? null,
      publisher: g.Publisher ?? null,
      publisher_link: g.PublisherLink ?? null,
      game_link: g.GameLink ?? null,
      raw_platform: g.Platform ?? null,

      // still present in schema but not filled yet
      sgdb_id: null as number | null,
    });
  }

  const payload = Array.from(bySlug.values());
  console.log(`Prepared ${payload.length} unique NEW games for insert.`);
  console.log(`Skipped ${skippedExisting} already-existing games.`);
  console.log(`Skipped ${skippedEmpty} invalid/empty entries.`);

  // Debug logs
  console.log("rawGames length:", rawGames.length);
  console.log("unique slugs in this batch (payload length):", payload.length);

  if (payload.length === 0) {
    console.log("No new games to insert. Exiting.");
    process.exit(0);
  }

  const chunkSize = 500;
  let inserted = 0;

  for (let i = 0; i < payload.length; i += chunkSize) {
    const chunk = payload.slice(i, i + chunkSize);

    const { error } = await supabase.from("games").insert(chunk);

    if (error) {
      console.error("Supabase insert error on chunk starting at index", i);
      console.error(JSON.stringify(error, null, 2));
      process.exit(1);
    }

    inserted += chunk.length;
    console.log(`✓ Inserted ${inserted}/${payload.length} new games`);
  }

  console.log("Done seeding from Windows JSON (new games only).");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
