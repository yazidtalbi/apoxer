import { createServerSupabaseClient } from "./supabase-server";
import { Player } from "@/types";

/**
 * Fetches all players for a given game, ordered by status (online first) and updated_at desc
 * @param gameId - The ID of the game
 * @returns Array of players for the game
 */
export async function getPlayersByGame(gameId: string): Promise<Player[]> {
  const supabase = await createServerSupabaseClient();
  
  // Custom ordering: online first, then looking, then offline, all by updated_at desc
  // Note: We can't directly join auth.users, so we'll fetch user data separately if needed
  const { data, error } = await supabase
    .from("players")
    .select(
      `
      id,
      user_id,
      game_id,
      platform,
      status,
      updated_at,
      created_at,
      games (
        id,
        title
      )
    `
    )
    .eq("game_id", gameId)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch players: ${error.message}`);
  }

  // Transform and sort: online first, then looking, then offline
  const players = (data || []).map((item: any) => ({
    id: item.id,
    userId: item.user_id,
    gameId: item.game_id,
    platform: item.platform,
    status: item.status,
    updatedAt: item.updated_at,
    createdAt: item.created_at,
    game: item.games
      ? {
          id: item.games.id,
          title: item.games.title,
        }
      : undefined,
  })) as Player[];

  // Sort by status priority: online > looking > offline
  const statusOrder = { online: 0, looking: 1, offline: 2 };
  return players.sort((a, b) => {
    const statusDiff = statusOrder[a.status] - statusOrder[b.status];
    if (statusDiff !== 0) return statusDiff;
    // If same status, sort by updated_at desc (already sorted by DB, but ensure consistency)
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
}

/**
 * Fetches a mix of suggested players across games
 * @param limit - Maximum number of players to return
 * @returns Array of suggested players
 */
export async function getSuggestedPlayers(limit: number = 20): Promise<Player[]> {
  const supabase = await createServerSupabaseClient();
  
  const { data, error } = await supabase
    .from("players")
    .select(
      `
      id,
      user_id,
      game_id,
      platform,
      status,
      updated_at,
      created_at,
      games (
        id,
        title
      )
    `
    )
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch suggested players: ${error.message}`);
  }

  // Transform data
  return (data || []).map((item: any) => ({
    id: item.id,
    userId: item.user_id,
    gameId: item.game_id,
    platform: item.platform,
    status: item.status,
    updatedAt: item.updated_at,
    createdAt: item.created_at,
    game: item.games
      ? {
          id: item.games.id,
          title: item.games.title,
        }
      : undefined,
  })) as Player[];
}

