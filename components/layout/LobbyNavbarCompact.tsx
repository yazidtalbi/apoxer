"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Game } from "@/types";
import { getAvailablePlayersByGameClient } from "@/lib/players-client";
import { Users, Clock, ChevronLeft } from "lucide-react";
import { useLobby } from "@/contexts/LobbyContext";

interface LobbyNavbarCompactProps {
  onExpand: () => void;
}

export default function LobbyNavbarCompact({ onExpand }: LobbyNavbarCompactProps) {
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

  // Fetch player count
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
    const interval = setInterval(loadPlayerCount, 30000);

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
      className="flex items-center gap-3 px-3 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors group focus:outline-none focus:ring-2 focus:ring-white/20 active:bg-white/15"
      aria-label={`Expand ${game.title} lobby. ${playerCount} players, ${formatCountdown(timeRemaining)} remaining`}
    >
      {/* Game Cover */}
      {coverUrl && (
        <div className="relative w-10 h-12 rounded overflow-hidden flex-shrink-0 shadow-md">
          <Image
            src={coverUrl}
            alt=""
            fill
            className="object-cover object-top"
            sizes="40px"
            aria-hidden="true"
          />
        </div>
      )}

      {/* Game Info */}
      <div className="flex-1 min-w-0 text-left">
        <p className="text-white text-sm font-medium truncate">{game.title}</p>
        <div className="flex items-center gap-3 text-xs text-white/60 mt-0.5">
          <div className="flex items-center gap-1.5" aria-label={`${playerCount} players`}>
            <Users className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
            <span className="tabular-nums">{playerCount}</span>
          </div>
          <div className="flex items-center gap-1.5" aria-label={`${formatCountdown(timeRemaining)} remaining`}>
            <Clock className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
            <span className="font-mono tabular-nums">{formatCountdown(timeRemaining)}</span>
          </div>
        </div>
      </div>

      {/* Expand Icon */}
      <ChevronLeft className="w-4 h-4 text-white/40 group-hover:text-white/60 transition-colors flex-shrink-0" aria-hidden="true" />
    </button>
  );
}
