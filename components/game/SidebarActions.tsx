"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Game } from "@/types";
import { Zap, Users, Clock, Plus } from "lucide-react";
import AddToYourGamesButton from "@/components/AddToYourGamesButton";
import LobbyModal from "./LobbyModal";
import { getAvailablePlayersByGameClient } from "@/lib/players-client";
import { createClientSupabaseClient } from "@/lib/supabase-client";

interface SidebarActionsProps {
  game: Game;
  communities: any[];
  playersCount: number;
  initialIsInLibrary?: boolean;
  hasUser?: boolean;
  onEventCreateClick?: () => void;
  onLobbyClick?: () => void; // Callback to show toast
}

export default function SidebarActions({
  game,
  communities,
  playersCount,
  initialIsInLibrary = false,
  hasUser = false,
  onEventCreateClick,
  onLobbyClick,
}: SidebarActionsProps) {
  const [activePlayerCount, setActivePlayerCount] = useState(0);
  const [searchingPlayerCount, setSearchingPlayerCount] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(15 * 60); // 15 minutes in seconds

  const coverUrl = (game as Game & { cover_url?: string }).cover_url || game.coverUrl;
  const gameExtended = game as Game & {
    cover_url?: string;
    developer?: string | null;
    publisher?: string | null;
    release_date?: string | null;
    release_year?: number | null;
  };

  const developer = gameExtended.developer || "TBA";
  const publisher = gameExtended.publisher || "TBA";
  const releaseDate = gameExtended.release_date || gameExtended.release_year?.toString() || "Coming Soon";
  const platform = gameExtended.platforms?.[0] || "PC";

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

  // Fetch player counts (active and searching) and refresh every 15 minutes
  useEffect(() => {
    const loadPlayerCounts = async () => {
      try {
        const players = await getAvailablePlayersByGameClient(game.id);
        // Active = all players with status "online" or "looking"
        const activeCount = players.length;
        // Searching = only players with status "looking"
        const searchingCount = players.filter(p => p.status === "looking").length;
        setActivePlayerCount(activeCount);
        setSearchingPlayerCount(searchingCount);
      } catch (error) {
        console.error("Error loading player count:", error);
      }
    };

    // Load immediately
    loadPlayerCounts();

    // Refresh every 15 minutes (900000 ms)
    const interval = setInterval(loadPlayerCounts, 15 * 60 * 1000);

    return () => clearInterval(interval);
  }, [game.id]);

  // Reload player count when timer resets (reaches 0)
  useEffect(() => {
    if (timeRemaining === 15 * 60) {
      // Timer just reset, reload player count
      const loadPlayerCounts = async () => {
        try {
          const players = await getAvailablePlayersByGameClient(game.id);
          const activeCount = players.length;
          const searchingCount = players.filter(p => p.status === "looking").length;
          setActivePlayerCount(activeCount);
          setSearchingPlayerCount(searchingCount);
        } catch (error) {
          console.error("Error loading player count:", error);
        }
      };
      loadPlayerCounts();
    }
  }, [timeRemaining, game.id]);

  const handleLobbyClick = () => {
    if (onLobbyClick) {
      onLobbyClick();
    }
  };

  const handleEventCreateClick = () => {
    if (onEventCreateClick) {
      onEventCreateClick();
    }
  };

  const handleAddToLibrary = async () => {
    if (!hasUser) {
      // Redirect to login if not logged in
      window.location.href = "/login";
      return;
    }

    if (initialIsInLibrary) {
      // Already in library, do nothing or show message
      return;
    }

    // Use the same logic as AddToYourGamesButton
    const supabase = createClientSupabaseClient();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = "/login";
        return;
      }

      const { error } = await supabase.from("user_games").insert({
        user_id: user.id,
        game_id: game.id,
      });

      if (error) {
        console.error("Error adding game:", error);
        alert("Failed to add game. Please try again.");
      } else {
        // Refresh the page to update the UI
        window.location.reload();
      }
    } catch (error) {
      console.error("Error adding game:", error);
      alert("Failed to add game. Please try again.");
    }
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-4">
      {/* Game Cover */}
      {coverUrl && (
        <div className="relative aspect-[8/12] w-full rounded-lg overflow-hidden">
          <Image
            src={coverUrl}
            alt={game.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 30vw"
          />
        </div>
      )}

      {/* Player Count and Timer */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-white font-mono font-semibold">{formatCountdown(timeRemaining)}</span>
        <span className="text-white/40">|</span>
        <span className="text-white/60">Players searching</span>
        <span className="text-white font-semibold">{searchingPlayerCount}</span>
      </div>

      {/* Primary Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleLobbyClick}
          className="flex-1 h-[42px] px-4 bg-purple-600 hover:bg-purple-700 text-white rounded flex items-center justify-center gap-2 transition-colors shadow-lg font-medium"
          title="Start Matchmaking"
        >
          <Zap className="w-5 h-5 fill-current" />
          <span className="text-sm">Start Matchmaking</span>
        </button>
        <button
          onClick={handleAddToLibrary}
          className="h-[42px] w-[42px] bg-white/10 hover:bg-white/20 text-white rounded flex items-center justify-center transition-colors flex-shrink-0"
          title="Add to Your Games"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Game Details Section */}
      <div className="space-y-3 pt-4 border-t border-white/10">
        {/* Developer */}
        <div className="flex items-start justify-between">
          <span className="text-white/60 text-sm">Developer</span>
          <span className="text-white text-sm text-right">{developer}</span>
        </div>

        {/* Publisher */}
        <div className="flex items-start justify-between">
          <span className="text-white/60 text-sm">Publisher</span>
          <span className="text-white text-sm text-right">{publisher}</span>
        </div>

        {/* Release Date */}
        <div className="flex items-start justify-between">
          <span className="text-white/60 text-sm">Release Date</span>
          <span className="text-white text-sm text-right">{releaseDate}</span>
        </div>

        {/* Platform */}
        <div className="flex items-start justify-between">
          <span className="text-white/60 text-sm">Platform</span>
          <div className="flex items-center gap-1">
            {platform?.toLowerCase() === "pc" || platform === "Windows" ? (
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 480 512">
                <g>
                  <path d="M0.175 256l-0.175-156.037 192-26.072v182.109zM224 69.241l255.936-37.241v224h-255.936zM479.999 288l-0.063 224-255.936-36.008v-187.992zM192 471.918l-191.844-26.297-0.010-157.621h191.854z"></path>
                </g>
              </svg>
            ) : (
              <span className="text-white text-sm">{platform}</span>
            )}
          </div>
        </div>
      </div>

      {/* Lobby Modal */}
      <LobbyModal />
    </div>
  );
}

