"use client";

import { useState } from "react";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLobby } from "@/contexts/LobbyContext";
import { Game } from "@/types";

interface QuickMatchmakerProps {
  userGames: Game[];
}

const PLATFORMS = ["PC", "PlayStation", "Xbox", "Nintendo Switch", "Mobile", "Cross-platform"];

export default function QuickMatchmaker({ userGames }: QuickMatchmakerProps) {
  const { setGame, setShowLobby } = useLobby();
  const [selectedGameId, setSelectedGameId] = useState<string>("");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("");

  const selectedGame = userGames.find((g) => g.id === selectedGameId);

  const handleLaunch = () => {
    if (!selectedGame) return;

    // Set the game in the lobby context
    setGame(selectedGame);
    setShowLobby(true);

    // Scroll to top to see the sidebar lobby
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isDisabled = !selectedGameId || !selectedPlatform;

  return (
    <div className="space-y-4">
      {/* Game Select */}
      <div>
        <label htmlFor="matchmaker-game" className="block text-white/80 text-sm mb-2">
          Select Game
        </label>
        {userGames.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white/60 text-sm">
            No games in your library. Add games to start matchmaking!
          </div>
        ) : (
          <select
            id="matchmaker-game"
            value={selectedGameId}
            onChange={(e) => setSelectedGameId(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/20 appearance-none cursor-pointer"
          >
            <option value="" className="bg-[#0E0E0E]">
              Choose a game...
            </option>
            {userGames.map((game) => (
              <option key={game.id} value={game.id} className="bg-[#0E0E0E]">
                {game.title}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Platform Select */}
      <div>
        <label htmlFor="matchmaker-platform" className="block text-white/80 text-sm mb-2">
          Platform
        </label>
        <select
          id="matchmaker-platform"
          value={selectedPlatform}
          onChange={(e) => setSelectedPlatform(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/20 appearance-none cursor-pointer"
        >
          <option value="" className="bg-[#0E0E0E]">
            Choose a platform...
          </option>
          {PLATFORMS.map((platform) => (
            <option key={platform} value={platform} className="bg-[#0E0E0E]">
              {platform}
            </option>
          ))}
        </select>
      </div>

      {/* Launch Button */}
      <Button
        onClick={handleLaunch}
        disabled={isDisabled}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium h-11 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Zap className="w-4 h-4 mr-2 fill-current" />
        Start Matchmaking
      </Button>

      {selectedGame && (
        <p className="text-white/60 text-xs text-center">
          Matchmaking will appear in the sidebar
        </p>
      )}
    </div>
  );
}

