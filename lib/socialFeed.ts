import { createServerSupabaseClient } from "./supabase-server";

/**
 * LFG Post with player and game information
 */
export interface SocialFeedPost {
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
  player: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
  };
  game: {
    id: string;
    title: string;
    slug: string;
  };
}

/**
 * Fetches social feed (LFG posts) for a player
 * Includes posts from:
 * - The player themselves
 * - Players they follow
 * 
 * @param playerId - The ID of the player whose feed we're fetching
 * @param limit - Maximum number of posts to return (default: 20)
 * @returns Array of LFG posts sorted by created_at DESC
 */
export async function getSocialFeedForPlayer(
  playerId: string,
  limit: number = 20
): Promise<SocialFeedPost[]> {
  const supabase = await createServerSupabaseClient();

  // Step 1: Find who this player is following
  const { data: followsData, error: followsError } = await supabase
    .from("player_follows")
    .select("followed_id")
    .eq("follower_id", playerId);

  if (followsError) {
    console.error("Error fetching following list:", followsError);
    // Continue with just the player's own posts
  }

  // Step 2: Create list of player IDs (self + following)
  const followedIds: string[] = followsData?.map((item) => item.followed_id) || [];
  const playerIds = [playerId, ...followedIds];

  // Step 3: Query recent LFG posts from player_lfg_posts where player_id in that list
  const { data: postsData, error: postsError } = await supabase
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
      players (
        id,
        username,
        display_name,
        avatar_url
      ),
      games (
        id,
        title,
        slug
      )
    `
    )
    .in("player_id", playerIds)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (postsError) {
    console.error("Error fetching social feed posts:", postsError);
    return [];
  }

  if (!postsData || postsData.length === 0) {
    return [];
  }

  // Step 4: Transform data to match our interface
  return postsData.map((post: any) => ({
    id: post.id,
    playerId: post.player_id,
    gameId: post.game_id,
    title: post.title,
    description: post.description,
    platform: post.platform,
    scheduledAt: post.scheduled_at,
    maxPlayers: post.max_players,
    currentPlayers: post.current_players,
    voiceRequired: post.voice_required,
    externalLink: post.external_link,
    createdAt: post.created_at,
    player: {
      id: post.players.id,
      username: post.players.username,
      displayName: post.players.display_name,
      avatarUrl: post.players.avatar_url,
    },
    game: {
      id: post.games.id,
      title: post.games.title,
      slug: post.games.slug,
    },
  }));
}

