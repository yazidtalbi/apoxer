"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Game, Community, Player, Event, GamePlayGuide } from "@/types";
import CommunityCard from "@/components/CommunityCard";
import PlayerCard from "@/components/PlayerCard";
import AddToYourGamesButton from "@/components/AddToYourGamesButton";
import { getEventsByGameClient } from "@/lib/events-client";
import { Calendar, Clock, Users, Users2, Gamepad2, Plus, ArrowRight } from "lucide-react";

interface OverviewSectionProps {
  game: Game;
  communities: Community[];
  players: Player[];
  gamePlayGuide?: GamePlayGuide | null;
  hasUser?: boolean;
  initialIsInLibrary?: boolean;
}

export default function OverviewSection({
  game,
  communities,
  players,
  gamePlayGuide,
  hasUser = false,
  initialIsInLibrary = false,
}: OverviewSectionProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const eventsData = await getEventsByGameClient(game.id);
        // Get only upcoming events (start_datetime in the future)
        const now = new Date();
        const upcoming = eventsData.filter((event) => {
          const eventDate = new Date(event.startDatetime);
          return eventDate > now;
        });
        // Sort by start_datetime ascending (soonest first)
        upcoming.sort((a, b) => {
          return new Date(a.startDatetime).getTime() - new Date(b.startDatetime).getTime();
        });
        setEvents(upcoming.slice(0, 5)); // Show only next 5 events
      } catch (error) {
        console.error("Error loading events:", error);
      } finally {
        setLoadingEvents(false);
      }
    };

    loadEvents();
  }, [game.id]);

  // Show latest communities (up to 6)
  const latestCommunities = communities.slice(0, 6);

  // Show players (up to 6, prioritize online)
  const sortedPlayers = [...players].sort((a, b) => {
    const statusOrder = { online: 0, looking: 1, offline: 2 };
    return statusOrder[a.status] - statusOrder[b.status];
  });
  const displayedPlayers = sortedPlayers.slice(0, 6);

  const formatEventDate = (dateString: string, timeString: string) => {
    try {
      const date = new Date(`${dateString}T${timeString}`);
      const now = new Date();
      const diffMs = date.getTime() - now.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);

      if (diffDays > 0) {
        return `in ${diffDays} day${diffDays !== 1 ? "s" : ""}`;
      } else if (diffHours > 0) {
        return `in ${diffHours} hour${diffHours !== 1 ? "s" : ""}`;
      } else {
        const diffMins = Math.floor(diffMs / (1000 * 60));
        return diffMins > 0 ? `in ${diffMins} min${diffMins !== 1 ? "s" : ""}` : "Starting soon";
      }
    } catch {
      return "";
    }
  };

  // Simple markdown parser for bullet points
  const parseMarkdownBullets = (content: string): string[] => {
    const lines = content.split('\n');
    const bullets: string[] = [];
    
    for (const line of lines) {
      const trimmed = line.trim();
      // Match markdown bullet points (-, *, •) or numbered lists
      if (trimmed.match(/^[-*•]\s+(.+)$/) || trimmed.match(/^\d+\.\s+(.+)$/)) {
        const match = trimmed.match(/^[-*•]\s+(.+)$/) || trimmed.match(/^\d+\.\s+(.+)$/);
        if (match && match[1]) {
          // Remove markdown bold (**text**)
          const text = match[1].replace(/\*\*(.+?)\*\*/g, '$1');
          bullets.push(text);
        }
      }
    }
    
    return bullets.slice(0, 6); // Limit to 6 bullet points
  };

  return (
    <div className="space-y-8">
      {/* Latest Communities */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Latest Communities</h2>
          {communities.length > latestCommunities.length && (
            <Link 
              href={`/games/${game.slug}?tab=communities`}
              className="text-white/60 hover:text-white text-sm transition-colors"
            >
              View all {communities.length} <ArrowRight className="inline-block w-3 h-3 ml-1" />
            </Link>
          )}
        </div>
        {latestCommunities.length > 0 ? (
          <div className="flex flex-col gap-4">
            {latestCommunities.map((community) => {
              // Calculate playing now count (players with status "online" or "looking")
              const playingNowCount = players.filter(
                p => p.status === 'online' || p.status === 'looking'
              ).length;
              
              return (
                <CommunityCard 
                  key={community.id} 
                  community={community}
                  playingNowCount={playingNowCount}
                />
              );
            })}
          </div>
        ) : (
          <div className="bg-[#0E0E0E] border border-white/10 rounded-lg p-8 text-center">
            <Users2 className="w-12 h-12 text-white/20 mx-auto mb-3" />
            <h3 className="text-white font-medium mb-2">No communities yet for this game</h3>
            <p className="text-white/60 text-sm mb-4">
              Communities help players find teammates and organize sessions.
            </p>
            <button className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded transition-colors text-sm">
              <Plus className="w-4 h-4" />
              Create the first community
            </button>
          </div>
        )}
      </section>

      {/* How to Play Together Guide */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-4">How to Play Together</h2>
        {gamePlayGuide ? (
          <div className="bg-[#0E0E0E] border border-white/10 rounded-lg p-6">
            <div className="prose prose-invert max-w-none">
              {parseMarkdownBullets(gamePlayGuide.content).length > 0 ? (
                <ul className="space-y-2 list-none pl-0">
                  {parseMarkdownBullets(gamePlayGuide.content).map((bullet, index) => (
                    <li key={index} className="flex items-start gap-3 text-white/80 text-sm">
                      <span className="text-blue-400 mt-1 flex-shrink-0">•</span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-white/70 text-sm whitespace-pre-line">{gamePlayGuide.content}</p>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-[#0E0E0E] border border-white/10 rounded-lg p-6">
            <Gamepad2 className="w-8 h-8 text-white/20 mb-3" />
            <p className="text-white/60 text-sm">
              No play-together guide yet. Later we'll allow curators to add step-by-step instructions for each game.
            </p>
          </div>
        )}
      </section>

      {/* People Playing This Game */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">People Playing This Game</h2>
          {players.length > displayedPlayers.length && (
            <span className="text-white/60 text-sm">
              {players.length} {players.length === 1 ? 'player' : 'players'} listed
            </span>
          )}
        </div>
        {displayedPlayers.length > 0 ? (
          <>
            <div className="mb-3">
              <p className="text-white/60 text-sm">
                {players.length} {players.length === 1 ? 'player' : 'players'} listed for this game
              </p>
            </div>
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
              {displayedPlayers.map((player) => (
                <PlayerCard key={player.id} player={player} />
              ))}
            </div>
          </>
        ) : (
          <div className="bg-[#0E0E0E] border border-white/10 rounded-lg p-8 text-center">
            <Users className="w-12 h-12 text-white/20 mx-auto mb-3" />
            <h3 className="text-white font-medium mb-2">No players listed yet</h3>
            <p className="text-white/60 text-sm mb-4">
              Be the first to add this game to your profile and show others you're playing.
            </p>
            <div className="inline-block">
              <AddToYourGamesButton 
                gameId={game.id} 
                hasUser={hasUser}
                initialIsInLibrary={initialIsInLibrary}
              />
            </div>
          </div>
        )}
      </section>

      {/* Upcoming Events */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Upcoming Events</h2>
          {events.length > 0 && (
            <span className="text-white/60 text-sm">
              {events.length} upcoming
            </span>
          )}
        </div>
        {loadingEvents ? (
          <div className="bg-[#0E0E0E] border border-white/10 rounded-lg p-6 text-center">
            <p className="text-white/60 text-sm">Loading events...</p>
          </div>
        ) : events.length > 0 ? (
          <div className="space-y-3">
            {events.map((event) => {
              const username = event.creator?.user_metadata?.username || 
                             event.creator?.email?.split("@")[0] || 
                             `Player ${event.createdBy.slice(0, 8)}`;
              const isFull = event.playersHave >= event.playersNeeded;
              
              return (
                <div
                  key={event.id}
                  className={`bg-[#0E0E0E] border rounded-lg p-4 hover:border-white/20 transition-colors ${
                    isFull ? "border-green-500/30" : "border-white/10"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-semibold">
                        {username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Tags */}
                      {event.tags && event.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                          {event.tags.slice(0, 3).map((tag, idx) => (
                            <span
                              key={idx}
                              className="bg-white/10 border border-white/20 text-white text-xs px-2 py-0.5 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      {/* Description */}
                      {event.description && (
                        <p className="text-white/80 text-sm mb-2 line-clamp-2">
                          {event.description}
                        </p>
                      )}
                      
                      {/* Metadata */}
                      <div className="flex flex-wrap items-center gap-4 text-xs text-white/60">
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>
                            {event.playersHave}/{event.playersNeeded} players
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(event.startDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>
                            {formatEventDate(event.startDate, event.startTime)}
                          </span>
                        </div>
                        {event.gameVersion && (
                          <span className="text-white/80">
                            {event.gameVersion.versionName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-[#0E0E0E] border border-white/10 rounded-lg p-8 text-center">
            <Calendar className="w-12 h-12 text-white/20 mx-auto mb-3" />
            <h3 className="text-white font-medium mb-2">No events yet</h3>
            <p className="text-white/60 text-sm">
              Once players start organizing sessions, you'll see them here.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
