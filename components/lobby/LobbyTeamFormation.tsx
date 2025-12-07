"use client";

import { useState } from "react";
import { Users, UserPlus, Crown, X, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TeamMember {
  id: string;
  userId: string;
  username: string;
  avatar?: string;
  platform: string;
  isLeader?: boolean;
  isReady?: boolean;
}

interface Team {
  id: string;
  name: string;
  members: TeamMember[];
  maxMembers: number;
}

interface LobbyTeamFormationProps {
  gameId: string;
  currentUserId: string;
  currentUsername: string;
  currentPlatform: string;
  availablePlayers: Array<{
    id: string;
    userId: string;
    username: string;
    platform: string;
    status: "online" | "looking" | "offline";
  }>;
}

export default function LobbyTeamFormation({
  gameId,
  currentUserId,
  currentUsername,
  currentPlatform,
  availablePlayers,
}: LobbyTeamFormationProps) {
  const [teams, setTeams] = useState<Team[]>([
    {
      id: "team-1",
      name: "Team Alpha",
      maxMembers: 4,
      members: [
        {
          id: "member-1",
          userId: currentUserId,
          username: currentUsername,
          platform: currentPlatform,
          isLeader: true,
          isReady: false,
        },
        {
          id: "member-2",
          userId: "user-1",
          username: "ProGamer123",
          platform: "PC",
          isLeader: false,
          isReady: true,
        },
      ],
    },
    {
      id: "team-2",
      name: "Team Beta",
      maxMembers: 4,
      members: [
        {
          id: "member-3",
          userId: "user-2",
          username: "SniperElite",
          platform: "PlayStation",
          isLeader: true,
          isReady: false,
        },
      ],
    },
  ]);

  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);

  const handleCreateTeam = () => {
    const newTeam: Team = {
      id: `team-${Date.now()}`,
      name: `Team ${String.fromCharCode(65 + teams.length)}`,
      maxMembers: 4,
      members: [
        {
          id: `member-${Date.now()}`,
          userId: currentUserId,
          username: currentUsername,
          platform: currentPlatform,
          isLeader: true,
          isReady: false,
        },
      ],
    };
    setTeams([...teams, newTeam]);
  };

  const handleInvitePlayer = (playerId: string, teamId: string) => {
    const player = availablePlayers.find((p) => p.id === playerId);
    if (!player) return;

    const team = teams.find((t) => t.id === teamId);
    if (!team || team.members.length >= team.maxMembers) return;

    // Check if player is already in a team
    const isInTeam = teams.some((t) =>
      t.members.some((m) => m.userId === player.userId)
    );
    if (isInTeam) return;

    const newMember: TeamMember = {
      id: `member-${Date.now()}`,
      userId: player.userId,
      username: player.username,
      platform: player.platform,
      isLeader: false,
      isReady: false,
    };

    setTeams(
      teams.map((t) =>
        t.id === teamId ? { ...t, members: [...t.members, newMember] } : t
      )
    );
    setSelectedPlayer(null);
  };

  const handleRemoveMember = (teamId: string, memberId: string) => {
    setTeams(
      teams.map((t) =>
        t.id === teamId
          ? { ...t, members: t.members.filter((m) => m.id !== memberId) }
          : t
      )
    );
  };

  const handleToggleReady = (teamId: string, memberId: string) => {
    setTeams(
      teams.map((t) =>
        t.id === teamId
          ? {
              ...t,
              members: t.members.map((m) =>
                m.id === memberId ? { ...m, isReady: !m.isReady } : m
              ),
            }
          : t
      )
    );
  };

  const handleLeaveTeam = (teamId: string) => {
    setTeams(
      teams.map((t) =>
        t.id === teamId
          ? {
              ...t,
              members: t.members.filter((m) => m.userId !== currentUserId),
            }
          : t
      ).filter((t) => t.members.length > 0)
    );
  };

  const getInitials = (username: string) => {
    return username.charAt(0).toUpperCase();
  };

  const allTeamsReady = teams.every((team) =>
    team.members.length > 0 && team.members.every((m) => m.isReady)
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-500" aria-hidden="true" />
          <h3 className="text-white text-lg font-semibold">Team Formation</h3>
        </div>
        <Button
          onClick={handleCreateTeam}
          className="bg-purple-600 hover:bg-purple-700 text-white text-sm h-9"
          aria-label="Create new team"
        >
          <UserPlus className="w-4 h-4 mr-2" aria-hidden="true" />
          New Team
        </Button>
      </div>

      {/* Teams List */}
      <div className="space-y-3">
        {teams.map((team) => {
          const isInTeam = team.members.some((m) => m.userId === currentUserId);
          const isLeader = team.members.some(
            (m) => m.userId === currentUserId && m.isLeader
          );
          const canInvite = team.members.length < team.maxMembers;

          return (
            <div
              key={team.id}
              className="bg-[#0E0E0E] border border-white/10 rounded-lg p-4"
            >
              {/* Team Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h4 className="text-white font-medium">{team.name}</h4>
                  <span className="text-white/40 text-xs">
                    ({team.members.length}/{team.maxMembers})
                  </span>
                </div>
                {isInTeam && (
                  <Button
                    onClick={() => handleLeaveTeam(team.id)}
                    variant="outline"
                    size="sm"
                    className="text-xs h-7"
                  >
                    Leave
                  </Button>
                )}
              </div>

              {/* Team Members */}
              <div className="space-y-2 mb-3">
                {team.members.map((member) => {
                  const isCurrentUser = member.userId === currentUserId;
                  return (
                    <div
                      key={member.id}
                      className={`flex items-center gap-3 p-2 rounded-lg ${
                        isCurrentUser ? "bg-purple-500/10 border border-purple-500/20" : "bg-white/5"
                      }`}
                    >
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                          <span className="text-white text-xs font-semibold">
                            {getInitials(member.username)}
                          </span>
                        </div>
                        {member.isLeader && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-yellow-500 flex items-center justify-center">
                            <Crown className="w-2.5 h-2.5 text-white" aria-hidden="true" />
                          </div>
                        )}
                      </div>

                      {/* Member Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-white text-sm font-medium truncate">
                            {member.username}
                            {isCurrentUser && " (You)"}
                          </p>
                          {member.isReady && (
                            <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" aria-hidden="true" />
                          )}
                        </div>
                        <p className="text-white/50 text-xs">{member.platform}</p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {isCurrentUser && !member.isReady && (
                          <Button
                            onClick={() => handleToggleReady(team.id, member.id)}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white text-xs h-7"
                          >
                            Ready
                          </Button>
                        )}
                        {isCurrentUser && member.isReady && (
                          <Button
                            onClick={() => handleToggleReady(team.id, member.id)}
                            variant="outline"
                            size="sm"
                            className="text-xs h-7"
                          >
                            Not Ready
                          </Button>
                        )}
                        {isLeader && !isCurrentUser && (
                          <button
                            onClick={() => handleRemoveMember(team.id, member.id)}
                            className="p-1.5 rounded hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                            aria-label={`Remove ${member.username} from team`}
                          >
                            <X className="w-4 h-4" aria-hidden="true" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Invite Section */}
              {canInvite && (
                <div className="pt-3 border-t border-white/10">
                  <select
                    value={selectedPlayer || ""}
                    onChange={(e) => {
                      setSelectedPlayer(e.target.value);
                      if (e.target.value) {
                        handleInvitePlayer(e.target.value, team.id);
                      }
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    aria-label={`Invite player to ${team.name}`}
                  >
                    <option value="">Invite a player...</option>
                    {availablePlayers
                      .filter(
                        (p) =>
                          !teams.some((t) =>
                            t.members.some((m) => m.userId === p.userId)
                          ) && p.userId !== currentUserId
                      )
                      .map((player) => (
                        <option key={player.id} value={player.id}>
                          {player.username} ({player.platform})
                        </option>
                      ))}
                  </select>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Ready Status */}
      {allTeamsReady && teams.length > 0 && (
        <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" aria-hidden="true" />
          <p className="text-green-400 text-sm font-medium">
            All teams are ready! You can start the match.
          </p>
        </div>
      )}
    </div>
  );
}

