"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Game } from "@/types";
import { getAvailablePlayersByGameClient } from "@/lib/players-client";
import { Users, Clock, X, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useLobby } from "@/contexts/LobbyContext";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export default function SidebarLobby() {
  const { game, showLobby, setShowLobby, openLobbyModal, setIsLobbyModalOpen } = useLobby();
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
      }
    };

    loadPlayerCount();
    const interval = setInterval(loadPlayerCount, 15 * 60 * 1000);

    return () => clearInterval(interval);
  }, [showLobby, game]);

  // Reload player count when timer resets
  useEffect(() => {
    if (!showLobby || !game) return;
    if (timeRemaining === 15 * 60) {
      const loadPlayerCount = async () => {
        try {
          const players = await getAvailablePlayersByGameClient(game.id);
          setPlayerCount(players.length);
        } catch (error) {
          console.error("Error loading player count:", error);
        }
      };
      loadPlayerCount();
    }
  }, [timeRemaining, showLobby, game]);

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const totalSeconds = 15 * 60;
  const progressValue = ((totalSeconds - timeRemaining) / totalSeconds) * 100;

  if (!showLobby || !game) return null;

  return (
    <div className="w-full border-t border-white/10 pt-4 px-4 mt-3">
      {/* Title */}
      <h3 className="flex items-center gap-2 text-white/60 text-xs font-medium uppercase tracking-wider mb-3">
        <Loader2 className="w-3 h-3 animate-spin" style={{ animationDuration: '3s' }} />
        Searching..
      </h3>

      {/* Card Container */}
      <div className="w-full bg-[#0E0E0E] border border-white/10 rounded-lg p-3">
        {/* Compact View */}
        <div className="w-full">
        {/* Progress Bar */}
        <div className="h-1 w-full mb-4 rounded-full">
          <Progress value={progressValue} className="h-full rounded-full bg-white/5" />
        </div>

        <div className="flex items-center gap-3">
          {/* Game Cover */}
          {coverUrl && (
            <div className="relative w-12 h-16 rounded overflow-hidden flex-shrink-0">
              <Image
                src={coverUrl}
                alt={game.title}
                fill
                className="object-cover"
                sizes="48px"
              />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Game Title */}
            <p className="text-white font-medium text-sm mb-2 line-clamp-2 text-left">
              {game.title}
            </p>

            {/* Player Count & Timer */}
            <div className="flex items-center gap-3 text-xs text-white/60">
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{playerCount} {playerCount === 1 ? "player" : "players"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="font-mono">{formatCountdown(timeRemaining)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons - Directly in navbar */}
        <div className="flex gap-2 mt-4">
          <Button
            onClick={openLobbyModal}
            className="flex-1 bg-white/10 hover:bg-white/20 text-white text-sm h-8"
          >
            Join Lobby
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowLobby(false)}
            className="px-3 border-white/10 text-white/60 hover:text-white hover:bg-white/10 h-8"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
      </div>

      {/* Popover - Commented out */}
      {/* <Popover>
        <PopoverTrigger asChild>
          <button className="w-full cursor-pointer hover:bg-white/5 transition-colors rounded-lg p-2 -m-2">
            ...
          </button>
        </PopoverTrigger>
        <PopoverContent 
          side="right" 
          align="start"
          className="w-80 bg-[#1A1A1A] border-white/10 p-0"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="p-4">
            ...
          </div>
        </PopoverContent>
      </Popover> */}
    </div>
  );
}

