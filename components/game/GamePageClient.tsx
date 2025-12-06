"use client";

import { useState } from "react";
import Link from "next/link";
import { Game } from "@/types";
import GameHero from "./GameHero";
import GameTabs from "./GameTabs";
import OverviewSection from "./OverviewSection";
import PlayTogetherSection from "./PlayTogetherSection";
import CommunitiesSection from "./CommunitiesSection";
import SystemRequirementsSection from "./SystemRequirementsSection";
import MoreLikeThisSection from "./MoreLikeThisSection";
import SidebarActions from "./SidebarActions";

interface GamePageClientProps {
  game: Game;
  communities: any[];
  guides: any[];
  playGuides: any[];
  players: any[];
  similarGames: Game[];
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
}: GamePageClientProps) {
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "play", label: "Play Together" },
    { key: "communities", label: "Communities" },
    { key: "requirements", label: "System Requirements" },
    { key: "similar", label: "More Like This" },
  ];

  const coverUrl = (game as Game & { cover_url?: string }).cover_url || game.coverUrl;
  const gallery = coverUrl ? [coverUrl] : []; // Use cover as gallery for now

  return (
    <div className="py-8">
      {/* Breadcrumbs */}
      <nav className="mb-6 text-sm">
        <div className="flex items-center gap-2 text-white/60">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/games" className="hover:text-white transition-colors">
            Games
          </Link>
          <span>/</span>
          <span className="text-white">{game.title}</span>
        </div>
      </nav>

      {/* Mobile Sidebar - Above Content on Mobile */}
      <div className="lg:hidden mb-8">
        <SidebarActions
          game={game}
          communities={communities}
          playersCount={players.length}
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8">
        {/* Left Column - Main Content (70%) */}
        <div>
          {/* Title & Metadata */}
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-white mb-4">{game.title}</h1>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              {/* Star Rating Placeholder */}
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-5 h-5 text-yellow-400 fill-current"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
                <span className="text-white/60 text-sm ml-2">4.5</span>
              </div>
              {/* Genres */}
              {game.genres && game.genres.length > 0 && (
                <>
                  <span className="text-white/40">•</span>
                  <div className="flex flex-wrap gap-2">
                    {game.genres.slice(0, 3).map((genre, index) => (
                      <span
                        key={index}
                        className="bg-white/5 border border-white/10 text-white/80 text-xs px-2 py-1 rounded"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                </>
              )}
              {/* Platforms */}
              {game.platforms && game.platforms.length > 0 && (
                <>
                  <span className="text-white/40">•</span>
                  <div className="flex flex-wrap gap-2">
                    {game.platforms.slice(0, 2).map((platform, index) => (
                      <span
                        key={index}
                        className="bg-white/5 border border-white/10 text-white/80 text-xs px-2 py-1 rounded"
                      >
                        {platform}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Hero Media Section */}
          <GameHero coverUrl={coverUrl || ""} gallery={gallery} />

          {/* Tabs Navigation */}
          <GameTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Tab Content */}
          <div className="min-h-[400px]">
            {activeTab === "overview" && <OverviewSection game={game} />}
            {activeTab === "play" && (
              <PlayTogetherSection game={game} guides={playGuides} />
            )}
            {activeTab === "communities" && (
              <CommunitiesSection communities={communities} />
            )}
            {activeTab === "requirements" && <SystemRequirementsSection />}
            {activeTab === "similar" && <MoreLikeThisSection games={similarGames} />}
          </div>
        </div>

        {/* Right Column - Sticky Sidebar (30%) */}
        <div className="hidden lg:block">
          <SidebarActions
            game={game}
            communities={communities}
            playersCount={players.length}
          />
        </div>
      </div>
    </div>
  );
}

