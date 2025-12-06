import { getGames } from "@/lib/games";
import GameCard from "@/components/GameCard";
import GameFilters from "@/components/GameFilters";

interface GamesPageProps {
  searchParams: Promise<{
    q?: string;
    genre?: string;
    platform?: string;
  }>;
}

export default async function GamesPage({ searchParams }: GamesPageProps) {
  const params = await searchParams;
  const games = await getGames({
    q: params.q,
    genre: params.genre,
    platform: params.platform,
  });

  return (
    <div className="py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-white mb-2">Games Directory</h1>
        <p className="text-white/60">
          Browse our collection of games
        </p>
      </div>

      <GameFilters />

      {games.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <svg
            className="w-16 h-16 text-white/20 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
          <h2 className="text-xl font-medium text-white mb-2">No games found</h2>
          <p className="text-white/60 max-w-md">
            {params.q || params.genre || params.platform
              ? "Try adjusting your search or filters."
              : "There are no games in the directory yet. Check back soon!"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      )}
    </div>
  );
}

