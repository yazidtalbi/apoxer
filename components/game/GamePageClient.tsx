"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Game, GamePlayGuide, GameGameTrait } from "@/types";
import GameTabs from "./GameTabs";
import OverviewSection from "./OverviewSection";
import PlayTogetherSection from "./PlayTogetherSection";
import CommunitiesSection from "./CommunitiesSection";
import EventsSection from "./EventsSection";
import SidebarActions from "./SidebarActions";
import { useLobby } from "@/contexts/LobbyContext";

interface GamePageClientProps {
  game: Game;
  communities: any[];
  guides: any[];
  playGuides: any[];
  players: any[];
  similarGames: Game[];
  gamePlayGuide?: GamePlayGuide | null;
  gameTraits?: GameGameTrait[];
  initialIsInLibrary?: boolean;
  hasUser?: boolean;
}

/**
 * Client Component - Handles interactive features like tabs
 * Receives all data as props from server component
 */
export default function GamePageClient({
  game,
  communities,
  guides,
  playGuides,
  players,
  similarGames,
  gamePlayGuide,
  gameTraits = [],
  initialIsInLibrary = false,
  hasUser = false,
}: GamePageClientProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const { setGame, setShowLobby, isLobbyModalOpen, setIsLobbyModalOpen } = useLobby();

  // Set game in context when component mounts (only if not already set)
  useEffect(() => {
    // Only set if there's no active lobby or if it's a different game
    setGame(game);
    setShowLobby(true);
    // Don't clear on unmount - let it persist
  }, [game, setGame, setShowLobby]);

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "communities", label: "Communities", count: communities.length },
    { key: "play", label: "Play Together" },
    { key: "events", label: "Events" },
  ];

  return (
    <>
      <div className="grid gap-0 md:grid-cols-[minmax(0,2fr)_minmax(260px,280px)]">
        {/* Left Column */}
        <div className="pr-0 md:pr-6 ">
        {/* Game Title Section - No Hero Background */}
        <div className="mb-8 ">
          {/* Breadcrumbs */}
          <nav className="text-xs mb-4">
            <div className="flex items-center gap-2 text-white/40 uppercase tracking-wide">
              <Link href="/" className="hover:text-white/60 transition-colors">
                Home
              </Link>
              <span>/</span>
              <Link href="/games" className="hover:text-white/60 transition-colors">
                Games
              </Link>
              <span>/</span>
              <span className="text-white/40">{game.title}</span>
            </div>
          </nav>

          {/* Title and Rating/Tags */}
          <div className="flex flex-col gap-3 ">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white max-w-2xl  my-3">
              {game.title}
            </h1>
            
            {/* Game Traits - Under Title */}
            {gameTraits && gameTraits.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:flex md:flex-nowrap gap-3">
                {gameTraits.map((trait) => (
                  <div
                    key={trait.gameTrait.slug}
                    className="flex flex-col items-center justify-center gap-3 rounded-lg bg-[#2A2A2A] px-4 py-5 md:flex-1 md:min-w-0"
                  >
                    {/* Emoji Icon */}
                    {trait.gameTrait.iconEmoji && (
                      <span className="text-3xl flex-shrink-0 mb-1" role="img" aria-label={trait.gameTrait.label}>
                        {trait.gameTrait.iconEmoji}
                      </span>
                    )}
                    {/* Text Content */}
                    <div className="flex flex-col items-center text-center">
                      {/* Prefix Text */}
                      <span className="text-white/50 text-xs font-normal mb-1">
                        {trait.gameTrait.label.toLowerCase().includes('recommended') || 
                         trait.gameTrait.label.toLowerCase().includes('focused') ||
                         trait.gameTrait.label.toLowerCase().includes('heavy') ||
                         trait.gameTrait.label.toLowerCase().includes('active') ||
                         trait.gameTrait.label.toLowerCase().includes('friendly')
                          ? 'This game is' 
                          : 'This game has'}
                      </span>
                      {/* Label */}
                      <span className="text-white text-sm font-bold leading-tight">
                        {trait.gameTrait.label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex flex-wrap items-center gap-3">
              {/* Genres */}
              {game.genres && game.genres.length > 0 && (
                <>
                  <span className="text-white/40">•</span>
                  <div className="flex flex-wrap gap-2">
                    {game.genres.slice(0, 3).map((genre, index) => (
                      <span
                        key={index}
                        className="bg-white/10 border border-white/20 text-white text-xs px-2 py-1 rounded backdrop-blur-sm"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <GameTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Tab Content */}
        <div className="min-h-[400px] mt-8">
          {activeTab === "overview" && (
            <OverviewSection 
              game={game} 
              communities={communities} 
              players={players}
              gamePlayGuide={gamePlayGuide}
              hasUser={hasUser}
              initialIsInLibrary={initialIsInLibrary}
            />
          )}
          {activeTab === "communities" && (
            <CommunitiesSection communities={communities} players={players} />
          )}
          {activeTab === "play" && (
            <PlayTogetherSection game={game} guides={playGuides} />
          )}
          {activeTab === "events" && (
            <EventsSection game={game} />
          )}
        </div>
        </div>

        {/* Right Column - Sticky Sidebar */}
        <aside className="md:sticky md:top-8 self-start border-l border-white/10 pl-6">
          <div className="space-y-4 mb-8 md:mb-0">
            <SidebarActions
              game={game}
              communities={communities}
              playersCount={players.length}
              initialIsInLibrary={initialIsInLibrary}
              hasUser={hasUser}
            onEventCreateClick={() => setActiveTab("events")}
            onLobbyClick={() => setShowLobby(true)}
            />
          </div>
        </aside>
      </div>
    </>
  );
}
