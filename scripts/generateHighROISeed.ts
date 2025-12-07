/**
 * Helper script to generate High ROI seed data
 * 
 * This script helps you find game IDs and generate seed SQL statements
 * 
 * Usage:
 * 1. Run: npx tsx scripts/generateHighROISeed.ts
 * 2. It will output SQL statements with actual game IDs from your database
 * 3. Copy the output and run it in your Supabase SQL editor
 */

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_ANON_KEY. Add them to .env.local");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Popular game slugs to seed
const GAME_SLUGS = [
  "call-of-duty-4-modern-warfare",
  "apex-legends",
  "fortnite",
  "valorant",
  "rocket-league",
  "among-us",
  "fall-guys",
  "minecraft",
  "counter-strike-2",
  "overwatch-2",
];

// Game Play Guides content
const PLAY_GUIDES: Record<string, string> = {
  "call-of-duty-4-modern-warfare": `## How to Play Together

• **Enable Multiplayer**: Launch the game and select "Multiplayer" from the main menu
• **Create Private Match**: Go to "Private Match" to set up a custom game with friends
• **Invite Friends**: Use the in-game invite system or Steam/console friend list to invite players
• **Set Game Mode**: Choose from Team Deathmatch, Search & Destroy, Domination, or Free-for-All
• **Voice Chat**: Enable voice chat in settings for team coordination
• **Cross-Platform**: Note that CoD4 does not support cross-platform play - all players must be on the same platform`,

  "apex-legends": `## How to Play Together

• **Add Friends**: Use the Friends menu to add players by username or EA account
• **Create Squad**: Invite friends from the lobby to form a 3-player squad
• **Select Game Mode**: Choose Battle Royale, Arenas, or Limited Time Modes
• **Enable Crossplay**: Go to Settings > Gameplay and enable "Cross-Platform Play"
• **Party Chat**: Use in-game voice chat or external apps like Discord for communication
• **Platform Requirements**: All players need the latest game update and active internet connection`,

  "fortnite": `## How to Play Together

• **Epic Friends**: Add friends through Epic Games launcher or in-game Friends menu
• **Create Party**: Click the "+" button next to your name in the lobby to invite friends
• **Select Mode**: Choose Battle Royale, Creative, or Save the World mode
• **Cross-Platform**: Fortnite supports full cross-platform play across all devices
• **Voice Chat**: Enable voice chat in Audio settings and assign push-to-talk key
• **Platform Sync**: Ensure all players have linked their Epic accounts for cross-platform progression`,

  "valorant": `## How to Play Together

• **Add Riot Friends**: Add friends using their Riot ID (username#tag) in the Friends menu
• **Create Party**: Click "Invite" in the lobby to add friends to your party
• **Queue Together**: Select Unrated, Competitive, or Spike Rush and queue as a party
• **Party Size Limits**: Competitive allows up to 5 players, Unrated allows any party size
• **Voice Chat**: Press V for team voice chat or use party voice in the lobby
• **Platform Note**: Valorant is PC-only - all players must be on PC`,

  "rocket-league": `## How to Play Together

• **Add Epic Friends**: Link your Epic Games account and add friends through Epic launcher
• **Create Party**: Click "Create Party" in the main menu and invite friends
• **Select Playlist**: Choose from Casual, Competitive, Extra Modes, or Custom Games
• **Cross-Platform**: Rocket League supports full cross-platform play and progression
• **Party Chat**: Use in-game voice chat or external apps for communication
• **Platform Requirements**: All players need active internet and the latest game version`,

  "among-us": `## How to Play Together

• **Create or Join Lobby**: Host a private game or join a friend's lobby using the room code
• **Share Room Code**: The host shares the 6-character room code with friends
• **Set Player Count**: Choose 4-15 players depending on your group size
• **Customize Settings**: Adjust discussion time, voting time, and impostor count
• **Cross-Platform**: Among Us supports cross-platform play across all devices
• **Voice Chat**: Use external apps like Discord for voice chat during discussions`,

  "minecraft": `## How to Play Together

• **Create Realm or Server**: Set up a Minecraft Realm or private server for friends
• **Add Friends**: Add friends through Xbox Live, PlayStation Network, or Nintendo Switch Online
• **Invite to World**: Open your world settings and invite friends to join
• **Cross-Platform**: Bedrock Edition supports cross-platform play across all platforms
• **Voice Chat**: Use platform-specific voice chat or external apps like Discord
• **Platform Sync**: Ensure all players have the same game version installed`,

  "counter-strike-2": `## How to Play Together

• **Add Steam Friends**: Add friends through Steam Friends list or in-game
• **Create Lobby**: Click "Play" and create a lobby, then invite friends
• **Select Game Mode**: Choose Competitive, Casual, Wingman, or Deathmatch
• **Queue Together**: Queue as a party (up to 5 players for Competitive)
• **Voice Chat**: Press and hold the voice chat key (default: K) to communicate
• **Platform Note**: CS2 is PC-only - all players must be on Steam`,

  "overwatch-2": `## How to Play Together

• **Add Battle.net Friends**: Add friends using their BattleTag in the Social menu
• **Create Group**: Click "Invite" in the Social menu to form a party
• **Select Mode**: Choose Quick Play, Competitive, Arcade, or Custom Games
• **Cross-Platform**: Overwatch 2 supports cross-platform play (console players can play with PC in Quick Play)
• **Voice Chat**: Join team voice chat automatically or use group voice chat
• **Platform Requirements**: All players need Battle.net account and active internet`,

  "fall-guys": `## How to Play Together

• **Add Epic Friends**: Link Epic Games account and add friends through Epic launcher
• **Create Party**: Click "Invite Players" in the lobby to form a party
• **Select Show**: Choose from Main Show, Duos, Squads, or Limited Time Events
• **Cross-Platform**: Fall Guys supports full cross-platform play and progression
• **Party Size**: Main Show allows up to 4 players, Duos requires 2, Squads requires 4
• **Platform Requirements**: All players need active internet and latest game version`,
};

