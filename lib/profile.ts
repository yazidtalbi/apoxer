import { createServerSupabaseClient } from "./supabase-server";

/**
 * Player profile with full details
 */
export interface PlayerProfile {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  platform: string | null;
  status: string | null;
  timezone: string | null;
  location: string | null;
  website: string | null;
  createdAt: string;
  gamesCount: number;
  followersCount: number;
  followingCount: number;
}

/**
 * Featured game from player_games
 */
export interface FeaturedGame {
  id: string;
  gameId: string;
  playerId: string;
  platform: string | null;
  skillLevel: string | null;
  game: {
    id: string;
    title: string;
    slug: string;
    coverUrl: string | null;
    platforms: string[] | null;
  };
}

/**
 * Pinned LFG post
 */
export interface PinnedLfgPost {
  id: string;
  playerId: string;
  gameId: string;
  title: string;
  description: string | null;
  platform: string | null;
  scheduledAt: string | null;
  maxPlayers: number | null;
  currentPlayers: number | null;
  voiceRequired: boolean | null;
  externalLink: string | null;
  createdAt: string;
  game: {
    id: string;
    title: string;
    slug: string;
  };
}

/**
 * All games for a player (not just featured)
 */
export interface PlayerGame {
  id: string;
  gameId: string;
  playerId: string;
  platform: string | null;
  skillLevel: string | null;
  isFeatured: boolean;
  game: {
    id: string;
    title: string;
    slug: string;
    coverUrl: string | null;
    platforms: string[] | null;
  };
}

/**
 * Helper function to count followers where player exists
 */
async function countFollowersWithValidPlayers(playerId: string): Promise<number> {
  const supabase = await createServerSupabaseClient();

  // Get follower IDs
  const { data: followsData, error: followsError } = await supabase
    .from("player_follows")
    .select("follower_id")
    .eq("followed_id", playerId);

  if (followsError || !followsData || followsData.length === 0) {
    return 0;
  }

  // Count only followers that exist in players table
  const followerIds = followsData.map((item) => item.follower_id);
  const { data: playersData, error: playersError } = await supabase
    .from("players")
    .select("id")
    .in("id", followerIds);

  if (playersError || !playersData) {
    return 0;
  }

  return playersData.length;
}

/**
 * Helper function to count following where player exists
 */
async function countFollowingWithValidPlayers(playerId: string): Promise<number> {
  const supabase = await createServerSupabaseClient();

  // Get following IDs
  const { data: followsData, error: followsError } = await supabase
    .from("player_follows")
    .select("followed_id")
    .eq("follower_id", playerId);

  if (followsError || !followsData || followsData.length === 0) {
    return 0;
  }

  // Count only following that exist in players table
  const followedIds = followsData.map((item) => item.followed_id);
  const { data: playersData, error: playersError } = await supabase
    .from("players")
    .select("id")
    .in("id", followedIds);

  if (playersError || !playersData) {
    return 0;
  }

  return playersData.length;
}

/**
 * Fetches a player profile by username
 */
export async function getPlayerProfileByUsername(
  username: string
): Promise<PlayerProfile | null> {
  const supabase = await createServerSupabaseClient();

  // Fetch player by username
  const { data: playerData, error: playerError } = await supabase
    .from("players")
    .select("*")
    .eq("username", username)
    .single();

  if (playerError || !playerData) {
    return null;
  }

  // Fetch counts in parallel
  // Use helper functions that only count valid players (matching what's shown on the pages)
  const [gamesCountResult, followersCount, followingCount] = await Promise.all([
    supabase
      .from("player_games")
      .select("id", { count: "exact", head: true })
      .eq("player_id", playerData.id),
    countFollowersWithValidPlayers(playerData.id),
    countFollowingWithValidPlayers(playerData.id),
  ]);

  return {
    id: playerData.id,
    userId: playerData.user_id,
    username: playerData.username,
    displayName: playerData.display_name,
    bio: playerData.bio,
    avatarUrl: playerData.avatar_url,
    platform: playerData.platform,
    status: playerData.status,
    timezone: playerData.timezone,
    location: playerData.location,
    website: playerData.website,
    createdAt: playerData.created_at,
    gamesCount: gamesCountResult.count || 0,
    followersCount,
    followingCount,
  };
}

/**
 * Fetches featured games for a player
 */
export async function getFeaturedGames(
  playerId: string,
  limit: number = 6
): Promise<FeaturedGame[]> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("player_games")
    .select(
      `
      id,
      player_id,
      game_id,
      platform,
      skill_level,
      games (
        id,
        title,
        slug,
        cover_url,
        platforms
      )
    `
    )
    .eq("player_id", playerId)
    .eq("is_featured", true)
    .limit(limit);

  if (error || !data) {
    return [];
  }

  return data.map((item: any) => ({
    id: item.id,
    gameId: item.game_id,
    playerId: item.player_id,
    platform: item.platform,
    skillLevel: item.skill_level,
    game: {
      id: item.games.id,
      title: item.games.title,
      slug: item.games.slug,
      coverUrl: item.games.cover_url,
      platforms: item.games.platforms || [],
    },
  }));
}

