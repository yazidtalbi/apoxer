"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import GameCard from "@/components/GameCard";
import { Game } from "@/types";
import Link from "next/link";

interface UserGamesSectionProps {
  games: Game[];
}

export default function UserGamesSection({ games }: UserGamesSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredGames = useMemo(() => {
    if (!searchQuery.trim()) return games;
    const query = searchQuery.toLowerCase();
    return games.filter(
      (game) =>
        game.title.toLowerCase().includes(query) ||
        game.genres?.some((genre) => genre.toLowerCase().includes(query)) ||
        game.tags?.some((tag) => tag.toLowerCase().includes(query))
    );
  }, [games, searchQuery]);

  if (games.length === 0) {
    return (
      <div className="bg-[#0E0E0E] border border-white/10 rounded-lg p-8 text-center">
        <p className="text-white/60 text-sm mb-4">You haven't added any games yet.</p>
        <Link
          href="/games"
          className="inline-block bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Browse Games
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search your games..."
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 pl-10 text-white placeholder-white/40 focus:outline-none focus:border-white/20"
        />
      </div>

      {/* Games Grid */}
      {filteredGames.length === 0 ? (
        <div className="bg-[#0E0E0E] border border-white/10 rounded-lg p-6 text-center">
          <p className="text-white/60 text-sm">No games found matching "{searchQuery}"</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredGames.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      )}

      {/* Quick Search Button */}
      {searchQuery && (
        <div className="text-center pt-2">
          <Link
            href={`/games?search=${encodeURIComponent(searchQuery)}`}
            className="inline-block text-white/60 hover:text-white text-sm font-medium transition-colors"
          >
            View all results for "{searchQuery}" →
          </Link>
        </div>
      )}
    </div>
  );
}