async function main() {
  console.log("🔍 Finding games in database...\n");

  // Fetch games by slugs
  const { data: games, error } = await supabase
    .from("games")
    .select("id, slug, title")
    .in("slug", GAME_SLUGS);

  if (error) {
    console.error("Error fetching games:", error);
    return;
  }

  if (!games || games.length === 0) {
    console.log("❌ No games found. Make sure you have games with these slugs in your database:");
    console.log(GAME_SLUGS.join(", "));
    return;
  }

  console.log(`✅ Found ${games.length} games:\n`);
  games.forEach((g) => console.log(`  - ${g.title} (${g.slug}) - ID: ${g.id}`));

  // Get a user ID for events and versions
  const { data: users } = await supabase.from("auth.users").select("id").limit(1);
  const userId = users?.[0]?.id || "00000000-0000-0000-0000-000000000000";

  console.log("\n📝 Generating SQL seed statements...\n");
  console.log("-- ============================================");
  console.log("-- High ROI Features Seed Data");
  console.log("-- Generated automatically");
  console.log("-- ============================================\n");

  // Generate Game Play Guides
  console.log("-- PART 1: Game Play Guides\n");
  for (const game of games) {
    const guide = PLAY_GUIDES[game.slug];
    if (guide) {
      console.log(`-- ${game.title}`);
      console.log(`INSERT INTO game_play_guides (game_id, content)`);
      console.log(`VALUES ('${game.id}', $guide_${game.slug.replace(/-/g, "_")}$)`);
      console.log(`ON CONFLICT (game_id) DO UPDATE SET content = EXCLUDED.content;\n`);
    }
  }

  // Generate Game Versions
  console.log("\n-- PART 2: Game Versions\n");
  const versions: Record<string, string[]> = {
    "apex-legends": ["Season 20", "Season 19"],
    "fortnite": ["Chapter 5 Season 1", "Chapter 4 Season 5"],
    "valorant": ["Episode 8 Act 1", "Episode 7 Act 3"],
    "rocket-league": ["Season 13"],
    "overwatch-2": ["Season 9", "Season 8"],
  };

  for (const game of games) {
    const gameVersions = versions[game.slug];
    if (gameVersions) {
      for (const version of gameVersions) {
        console.log(`-- ${game.title} - ${version}`);
        console.log(
          `INSERT INTO game_versions (game_id, version_name, created_by) VALUES ('${game.id}', '${version}', '${userId}') ON CONFLICT (game_id, version_name) DO NOTHING;`
        );
      }
      console.log("");
    }
  }

  console.log("\n✅ SQL generation complete!");
  console.log("\n⚠️  Note: The guide content needs to be inserted separately due to special characters.");
  console.log("   Copy the INSERT statements above and replace the $guide_*$ placeholders with actual content.");
  console.log("\n💡 Tip: You can also use the database-seed-high-roi-features.sql file and replace game slugs with IDs.");
}

main().catch(console.error);