/**
 * Fetches pinned LFG post for a player
 */
export async function getPinnedLfgPost(
  playerId: string
): Promise<PinnedLfgPost | null> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("player_lfg_posts")
    .select(
      `
      id,
      player_id,
      game_id,
      title,
      description,
      platform,
      scheduled_at,
      max_players,
      current_players,
      voice_required,
      external_link,
      created_at,
      games (
        id,
        title,
        slug
      )
    `
    )
    .eq("player_id", playerId)
    .eq("is_pinned", true)
    .limit(1)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    id: data.id,
    playerId: data.player_id,
    gameId: data.game_id,
    title: data.title,
    description: data.description,
    platform: data.platform,
    scheduledAt: data.scheduled_at,
    maxPlayers: data.max_players,
    currentPlayers: data.current_players,
    voiceRequired: data.voice_required,
    externalLink: data.external_link,
    createdAt: data.created_at,
    game: {
      id: data.games.id,
      title: data.games.title,
      slug: data.games.slug,
    },
  };
}

/**
 * Fetches all games for a player
 */
export async function getPlayerGames(playerId: string): Promise<PlayerGame[]> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("player_games")
    .select(
      `
      id,
      player_id,
      game_id,
      platform,
      skill_level,
      is_featured,
      games (
        id,
        title,
        slug,
        cover_url,
        platforms
      )
    `
    )
    .eq("player_id", playerId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return data.map((item: any) => ({
    id: item.id,
    gameId: item.game_id,
    playerId: item.player_id,
    platform: item.platform,
    skillLevel: item.skill_level,
    isFeatured: item.is_featured,
    game: {
      id: item.games.id,
      title: item.games.title,
      slug: item.games.slug,
      coverUrl: item.games.cover_url,
      platforms: item.games.platforms || [],
    },
  }));
}

/**
 * Player summary for followers/following lists
 */
export interface PlayerSummary {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
}

/**
 * Fetches followers for a player by username
 */
export async function getFollowersForUsername(
  username: string
): Promise<PlayerSummary[]> {
  const supabase = await createServerSupabaseClient();

  // First, get the player by username
  const { data: playerData, error: playerError } = await supabase
    .from("players")
    .select("id")
    .eq("username", username)
    .single();

  if (playerError || !playerData) {
    return [];
  }

  // Get follower IDs
  const { data: followsData, error: followsError } = await supabase
    .from("player_follows")
    .select("follower_id")
    .eq("followed_id", playerData.id)
    .order("created_at", { ascending: false });

  if (followsError || !followsData || followsData.length === 0) {
    return [];
  }

  // Get follower player data
  const followerIds = followsData.map((item) => item.follower_id);
  const { data: playersData, error: playersError } = await supabase
    .from("players")
    .select("id, username, display_name, avatar_url")
    .in("id", followerIds);

  if (playersError || !playersData) {
    return [];
  }

  // Maintain order from followsData
  const playersMap = new Map(playersData.map((p: any) => [p.id, p]));
  return followsData
    .map((follow) => {
      const player = playersMap.get(follow.follower_id);
      if (!player) return null;
      return {
        id: player.id,
        username: player.username,
        displayName: player.display_name,
        avatarUrl: player.avatar_url,
      };
    })
    .filter((p): p is PlayerSummary => p !== null);
}

/**
 * Fetches following list for a player by username
 */
export async function getFollowingForUsername(
  username: string
): Promise<PlayerSummary[]> {
  const supabase = await createServerSupabaseClient();

  // First, get the player by username
  const { data: playerData, error: playerError } = await supabase
    .from("players")
    .select("id")
    .eq("username", username)
    .single();

  if (playerError || !playerData) {
    return [];
  }

  // Get following IDs
  const { data: followsData, error: followsError } = await supabase
    .from("player_follows")
    .select("followed_id")
    .eq("follower_id", playerData.id)
    .order("created_at", { ascending: false });

  if (followsError || !followsData || followsData.length === 0) {
    return [];
  }

  // Get following player data
  const followedIds = followsData.map((item) => item.followed_id);
  const { data: playersData, error: playersError } = await supabase
    .from("players")
    .select("id, username, display_name, avatar_url")
    .in("id", followedIds);

  if (playersError || !playersData) {
    return [];
  }

  // Maintain order from followsData
  const playersMap = new Map(playersData.map((p: any) => [p.id, p]));
  return followsData
    .map((follow) => {
      const player = playersMap.get(follow.followed_id);
      if (!player) return null;
      return {
        id: player.id,
        username: player.username,
        displayName: player.display_name,
        avatarUrl: player.avatar_url,
      };
    })
    .filter((p): p is PlayerSummary => p !== null);
}

