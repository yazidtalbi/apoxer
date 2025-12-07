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
  horizontal?: boolean; // If true, render as horizontal action row
}

export default function SidebarActions({
  game,
  communities,
  playersCount,
  initialIsInLibrary = false,
  hasUser = false,
  onEventCreateClick,
  onLobbyClick,
  horizontal = false,
}: SidebarActionsProps) {
  const [activePlayerCount, setActivePlayerCount] = useState(0);
  const [searchingPlayerCount, setSearchingPlayerCount] = useState(0);
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

  // Horizontal layout (Spotify-style action row)
  if (horizontal) {
    return (
      <>
        {/* Primary Action Button - Large with text */}
        <button
          onClick={handleLobbyClick}
          className="h-14 px-6 bg-purple-600 hover:bg-purple-700 text-white rounded-full flex items-center justify-center gap-2.5 transition-all hover:scale-105 shadow-lg font-semibold text-sm"
          title="Start Matchmaking"
        >
          <Zap className="w-5 h-5 fill-current" />
          <span>Start Matchmaking</span>
        </button>
        
        {/* Secondary Actions */}
        <button
          onClick={handleAddToLibrary}
          className="h-10 w-10 bg-transparent hover:bg-white/10 text-white rounded-full flex items-center justify-center transition-colors border border-white/20 hover:border-white/40"
          title="Add to Your Games"
        >
          <Plus className="w-5 h-5" />
        </button>

        {/* Lobby Modal */}
        <LobbyModal />
      </>
    );
  }

  // Vertical sidebar layout (original)
  return (
    <div className="space-y-5">
      {/* Game Cover */}
      {coverUrl && (
        <div className="relative aspect-[8/12] w-full rounded-lg overflow-hidden">
          <Image
            src={coverUrl}
            alt={game.title}
            fill
            className="object-cover object-top"
            sizes="320px"
          />
        </div>
      )}

      {/* Lobby Modal */}
      <LobbyModal />
    </div>
  );
}
