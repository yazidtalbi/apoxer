import { supabase } from "./supabaseClient";
import { Game, Community, Guide, PlayGuide } from "@/types";

/**
 * Fetches games with optional search and filter parameters
 * @param filters - Optional filters for search query, genre, and platform
 * @returns Array of games sorted by title
 */
export async function getGames(filters?: {
  q?: string;
  genre?: string;
  platform?: string;
}): Promise<Game[]> {
  let query = supabase.from("games").select("*");

  // Apply search query filter (title ilike)
  if (filters?.q) {
    query = query.ilike("title", `%${filters.q}%`);
  }

  // Apply genre filter (genres array contains)
  if (filters?.genre) {
    query = query.contains("genres", [filters.genre]);
  }

  // Apply platform filter (platforms array contains)
  if (filters?.platform) {
    query = query.contains("platforms", [filters.platform]);
  }

  // Order by title
  query = query.order("title", { ascending: true });

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch games: ${error.message}`);
  }

  return data as Game[];
}

/**
 * Fetches a single game by slug
 * @param slug - The game slug identifier
 * @returns The game if found, null otherwise
 */
export async function getGameBySlug(slug: string): Promise<Game | null> {
  const { data, error } = await supabase
    .from("games")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // No rows returned
      return null;
    }
    throw new Error(`Failed to fetch game: ${error.message}`);
  }

  return data as Game;
}

/**
 * Fetches all communities for a given game, ordered by online_count descending
 * @param gameId - The ID of the game
 * @returns Array of communities for the game
 */
export async function getCommunitiesByGame(
  gameId: string
): Promise<Community[]> {
  const { data, error } = await supabase
    .from("communities")
    .select("*")
    .eq("game_id", gameId)
    .order("online_count", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch communities: ${error.message}`);
  }

  return data as Community[];
}

/**
 * Fetches all guides for a given game
 * @param gameId - The ID of the game
 * @returns Array of guides for the game
 */
export async function getGuidesByGame(gameId: string): Promise<Guide[]> {
  const { data, error } = await supabase
    .from("guides")
    .select("*")
    .eq("game_id", gameId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch guides: ${error.message}`);
  }

  return data as Guide[];
}

/**
 * Fetches all play guides for a given game
 * @param gameId - The ID of the game
 * @returns Array of play guides for the game
 */
export async function getPlayGuidesByGame(gameId: string): Promise<PlayGuide[]> {
  const { data, error } = await supabase
    .from("play_guides")
    .select("*")
    .eq("game_id", gameId)
    .order("last_updated", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch play guides: ${error.message}`);
  }

  return data as PlayGuide[];
}

/**
 * Fetches similar games based on shared genres
 * @param genres - Array of genres to match
 * @param excludeGameId - Game ID to exclude from results
 * @param limit - Maximum number of games to return
 * @returns Array of similar games
 */
export async function getSimilarGames(
  genres: string[],
  excludeGameId: string,
  limit: number = 8
): Promise<Game[]> {
  if (!genres || genres.length === 0) {
    // If no genres, return popular/trending games
    const { data, error } = await supabase
      .from("games")
      .select("*")
      .neq("id", excludeGameId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch similar games: ${error.message}`);
    }

    return data as Game[];
  }

  // Find games that share at least one genre
  const { data, error } = await supabase
    .from("games")
    .select("*")
    .neq("id", excludeGameId)
    .overlaps("genres", genres)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch similar games: ${error.message}`);
  }

  return data as Game[];
}

