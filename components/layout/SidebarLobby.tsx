"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Game } from "@/types";
import { getAvailablePlayersByGameClient } from "@/lib/players-client";
import { Users, Clock, X, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useLobby } from "@/contexts/LobbyContext";

export default function SidebarLobby() {
  const { game, showLobby, setShowLobby, openLobbyModal } = useLobby();
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
  const loadPlayerCount = useCallback(async () => {
    if (!showLobby || !game) return;

    try {
      const players = await getAvailablePlayersByGameClient(game.id);
      setPlayerCount(players.length);
    } catch (error) {
      console.error("Error loading player count:", error);
    }
  }, [showLobby, game]);

  useEffect(() => {
    loadPlayerCount();
    const interval = setInterval(loadPlayerCount, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, [loadPlayerCount]);

  // Reload player count when timer resets
  useEffect(() => {
    if (!showLobby || !game) return;
    if (timeRemaining === 15 * 60) {
      loadPlayerCount();
    }
  }, [timeRemaining, showLobby, game, loadPlayerCount]);

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const totalSeconds = 15 * 60;
  const progressValue = ((totalSeconds - timeRemaining) / totalSeconds) * 100;

  if (!showLobby || !game) return null;

  return (
    <div className="w-full border-t border-white/10 pt-4 px-4 mt-3" role="region" aria-label="Active matchmaking lobby">
      {/* Status Header */}
      <h3 className="flex items-center gap-2 text-white/60 text-xs font-medium uppercase tracking-wider mb-3">
        <Loader2 className="w-3 h-3 animate-spin" style={{ animationDuration: '2s' }} aria-hidden="true" />
        <span>Searching...</span>
      </h3>

      {/* Card Container */}
      <div className="w-full bg-[#0E0E0E] border border-white/10 rounded-lg p-3 hover:border-white/15 transition-colors">
        {/* Progress Bar */}
        <div 
          className="h-1 w-full mb-4 rounded-full overflow-hidden" 
          role="progressbar" 
          aria-valuenow={progressValue} 
          aria-valuemin={0} 
          aria-valuemax={100}
          aria-label={`Matchmaking progress: ${Math.round(progressValue)}%`}
        >
          <Progress value={progressValue} className="h-full rounded-full bg-white/5" />
        </div>

        <div className="flex items-center gap-3 mb-4">
          {/* Game Cover */}
          {coverUrl && (
            <div className="relative w-12 h-16 rounded overflow-hidden flex-shrink-0 shadow-md">
              <Image
                src={coverUrl}
                alt={`${game.title} cover`}
                fill
                className="object-cover object-top"
                sizes="48px"
              />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Game Title */}
            <p className="text-white font-medium text-sm mb-2 line-clamp-2 leading-tight">
              {game.title}
            </p>

            {/* Player Count & Timer */}
            <div className="flex items-center gap-3 text-xs text-white/60">
              <div className="flex items-center gap-1.5" aria-label={`${playerCount} players available`}>
                <Users className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
                <span className="tabular-nums">{playerCount}</span>
                <span className="hidden sm:inline">{playerCount === 1 ? "player" : "players"}</span>
              </div>
              <div className="flex items-center gap-1.5" aria-label={`Time remaining: ${formatCountdown(timeRemaining)}`}>
                <Clock className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
                <span className="font-mono tabular-nums">{formatCountdown(timeRemaining)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={openLobbyModal}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-sm h-9 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-[#0E0E0E]"
            aria-label="View available players and join lobby"
          >
            <Users className="w-4 h-4 mr-2" aria-hidden="true" />
            Join Lobby
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowLobby(false)}
            className="px-3 border-white/10 text-white/60 hover:text-white hover:bg-white/10 h-9 transition-colors focus:outline-none focus:ring-2 focus:ring-white/20"
            aria-label="Stop matchmaking"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  );
}
