"use client";

import { createClientSupabaseClient } from "./supabase-client";
import { Player } from "@/types";

/**
 * Client-side function to fetch players for a game
 * Filters for players who are "online" or "looking" (available/looking for opponents)
 */
export async function getAvailablePlayersByGameClient(gameId: string): Promise<Player[]> {
  const supabase = createClientSupabaseClient();
  
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
    .in("status", ["online", "looking"]) // Only get available/looking players
    .order("status", { ascending: true }) // online first, then looking
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error fetching available players:", error);
    return [];
  }

  // Transform data
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

  // Sort by status priority: online > looking
  const statusOrder = { online: 0, looking: 1 };
  return players.sort((a, b) => {
    const statusDiff = statusOrder[a.status] - statusOrder[b.status];
    if (statusDiff !== 0) return statusDiff;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
}

