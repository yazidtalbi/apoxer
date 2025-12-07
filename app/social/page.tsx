import { getCurrentUser } from "@/lib/supabase-server";
import { getUserGames } from "@/lib/user-games";
import { getFollowingForUsername } from "@/lib/profile";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import SocialFeed from "@/components/social/SocialFeed";

interface Activity {
  id: string;
  type: "game_added" | "matchmaking_started" | "event_participated";
  user: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string | null;
  };
  game?: {
    id: string;
    title: string;
    slug: string;
    coverUrl: string | null;
  };
  event?: {
    id: string;
    title?: string;
    game: {
      id: string;
      title: string;
      slug: string;
    };
  };
  timestamp: string;
  platform?: string;
}

/**
 * Fetches activity feed for friends/following
 * Returns dummy data with activities grouped by type
 */
async function getActivityFeed(userId?: string): Promise<Activity[]> {
  // TODO: Replace with actual database queries
  // Query should fetch:
  // - Friends/following who added games (from player_games table)
  // - Friends/following who started matchmaking (from players table where status = 'looking')
  // - Friends/following who joined events (from event_participants table)
  // Order by timestamp descending

  const now = Date.now();
  
  // Create activities with different timestamps to group by day
  return [
    {
      id: "1",
      type: "event_participated",
      user: {
        id: "user1",
        username: "gamer123",
        displayName: "Gamer Pro",
        avatarUrl: null,
      },
      event: {
        id: "event1",
        game: {
          id: "game1",
          title: "Call of Duty: Modern Warfare",
          slug: "call-of-duty-modern-warfare",
        },
      },
      timestamp: new Date(now - 30 * 60 * 1000).toISOString(), // 30 minutes ago (today)
    },
    {
      id: "2",
      type: "matchmaking_started",
      user: {
        id: "user2",
        username: "proplayer",
        displayName: "Pro Player",
        avatarUrl: null,
      },
      game: {
        id: "game2",
        title: "Valorant",
        slug: "valorant",
        coverUrl: null,
      },
      timestamp: new Date(now - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago (today)
      platform: "PC",
    },
    {
      id: "3",
      type: "game_added",
      user: {
        id: "user3",
        username: "casualgamer",
        displayName: "Casual Gamer",
        avatarUrl: null,
      },
      game: {
        id: "game3",
        title: "Fortnite",
        slug: "fortnite",
        coverUrl: null,
      },
      timestamp: new Date(now - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago (today)
    },
    {
      id: "4",
      type: "event_participated",
      user: {
        id: "user4",
        username: "streamer",
        displayName: "Streamer Pro",
        avatarUrl: null,
      },
      event: {
        id: "event2",
        game: {
          id: "game4",
          title: "Apex Legends",
          slug: "apex-legends",
        },
      },
      timestamp: new Date(now - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
    },
    {
      id: "5",
      type: "matchmaking_started",
      user: {
        id: "user5",
        username: "tournament",
        displayName: "Tournament Player",
        avatarUrl: null,
      },
      game: {
        id: "game5",
        title: "Rocket League",
        slug: "rocket-league",
        coverUrl: null,
      },
      timestamp: new Date(now - 26 * 60 * 60 * 1000).toISOString(), // Yesterday
      platform: "PlayStation",
    },
    {
      id: "6",
      type: "game_added",
      user: {
        id: "user6",
        username: "newbie",
        displayName: "New Player",
        avatarUrl: null,
      },
      game: {
        id: "game6",
        title: "Overwatch 2",
        slug: "overwatch-2",
        coverUrl: null,
      },
      timestamp: new Date(now - 48 * 60 * 60 * 1000).toISOString(), // 2 days ago
    },
  ];
}

export default async function SocialPage() {
  const user = await getCurrentUser();

  // Fetch user's games if logged in
  let userGames = [];
  let following: any[] = [];
  
  if (user) {
    try {
      userGames = await getUserGames(user.id);
      
      // Get current user's player profile to fetch following
      const supabase = await createServerSupabaseClient();
      const { data: playerData } = await supabase
        .from("players")
        .select("id, username")
        .eq("user_id", user.id)
        .single();
      
      if (playerData) {
        following = await getFollowingForUsername(playerData.username);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  // Fetch activity feed
  const activities = await getActivityFeed(user?.id);

  return (
    <div className="min-h-screen">
      <div className="py-8">
        <h1 className="text-3xl font-semibold text-white mb-8">Social Feed</h1>
        <SocialFeed initialActivities={activities} userGames={userGames} following={following} />
      </div>
    </div>
  );
}

