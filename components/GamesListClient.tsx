"use client";

import { useState, useEffect } from "react";
import { Game } from "@/types";
import GameCard from "./GameCard";

interface GamesListClientProps {
  initialGames: Game[];
  filters: {
    q?: string;
    genre?: string;
    platform?: string;
  };
  initialLimit: number;
}

export default function GamesListClient({
  initialGames,
  filters,
  initialLimit,
}: GamesListClientProps) {
  const [games, setGames] = useState<Game[]>(initialGames);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialGames.length === initialLimit);
  const [offset, setOffset] = useState(initialLimit);

  // Reset when filters change (detected by initialGames changing)
  useEffect(() => {
    setGames(initialGames);
    setHasMore(initialGames.length === initialLimit);
    setOffset(initialLimit);
    setLoading(false);
  }, [initialGames, initialLimit]);

  const loadMore = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/games?${new URLSearchParams({
          ...(filters.q && { q: filters.q }),
          ...(filters.genre && { genre: filters.genre }),
          ...(filters.platform && { platform: filters.platform }),
          limit: initialLimit.toString(),
          offset: offset.toString(),
        })}`
      );

      if (!response.ok) {
        throw new Error("Failed to load more games");
      }

      const newGames: Game[] = await response.json();
      
      if (newGames.length === 0) {
        setHasMore(false);
      } else {
        setGames((prev) => [...prev, ...newGames]);
        setOffset((prev) => prev + newGames.length);
        // If we got fewer games than requested, there are no more
        if (newGames.length < initialLimit) {
          setHasMore(false);
        }
      }
    } catch (error) {
      console.error("Error loading more games:", error);
    } finally {
      setLoading(false);
    }
  };

  if (games.length === 0) {
    return (
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
          {filters.q || filters.genre || filters.platform
            ? "Try adjusting your search or filters."
            : "There are no games in the directory yet. Check back soon!"}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {games.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center mt-8">
          <button
            onClick={loadMore}
            disabled={loading}
            className="bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#0E0E0E]"
          >
            {loading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </>
  );
}

