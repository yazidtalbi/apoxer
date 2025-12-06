import { getGames } from "@/lib/games";
import GameCard from "@/components/GameCard";
import SearchBar from "@/components/SearchBar";
import CommunityCard from "@/components/CommunityCard";
import { Community } from "@/types";

export default async function Home() {
  const allGames = await getGames();
  const trendingGames = allGames.slice(0, 8);

  // Placeholder communities - replace with actual data later
  const sampleCommunities: Community[] = [
    {
      id: "1",
      gameId: allGames[0]?.id || "",
      name: "Gaming Hub",
      inviteUrl: "https://discord.gg/example",
      category: "General",
      language: "English",
      onlineCount: 1247,
      createdAt: new Date().toISOString(),
    },
    {
      id: "2",
      gameId: allGames[0]?.id || "",
      name: "Pro Players",
      inviteUrl: "https://discord.gg/example2",
      category: "Competitive",
      language: "English",
      onlineCount: 892,
      createdAt: new Date().toISOString(),
    },
    {
      id: "3",
      gameId: allGames[0]?.id || "",
      name: "Casual Gaming",
      inviteUrl: "https://discord.gg/example3",
      category: "Casual",
      language: "English",
      onlineCount: 456,
      createdAt: new Date().toISOString(),
    },
  ];

  return (
    <div className="py-8">
      {/* Search Bar */}
      <div className="mb-12">
        <SearchBar />
      </div>

      {/* Your Games Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Your Games</h2>
        <div className="bg-[#0E0E0E] border border-white/10 rounded p-6 text-center">
          <p className="text-white/60 text-sm">Log in to see your games</p>
        </div>
      </section>

      {/* Trending Games Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Trending Games</h2>
        {trendingGames.length === 0 ? (
          <p className="text-white/60 text-sm">No games available.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {trendingGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        )}
      </section>

      {/* Active Communities Now Section */}
      <section>
        <h2 className="text-2xl font-semibold text-white mb-4">Active Communities Now</h2>
        {sampleCommunities.length === 0 ? (
          <p className="text-white/60 text-sm">No active communities.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sampleCommunities.map((community) => (
              <CommunityCard key={community.id} community={community} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
