import { supabase } from "./supabaseClient";
import { Game, Community, Guide, PlayGuide, GamePlayGuide, GameGameTrait } from "@/types";

/**
 * Fetches games with optional search and filter parameters
 * @param filters - Optional filters for search query, genre, platform, limit, and offset
 * @returns Array of games sorted by title
 */
export async function getGames(filters?: {
  q?: string;
  genre?: string;
  platform?: string;
  limit?: number;
  offset?: number;
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

  // Apply pagination
  const limit = filters?.limit || 1000;
  const offset = filters?.offset || 0;
  query = query.range(offset, offset + limit - 1);

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
 * Fetches all communities for a given game, ordered by member_count DESC, then name
 * @param gameId - The ID of the game
 * @returns Array of communities for the game with enhanced fields
 */
export async function getCommunitiesByGame(
  gameId: string
): Promise<Community[]> {
  const { data, error } = await supabase
    .from("communities")
    .select("*")
    .eq("game_id", gameId)
    .order("member_count", { ascending: false, nullsFirst: false })
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch communities: ${error.message}`);
  }

  // Map database fields (snake_case) to TypeScript interface (camelCase)
  return (data || []).map((item: any) => ({
    id: item.id,
    gameId: item.game_id,
    name: item.name,
    inviteUrl: item.invite_url,
    category: item.category,
    language: item.language,
    onlineCount: item.online_count || 0,
    createdAt: item.created_at,
    // Enhanced fields
    description: item.description || null,
    tags: item.tags || [],
    memberCount: item.member_count || item.online_count || 0, // Fallback to online_count if member_count not set
    region: item.region || null,
    voiceRequired: item.voice_required || false,
  })) as Community[];
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
    .select(`
      *,
      game_version:game_versions(id, version_name, game_id, created_by, created_at, updated_at)
    `)
    .eq("game_id", gameId)
    .order("last_updated", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch play guides: ${error.message}`);
  }

  return (data || []).map((item: any) => ({
    id: item.id,
    gameId: item.game_id,
    title: item.title,
    summary: item.summary,
    fromPlatform: item.from_platform,
    toPlatform: item.to_platform,
    steps: item.steps,
    lastUpdated: item.last_updated,
    gameVersionId: item.game_version_id,
    platform: item.platform,
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
  })) as PlayGuide[];
}

/**
 * Fetches the mini "How to Play Together" guide for a game
 * @param gameId - The ID of the game
 * @returns The game play guide if found, null otherwise
 */
export async function getGamePlayGuide(gameId: string): Promise<GamePlayGuide | null> {
  const { data, error } = await supabase
    .from("game_play_guides")
    .select("*")
    .eq("game_id", gameId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // No rows returned
      return null;
    }
    throw new Error(`Failed to fetch game play guide: ${error.message}`);
  }

  if (!data) return null;

  return {
    id: data.id,
    gameId: data.game_id,
    content: data.content,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  } as GamePlayGuide;
}

/**
 * Fetches a single play guide by ID
 * @param guideId - The ID of the guide
 * @returns The play guide if found, null otherwise
 */
