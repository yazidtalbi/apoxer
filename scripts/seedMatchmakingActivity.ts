/**
 * Seed Matchmaking Activity Data
 * 
 * This script creates player records with various timestamps spread over time
 * to populate the matchmaking activity chart on game pages.
 * 
 * Usage:
 *   npx tsx scripts/seedMatchmakingActivity.ts
 */

import { createClient } from "@supabase/supabase-js";

// Use service role key for seeding (bypasses RLS)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface GameSlug {
  slug: string;
  entries: number;
  daysAgo: number;
  weightRecent?: boolean; // Weight activity towards recent days
}

const GAMES_TO_SEED: GameSlug[] = [
  { slug: "call-of-duty-modern-warfare-3", entries: 120, daysAgo: 7 },
  { slug: "valorant", entries: 150, daysAgo: 7, weightRecent: true },
  { slug: "apex-legends", entries: 200, daysAgo: 30 },
  { slug: "counter-strike-2", entries: 80, daysAgo: 2 }, // 48 hours
  { slug: "fortnite", entries: 180, daysAgo: 7 },
];

const PLATFORMS = ["PC", "PlayStation", "Xbox", "Nintendo Switch"];
const STATUSES: ("online" | "looking")[] = ["online", "looking"];

function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomOffset(daysAgo: number, weightRecent?: boolean): Date {
  const now = Date.now();
  const msAgo = daysAgo * 24 * 60 * 60 * 1000;
  
  let randomMs: number;
  if (weightRecent && daysAgo > 3) {
    // Weight towards recent 3 days (70% chance)
    if (Math.random() > 0.3) {
      const recentMs = 3 * 24 * 60 * 60 * 1000;
      randomMs = Math.random() * recentMs;
    } else {
      const olderMs = (daysAgo - 3) * 24 * 60 * 60 * 1000;
      randomMs = 3 * 24 * 60 * 60 * 1000 + Math.random() * olderMs;
    }
  } else {
    randomMs = Math.random() * msAgo;
  }
  
  return new Date(now - randomMs);
}

async function seedMatchmakingActivity() {
  console.log("🌱 Starting matchmaking activity seed...\n");

  // Get a user ID from auth.users (using service role key)
  const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
  
  let userId: string | null = null;
  
  if (usersError || !users || users.length === 0) {
    console.log("⚠️  No users found. Creating entries with NULL user_id (if allowed by schema)");
  } else {
    userId = users[0].id;
    console.log(`✓ Using user: ${users[0].email || users[0].id}\n`);
  }
  console.log(`✓ Using user: ${userId}\n`);

  let totalInserted = 0;

  for (const gameConfig of GAMES_TO_SEED) {
    console.log(`📊 Seeding ${gameConfig.slug}...`);

    // Get game ID
    const { data: game, error: gameError } = await supabase
      .from("games")
      .select("id, title, slug")
      .or(`slug.eq.${gameConfig.slug},title.ilike.%${gameConfig.slug.replace(/-/g, " ")}%`)
      .limit(1)
      .single();

    if (gameError || !game) {
      console.log(`  ⚠️  Game not found: ${gameConfig.slug}`);
      continue;
    }

    console.log(`  ✓ Found game: ${game.title}`);

    let inserted = 0;
    const errors: string[] = [];

    // Generate entries
    for (let i = 0; i < gameConfig.entries; i++) {
      const updatedAt = randomOffset(gameConfig.daysAgo, gameConfig.weightRecent);
      const createdAt = new Date(updatedAt.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000);

      const insertData: any = {
        game_id: game.id,
        platform: randomChoice(PLATFORMS),
        status: randomChoice(STATUSES),
        updated_at: updatedAt.toISOString(),
        created_at: createdAt.toISOString(),
      };
      
      // Only add user_id if we have one
      if (userId) {
        insertData.user_id = userId;
      } else {
        insertData.user_id = null;
      }

      const { error } = await supabase.from("players").insert(insertData);

      if (error) {
        // Skip conflicts (same user/game/status combinations)
        if (!error.message.includes("duplicate") && !error.message.includes("violates")) {
          errors.push(error.message);
        }
      } else {
        inserted++;
      }

      // Progress indicator
      if ((i + 1) % 20 === 0) {
        process.stdout.write(".");
      }
    }

    console.log(`\n  ✓ Inserted ${inserted} player records`);
    if (errors.length > 0) {
      console.log(`  ⚠️  ${errors.length} errors (likely duplicates)`);
    }
    totalInserted += inserted;
    console.log("");
  }

  // Add some very recent activity (last 6 hours)
  console.log("🕐 Adding recent activity (last 6 hours)...");
  
  // Get a random game that we seeded
  const { data: recentGames } = await supabase
    .from("games")
    .select("id, title")
    .in(
      "slug",
      GAMES_TO_SEED.map((g) => g.slug)
    )
    .limit(1)
    .single();

  if (recentGames) {
    let recentInserted = 0;
    for (let i = 0; i < 30; i++) {
      const hoursAgo = Math.random() * 6;
      const updatedAt = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
      const createdAt = new Date(updatedAt.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000);

      const insertData: any = {
        game_id: recentGames.id,
        platform: randomChoice(PLATFORMS),
        status: randomChoice(STATUSES),
        updated_at: updatedAt.toISOString(),
        created_at: createdAt.toISOString(),
      };
      
      if (userId) {
        insertData.user_id = userId;
      } else {
        insertData.user_id = null;
      }

      const { error } = await supabase.from("players").insert(insertData);

      if (!error) {
        recentInserted++;
      }
    }
    console.log(`✓ Inserted ${recentInserted} recent player records\n`);
    totalInserted += recentInserted;
  }

  console.log(`✨ Done! Total records inserted: ${totalInserted}\n`);

  // Show summary
  console.log("📈 Activity Summary:");
  const { data: summary } = await supabase
    .from("players")
    .select("game_id, status, updated_at")
    .in("status", ["online", "looking"])
    .gte("updated_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

  if (summary) {
    const gameMap = new Map<string, number>();
    summary.forEach((p) => {
      gameMap.set(p.game_id, (gameMap.get(p.game_id) || 0) + 1);
    });

    // Get game titles
    const gameIds = Array.from(gameMap.keys());
    if (gameIds.length > 0) {
      const { data: games } = await supabase
        .from("games")
        .select("id, title")
        .in("id", gameIds);

      if (games) {
        games.forEach((game) => {
          console.log(`  ${game.title}: ${gameMap.get(game.id)} activities`);
        });
      }
    }
  }
}

// Run the seed
seedMatchmakingActivity()
  .then(() => {
    console.log("\n✅ Seed completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Seed failed:", error);
    process.exit(1);
  });

