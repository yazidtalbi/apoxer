"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Game } from "@/types";
import { getAvailablePlayersByGameClient } from "@/lib/players-client";
import { Users, Clock } from "lucide-react";
import { useLobby } from "@/contexts/LobbyContext";

interface LobbySidebarCompactProps {
  onExpand: () => void;
}

export default function LobbySidebarCompact({ onExpand }: LobbySidebarCompactProps) {
  const { game, showLobby } = useLobby();
  const [playerCount, setPlayerCount] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(15 * 60);

  const coverUrl = game ? ((game as Game & { cover_url?: string }).cover_url || game.coverUrl) : null;

  // Countdown timer
  useEffect(() => {
    if (!showLobby || !game) return;

    setTimeRemaining(15 * 60);

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          return 15 * 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showLobby, game]);

  // Fetch player count (optimized: every 30 seconds)
  useEffect(() => {
    if (!showLobby || !game) return;

    const loadPlayerCount = async () => {
      try {
        const players = await getAvailablePlayersByGameClient(game.id);
        setPlayerCount(players.length);
      } catch (error) {
        console.error("Error loading player count:", error);
      }
    };

    loadPlayerCount();
    const interval = setInterval(loadPlayerCount, 30000); // 30 seconds for compact view

    return () => clearInterval(interval);
  }, [showLobby, game]);

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (!showLobby || !game) return null;

  return (
    <button
      onClick={onExpand}
      className="w-full px-3 py-4 space-y-3 hover:bg-white/5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white/20 active:bg-white/10"
      title={`Expand ${game.title} lobby - ${playerCount} players, ${formatCountdown(timeRemaining)} remaining`}
      aria-label={`Active matchmaking: ${game.title}. ${playerCount} players available. Time remaining: ${formatCountdown(timeRemaining)}. Click to expand.`}
    >
      {/* Game Cover Image */}
      {coverUrl && (
        <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden shadow-md">
          <Image
            src={coverUrl}
            alt={`${game.title} cover`}
            fill
            className="object-cover"
            sizes="64px"
          />
        </div>
      )}

      {/* Stats */}
      <div className="flex flex-col gap-2">
        {/* Player Count */}
        <div className="flex items-center justify-center gap-1.5 text-white/70">
          <Users className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
          <span className="text-xs font-medium tabular-nums">{playerCount}</span>
        </div>

        {/* Timer */}
        <div className="flex items-center justify-center gap-1.5 text-white/70">
          <Clock className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
          <span className="text-xs font-mono tabular-nums">{formatCountdown(timeRemaining)}</span>
        </div>
      </div>
    </button>
  );
}
