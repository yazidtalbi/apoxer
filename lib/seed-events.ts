import { supabase } from "./supabaseClient";

/**
 * Seed function to populate the database with sample events and game versions
 * 
 * This function:
 * - Creates game versions for popular games
 * - Creates sample events for those games
 * 
 * Run this after you have games and at least one user in your database.
 * 
 * Usage:
 * ```ts
 * import { seedEvents } from "@/lib/seed-events";
 * await seedEvents();
 * ```
 */
export async function seedEvents() {
  const results = {
    versionsCreated: 0,
    eventsCreated: 0,
    errors: [] as string[],
  };

  try {
    // Get all games
    const { data: games, error: gamesError } = await supabase
      .from("games")
      .select("id, slug, title, platforms")
      .order("title");

    if (gamesError) {
      throw new Error(`Failed to fetch games: ${gamesError.message}`);
    }

    if (!games || games.length === 0) {
      console.log("No games found. Please seed games first.");
      return results;
    }

    // Get a user (for created_by fields)
    // Try to get the first user from the database
    // Note: This requires service role key or proper RLS policies
    let userId: string | null = null;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id || null;
    } catch (error) {
      // If no authenticated user, try to get any user ID from auth.users
      // This might not work with RLS, so we'll log a warning
      console.log("No authenticated user. Trying to fetch a user from database...");
    }
    
    // If still no user, we'll create events with null created_by
    // The database schema allows this, but RLS might block it
    if (!userId) {
      console.log("Warning: No user found. Events will be created with created_by = NULL");
    }

    // Game versions to create
    const versionTemplates = [
      { slug: "valorant", versions: ["Episode 8", "Season 3", "Act 2"] },
      { slug: "counter-strike-2", versions: ["Update 2.0", "Operation Update"] },
      { slug: "apex-legends", versions: ["Season 20", "Collection Event"] },
      { slug: "fortnite", versions: ["Chapter 5", "Season 2"] },
      { slug: "rocket-league", versions: ["Season 14", "Tournament Update"] },
    ];

    // Create game versions
    for (const template of versionTemplates) {
      const game = games.find((g) => g.slug === template.slug);
      if (!game) continue;

      for (const versionName of template.versions) {
        const { error } = await supabase
          .from("game_versions")
          .insert({
            game_id: game.id,
            version_name: versionName,
            created_by: userId,
          })
          .select()
          .single();

        if (error && error.code !== "23505") {
          // 23505 is unique constraint violation (version already exists)
          results.errors.push(`Failed to create version ${versionName} for ${game.title}: ${error.message}`);
        } else if (!error) {
          results.versionsCreated++;
        }
      }
    }

    // Event templates (Xbox-style)
    const eventTemplates = [
      {
        gameSlug: "valorant",
        events: [
          {
            description: "Looking for ranked players, positive K/D only",
            tags: ["#Ranked", "#rankonly", "#Plat1andup", "#winstreak", "#EnglishSpeakers", "#TEAMWORK", "Mic required"],
            playersNeeded: 1,
            playersHave: 1,
            language: "English",
            platform: "PC",
            versionName: null,
          },
          {
            description: "Casual 5v5, all welcome",
            tags: ["Mic optional", "All content OK", "Swearing OK", "Competitive", "All ages"],
            playersNeeded: 6,
            playersHave: 1,
            language: "English",
            platform: "PC",
            versionName: null,
          },
          {
            description: "Kid-friendly session",
            tags: ["Kid-friendly content", "No swearing", "No trash-talking", "Mic optional", "New players welcome"],
            playersNeeded: 1,
            playersHave: 0,
            language: "English",
            platform: "PC",
            versionName: null,
          },
        ],
      },
      {
        gameSlug: "apex-legends",
        events: [
          {
            description: "Ranked grind, Diamond+ only",
            tags: ["#Ranked", "Mic required", "Competitive", "#DiamondPlus"],
            playersNeeded: 2,
            playersHave: 1,
            language: "English",
            platform: "PC",
            versionName: null,
          },
          {
            description: "Casual trios, just for fun",
            tags: ["Casual", "Mic optional", "All content OK"],
            playersNeeded: 2,
            playersHave: 1,
            language: "English",
            platform: null,
            versionName: null,
          },
        ],
      },
      {
        gameSlug: "counter-strike-2",
        events: [
          {
            description: "Competitive matchmaking, LE+",
            tags: ["Competitive", "Mic required", "#LEPlus", "#EnglishSpeakers"],
            playersNeeded: 4,
            playersHave: 1,
            language: "English",
            platform: "PC",
            versionName: null,
          },
        ],
      },
    ];

    // Create events
    for (const template of eventTemplates) {
      const game = games.find((g) => g.slug === template.gameSlug);
      if (!game) continue;

      for (const eventTemplate of template.events) {
        // Get version if specified
        let versionId: string | null = null;
        if (eventTemplate.versionName) {
          const { data: version } = await supabase
            .from("game_versions")
            .select("id")
            .eq("game_id", game.id)
            .eq("version_name", eventTemplate.versionName)
            .single();
          versionId = version?.id || null;
        }

        // Calculate start time (some in the past, some in the future)
        const now = new Date();
        const startDate = new Date(now);
        startDate.setHours(now.getHours() + Math.floor(Math.random() * 24)); // Random time in next 24 hours
        const startDateStr = startDate.toISOString().split("T")[0];
        const startTimeStr = startDate.toTimeString().split(" ")[0].substring(0, 5); // HH:MM format
        const startDatetime = startDate.toISOString();

        const { error } = await supabase
          .from("events")
          .insert({
            game_id: game.id,
            game_version_id: versionId,
            created_by: userId,
            description: eventTemplate.description,
            tags: eventTemplate.tags,
            players_needed: eventTemplate.playersNeeded,
            players_have: eventTemplate.playersHave,
            start_date: startDateStr,
            start_time: startTimeStr,
            start_datetime: startDatetime,
            language: eventTemplate.language,
            platform: eventTemplate.platform,
            status: "active",
          });

        if (error) {
          results.errors.push(`Failed to create event for ${game.title}: ${error.message}`);
        } else {
          results.eventsCreated++;
        }
      }
    }

    console.log("\n=== Events Seed Summary ===");
    console.log(`Game versions created: ${results.versionsCreated}`);
    console.log(`Events created: ${results.eventsCreated}`);
    if (results.errors.length > 0) {
      console.log(`Errors: ${results.errors.length}`);
      results.errors.forEach((err) => console.error(`  - ${err}`));
    }
    console.log("\nDone!");

    return results;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Fatal error in events seeder:", errorMessage);
    results.errors.push(errorMessage);
    return results;
  }
}

// Allow running directly with tsx
if (require.main === module) {
  seedEvents()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Fatal error:", error);
      process.exit(1);
    });
}

