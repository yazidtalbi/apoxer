import { createServerSupabaseClient } from "./supabase-server";
import { Event, GameVersion } from "@/types";

/**
 * Fetches all events for a specific game, ordered by start_datetime ascending
 */
export async function getEventsByGame(gameId: string): Promise<Event[]> {
  const supabase = await createServerSupabaseClient();
  
  const { data, error } = await supabase
    .from("events")
    .select(
      `
      *,
      game_version:game_versions(id, version_name, game_id, created_by, created_at, updated_at),
      creator:auth.users(id, email, user_metadata)
    `
    )
    .eq("game_id", gameId)
    .eq("status", "active")
    .order("start_datetime", { ascending: true });

  if (error) {
    console.error("Error fetching events:", error);
    return [];
  }

  return (data || []).map((item: any) => ({
    id: item.id,
    gameId: item.game_id,
    gameVersionId: item.game_version_id,
    createdBy: item.created_by,
    description: item.description,
    tags: item.tags || [],
    playersNeeded: item.players_needed,
    playersHave: item.players_have,
    startDate: item.start_date,
    startTime: item.start_time,
    startDatetime: item.start_datetime,
    language: item.language,
    platform: item.platform,
    status: item.status,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    gameVersion: item.game_version
      ? {
          id: item.game_version.id,
          gameId: item.game_version.game_id,
          versionName: item.game_version.version_name,
          createdBy: item.game_version.created_by,
          createdAt: item.game_version.created_at,
          updatedAt: item.game_version.updated_at,
        }
      : null,
    creator: item.creator
      ? {
          id: item.creator.id,
          email: item.creator.email,
          user_metadata: item.creator.user_metadata,
        }
      : undefined,
  })) as Event[];
}

/**
 * Fetches upcoming events across all games, with game data
 * @param limit - Maximum number of events to return
 * @returns Array of events with game information
 */
export async function getUpcomingEvents(limit: number = 4): Promise<(Event & { game?: { id: string; title: string; cover_url: string | null; hero_url: string | null; slug: string } })[]> {
  const supabase = await createServerSupabaseClient();
  
  const now = new Date().toISOString();
  
  const { data, error } = await supabase
    .from("events")
    .select(
      `
      *,
      game_version:game_versions(id, version_name, game_id, created_by, created_at, updated_at),
      games(id, title, cover_url, hero_url, slug)
    `
    )
    .eq("status", "active")
    .gte("start_datetime", now)
    .order("start_datetime", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("Error fetching upcoming events:", error);
    return [];
  }

  return (data || []).map((item: any) => ({
    id: item.id,
    gameId: item.game_id,
    gameVersionId: item.game_version_id,
    createdBy: item.created_by,
    description: item.description,
    tags: item.tags || [],
    playersNeeded: item.players_needed,
    playersHave: item.players_have,
    startDate: item.start_date,
    startTime: item.start_time,
    startDatetime: item.start_datetime,
    language: item.language,
    platform: item.platform,
    status: item.status,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    gameVersion: item.game_version
      ? {
          id: item.game_version.id,
          gameId: item.game_version.game_id,
          versionName: item.game_version.version_name,
          createdBy: item.game_version.created_by,
          createdAt: item.game_version.created_at,
          updatedAt: item.game_version.updated_at,
        }
      : null,
    game: item.games
      ? {
          id: item.games.id,
          title: item.games.title,
          cover_url: item.games.cover_url,
          hero_url: item.games.hero_url,
          slug: item.games.slug,
        }
      : undefined,
  })) as (Event & { game?: { id: string; title: string; cover_url: string | null; slug: string } })[];
}

/**
 * Fetches all game versions for a specific game
 */
export async function getGameVersions(gameId: string): Promise<GameVersion[]> {
  const supabase = await createServerSupabaseClient();
  
  const { data, error } = await supabase
    .from("game_versions")
    .select("*")
    .eq("game_id", gameId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching game versions:", error);
    return [];
  }

  return (data || []).map((item: any) => ({
    id: item.id,
    gameId: item.game_id,
    versionName: item.version_name,
    createdBy: item.created_by,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  })) as GameVersion[];
}

/**
 * Creates a new game version
 */
export async function createGameVersion(
  gameId: string,
  versionName: string,
  userId: string
): Promise<GameVersion | null> {
  const supabase = await createServerSupabaseClient();
  
  const { data, error } = await supabase
    .from("game_versions")
    .insert({
      game_id: gameId,
      version_name: versionName,
      created_by: userId,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating game version:", error);
    throw new Error(`Failed to create game version: ${error.message}`);
  }

  return {
    id: data.id,
    gameId: data.game_id,
    versionName: data.version_name,
    createdBy: data.created_by,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

/**
 * Creates a new event
 */
export async function createEvent(
  eventData: {
    gameId: string;
    gameVersionId: string | null;
    createdBy: string;
    description: string | null;
    tags: string[];
    playersNeeded: number;
    startDate: string;
    startTime: string;
    language: string;
    platform: string | null;
  }
): Promise<Event | null> {
  const supabase = await createServerSupabaseClient();
  
  // Calculate start_datetime from start_date + start_time
  const startDatetime = new Date(`${eventData.startDate}T${eventData.startTime}`).toISOString();
  
  const { data, error } = await supabase
    .from("events")
    .insert({
      game_id: eventData.gameId,
      game_version_id: eventData.gameVersionId,
      created_by: eventData.createdBy,
      description: eventData.description,
      tags: eventData.tags,
      players_needed: eventData.playersNeeded,
      players_have: 0,
      start_date: eventData.startDate,
      start_time: eventData.startTime,
      start_datetime: startDatetime,
      language: eventData.language,
      platform: eventData.platform,
      status: "active",
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating event:", error);
    throw new Error(`Failed to create event: ${error.message}`);
  }

  return {
    id: data.id,
    gameId: data.game_id,
    gameVersionId: data.game_version_id,
    createdBy: data.created_by,
    description: data.description,
    tags: data.tags || [],
    playersNeeded: data.players_needed,
    playersHave: data.players_have,
    startDate: data.start_date,
    startTime: data.start_time,
    startDatetime: data.start_datetime,
    language: data.language,
    platform: data.platform,
    status: data.status,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

/**
 * Joins an event (adds user as participant)
 */
export async function joinEvent(eventId: string, userId: string): Promise<void> {
  const supabase = await createServerSupabaseClient();
  
  const { error } = await supabase
    .from("event_participants")
    .insert({
      event_id: eventId,
      user_id: userId,
    });

  if (error) {
    console.error("Error joining event:", error);
    throw new Error(`Failed to join event: ${error.message}`);
  }
}

/**
 * Leaves an event (removes user as participant)
 */
export async function leaveEvent(eventId: string, userId: string): Promise<void> {
  const supabase = await createServerSupabaseClient();
  
  const { error } = await supabase
    .from("event_participants")
    .delete()
    .eq("event_id", eventId)
    .eq("user_id", userId);

  if (error) {
    console.error("Error leaving event:", error);
    throw new Error(`Failed to leave event: ${error.message}`);
  }
}

