"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { Game, Player } from "@/types";
import { getAvailablePlayersByGameClient } from "@/lib/players-client";
import { Users, Clock, X, Loader2, ChevronRight, CheckCircle2, AlertCircle, Wifi, WifiOff, MessageSquare, MessageCircle, Info, Crown, Send, ChevronDown, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLobby } from "@/contexts/LobbyContext";
import DiscordIntegration from "@/components/lobby/DiscordIntegration";

interface LobbySidebarProps {
  onCollapse: () => void;
}

type TabType = "players" | "chat" | "discord" | "info";

interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  message: string;
  timestamp: Date;
  type: "message" | "system" | "join" | "leave";
}

// Dummy players data
const DUMMY_PLAYERS: Player[] = [
  {
    id: "player-1",
    userId: "user-1",
    gameId: "game-1",
    platform: "PC",
    status: "online",
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    user: { id: "user-1", user_metadata: { username: "ProGamer123" } },
  } as Player,
  {
    id: "player-2",
    userId: "user-2",
    gameId: "game-1",
    platform: "PlayStation",
    status: "looking",
    updatedAt: new Date(Date.now() - 30000).toISOString(),
    createdAt: new Date().toISOString(),
    user: { id: "user-2", user_metadata: { username: "SniperElite" } },
  } as Player,
  {
    id: "player-3",
    userId: "user-3",
    gameId: "game-1",
    platform: "Xbox",
    status: "online",
    updatedAt: new Date(Date.now() - 60000).toISOString(),
    createdAt: new Date().toISOString(),
    user: { id: "user-3", user_metadata: { username: "TeamPlayer" } },
  } as Player,
];