export async function getPlayGuideById(guideId: string): Promise<PlayGuide | null> {
  const { data, error } = await supabase
    .from("play_guides")
    .select(`
      *,
      game_version:game_versions(id, version_name, game_id, created_by, created_at, updated_at),
      games(id, slug, title, cover_url, platforms)
    `)
    .eq("id", guideId)
    .single();

  if (error) {
    throw new Error(`Failed to fetch play guide: ${error.message}`);
  }

  if (!data) return null;

  return {
    id: data.id,
    gameId: data.game_id,
    title: data.title,
    summary: data.summary,
    fromPlatform: data.from_platform,
    toPlatform: data.to_platform,
    steps: data.steps,
    lastUpdated: data.last_updated,
    gameVersionId: data.game_version_id,
    platform: data.platform,
    gameVersion: data.game_version
      ? {
          id: data.game_version.id,
          gameId: data.game_version.game_id,
          versionName: data.game_version.version_name,
          createdBy: data.game_version.created_by,
          createdAt: data.game_version.created_at,
          updatedAt: data.game_version.updated_at,
        }
      : null,
  } as PlayGuide;
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

/**
 * Fetches trending communities (most active by online_count)
 * @param limit - Maximum number of communities to return
 * @returns Array of communities with game data
 */
export async function getTrendingCommunities(limit: number = 12): Promise<(Community & { game?: Game })[]> {
  const { data, error } = await supabase
    .from("communities")
    .select(`
      *,
      games(id, slug, title, cover_url, hero_url, platforms, genres)
    `)
    .order("online_count", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch trending communities: ${error.message}`);
  }

  return (data || []).map((item: any) => ({
    id: item.id,
    gameId: item.game_id,
    name: item.name,
    inviteUrl: item.invite_url,
    category: item.category,
    language: item.language,
    onlineCount: item.online_count,
    createdAt: item.created_at,
    game: item.games ? {
      id: item.games.id,
      slug: item.games.slug,
      title: item.games.title,
      description: "",
      coverUrl: item.games.cover_url || "",
      heroUrl: item.games.hero_url,
      platforms: item.games.platforms || [],
      genres: item.games.genres || [],
      tags: [],
      createdAt: "",
    } : undefined,
  })) as (Community & { game?: Game })[];
}

/**
 * Fetches popular play guides (most recently updated)
 * @param limit - Maximum number of guides to return
 * @returns Array of play guides with game data
 */
export async function getPopularPlayGuides(limit: number = 12): Promise<(PlayGuide & { game?: { id: string; slug: string; title: string; cover_url: string | null } })[]> {
  const { data, error } = await supabase
    .from("play_guides")
    .select(`
      *,
      games(id, slug, title, cover_url)
    `)
    .order("last_updated", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch popular play guides: ${error.message}`);
  }

  return (data || []).map((item: any) => ({
    id: item.id,
    gameId: item.game_id,
    title: item.title,
    summary: item.summary,
    fromPlatform: item.from_platform,
    toPlatform: item.to_platform,
    steps: item.steps,
    lastUpdated: item.last_updated,
    gameVersionId: item.game_version_id,
    platform: item.platform,
    game: item.games ? {
      id: item.games.id,
      slug: item.games.slug,
      title: item.games.title,
      cover_url: item.games.cover_url,
    } : undefined,
  })) as (PlayGuide & { game?: { id: string; slug: string; title: string; cover_url: string | null } })[];
}

/**
 * Fetches recently added games
 * @param limit - Maximum number of games to return
 * @returns Array of recently added games
 */
