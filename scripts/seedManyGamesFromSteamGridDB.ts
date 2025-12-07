/**
 * Seed 10,000+ real games into Supabase using SteamGridDB autocomplete.
 *
 * Usage:
 * 1. Ensure .env.local contains:
 *    - NEXT_PUBLIC_SUPABASE_URL
 *    - NEXT_PUBLIC_SUPABASE_ANON_KEY
 *    - STEAMGRIDDB_API_KEY
 *
 * 2. Run:
 *    npx tsx scripts/seedManyGamesFromSteamGridDB.ts
 *
 * 3. Then run your existing cover + hero fetchers to fill images:
 *    npx tsx scripts/fetchCoversFromSteamGridDB.ts
 *    npx tsx scripts/fetchHeroesFromSteamGridDB.ts
 */

import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

dotenv.config();

import { createClient } from "@supabase/supabase-js";

const SGDB_KEY =
  process.env.STEAMGRIDDB_API_KEY ?? process.env.NEXT_PUBLIC_STEAMGRIDDB_API_KEY;

if (!SGDB_KEY) {
  console.error("Available STEAMGRID env vars:", {
    STEAMGRIDDB_API_KEY: process.env.STEAMGRIDDB_API_KEY,
    NEXT_PUBLIC_STEAMGRIDDB_API_KEY:
      process.env.NEXT_PUBLIC_STEAMGRIDDB_API_KEY,
  });
  throw new Error(
    "STEAMGRIDDB_API_KEY not found. Add STEAMGRIDDB_API_KEY=... in .env.local at project root."
  );
}

const SUPABASE_URL =
  process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error("Missing Supabase credentials. Add SUPABASE_URL and SUPABASE_ANON_KEY.");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const SGDB_BASE = "https://www.steamgriddb.com/api/v2";

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

type SGDBGame = {
  id: number;
  name: string;
};

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function searchGames(query: string): Promise<SGDBGame[]> {
  const url = `https://www.steamgriddb.com/api/v2/search/autocomplete/${encodeURIComponent(
    query
  )}?types=game`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${SGDB_KEY}`,
    },
  });

  if (!res.ok) {
    console.warn(`SteamGridDB search failed for "${query}" → ${res.status}`);
    return [];
  }

  const json = await res.json();

  // SGDB returns: { success: true, data: [{ name, id, types: ["game"] }] }
  return (json.data ?? [])
    .filter((item: any) => item.types?.includes("game"))
    .map((item: any) => ({
      id: item.id,
      name: item.name,
    }));
}

async function main() {
  const MAX_GAMES = 10500;
  const gamesMap = new Map<number, string>();

  console.log("Collecting game names from SteamGridDB...");

  const alphabet = "abcdefghijklmnopqrstuvwxyz";
  const digits = "0123456789";

  const queries: string[] = [];

  // 1-letter → 26 queries
  for (const a of alphabet) queries.push(a);

  // 2-letter → 676 queries
  for (const a of alphabet) {
    for (const b of alphabet) {
      queries.push(a + b);
    }
  }

  // letter + digit → 260 queries
  for (const a of alphabet) {
    for (const d of digits) {
      queries.push(a + d);
    }
  }

  let qIndex = 0;

  for (const q of queries) {
    if (gamesMap.size >= MAX_GAMES) break;

    qIndex++;
    const results = await searchGames(q);

    for (const g of results) {
      if (!gamesMap.has(g.id)) {
        gamesMap.set(g.id, g.name);
      }
      if (gamesMap.size >= MAX_GAMES) break;
    }

    if (qIndex % 25 === 0) {
      console.log(
        `Queries: ${qIndex}/${queries.length} | Games collected: ${gamesMap.size}`
      );
    }

    await sleep(250); // reduce API rate limit issues
  }

  console.log(`\nCollected ${gamesMap.size} unique games from SteamGridDB.`);

  const payload = Array.from(gamesMap.entries()).map(([sgdb_id, title]) => ({
    sgdb_id,
    title,
    slug: slugify(title),
    description: "Game information coming soon.",
    genres: [] as string[],
    platforms: [] as string[],
    cover_url: null as string | null,
    hero_url: null as string | null,
  }));

  console.log("Inserting games into Supabase in chunks...");

  const chunkSize = 500;
  let inserted = 0;

  for (let i = 0; i < payload.length; i += chunkSize) {
    const chunk = payload.slice(i, i + chunkSize);

    const { error } = await supabase.from("games").upsert(chunk, {
      onConflict: "sgdb_id",
    });

    if (error) {
      console.error("Supabase upsert error:", error);
      process.exit(1);
    }

    inserted += chunk.length;
    console.log(`  ✓ Inserted/updated ${inserted}/${payload.length} games`);
  }

  console.log("\nDone! You now have 10k+ games in your database.");
  console.log("Run your cover + hero fetch scripts next.");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
