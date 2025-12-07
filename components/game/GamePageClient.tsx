"use client";

/**
 * GAME PAGE LAYOUT REFACTOR PLAN
 * 
 * Goal: Create a Spotify-like layout with three columns:
 * 1. Left: Persistent lobby sidebar (handled by AppShell)
 * 2. Center: Wide, dominant game content area (flex-grow)
 * 3. Right: Narrow, lightweight metadata sidebar (fixed width, ~240px)
 * 
 * Changes:
 * - Center column uses flex-grow to take all remaining space
 * - Increased vertical spacing around title/stats for "hero" feel
 * - Tabs span full width of center content with full-width divider
 * - All sections use full width of center column
 * - Right sidebar reduced from 280px to 240px, lighter styling
 * - Better visual hierarchy with center as primary focus
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { LayoutDashboard, Users, Gamepad2, Calendar, UserCircle, Clock } from "lucide-react";
import { Game, GamePlayGuide, GameGameTrait } from "@/types";
import GameTabs from "./GameTabs";
import OverviewSection from "./OverviewSection";
import PlayTogetherSection from "./PlayTogetherSection";
import CommunitiesSection from "./CommunitiesSection";
import EventsSection from "./EventsSection";
import PlayersSection from "./PlayersSection";
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

  // Get game cover URL for background
  const coverUrl = (game as Game & { cover_url?: string }).cover_url || game.coverUrl;

  // Set game in context when component mounts (only if not already set)
  useEffect(() => {
    // Only set if there's no active lobby or if it's a different game
    setGame(game);
    setShowLobby(true);
    // Don't clear on unmount - let it persist
  }, [game, setGame, setShowLobby]);

  const tabs = [
    { key: "overview", label: "Overview", icon: LayoutDashboard },
    { key: "communities", label: "Communities", count: communities.length, icon: Users },
    { key: "play", label: "Play Together", icon: Gamepad2 },
    { key: "players", label: "Players", count: players.length, icon: UserCircle },
    { key: "events", label: "Events", icon: Calendar },
  ];

  // Calculate stats
  const totalPlayers = players.length;
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const recentPlayersCount = players.filter((player: any) => {
    if (!player.updated_at) return false;
    const updatedDate = new Date(player.updated_at);
    return updatedDate >= oneWeekAgo;
  }).length;

  // Get game metadata
  const gameExtended = game as Game & {
    developer?: string | null;
    publisher?: string | null;
    release_date?: string | null;
    release_year?: number | null;
  };
  const developer = gameExtended.developer || "TBA";
  const publisher = gameExtended.publisher || "TBA";
  
  // Format release date
  let formattedReleaseDate = "Coming Soon";
  if (gameExtended.release_date) {
    try {
      const date = new Date(gameExtended.release_date);
      if (!isNaN(date.getTime())) {
        formattedReleaseDate = date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        }).toUpperCase();
      }
    } catch (e) {
      // Fall back to original string if parsing fails
      formattedReleaseDate = gameExtended.release_date;
    }
  } else if (gameExtended.release_year) {
    formattedReleaseDate = gameExtended.release_year.toString();
  }
  
  const platform = gameExtended.platforms?.[0] || "PC";

  return (
    <>
      {/* Hero Section with Blurred Cover Background - Spotify style */}
      <div className="relative -mx-4 sm:-mx-6 lg:-mx-8 -mt-6 sm:-mt-8 mb-12 overflow-hidden">
        {/* Blurred Cover Background */}
        {coverUrl && (
          <div className="absolute inset-0 top-0 h-[500px] z-0">
            <div className="absolute inset-0 scale-125">
              <Image
                src={coverUrl}
                alt={game.title}
                fill
                className="object-cover opacity-20"
                style={{ filter: 'opacity(0.5) saturate(2)' }}  
                sizes="100vw"
                priority
                unoptimized
              />
            </div>
            {/* Fade overlay - matches page background with smooth transition */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#1A1A1A]/50 to-[#1A1A1A]" />
          </div>
        )}
        {/* Fallback gradient if no cover */}
        {!coverUrl && (
          <div className="absolute inset-0 h-[500px] z-0 bg-[#1A1A1A]" />
        )}
        
        {/* Content */}
        <div className="relative z-10 px-4 sm:px-6 lg:px-8 pb-12 top-8">
          <div className="flex gap-6 items-end">
        {/* Left Column - Title and Stats */}
        <div className="flex-1 min-w-0 overflow-hidden">
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

          {/* Game Metadata - White rounded boxes */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            {/* Developer */}
            <div className="bg-white rounded-sm px-2 h-5 flex items-center justify-center py-0">
              <span className="text-xs text-black">{developer}</span>
            </div>
            
            {/* Release Date */}
            <div className="bg-white rounded-sm px-2 h-5 flex items-center justify-center py-0">
              <span className="text-xs  text-black">{formattedReleaseDate}</span>
            </div>
            
            {/* Platform Icons */}
            {game.platforms && game.platforms.length > 0 && (
              <>
                {game.platforms.map((platformName) => {
                  const platformLower = platformName.toLowerCase();
                  if (platformLower === "pc" || platformLower === "windows") {
                    return (
                      <svg key={platformName} className="w-5 h-4 text-white" fill="currentColor" viewBox="0 0 480 512">
                        <g>
                          <path d="M0.175 256l-0.175-156.037 192-26.072v182.109zM224 69.241l255.936-37.241v224h-255.936zM479.999 288l-0.063 224-255.936-36.008v-187.992zM192 471.918l-191.844-26.297-0.010-157.621h191.854z"></path>
                        </g>
                      </svg>
                    );
                  } else if (platformLower.includes("playstation") || platformLower.includes("ps")) {
                    return (
                      <svg key={platformName} className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8.984 2.596v17.547l3.915 1.261V6.688c0-.69.304-1.151.794-1.151.49 0 .812.461.812 1.151v13.435l1.954.606V6.991c0-.69.293-1.151.773-1.151.481 0 .785.461.785 1.151v11.02l1.794.586c-.006-2.948-.007-5.199-.007-5.199 0-.69.293-1.151.773-1.151.481 0 .785.461.785 1.151v3.047c.979-.326 2.811-1.068 4.131-1.601C22.385 15.863 24 15.017 24 12.739c0-2.576-2.448-5.238-7.932-6.352-.61-.123-1.223-.185-1.836-.185-3.261 0-5.399.369-5.399 1.262 0 .69.293 1.151.773 1.151.481 0 .785-.461.785-1.151 0-.046.033-.09.033-.09l.007-.018c.005-.033 0-.065-.004-.089 0-.023-.007-.045-.016-.066a.226.226 0 00-.017-.045l-.003-.008a.159.159 0 00-.02-.04c-.01-.013-.02-.024-.03-.033a.26.26 0 00-.047-.033c-.014-.008-.03-.012-.045-.018a.135.135 0 00-.028-.007l-.01-.002c-.01-.002-.021-.003-.032-.003-.011 0-.022.001-.033.003l-.01.002a.135.135 0 00-.028.007c-.015.006-.031.01-.045.018a.26.26 0 00-.047.033c-.01.009-.02.02-.03.033a.159.159 0 00-.02.04l-.003.008a.226.226 0 00-.017.045c-.009.021-.016.043-.016.066 0 .024.009.056.004.089l.007.018s.033.044.033.09c0 .69.293 1.151.773 1.151.481 0 .785-.461.785-1.151 0-.893-2.138-1.262-5.399-1.262-.613 0-1.226.062-1.836.185C2.448 7.5 0 10.163 0 12.739c0 2.278 1.615 3.124 3.92 3.786.696.208 1.433.398 2.187.569v.214c0 .69.293 1.151.773 1.151.481 0 .785-.461.785-1.151V2.596c0-.69-.304-1.151-.794-1.151-.49 0-.812.461-.812 1.151z"/>
                      </svg>
                    );
                  } else if (platformLower.includes("xbox")) {
                    return (
                      <svg key={platformName} className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M4.102 21.033C2.162 18.676 0 15.402 0 12 0 5.373 5.373 0 12 0s12 5.373 12 12c0 3.402-2.162 6.676-4.102 9.033L12 12 4.102 21.033zm13.78-1.354C19.962 18.432 24 15.527 24 12c0-6.627-5.373-12-12-12S0 5.373 0 12c0 3.527 4.038 6.432 9.118 7.679L12 12l5.882 7.679z"/>
                      </svg>
                    );
                  } else if (platformLower.includes("nintendo") || platformLower.includes("switch")) {
                    return (
                      <svg key={platformName} className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.904 5.405a6.393 6.393 0 01-3.018 1.127c.078-.5.118-1.014.118-1.539 0-4.078-3.306-7.384-7.384-7.384-2.263 0-4.276 1.019-5.637 2.623A11.948 11.948 0 0112 0c6.627 0 12 5.373 12 12 0 1.047-.134 2.067-.387 3.044a6.393 6.393 0 01-1.127-3.018c.5-.078 1.014-.118 1.539-.118 2.263 0 4.276-1.019 5.637-2.623A11.948 11.948 0 0024 12c0-6.627-5.373-12-12-12S0 5.373 0 12c0 1.047.134 2.067.387 3.044a6.393 6.393 0 001.127 3.018C.014 13.984 0 13.494 0 12.993c0-4.078 3.306-7.384 7.384-7.384 2.263 0 4.276 1.019 5.637 2.623A11.948 11.948 0 0112 7.5c.506 0 1.004-.04 1.49-.118a6.393 6.393 0 01-1.127-3.018c-.5.078-1.014.118-1.539.118-2.263 0-4.276-1.019-5.637-2.623A11.948 11.948 0 0012 2.5c4.078 0 7.384 3.306 7.384 7.384 0 2.263-1.019 4.276-2.623 5.637a11.948 11.948 0 01-3.044.387 6.393 6.393 0 01-3.018-1.127c.078-.5.118-1.014.118-1.539 0-2.263-1.019-4.276-2.623-5.637A11.948 11.948 0 0012 5c-2.263 0-4.276 1.019-5.637 2.623A11.948 11.948 0 0012 10c4.078 0 7.384-3.306 7.384-7.384 0-2.263-1.019-4.276-2.623-5.637A11.948 11.948 0 0012 0C5.373 0 0 5.373 0 12c0 6.627 5.373 12 12 12s12-5.373 12-12c0-6.627-5.373-12-12-12z"/>
                      </svg>
                    );
                  }
                  return null;
                })}
              </>
            )}
          </div>

          {/* Title and Stats */}
          <div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 break-words">
              {game.title}
            </h1>
            
            {/* Action Buttons Row - Spotify style */}
            <div className="flex items-center gap-4 mb-8">
              <SidebarActions
                game={game}
                communities={communities}
                playersCount={players.length}
                initialIsInLibrary={initialIsInLibrary}
                hasUser={hasUser}
                onEventCreateClick={() => setActiveTab("events")}
                onLobbyClick={() => setShowLobby(true)}
                horizontal={true}
              />
            </div>
            
            {/* Stats Cards */}
            {/* <div className="flex items-center border border-white/10 rounded-lg p-4 mb-6 max-w-lg">
              {/* Total Players */}
              {/* <div className="flex flex-col items-center flex-1 px-4 pl-0 border-r border-white/10">
                <span className="text-3xl font-bold text-white leading-none mb-2">{totalPlayers}</span>
                <span className="text-sm text-white/60 font-normal">Players</span>
              </div> */}
              
              {/* Recent Players */}
              {/* <div className="flex flex-col items-center flex-1 px-4 border-r border-white/10">
                <span className="text-3xl font-bold text-white leading-none mb-2">{recentPlayersCount}</span>
                <span className="text-sm text-white/60 font-normal">Recent</span>
              </div> */}
              
              {/* Active Now */}
              {/* <div className="flex flex-col items-center flex-1 px-4 border-r border-white/10">
                <span className="text-3xl font-bold text-white leading-none mb-2">
                  {players.filter((p: any) => p.status === 'online' || p.status === 'looking').length}
                </span>
                <span className="text-sm text-white/60 font-normal">Active Now</span>
              </div> */}
              
              {/* Guides Available */}
              {/* <div className="flex flex-col items-center flex-1 px-4 pr-0">
                <span className="text-3xl font-bold text-white leading-none mb-2">{guides.length + playGuides.length}</span>
                <span className="text-sm text-white/60 font-normal">Guides</span>
              </div> */}
            {/* </div> */}
            
            {/* Game Traits */}
            {gameTraits && gameTraits.length > 0 && (
              <div className="mb-6 overflow-hidden">
                <div className="flex flex-wrap items-center gap-3">
                  {gameTraits.map((trait) => (
                    <div
                      key={trait.gameTrait.slug}
                      className="flex items-center gap-2.5 px-2.5 py-0.5 rounded-sm border   bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      {/* Icon */}
                      {trait.gameTrait.iconEmoji && (
                        <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ">
                          <span className="text-md" role="img" aria-label={trait.gameTrait.label}>
                            {trait.gameTrait.iconEmoji}
                          </span>
                        </div>
                      )}
                      {/* Text */}
                      <span className="text-white text-xs font-semibold leading-tight whitespace-nowrap">
                        {trait.gameTrait.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Genres */}
            {game.genres && game.genres.length > 0 && (
              <div className="flex flex-wrap items-center gap-3">
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
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - Game Cover */}
        <aside className="hidden lg:block w-[280px] flex-shrink-0">
          <SidebarActions
            game={game}
            communities={communities}
            playersCount={players.length}
            initialIsInLibrary={initialIsInLibrary}
            hasUser={hasUser}
            onEventCreateClick={() => setActiveTab("events")}
            onLobbyClick={() => setShowLobby(true)}
            horizontal={false}
          />
        </aside>
          </div>
        </div>
      </div>

      {/* Tabs Navigation - Full screen width */}
      <div className="w-full -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        <GameTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Tab Content - Full width sections */}
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
        {activeTab === "players" && (
          <PlayersSection players={players} />
        )}
        {activeTab === "events" && (
          <EventsSection game={game} />
        )}
      </div>
    </>
  );
}