export async function getRecentlyAddedGames(limit: number = 12): Promise<Game[]> {
  const { data, error } = await supabase
    .from("games")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch recently added games: ${error.message}`);
  }

  return data as Game[];
}

/**
 * Fetches crossplay-friendly games (games with multiple platforms)
 * @param limit - Maximum number of games to return
 * @returns Array of games with multiple platforms
 */
export async function getCrossplayGames(limit: number = 12): Promise<Game[]> {
  const { data, error } = await supabase
    .from("games")
    .select("*")
    .not("platforms", "is", null);

  if (error) {
    throw new Error(`Failed to fetch crossplay games: ${error.message}`);
  }

  // Filter games with 2+ platforms and sort by platform count
  const crossplayGames = (data || [])
    .filter((game: any) => game.platforms && game.platforms.length >= 2)
    .sort((a: any, b: any) => (b.platforms?.length || 0) - (a.platforms?.length || 0))
    .slice(0, limit);

  return crossplayGames as Game[];
}

/**
 * Fetches games with most active players (most searched)
 * @param limit - Maximum number of games to return
 * @returns Array of games with player counts
 */
export async function getMostSearchedGames(limit: number = 12): Promise<(Game & { playerCount: number })[]> {
  // Get all active players (online or looking)
  const { data: playersData, error: playersError } = await supabase
    .from("players")
    .select("game_id")
    .in("status", ["online", "looking"]);

  if (playersError) {
    throw new Error(`Failed to fetch players: ${playersError.message}`);
  }

  // Count players per game
  const gamePlayerCounts: Record<string, number> = {};
  (playersData || []).forEach((player: any) => {
    gamePlayerCounts[player.game_id] = (gamePlayerCounts[player.game_id] || 0) + 1;
  });

  // Get unique game IDs sorted by player count
  const gameIds = Object.keys(gamePlayerCounts)
    .sort((a, b) => gamePlayerCounts[b] - gamePlayerCounts[a])
    .slice(0, limit);

  if (gameIds.length === 0) {
    return [];
  }

  // Fetch games
  const { data: gamesData, error: gamesError } = await supabase
    .from("games")
    .select("*")
    .in("id", gameIds);

  if (gamesError) {
    throw new Error(`Failed to fetch games: ${gamesError.message}`);
  }

  // Map games with player counts, maintaining sort order
  const gamesMap = new Map((gamesData || []).map((game: any) => [game.id, game]));
  return gameIds
    .map((gameId) => {
      const game = gamesMap.get(gameId);
      if (!game) return null;
      return {
        ...game,
        playerCount: gamePlayerCounts[gameId],
      };
    })
    .filter((game): game is Game & { playerCount: number } => game !== null);
}

/**
 * Fetches games with very low users searching (0-1 active players)
 * @param limit - Maximum number of games to return
 * @returns Array of games with low player counts
 */
export async function getGamesWithLowUsersSearching(limit: number = 12): Promise<(Game & { playerCount: number })[]> {
  // Get all active players (online or looking)
  const { data: playersData, error: playersError } = await supabase
    .from("players")
    .select("game_id")
    .in("status", ["online", "looking"]);

  if (playersError) {
    throw new Error(`Failed to fetch players: ${playersError.message}`);
  }

  // Count players per game
  const gamePlayerCounts: Record<string, number> = {};
  (playersData || []).forEach((player: any) => {
    gamePlayerCounts[player.game_id] = (gamePlayerCounts[player.game_id] || 0) + 1;
  });

  // Get all games
  const { data: allGames, error: gamesError } = await supabase
    .from("games")
    .select("*")
    .limit(1000); // Get a large set to filter from

  if (gamesError) {
    throw new Error(`Failed to fetch games: ${gamesError.message}`);
  }

  // Filter games with 0-1 active players and add player count
  const lowPlayerGames = (allGames || [])
    .map((game: any) => ({
      ...game,
      playerCount: gamePlayerCounts[game.id] || 0,
    }))
    .filter((game: any) => game.playerCount <= 1)
    .sort((a: any, b: any) => {
      // Sort by player count (0 first), then by title
      if (a.playerCount !== b.playerCount) {
        return a.playerCount - b.playerCount;
      }
      return a.title.localeCompare(b.title);
    })
    .slice(0, limit);

  return lowPlayerGames as (Game & { playerCount: number })[];
}

/**
 * Fetches game traits for a given game, ordered by strength descending
 * @param gameId - The ID of the game
 * @param limit - Maximum number of traits to return (default: 4)
 * @returns Array of game traits with strength
 */
export async function getGameTraits(
  gameId: string,
  limit: number = 4
): Promise<GameGameTrait[]> {
  const { data, error } = await supabase
    .from("game_game_traits")
    .select(`
      strength,
      game_traits:trait_id (
        slug,
        label,
        icon_emoji
      )
    `)
    .eq("game_id", gameId)
    .order("strength", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch game traits: ${error.message}`);
  }

  // Transform the data to match the GameGameTrait interface
  return (data || []).map((item: any) => ({
    strength: item.strength,
    gameTrait: {
      slug: item.game_traits?.slug || "",
      label: item.game_traits?.label || "",
      iconEmoji: item.game_traits?.icon_emoji || null,
    },
  })) as GameGameTrait[];
}

