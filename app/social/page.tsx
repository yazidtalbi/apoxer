import { getCurrentUser } from "@/lib/supabase-server";
import { getUserGames } from "@/lib/user-games";
import SocialFeed from "@/components/social/SocialFeed";

interface Activity {
  id: string;
  type: "game_added" | "matchmaking_started" | "status_updated";
  user: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
  game?: {
    id: string;
    title: string;
    slug: string;
    coverUrl: string;
  };
  timestamp: string;
  platform?: string;
}

/**
 * Fetches activity feed for friends/following
 * For now, returns dummy data - can be replaced with real database queries
 */
async function getActivityFeed(userId?: string): Promise<Activity[]> {
  // TODO: Replace with actual database query
  // Query should fetch:
  // - Friends/following who added games
  // - Friends/following who started matchmaking
  // - Friends/following who updated their status
  // Order by timestamp descending

  // Dummy data for now
  return [
    {
      id: "1",
      type: "game_added",
      user: {
        id: "user1",
        username: "gamer123",
        avatarUrl: undefined,
      },
      game: {
        id: "game1",
        title: "Apex Legends",
        slug: "apex-legends",
        coverUrl: "https://images.igdb.com/igdb/image/upload/t_cover_big/co49x5.jpg",
      },
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    },
    {
      id: "2",
      type: "matchmaking_started",
      user: {
        id: "user2",
        username: "proplayer",
        avatarUrl: undefined,
      },
      game: {
        id: "game2",
        title: "Valorant",
        slug: "valorant",
        coverUrl: "https://images.igdb.com/igdb/image/upload/t_cover_big/co49x5.jpg",
      },
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      platform: "PC",
    },
    {
      id: "3",
      type: "status_updated",
      user: {
        id: "user3",
        username: "casualgamer",
        avatarUrl: undefined,
      },
      game: {
        id: "game3",
        title: "Fortnite",
        slug: "fortnite",
        coverUrl: "https://images.igdb.com/igdb/image/upload/t_cover_big/co49x5.jpg",
      },
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
      platform: "PlayStation",
    },
  ];
}

export default async function SocialPage() {
  const user = await getCurrentUser();

  // Fetch user's games if logged in
  let userGames = [];
  if (user) {
    try {
      userGames = await getUserGames(user.id);
    } catch (error) {
      console.error("Error fetching user games:", error);
    }
  }

  // Fetch activity feed
  const activities = await getActivityFeed(user?.id);

  return (
    <div className="py-8">
      <h1 className="text-3xl font-semibold text-white mb-8">Social Feed</h1>
      <SocialFeed initialActivities={activities} userGames={userGames} />
    </div>
  );
}

