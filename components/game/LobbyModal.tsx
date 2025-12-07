"use client";

import { useState, useEffect } from "react";
import { Player } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { getAvailablePlayersByGameClient } from "@/lib/players-client";
import { Users } from "lucide-react";
import { useLobby } from "@/contexts/LobbyContext";

export default function LobbyModal() {
  const { game, isLobbyModalOpen, setIsLobbyModalOpen } = useLobby();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLobbyModalOpen && game) {
      loadPlayers();
    }
  }, [isLobbyModalOpen, game?.id]);

  const loadPlayers = async () => {
    if (!game) return;
    setLoading(true);
    try {
      const availablePlayers = await getAvailablePlayersByGameClient(game.id);
      setPlayers(availablePlayers);
    } catch (error) {
      console.error("Error loading players:", error);
    } finally {
      setLoading(false);
    }
  };

  const getUsername = (player: Player) => {
    // Try to get username from user metadata, email, or use userId as fallback
    if (player.user?.user_metadata?.username) {
      return player.user.user_metadata.username;
    }
    if (player.user?.email) {
      return player.user.email.split("@")[0];
    }
    // Fallback to a shortened userId
    return `Player ${player.userId.slice(0, 8)}`;
  };

  if (!game) return null;

  return (
    <Dialog open={isLobbyModalOpen} onOpenChange={setIsLobbyModalOpen}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-[#0E0E0E] border-white/10">
        <DialogHeader>
          <DialogTitle className="text-white text-xl font-semibold">
            Lobby - {game.title}
          </DialogTitle>
          <DialogDescription className="text-white/60">
            Players available or looking for opponents
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center">
            <p className="text-white/60 text-sm">Loading players...</p>
          </div>
        ) : players.length === 0 ? (
          <div className="py-8 text-center">
            <Users className="w-12 h-12 text-white/20 mx-auto mb-3" />
            <p className="text-white/60 text-sm">No players available at the moment</p>
          </div>
        ) : (
          <div className="space-y-3 mt-4">
            {players.map((player) => {
              const username = getUsername(player);
              const isOnline = player.status === "online";
              const isLooking = player.status === "looking";

              return (
                <div
                  key={player.id}
                  className="bg-[#1A1A1A] border border-white/10 rounded-lg p-4 hover:border-white/20 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-lg font-semibold">
                        {username.charAt(0).toUpperCase()}
                      </span>
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{username}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-white/60 text-xs">{player.platform}</span>
                        {isOnline && (
                          <span className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-full border border-green-500/30">
                            Online
                          </span>
                        )}
                        {isLooking && (
                          <span className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-0.5 rounded-full border border-yellow-500/30">
                            Looking for opponents
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <button className="bg-white/10 hover:bg-white/20 text-white text-sm px-4 py-2 rounded transition-colors flex-shrink-0">
                      Connect
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

