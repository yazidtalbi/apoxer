import Link from "next/link";
import { Metadata } from "next";
import { getGameBySlug, getCommunitiesByGame, getGuidesByGame, getPlayGuidesByGame, getSimilarGames, getGamePlayGuide, getGameTraits } from "@/lib/games";
import { getPlayersByGame } from "@/lib/players";
import { getCurrentUser } from "@/lib/supabase-server";
import { isGameInUserLibrary } from "@/lib/user-games";
import GamePageClient from "@/components/game/GamePageClient";

interface GamePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: GamePageProps): Promise<Metadata> {
  const { slug } = await params;
  const game = await getGameBySlug(slug);

  if (!game) {
    return {
      title: "Game not found - Apoxer",
    };
  }

  return {
    title: `${game.title} - Apoxer`,
  };
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

  // Get current user and check if game is in library
  const user = await getCurrentUser();
  let isInLibrary = false;
  if (user) {
    try {
      isInLibrary = await isGameInUserLibrary(user.id, game.id);
    } catch (error) {
      console.error("Error checking if game is in library:", error);
    }
  }

  // Fetch all data in parallel
  const [communities, guides, playGuides, players, similarGames, gamePlayGuide, gameTraits] = await Promise.all([
    getCommunitiesByGame(game.id),
    getGuidesByGame(game.id),
    getPlayGuidesByGame(game.id),
    getPlayersByGame(game.id),
    getSimilarGames(game.genres || [], game.id, 8),
    getGamePlayGuide(game.id), // Fetch mini "How to Play Together" guide
    getGameTraits(game.id, 4).catch(() => []), // Fetch game traits, return empty array on error
  ]);

  return (
    <GamePageClient
      game={game}
      communities={communities}
      guides={guides}
      playGuides={playGuides}
      players={players}
      similarGames={similarGames}
      gamePlayGuide={gamePlayGuide}
      gameTraits={gameTraits}
      initialIsInLibrary={isInLibrary}
      hasUser={!!user}
    />
  );
}