export default function LobbySidebar({ onCollapse }: LobbySidebarProps) {
  const { game, showLobby, setShowLobby, openLobbyModal, matchmakingState, setMatchmakingState } = useLobby();
  const [playerCount, setPlayerCount] = useState(DUMMY_PLAYERS.length);
  const [players, setPlayers] = useState<Player[]>(DUMMY_PLAYERS);
  const [timeRemaining, setTimeRemaining] = useState(15 * 60);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<TabType>("players");
  const [leaderId, setLeaderId] = useState<string>(DUMMY_PLAYERS[0]?.userId || "");
  
  // Team state - simple teams for player switching
  const [teams, setTeams] = useState(() => {
    if (DUMMY_PLAYERS.length >= 3) {
      return [
        { id: "team-1", name: "Team 1", playerIds: [DUMMY_PLAYERS[0]?.userId || "", DUMMY_PLAYERS[1]?.userId || ""] },
        { id: "team-2", name: "Team 2", playerIds: [DUMMY_PLAYERS[2]?.userId || ""] },
      ];
    }
    return [
      { id: "team-1", name: "Team 1", playerIds: [] },
      { id: "team-2", name: "Team 2", playerIds: [] },
    ];
  });
  
  // Collapsed state for teams
  const [collapsedTeams, setCollapsedTeams] = useState<Record<string, boolean>>({
    "team-1": false,
    "team-2": false,
  });
  
  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "msg-1",
      userId: "user-1",
      username: "ProGamer123",
      message: "Hey everyone! Ready to start?",
      timestamp: new Date(Date.now() - 420000), // 7 minutes ago
      type: "message",
    },
    {
      id: "msg-2",
      userId: "system",
      username: "System",
      message: "SniperElite joined the lobby",
      timestamp: new Date(Date.now() - 360000), // 6 minutes ago
      type: "join",
    },
    {
      id: "msg-3",
      userId: "user-2",
      username: "SniperElite",
      message: "Yep, I'm ready. Who wants to team up?",
      timestamp: new Date(Date.now() - 360000), // 6 minutes ago
      type: "message",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  const coverUrl = game ? ((game as Game & { cover_url?: string }).cover_url || game.coverUrl) : null;

  // Set first player as leader if no leader exists
  useEffect(() => {
    if (players.length > 0 && !leaderId) {
      setLeaderId(players[0].userId);
    }
  }, [players, leaderId]);

  // Auto-scroll chat to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Chat handlers
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      userId: "current-user-id",
      username: "You",
      message: chatInput.trim(),
      timestamp: new Date(),
      type: "message",
    };

    setChatMessages((prev) => [...prev, newMessage]);
    setChatInput("");
    chatInputRef.current?.focus();
  };

  const formatChatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);

    if (seconds < 60) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  // Countdown timer that resets every 15 minutes
  useEffect(() => {
    if (!showLobby || !game) return;

    setTimeRemaining(15 * 60);

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          return 15 * 60; // Reset to 15 minutes
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showLobby, game]);

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 10) return "just now";
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ago`;
  };

  const totalSeconds = 15 * 60;
  const progressValue = ((totalSeconds - timeRemaining) / totalSeconds) * 100;

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
        return "Looking";
      case "offline":
        return "Offline";
      default:
        return "Unknown";
    }
  };

  const getUsername = (player: Player) => {
    if (player.user?.user_metadata?.username) {
      return player.user.user_metadata.username;
    }
    if (player.user?.email) {
      return player.user.email.split("@")[0];
    }
    return `Player ${player.userId.slice(0, 8)}`;
  };

  // Render player card component
  const renderPlayerCard = (player: Player, team: { id: string; name: string; playerIds: string[] } | null) => {
    const username = getUsername(player);
    const isRecent = new Date().getTime() - new Date(player.updatedAt).getTime() < 30000;
    const isLeader = player.userId === leaderId;
    const isCurrentUser = player.userId === "current-user-id"; // TODO: Get actual current user ID
    const canTransfer = leaderId === "current-user-id" && !isLeader && players.length > 1;
    const currentTeam = team || teams.find(t => t.playerIds.includes(player.userId));

    return (
      <div
        key={player.id}
        className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors group"
        role="listitem"
      >
        <button
          onClick={() => openLobbyModal()}
          className="flex-1 flex items-center gap-2 text-left focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-[#121212] rounded"
          aria-label={`Player ${username}, ${getStatusLabel(player.status)}, platform ${player.platform}${isLeader ? ", Leader" : ""}`}
          tabIndex={0}
        >
          {/* Avatar */}
          <div className="relative flex-shrink-0" aria-hidden="true">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md">
              <span className="text-white text-[10px] font-semibold">
                {username.charAt(0).toUpperCase()}
              </span>
            </div>
            {/* Status Indicator */}
            <div
              className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border-2 border-[#121212] ${getStatusColor(player.status)} ${
                isRecent ? "animate-pulse" : ""
              }`}
              aria-label={getStatusLabel(player.status)}
              title={getStatusLabel(player.status)}
            />
            {/* Leader Crown */}
            {isLeader && (
              <div className="absolute -top-0.5 -left-0.5 w-3 h-3 rounded-full bg-yellow-500 flex items-center justify-center">
                <Crown className="w-2 h-2 text-white" aria-hidden="true" />
              </div>
            )}
          </div>

          {/* Player Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-white text-sm font-medium truncate">{username}</p>
              {isLeader && (
                <span className="text-yellow-500 text-xs font-medium">(Leader)</span>
              )}
              {isRecent && !isLeader && (
                <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse" aria-label="Recently active" />
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-white/50">
              <span className="truncate">{player.platform}</span>
              <span aria-hidden="true">•</span>
              <span className="capitalize">{getStatusLabel(player.status).toLowerCase()}</span>
            </div>
          </div>

          {/* Transfer Leader Button */}
          {canTransfer && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLeaderId(player.userId);
              }}
              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/10 text-white/60 hover:text-yellow-500 transition-all"
              title="Make leader"
              aria-label={`Transfer leadership to ${username}`}
            >
              <Crown className="w-3 h-3" aria-hidden="true" />
            </button>
          )}
        </button>

        {/* Join Team Button (only show if player is not in this team) */}
        {team && !team.playerIds.includes(player.userId) && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              const currentUserId = "current-user-id"; // TODO: Get actual current user ID
              // Remove from other teams
              const updatedTeams = teams.map(t => ({
                ...t,
                playerIds: t.playerIds.filter(id => id !== currentUserId)
              }));
              // Add to this team
              setTeams(updatedTeams.map(t => 
                t.id === team.id 
                  ? { ...t, playerIds: [...t.playerIds, currentUserId] }
                  : t
              ));
            }}
            className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-white/10 text-white/60 hover:text-purple-400 transition-all"
            title="Join team"
            aria-label={`Join ${team.name}`}
          >
            <UserPlus className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        )}

        {/* Change Team Dropdown (for players not in a team) */}
        {!team && teams.length > 0 && (
          <select
            value={currentTeam?.id || ""}
            onChange={(e) => {
              const newTeamId = e.target.value;
              if (!newTeamId) {
                // Remove from team
                setTeams(teams.map(t => ({
                  ...t,
                  playerIds: t.playerIds.filter(id => id !== player.userId)
                })));
                return;
              }
              
              // Remove player from current team
              const updatedTeams = teams.map(t => ({
                ...t,
                playerIds: t.playerIds.filter(id => id !== player.userId)
              }));
              
              // Add player to new team
              setTeams(updatedTeams.map(t => 
                t.id === newTeamId 
                  ? { ...t, playerIds: [...t.playerIds, player.userId] }
                  : t
              ));
            }}
            onClick={(e) => e.stopPropagation()}
            className="opacity-0 group-hover:opacity-100 text-[10px] bg-white/5 border border-white/10 rounded px-2 py-1 text-white/60 hover:text-white focus:outline-none focus:ring-1 focus:ring-white/20 transition-all min-w-[80px]"
            title="Join team"
          >
            <option value="">No team</option>
            {teams.map(t => (
              <option key={t.id} value={t.id} className="bg-[#0E0E0E]">
                {t.name}
              </option>
            ))}
          </select>
        )}
      </div>
    );
  };

  const getMatchmakingLabel = () => {
    switch (matchmakingState) {
      case "searching":
        return "Searching for players...";
      case "found":
        return `${playerCount} player${playerCount !== 1 ? "s" : ""} available`;
      case "connecting":
        return "Connecting...";
      case "ready":
        return "Ready to join";
      case "error":
        return "Connection error";
      default:
        return "Searching...";
    }
  };

  const getMatchmakingIcon = () => {
    switch (matchmakingState) {
      case "searching":
        return <Loader2 className="w-3.5 h-3.5 animate-spin text-white/60" style={{ animationDuration: '2s' }} />;
      case "found":
        return <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />;
      case "connecting":
        return <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" style={{ animationDuration: '1s' }} />;
      case "ready":
        return <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />;
      case "error":
        return <AlertCircle className="w-3.5 h-3.5 text-red-500" />;
      default:
        return <Loader2 className="w-3.5 h-3.5 animate-spin text-white/60" />;
    }
  };

  if (!showLobby || !game) return null;

  return (
    <aside 
      className="w-full h-full flex flex-col relative bg-[#121212] rounded-2xl"
      aria-label="Matchmaking lobby"
      role="complementary"
    >
      {/* Collapse Button */}
      <button
        onClick={onCollapse}
        className="absolute -left-3 top-6 z-10 w-6 h-6 rounded-full bg-[#121212] border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white/20"
        title="Collapse lobby"
        aria-label="Collapse lobby sidebar"
      >
        <ChevronRight className="w-4 h-4 text-white/60" aria-hidden="true" />
      </button>

      {/* Header Section */}
      <div className="px-4 pt-4 pb-3 border-b border-white/10">
        {/* Status Header with Cancel Button */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-white/60 text-xs font-medium uppercase tracking-wider">
            <span>Lobby</span>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowLobby(false)}
            className="px-3 border-white/10 text-white/60 hover:text-white hover:bg-white/10 h-7 text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-white/20"
            aria-label="Cancel lobby"
          >
            Cancel
          </Button>
        </div>

        {/* Game Info Card */}
        <div className="w-full">
          <div className="flex items-center gap-3 mb-3">
            {/* Game Cover */}
            {coverUrl && (
              <div className="relative w-14 h-18 rounded overflow-hidden flex-shrink-0 shadow-md">
                <Image
                  src={coverUrl}
                  alt={`${game.title} cover art`}
                  fill
                  className="object-cover"
                  sizes="56px"
                  priority
                />
              </div>
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Game Title */}
              <h3 className="text-white font-semibold text-sm mb-2 line-clamp-2 leading-tight">
                {game.title}
              </h3>

              {/* Stats Row */}
              <div className="flex items-center gap-4 text-xs text-white/60">
                <div className="flex items-center gap-1.5" aria-label={`${playerCount} players available`}>
                  <Users className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
                  <span className="font-medium">{playerCount}</span>
                  <span className="hidden sm:inline">{playerCount === 1 ? "player" : "players"}</span>
                </div>
                <div className="flex items-center gap-1.5" aria-label={`Time remaining: ${formatCountdown(timeRemaining)}`}>
                  <Clock className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
                  <span className="font-mono tabular-nums">{formatCountdown(timeRemaining)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Last Updated Indicator */}
          <div className="mt-2 pt-2  ">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-white/40 text-xs">
                <Wifi className="w-3 h-3" aria-hidden="true" />
                <span>Updated {formatTimeAgo(lastUpdated)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 px-4" role="tablist" aria-label="Lobby sections">
        <button
          onClick={() => setActiveTab("players")}
          className={`flex-1 px-3 py-2 text-xs font-medium transition-colors border-b-2 flex items-center justify-center gap-1.5 ${
            activeTab === "players"
              ? "text-white border-purple-500"
              : "text-white/60 border-transparent hover:text-white/80"
          }`}
          role="tab"
          aria-selected={activeTab === "players"}
          aria-controls="players-panel"
        >
          Players
        </button>
        <button
          onClick={() => setActiveTab("chat")}
          className={`flex-1 px-3 py-2 text-xs font-medium transition-colors border-b-2 flex items-center justify-center gap-1.5 ${
            activeTab === "chat"
              ? "text-white border-purple-500"
              : "text-white/60 border-transparent hover:text-white/80"
          }`}
          role="tab"
          aria-selected={activeTab === "chat"}
          aria-controls="chat-panel"
        >
          <MessageSquare className="w-3.5 h-3.5" aria-hidden="true" />
          Chat
        </button>
        <button
          onClick={() => setActiveTab("discord")}
          className={`flex-1 px-3 py-2 text-xs font-medium transition-colors border-b-2 flex items-center justify-center gap-1.5 ${
            activeTab === "discord"
              ? "text-white border-purple-500"
              : "text-white/60 border-transparent hover:text-white/80"
          }`}
          role="tab"
          aria-selected={activeTab === "discord"}
          aria-controls="discord-panel"
        >
          Discord
        </button>
        <button
          onClick={() => setActiveTab("info")}
          className={`flex-1 px-3 py-3.5 text-xs font-medium transition-colors border-b-2 flex items-center justify-center gap-1.5 ${
            activeTab === "info"
              ? "text-white border-purple-500"
              : "text-white/60 border-transparent hover:text-white/80"
          }`}
          role="tab"
          aria-selected={activeTab === "info"}
          aria-controls="info-panel"
        >
         Info
        </button>
      </div>

      {/* Tab Panels */}
      <div className="flex-1 overflow-hidden min-h-0">
        {/* Players Panel */}
        {activeTab === "players" && (
          <div id="players-panel" role="tabpanel" className="h-full overflow-y-auto px-4 py-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-white/60 text-xs font-medium uppercase tracking-wider">
                Players Available
              </h4>
            </div>

            {players.length === 0 ? (
              <div className="py-8 text-center">
                <WifiOff className="w-8 h-8 text-white/20 mx-auto mb-3" aria-hidden="true" />
                <p className="text-white/40 text-xs mb-1">No players available</p>
                <p className="text-white/30 text-xs">Waiting for players to join...</p>
              </div>
            ) : (
              <div className="space-y-3" role="list" aria-label="Available players list">
                {/* Players not in a team */}
                {(() => {
                  const unassignedPlayers = players.filter(p => !teams.some(t => t.playerIds.includes(p.userId)));
                  if (unassignedPlayers.length > 0) {
                    return (
                      <div>
                        <h5 className="text-white/60 text-sm font-medium uppercase tracking-wider mb-2">Players</h5>
                        <div className="space-y-1.5">
                          {unassignedPlayers.map((player) => renderPlayerCard(player, null))}
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}

                {/* Teams */}
                {teams.map((team) => {
                  const teamPlayers = players.filter(p => team.playerIds.includes(p.userId));
                  const isCollapsed = collapsedTeams[team.id];
                  
                  return (
                    <div key={team.id} className="border border-white/10 rounded-lg overflow-hidden group">
                      {/* Team Header - Collapsible */}
                      <div className="w-full flex items-center justify-between px-3 py-2 bg-white/5 hover:bg-white/10 transition-colors">
                        <button
                          onClick={() => setCollapsedTeams(prev => ({ ...prev, [team.id]: !prev[team.id] }))}
                          className="flex-1 flex items-center gap-2 text-left"
                          aria-label={`${isCollapsed ? 'Expand' : 'Collapse'} ${team.name}`}
                        >
                          <ChevronDown
                            className={`w-3.5 h-3.5 text-white/60 transition-transform ${isCollapsed ? '-rotate-90' : ''}`}
                            aria-hidden="true"
                          />
                          <h5 className="text-white text-sm font-medium">{team.name}</h5>
                          <span className="text-white/40 text-xs">({teamPlayers.length})</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Add current user to team
                            const currentUserId = "current-user-id"; // TODO: Get actual current user ID
                            if (!team.playerIds.includes(currentUserId)) {
                              // Remove from other teams first
                              const updatedTeams = teams.map(t => ({
                                ...t,
                                playerIds: t.playerIds.filter(id => id !== currentUserId)
                              }));
                              // Add to this team
                              setTeams(updatedTeams.map(t => 
                                t.id === team.id 
                                  ? { ...t, playerIds: [...t.playerIds, currentUserId] }
                                  : t
                              ));
                            }
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-white/10 text-white/60 hover:text-purple-400 transition-all"
                          title="Join team"
                          aria-label={`Join ${team.name}`}
                        >
                          <UserPlus className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      </div>

                      {/* Team Players - Collapsible */}
                      {!isCollapsed && (
                        <div className="space-y-1.5 p-2">
                          {teamPlayers.length > 0 ? (
                            teamPlayers.map((player) => renderPlayerCard(player, team))
                          ) : (
                            <p className="text-white/40 text-xs text-center py-2">No players in this team</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Chat Panel */}
        {activeTab === "chat" && (
          <div id="chat-panel" role="tabpanel" className="h-full flex flex-col">
            {/* Chat Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-white/60" aria-hidden="true" />
                <h4 className="text-white text-sm font-medium">Lobby Chat</h4>
                <span className="text-white/40 text-xs">({players.length} online)</span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3 py-2 space-y-3 min-h-0" role="log" aria-live="polite">
              {chatMessages.map((msg) => {
                const isOwnMessage = msg.userId === "current-user-id";
                const isSystem = msg.type === "system" || msg.type === "join" || msg.type === "leave";

                if (isSystem) {
                  return (
                    <div key={msg.id} className="text-center">
                      <span className="text-white/40 text-xs italic">{msg.message}</span>
                    </div>
                  );
                }

                return (
                  <div
                    key={msg.id}
                    className={`flex gap-2 ${isOwnMessage ? "flex-row-reverse" : "flex-row"}`}
                  >
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <span className="text-white text-xs font-semibold">
                          {msg.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Message Content */}
                    <div className={`flex flex-col ${isOwnMessage ? "items-end" : "items-start"} max-w-[80%]`}>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-white/60 text-xs font-medium">{msg.username}</span>
                        <span className="text-white/30 text-xs">{formatChatTime(msg.timestamp)}</span>
                      </div>
                      <div
                        className={`rounded-lg px-3 py-1.5 text-sm ${
                          isOwnMessage
                            ? "bg-purple-600 text-white"
                            : "bg-white/5 text-white/90"
                        }`}
                      >
                        {msg.message}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="border-t border-white/10 p-2">
              <div className="flex items-center gap-2">
                <input
                  ref={chatInputRef}
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  aria-label="Chat message input"
                  maxLength={200}
                />
                <Button
                  type="submit"
                  size="icon"
                  className="bg-purple-600 hover:bg-purple-700 text-white h-9 w-9 flex-shrink-0"
                  disabled={!chatInput.trim()}
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" aria-hidden="true" />
                </Button>
              </div>
              <p className="text-white/30 text-xs mt-1 px-1">
                Press Enter to send • Keep it friendly
              </p>
            </form>
          </div>
        )}

        {/* Discord Panel */}
        {activeTab === "discord" && (
          <div id="discord-panel" role="tabpanel" className="h-full overflow-y-auto px-4 py-4">
            <DiscordIntegration
              gameId={game?.id || ""}
              gameTitle={game?.title || ""}
            />
          </div>
        )}

        {/* Game Info Panel */}
        {activeTab === "info" && (
          <div id="info-panel" role="tabpanel" className="h-full overflow-y-auto px-4 py-4">
            <div className="space-y-4">
              <div>
                <h4 className="text-white text-sm font-semibold mb-3">Server Information</h4>
                <div className="space-y-2 bg-white/5 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-white/60 text-xs">Server Name</span>
                    <span className="text-white text-xs font-medium">EU West #1</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60 text-xs">Region</span>
                    <span className="text-white text-xs font-medium">Europe</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60 text-xs">Latency</span>
                    <span className="text-green-400 text-xs font-medium">32ms</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60 text-xs">Status</span>
                    <span className="text-green-400 text-xs font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                      Online
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-white text-sm font-semibold mb-3">Lobby Settings</h4>
                <div className="space-y-2 bg-white/5 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-white/60 text-xs">Max Players</span>
                    <span className="text-white text-xs font-medium">8</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60 text-xs">Game Mode</span>
                    <span className="text-white text-xs font-medium">Team Deathmatch</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60 text-xs">Privacy</span>
                    <span className="text-white text-xs font-medium">Public</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-white text-sm font-semibold mb-3">Leader</h4>
                <div className="bg-white/5 rounded-lg p-3 flex items-center gap-3">
                  {leaderId && (() => {
                    const leader = players.find(p => p.userId === leaderId);
                    if (!leader) return null;
                    const leaderUsername = getUsername(leader);
                    return (
                      <>
                        <div className="relative flex-shrink-0">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md">
                            <span className="text-white text-xs font-semibold">
                              {leaderUsername.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-yellow-500 flex items-center justify-center">
                            <Crown className="w-2.5 h-2.5 text-white" aria-hidden="true" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium">{leaderUsername}</p>
                          <p className="text-white/50 text-xs">{leader.platform}</p>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
