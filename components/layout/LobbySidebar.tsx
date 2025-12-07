"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Game } from "@/types";
import { getAvailablePlayersByGameClient } from "@/lib/players-client";
import { Users, Clock, X, Loader2, ChevronRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useLobby } from "@/contexts/LobbyContext";

interface DummyPlayer {
  id: string;
  username: string;
  avatarUrl?: string;
  status: "online" | "away" | "in-game";
}

// Dummy players for lobby simulation
const DUMMY_PLAYERS: DummyPlayer[] = [
  {
    id: "1",
    username: "ProGamer123",
    avatarUrl: undefined,
    status: "online",
  },
  {
    id: "2",
    username: "SniperElite",
    avatarUrl: undefined,
    status: "in-game",
  },
  {
    id: "3",
    username: "TeamPlayer",
    avatarUrl: undefined,
    status: "online",
  },
  {
    id: "4",
    username: "QuickShot",
    avatarUrl: undefined,
    status: "away",
  },
];

interface LobbySidebarProps {
  onCollapse: () => void;
}

export default function LobbySidebar({ onCollapse }: LobbySidebarProps) {
  const { game, showLobby, setShowLobby, openLobbyModal } = useLobby();
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
        // Use dummy count if API fails
        setPlayerCount(DUMMY_PLAYERS.length);
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
          setPlayerCount(DUMMY_PLAYERS.length);
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

  const getStatusColor = (status: DummyPlayer["status"]) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "in-game":
        return "bg-blue-500";
      case "away":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="w-full h-full flex flex-col relative">
      {/* Collapse Button */}
      <button
        onClick={onCollapse}
        className="absolute -left-3 top-6 z-10 w-6 h-6 rounded-full bg-[#121212] border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
        title="Collapse lobby"
      >
        <ChevronRight className="w-4 h-4 text-white/60" />
      </button>

      {/* Title */}
      <div className="px-4 pt-4 pb-3 border-b border-white/10">
        <h3 className="flex items-center gap-2 text-white/60 text-xs font-medium uppercase tracking-wider mb-3">
          <Loader2 className="w-3 h-3 animate-spin" style={{ animationDuration: '3s' }} />
          Searching..
        </h3>

        {/* Game Info Card */}
        <div className="w-full bg-[#0E0E0E] border border-white/10 rounded-lg p-3">
          {/* Progress Bar */}
          <div className="h-1 w-full mb-4 rounded-full">
            <Progress value={progressValue} className="h-full rounded-full bg-white/5" />
          </div>

          <div className="flex items-center gap-3 mb-3">
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

          {/* Action Buttons */}
          <div className="flex gap-2">
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

      {/* Players List */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <h4 className="text-white/60 text-xs font-medium uppercase tracking-wider mb-3">
          Players in Lobby
        </h4>
        <div className="space-y-3">
          {DUMMY_PLAYERS.map((player) => (
            <div
              key={player.id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                {player.avatarUrl ? (
                  <div className="relative w-10 h-10 rounded-full overflow-hidden">
                    <Image
                      src={player.avatarUrl}
                      alt={player.username}
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="text-white text-xs font-semibold">
                      {player.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                {/* Status Indicator */}
                <div
                  className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#0E0E0E] ${getStatusColor(
                    player.status
                  )}`}
                />
              </div>

              {/* Player Info */}
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{player.username}</p>
                <p className="text-white/40 text-xs capitalize">{player.status.replace("-", " ")}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

