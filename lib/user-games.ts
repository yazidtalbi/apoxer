import { createServerSupabaseClient } from "./supabase-server";
import { Game } from "@/types";

/**
 * Checks if a user has a game in their library
 * @param userId - The user ID
 * @param gameId - The game ID
 * @returns true if the game is in the user's library
 */
export async function isGameInUserLibrary(
  userId: string,
  gameId: string
): Promise<boolean> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("user_games")
    .select("id")
    .eq("user_id", userId)
    .eq("game_id", gameId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // No rows returned
      return false;
    }
    throw new Error(`Failed to check user game: ${error.message}`);
  }

  return !!data;
}

/**
 * Gets all games in a user's library
 * @param userId - The user ID
 * @returns Array of games
 */
export async function getUserGames(userId: string): Promise<Game[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("user_games")
    .select(
      `
      game_id,
      games (
        id,
        slug,
        title,
        description,
        cover_url,
        platforms,
        genres,
        tags,
        created_at
      )
    `
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch user games: ${error.message}`);
  }

  // Transform the data to match Game interface
  return (data || []).map((item: any) => ({
    id: item.games.id,
    slug: item.games.slug,
    title: item.games.title,
    description: item.games.description,
    coverUrl: item.games.cover_url || "",
    platforms: item.games.platforms || [],
    genres: item.games.genres || [],
    tags: item.games.tags || [],
    createdAt: item.games.created_at,
  })) as Game[];
}

