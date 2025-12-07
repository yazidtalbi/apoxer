"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Game } from "@/types";
import { getAvailablePlayersByGameClient } from "@/lib/players-client";
import { Users, Clock, X, UserPlus, Share2, MoreHorizontal } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

interface LobbyToastProps {
  game: Game;
  onClose: () => void;
  onClick: () => void;
}

export default function LobbyToast({ game, onClose, onClick }: LobbyToastProps) {
  const [playerCount, setPlayerCount] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(15 * 60); // 15 minutes in seconds
  const coverUrl = (game as Game & { cover_url?: string }).cover_url || game.coverUrl;

  // Countdown timer that resets every 15 minutes
  useEffect(() => {
    // Set initial time to 15 minutes
    setTimeRemaining(15 * 60);

    // Update timer every second
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Reset to 15 minutes when it reaches 0
          return 15 * 60;
        }
        return prev - 1;
      });
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, []);

  // Fetch player count and refresh every 15 minutes (when timer resets)
  useEffect(() => {
    const loadPlayerCount = async () => {
      try {
        const players = await getAvailablePlayersByGameClient(game.id);
        setPlayerCount(players.length);
      } catch (error) {
        console.error("Error loading player count:", error);
      }
    };

    // Load immediately
    loadPlayerCount();

    // Refresh every 15 minutes (900000 ms)
    const interval = setInterval(loadPlayerCount, 15 * 60 * 1000);

    return () => clearInterval(interval);
  }, [game.id]);

  // Reload player count when timer resets (reaches 0)
  useEffect(() => {
    if (timeRemaining === 15 * 60) {
      // Timer just reset, reload player count
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
  }, [timeRemaining, game.id]);

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Calculate progress percentage (0-100)
  const totalSeconds = 15 * 60; // 15 minutes
  const progressValue = ((totalSeconds - timeRemaining) / totalSeconds) * 100;

  const handleInvite = (e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implement invite functionality
    console.log("Invite clicked");
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implement share functionality
    if (navigator.share) {
      navigator.share({
        title: `Join me in ${game.title}`,
        text: `Looking for players in ${game.title}`,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 sm:left-16 right-0 z-40 bg-[#181818] border-t border-white/10">
      {/* Progress Bar */}
      <div className="h-1 w-full">
        <Progress value={progressValue} className="h-full rounded-none bg-[#0E0E0E]" />
      </div>

      {/* Main Bar Content */}
      <div
        onClick={onClick}
        className="h-20 flex items-center px-4 sm:px-6 cursor-pointer hover:bg-[#1A1A1A] transition-colors"
      >
        <div className="flex items-center gap-4 w-full max-w-[1400px] mx-auto">
          {/* Game Cover */}
          {coverUrl && (
            <div className="relative w-14 h-14 rounded overflow-hidden flex-shrink-0">
              <Image
                src={coverUrl}
                alt={game.title}
                fill
                className="object-cover"
                sizes="56px"
              />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium text-sm truncate mb-1">{game.title}</p>
            <div className="flex items-center gap-4 text-xs text-white/60">
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>{playerCount} {playerCount === 1 ? "player" : "players"}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span className="font-mono">{formatCountdown(timeRemaining)}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/10"
              onClick={handleInvite}
              title="Invite players"
            >
              <UserPlus className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/10"
              onClick={handleShare}
              title="Share lobby"
            >
              <Share2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/10"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              title="Close"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

