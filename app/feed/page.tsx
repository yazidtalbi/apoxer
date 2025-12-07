import { getCurrentUser } from "@/lib/supabase-server";
import { getSocialFeedForPlayer } from "@/lib/socialFeed";
import { getOrCreatePlayerProfile } from "@/lib/player-profile";
import { redirect } from "next/navigation";
import SocialFeedList from "@/components/social/SocialFeedList";

export default async function FeedPage() {
  // Get current authenticated user
  const user = await getCurrentUser();

  // Redirect to login if not authenticated
  if (!user) {
    redirect("/login");
  }

  // Get or create player profile
  const playerId = await getOrCreatePlayerProfile();

  if (!playerId) {
    return (
      <div className="min-h-screen py-16">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-[#0E0E0E] border border-white/10 rounded-lg p-8 text-center">
            <h1 className="text-2xl font-semibold text-white mb-4">
              Error Creating Profile
            </h1>
            <p className="text-white/60 mb-6">
              There was an error creating your profile. Please try again or contact support.
            </p>
            <div className="flex gap-4 justify-center">
              <a
                href="/profile"
                className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Go to Profile
              </a>
              <a
                href="/"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Browse Games
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fetch social feed
  const feedPosts = await getSocialFeedForPlayer(playerId, 20);

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-semibold text-white mb-8">Activity Feed</h1>
        <SocialFeedList posts={feedPosts} currentPlayerId={playerId} />
      </div>
    </div>
  );
}

