import Link from "next/link";
import { getGameBySlug, getCommunitiesByGame, getGuidesByGame, getPlayGuidesByGame, getSimilarGames } from "@/lib/games";
import { getPlayersByGame } from "@/lib/players";
import GamePageClient from "@/components/game/GamePageClient";

interface GamePageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Server Component - Fetches all data for the game page
 * Passes data to client component for interactive features
 */
export default async function GamePage({ params }: GamePageProps) {
  const { slug } = await params;
  const game = await getGameBySlug(slug);

  if (!game) {
    return (
      <div className="py-16 text-center">
        <h1 className="text-2xl font-semibold text-white mb-2">Game not found</h1>
        <p className="text-white/60">The game you're looking for doesn't exist.</p>
      </div>
    );
  }

  // Fetch all data in parallel
  const [communities, guides, playGuides, players, similarGames] = await Promise.all([
    getCommunitiesByGame(game.id),
    getGuidesByGame(game.id),
    getPlayGuidesByGame(game.id),
    getPlayersByGame(game.id),
    getSimilarGames(game.genres || [], game.id, 8),
  ]);

  return (
    <GamePageClient
      game={game}
      communities={communities}
      guides={guides}
      playGuides={playGuides}
      players={players}
      similarGames={similarGames}
    />
  );
}
