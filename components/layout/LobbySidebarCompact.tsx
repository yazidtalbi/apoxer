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

  // Countdown timer that resets every 15 minutes
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

  // Fetch player count
  useEffect(() => {
    if (!showLobby || !game) return;

    const loadPlayerCount = async () => {
      try {
        const players = await getAvailablePlayersByGameClient(game.id);
        setPlayerCount(players.length);
      } catch (error) {
        console.error("Error loading player count:", error);
        setPlayerCount(4); // Default to 4 for dummy players
      }
    };

    loadPlayerCount();
    const interval = setInterval(loadPlayerCount, 15 * 60 * 1000);

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
      className="w-full px-3 py-4 space-y-3 hover:bg-white/5 rounded-lg transition-colors"
      title="Click to expand lobby"
    >
      {/* Game Cover Image */}
      {coverUrl && (
        <div className="relative w-full aspect-[3/4] rounded overflow-hidden">
          <Image
            src={coverUrl}
            alt={game.title}
            fill
            className="object-cover"
            sizes="64px"
          />
        </div>
      )}

      {/* Player Count */}
      <div className="flex flex-col items-center gap-1">
        <div className="flex items-center gap-1.5 text-white/60">
          <Users className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="text-xs">{playerCount}</span>
        </div>
      </div>

      {/* Timer */}
      <div className="flex flex-col items-center gap-1">
        <div className="flex items-center gap-1.5 text-white/60">
          <Clock className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="text-xs font-mono">{formatCountdown(timeRemaining)}</span>
        </div>
      </div>
    </button>
  );
}

