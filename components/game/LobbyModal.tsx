"use client";

import { useState, useEffect, useCallback } from "react";
import { Player } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { getAvailablePlayersByGameClient } from "@/lib/players-client";
import { Users, Wifi, WifiOff, Loader2, UserPlus, MessageSquare, Copy, Check, Users2 } from "lucide-react";
import { useLobby } from "@/contexts/LobbyContext";
import { Button } from "@/components/ui/button";
import LobbyTeamFormation from "@/components/lobby/LobbyTeamFormation";

type ModalTab = "players" | "teams";

export default function LobbyModal() {
  const { game, isLobbyModalOpen, setIsLobbyModalOpen } = useLobby();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedUserId, setCopiedUserId] = useState<string | null>(null);
  const [connectingTo, setConnectingTo] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ModalTab>("players");

  // Define loadPlayers before useEffect that uses it
  const loadPlayers = useCallback(async () => {
    if (!game) return;
    setLoading(true);
    setError(null);
    try {
      const availablePlayers = await getAvailablePlayersByGameClient(game.id);
      setPlayers(availablePlayers);
    } catch (err) {
      console.error("Error loading players:", err);
      setError("Failed to load players. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [game]);

  // Load players when modal opens
  useEffect(() => {
    if (isLobbyModalOpen && game) {
      loadPlayers();
      // Auto-refresh every 10 seconds while modal is open
      const interval = setInterval(loadPlayers, 10000);
      return () => clearInterval(interval);
    }
  }, [isLobbyModalOpen, game?.id, loadPlayers]);

  const getUsername = (player: Player) => {
    if (player.user?.user_metadata?.username) {
      return player.user.user_metadata.username;
    }
    if (player.user?.email) {
      return player.user.email.split("@")[0];
    }
    return `Player ${player.userId.slice(0, 8)}`;
  };

  const handleConnect = async (playerId: string, userId: string) => {
    setConnectingTo(playerId);
    // TODO: Implement actual connection logic
    // This could open a chat, initiate voice connection, or send friend request
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate connection
    setConnectingTo(null);
    // Show success feedback
  };

  const handleCopyId = async (userId: string) => {
    try {
      await navigator.clipboard.writeText(userId);
      setCopiedUserId(userId);
      setTimeout(() => setCopiedUserId(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const getStatusColor = (status: Player["status"]) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "looking":
        return "bg-yellow-500";
      case "offline":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusLabel = (status: Player["status"]) => {
    switch (status) {
      case "online":
        return "Online";
      case "looking":
        return "Looking for players";
      case "offline":
        return "Offline";
      default:
        return "Unknown";
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  if (!game) return null;

  return (
    <Dialog open={isLobbyModalOpen} onOpenChange={setIsLobbyModalOpen}>
      <DialogContent 
        className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col bg-[#0E0E0E] border-white/10"
        aria-labelledby="lobby-modal-title"
        aria-describedby="lobby-modal-description"
      >
        <DialogHeader className="flex-shrink-0 pb-4 border-b border-white/10">
          <DialogTitle id="lobby-modal-title" className="text-white text-xl font-semibold flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-500" aria-hidden="true" />
            Lobby - {game.title}
          </DialogTitle>
          <DialogDescription id="lobby-modal-description" className="text-white/60 text-sm mt-1">
            Connect with players, form teams, and start matches together.
          </DialogDescription>
          
          {/* Tabs */}
          <div className="flex gap-2 mt-4" role="tablist" aria-label="Lobby sections">
            <button
              onClick={() => setActiveTab("players")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "players"
                  ? "bg-purple-600 text-white"
                  : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80"
              }`}
              role="tab"
              aria-selected={activeTab === "players"}
              aria-controls="players-panel"
            >
              <Users className="w-4 h-4" aria-hidden="true" />
              Players ({players.length})
            </button>
            <button
              onClick={() => setActiveTab("teams")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "teams"
                  ? "bg-purple-600 text-white"
                  : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80"
              }`}
              role="tab"
              aria-selected={activeTab === "teams"}
              aria-controls="teams-panel"
            >
              <Users2 className="w-4 h-4" aria-hidden="true" />
              Teams
            </button>
          </div>
        </DialogHeader>

        {/* Content Area - Scrollable */}
        <div className="flex-1 overflow-y-auto min-h-0 pr-2 -mr-2">
          {/* Players Panel */}
          {activeTab === "players" && (
            <div id="players-panel" role="tabpanel">
              {loading && players.length === 0 ? (
            <div className="py-12 text-center" role="status" aria-live="polite">
              <Loader2 className="w-10 h-10 animate-spin text-white/40 mx-auto mb-4" style={{ animationDuration: '1s' }} aria-hidden="true" />
              <p className="text-white/60 text-sm">Loading players...</p>
            </div>
          ) : error ? (
            <div className="py-12 text-center">
              <WifiOff className="w-10 h-10 text-red-500/50 mx-auto mb-4" aria-hidden="true" />
              <p className="text-white/60 text-sm mb-2">{error}</p>
              <Button 
                onClick={loadPlayers}
                variant="outline"
                className="mt-4"
                aria-label="Retry loading players"
              >
                Retry
              </Button>
            </div>
          ) : players.length === 0 ? (
            <div className="py-12 text-center">
              <Users className="w-12 h-12 text-white/20 mx-auto mb-4" aria-hidden="true" />
              <p className="text-white/60 text-sm mb-1">No players available at the moment</p>
              <p className="text-white/40 text-xs">Players will appear here when they're online and looking for matches</p>
            </div>
          ) : (
            <div className="space-y-3 mt-4 pb-2" role="list" aria-label="Available players">
              {players.map((player, index) => {
                const username = getUsername(player);
                const isOnline = player.status === "online";
                const isLooking = player.status === "looking";
                const isConnecting = connectingTo === player.id;
                const isRecent = new Date().getTime() - new Date(player.updatedAt).getTime() < 60000; // Last minute

                return (
                  <div
                    key={player.id}
                    className="bg-[#1A1A1A] border border-white/10 rounded-lg p-4 hover:border-white/20 transition-all hover:shadow-lg"
                    role="listitem"
                  >
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="relative flex-shrink-0" aria-hidden="true">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-md">
                          <span className="text-white text-base font-semibold">
                            {username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        {/* Status Indicator */}
                        <div
                          className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-[#1A1A1A] ${getStatusColor(player.status)} ${
                            isRecent ? "animate-pulse" : ""
                          }`}
                          aria-label={getStatusLabel(player.status)}
                          title={getStatusLabel(player.status)}
                        />
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-white font-medium text-base truncate">{username}</p>
                          {isRecent && (
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" aria-label="Recently active" />
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="text-white/60 bg-white/5 px-2 py-1 rounded border border-white/10">
                            {player.platform}
                          </span>
                          {isOnline && (
                            <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full border border-green-500/30 flex items-center gap-1.5">
                              <Wifi className="w-3 h-3" aria-hidden="true" />
                              Online
                            </span>
                          )}
                          {isLooking && (
                            <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full border border-yellow-500/30">
                              Looking for opponents
                            </span>
                          )}
                          <span className="text-white/40">
                            Active {formatTimeAgo(player.updatedAt)}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                          onClick={() => handleConnect(player.id, player.userId)}
                          disabled={isConnecting}
                          className="bg-purple-600 hover:bg-purple-700 text-white text-sm px-4 py-2 h-9 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
                          aria-label={`Connect with ${username}`}
                        >
                          {isConnecting ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                              Connecting...
                            </>
                          ) : (
                            <>
                              <UserPlus className="w-4 h-4 mr-2" aria-hidden="true" />
                              Connect
                            </>
                          )}
                        </Button>
                        <button
                          onClick={() => handleCopyId(player.userId)}
                          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/20"
                          aria-label={`Copy ${username}'s user ID`}
                          title="Copy User ID"
                        >
                          {copiedUserId === player.userId ? (
                            <Check className="w-4 h-4 text-green-500" aria-hidden="true" />
                          ) : (
                            <Copy className="w-4 h-4" aria-hidden="true" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
            </div>
          )}

          {/* Teams Panel */}
          {activeTab === "teams" && (
            <div id="teams-panel" role="tabpanel">
              <LobbyTeamFormation
                gameId={game.id}
                currentUserId="current-user-id"
                currentUsername="You"
                currentPlatform="PC"
                availablePlayers={players.map((p) => ({
                  id: p.id,
                  userId: p.userId,
                  username: getUsername(p),
                  platform: p.platform,
                  status: p.status,
                }))}
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex-shrink-0 pt-4 border-t border-white/10 flex items-center justify-between">
          <div className="text-white/40 text-xs flex items-center gap-1.5">
            <Wifi className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Auto-refreshing every 10 seconds</span>
          </div>
          <Button
            variant="outline"
            onClick={() => setIsLobbyModalOpen(false)}
            className="text-sm"
            aria-label="Close modal"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
