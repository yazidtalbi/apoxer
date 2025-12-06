import { supabase } from "./supabaseClient";
import { Game, Community } from "@/types";

/**
 * Seed function to populate the database with sample games and communities
 * 
 * This function inserts:
 * - 15+ popular multiplayer games with complete data
 * - 1-3 Discord communities per game
 * 
 * Run this once during development to populate your database.
 */
export async function seedDatabase() {
  const games: Omit<Game, "id" | "createdAt">[] = [
    {
      slug: "valorant",
      title: "Valorant",
      description: "A 5v5 character-based tactical FPS where precise gunplay meets unique agent abilities.",
      coverUrl: "https://images.igdb.com/igdb/image/upload/t_cover_big/co49x5.png",
      platforms: ["PC"],
      genres: ["FPS", "Tactical"],
      tags: ["Competitive", "Team-based", "Free-to-play"],
    },
    {
      slug: "counter-strike-2",
      title: "Counter-Strike 2",
      description: "The next evolution of the legendary Counter-Strike series with improved graphics and gameplay.",
      coverUrl: "https://images.igdb.com/igdb/image/upload/t_cover_big/co6wum.png",
      platforms: ["PC"],
      genres: ["FPS", "Tactical"],
      tags: ["Competitive", "Esports", "Team-based"],
    },
    {
      slug: "apex-legends",
      title: "Apex Legends",
      description: "A free-to-play battle royale game featuring unique characters with special abilities.",
      coverUrl: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1r7h.png",
      platforms: ["PC", "PlayStation", "Xbox", "Nintendo Switch"],
      genres: ["Battle Royale", "FPS"],
      tags: ["Free-to-play", "Squad-based", "Fast-paced"],
    },
    {
      slug: "fortnite",
      title: "Fortnite",
      description: "Build, battle, and survive in this popular battle royale game with creative building mechanics.",
      coverUrl: "https://images.igdb.com/igdb/image/upload/t_cover_big/co49x6.png",
      platforms: ["PC", "PlayStation", "Xbox", "Nintendo Switch", "Mobile"],
      genres: ["Battle Royale", "Action"],
      tags: ["Free-to-play", "Building", "Cross-platform"],
    },
    {
      slug: "overwatch-2",
      title: "Overwatch 2",
      description: "Team-based hero shooter with diverse characters and strategic gameplay.",
      coverUrl: "https://images.igdb.com/igdb/image/upload/t_cover_big/co5p5a.png",
      platforms: ["PC", "PlayStation", "Xbox", "Nintendo Switch"],
      genres: ["FPS", "Hero Shooter"],
      tags: ["Team-based", "Competitive", "Free-to-play"],
    },
    {
      slug: "rocket-league",
      title: "Rocket League",
      description: "Soccer meets driving in this physics-based multiplayer game.",
      coverUrl: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1r76.png",
      platforms: ["PC", "PlayStation", "Xbox", "Nintendo Switch"],
      genres: ["Sports", "Racing"],
      tags: ["Competitive", "Cross-platform", "Free-to-play"],
    },
    {
      slug: "minecraft",
      title: "Minecraft",
      description: "Build, explore, and survive in an infinite blocky world with friends.",
      coverUrl: "https://images.igdb.com/igdb/image/upload/t_cover_big/co49x7.png",
      platforms: ["PC", "PlayStation", "Xbox", "Nintendo Switch", "Mobile"],
      genres: ["Sandbox", "Survival"],
      tags: ["Creative", "Multiplayer", "Cross-platform"],
    },
    {
      slug: "among-us",
      title: "Among Us",
      description: "Work together to complete tasks, but watch out for the impostor among you.",
      coverUrl: "https://images.igdb.com/igdb/image/upload/t_cover_big/co2r7h.png",
      platforms: ["PC", "Mobile", "Nintendo Switch"],
      genres: ["Party", "Social Deduction"],
      tags: ["Casual", "Multiplayer", "Free-to-play"],
    },
    {
      slug: "fall-guys",
      title: "Fall Guys",
      description: "Race through chaotic obstacle courses in this battle royale party game.",
      coverUrl: "https://images.igdb.com/igdb/image/upload/t_cover_big/co2r7i.png",
      platforms: ["PC", "PlayStation", "Xbox", "Nintendo Switch", "Mobile"],
      genres: ["Party", "Battle Royale"],
      tags: ["Casual", "Free-to-play", "Cross-platform"],
    },
    {
      slug: "league-of-legends",
      title: "League of Legends",
      description: "The world's most popular MOBA with strategic 5v5 battles.",
      coverUrl: "https://images.igdb.com/igdb/image/upload/t_cover_big/co49x8.png",
      platforms: ["PC"],
      genres: ["MOBA", "Strategy"],
      tags: ["Competitive", "Free-to-play", "Esports"],
    },
    {
      slug: "dota-2",
      title: "Dota 2",
      description: "Deep strategic MOBA with complex mechanics and high skill ceiling.",
      coverUrl: "https://images.igdb.com/igdb/image/upload/t_cover_big/co49x9.png",
      platforms: ["PC"],
      genres: ["MOBA", "Strategy"],
      tags: ["Competitive", "Free-to-play", "Complex"],
    },
    {
      slug: "rainbow-six-siege",
      title: "Tom Clancy's Rainbow Six Siege",
      description: "Tactical 5v5 FPS with destructible environments and unique operators.",
      coverUrl: "https://images.igdb.com/igdb/image/upload/t_cover_big/co49xa.png",
      platforms: ["PC", "PlayStation", "Xbox"],
      genres: ["FPS", "Tactical"],
      tags: ["Competitive", "Team-based", "Strategic"],
    },
    {
      slug: "destiny-2",
      title: "Destiny 2",
      description: "Action MMO with FPS combat, raids, and cooperative gameplay.",
      coverUrl: "https://images.igdb.com/igdb/image/upload/t_cover_big/co49xb.png",
      platforms: ["PC", "PlayStation", "Xbox"],
      genres: ["FPS", "MMO", "RPG"],
      tags: ["Cooperative", "Looter-shooter", "Free-to-play"],
    },
    {
      slug: "phasmophobia",
      title: "Phasmophobia",
      description: "Cooperative horror game where you investigate paranormal activity with friends.",
      coverUrl: "https://images.igdb.com/igdb/image/upload/t_cover_big/co2r7j.png",
      platforms: ["PC", "PlayStation", "Xbox", "VR"],
      genres: ["Horror", "Cooperative"],
      tags: ["Multiplayer", "Horror", "Cooperative"],
    },
    {
      slug: "sea-of-thieves",
      title: "Sea of Thieves",
      description: "Pirate adventure game where you sail the seas with your crew.",
      coverUrl: "https://images.igdb.com/igdb/image/upload/t_cover_big/co2r7k.png",
      platforms: ["PC", "Xbox"],
      genres: ["Adventure", "Action"],
      tags: ["Cooperative", "Open-world", "Cross-platform"],
    },
    {
      slug: "dead-by-daylight",
      title: "Dead by Daylight",
      description: "Asymmetric horror game where survivors try to escape a killer.",
      coverUrl: "https://images.igdb.com/igdb/image/upload/t_cover_big/co2r7l.png",
      platforms: ["PC", "PlayStation", "Xbox", "Nintendo Switch", "Mobile"],
      genres: ["Horror", "Asymmetric"],
      tags: ["Multiplayer", "Horror", "Competitive"],
    },
    {
      slug: "call-of-duty-warzone",
      title: "Call of Duty: Warzone",
      description: "Free-to-play battle royale set in the Call of Duty universe.",
      coverUrl: "https://images.igdb.com/igdb/image/upload/t_cover_big/co2r7m.png",
      platforms: ["PC", "PlayStation", "Xbox"],
      genres: ["Battle Royale", "FPS"],
      tags: ["Free-to-play", "Competitive", "Cross-platform"],
    },
    {
      slug: "gta-online",
      title: "Grand Theft Auto Online",
      description: "Massive multiplayer experience in the world of Los Santos.",
      coverUrl: "https://images.igdb.com/igdb/image/upload/t_cover_big/co2r7n.png",
      platforms: ["PC", "PlayStation", "Xbox"],
      genres: ["Action", "Open-world"],
      tags: ["Multiplayer", "Open-world", "Cooperative"],
    },
  ];

  const communityTemplates = [
    { name: "Official Community", category: "General", language: "English" },
    { name: "Competitive Players", category: "Competitive", language: "English" },
    { name: "Casual Gaming", category: "Casual", language: "English" },
  ];

  const results = {
    gamesInserted: 0,
    communitiesInserted: 0,
    errors: [] as string[],
  };

  try {
    // Insert games
    for (const game of games) {
      const { data: insertedGame, error: gameError } = await supabase
        .from("games")
        .insert({
          ...game,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (gameError) {
        // Game might already exist, try to get it by slug
        const { data: existingGame } = await supabase
          .from("games")
          .select("id")
          .eq("slug", game.slug)
          .single();

        if (existingGame) {
          // Game exists, use its ID for communities
          const gameId = existingGame.id;

          // Insert communities for this game
          const numCommunities = Math.floor(Math.random() * 3) + 1; // 1-3 communities
          for (let i = 0; i < numCommunities; i++) {
            const template = communityTemplates[i % communityTemplates.length];
            const { error: communityError } = await supabase.from("communities").insert({
              game_id: gameId,
              name: `${game.title} - ${template.name}`,
              invite_url: `https://discord.gg/${game.slug}-${i + 1}`,
              category: template.category,
              language: template.language,
              online_count: Math.floor(Math.random() * 2000) + 100,
              created_at: new Date().toISOString(),
            });

            if (!communityError) {
              results.communitiesInserted++;
            }
          }
          continue;
        } else {
          results.errors.push(`Failed to insert game ${game.title}: ${gameError.message}`);
          continue;
        }
      }

      if (insertedGame) {
        results.gamesInserted++;
        const gameId = insertedGame.id;

        // Insert 1-3 communities for this game
        const numCommunities = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < numCommunities; i++) {
          const template = communityTemplates[i % communityTemplates.length];
          const { error: communityError } = await supabase.from("communities").insert({
            game_id: gameId,
            name: `${game.title} - ${template.name}`,
            invite_url: `https://discord.gg/${game.slug}-${i + 1}`,
            category: template.category,
            language: template.language,
            online_count: Math.floor(Math.random() * 2000) + 100,
            created_at: new Date().toISOString(),
          });

          if (!communityError) {
            results.communitiesInserted++;
          } else {
            results.errors.push(
              `Failed to insert community for ${game.title}: ${communityError.message}`
            );
          }
        }
      }
    }

    return results;
  } catch (error) {
    results.errors.push(`Unexpected error: ${error instanceof Error ? error.message : "Unknown error"}`);
    return results;
  }
}

