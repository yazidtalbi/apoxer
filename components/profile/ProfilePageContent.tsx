"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { LayoutDashboard, Gamepad2 } from "lucide-react";
import ProfileTabs from "./ProfileTabs";
import FeaturedGamesRow from "./FeaturedGamesRow";
import PinnedLfgCard from "./PinnedLfgCard";
import { FeaturedGame, PinnedLfgPost, PlayerGame } from "@/lib/profile";

interface ProfilePageContentProps {
  featuredGames: FeaturedGame[];
  allGames: PlayerGame[];
  pinnedLfg: PinnedLfgPost | null;
}

export default function ProfilePageContent({
  featuredGames,
  allGames,
  pinnedLfg,
}: ProfilePageContentProps) {
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    { key: "overview", label: "Overview", icon: LayoutDashboard },
    { key: "games", label: "Games", icon: Gamepad2, count: allGames.length },
  ];

  return (
    <>
      {/* Tabs Navigation */}
      <ProfileTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Content */}
      <div className="min-h-[400px] mt-8">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Featured Games */}
            <FeaturedGamesRow games={featuredGames} />

            {/* Pinned LFG Card */}
            {pinnedLfg && <PinnedLfgCard post={pinnedLfg} />}
          </div>
        )}

        {/* Games Tab */}
        {activeTab === "games" && (
          <div className="space-y-6">
            {/* Games Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {allGames.map((item) => (
                <Link
                  key={item.id}
                  href={`/games/${item.game.slug}`}
                  className="bg-[#0E0E0E] border border-white/10 rounded-lg overflow-hidden hover:border-white/20 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <div className="relative aspect-[3/4] w-full">
                    {item.game.coverUrl ? (
                      <Image
                        src={item.game.coverUrl}
                        alt={item.game.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                      />
                    ) : (
                      <div className="w-full h-full bg-white/5 flex items-center justify-center">
                        <span className="text-white/40 text-xs">No cover</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="text-white text-sm font-medium truncate mb-2">
                      {item.game.title}
                    </h3>
                    {item.platform && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        <span className="text-xs bg-white/10 text-white/80 px-2 py-0.5 rounded">
                          {item.platform.toUpperCase()}
                        </span>
                      </div>
                    )}
                    {item.skillLevel && (
                      <p className="text-white/60 text-xs capitalize">{item.skillLevel}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {allGames.length === 0 && (
              <div className="bg-[#0E0E0E] border border-white/10 rounded-lg p-8 text-center">
                <p className="text-white/60 text-sm">No games added yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

