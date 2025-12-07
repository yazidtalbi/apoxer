"use client";

import { supabase } from "./supabaseClient";
import { Event, GameVersion } from "@/types";

/**
 * Client-side function to fetch all events for a specific game
 * Note: Cannot join with auth.users from client, so creator data is limited to created_by ID
 */
export async function getEventsByGameClient(gameId: string): Promise<Event[]> {
  console.log("Fetching events for gameId:", gameId);
  
  const { data, error } = await supabase
    .from("events")
    .select(
      `
      *,
      game_version:game_versions(id, version_name, game_id, created_by, created_at, updated_at)
    `
    )
    .eq("game_id", gameId)
    .eq("status", "active")
    .order("start_datetime", { ascending: true });

  if (error) {
    console.error("Error fetching events:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    return [];
  }

  console.log("Events fetched successfully:", data?.length || 0, "events");

  // Fetch user data separately for creators (if needed)
  // For now, we'll just use the created_by ID and fetch user data in the component if needed
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
    // Creator data will be fetched separately if needed
    creator: undefined,
  })) as Event[];
}

/**
 * Client-side function to fetch all game versions for a specific game
 */
export async function getGameVersionsClient(gameId: string): Promise<GameVersion[]> {
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
 * Client-side function to create a new game version
 */
export async function createGameVersionClient(
  gameId: string,
  versionName: string,
  userId: string
): Promise<GameVersion | null> {
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
 * Client-side function to create a new event
 */
export async function createEventClient(
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
 * Client-side function to join an event
 */
export async function joinEventClient(eventId: string, userId: string): Promise<void> {
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
 * Client-side function to leave an event
 */
export async function leaveEventClient(eventId: string, userId: string): Promise<void> {
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

