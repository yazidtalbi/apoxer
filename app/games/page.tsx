import { getGames } from "@/lib/games";
import GameCard from "@/components/GameCard";
import GameFilters from "@/components/GameFilters";
import GamesListClient from "@/components/GamesListClient";

interface GamesPageProps {
  searchParams: Promise<{
    q?: string;
    genre?: string;
    platform?: string;
  }>;
}

const INITIAL_LIMIT = 50; // Load first 50 games

export default async function GamesPage({ searchParams }: GamesPageProps) {
  const params = await searchParams;
  
  // Fetch initial batch of games
  const initialGames = await getGames({
    q: params.q,
    genre: params.genre,
    platform: params.platform,
    limit: INITIAL_LIMIT,
    offset: 0,
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

      <GamesListClient
        initialGames={initialGames}
        filters={{
          q: params.q,
          genre: params.genre,
          platform: params.platform,
        }}
        initialLimit={INITIAL_LIMIT}
      />
    </div>
  );
}
