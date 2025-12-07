"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { dummyProfile } from "@/lib/mockProfile";
import { UserProfile, ProfileGame, ProfileEvent } from "@/types/profile";
import { UserPlus, Calendar, Users, BookOpen, Gamepad2, Pin } from "lucide-react";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // For now, use dummyProfile regardless of username param
  const profile: UserProfile = dummyProfile;

  const tabs = [
    { key: "overview", label: "Overview", icon: UserPlus },
    { key: "games", label: "Games", icon: Gamepad2 },
    { key: "communities", label: "Communities", icon: Users },
    { key: "guides", label: "Guides", icon: BookOpen },
    { key: "events", label: "Events", icon: Calendar },
  ];

  const playingGames = profile.games.filter((g) => g.status === "playing");
  const pinnedEvent = profile.events.find((e) => e.isPinned);
  const upcomingEvents = profile.events.filter((e) => !e.isPinned);

  const filteredGames =
    statusFilter === "all"
      ? profile.games
      : profile.games.filter((g) => g.status === statusFilter);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status: ProfileGame["status"]) => {
    switch (status) {
      case "playing":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "completed":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "wishlist":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "added":
        return "bg-white/10 text-white/80 border-white/20";
      default:
        return "bg-white/10 text-white/60 border-white/10";
    }
  };

  const getStatusLabel = (status: ProfileGame["status"]) => {
    switch (status) {
      case "playing":
        return "Playing";
      case "completed":
        return "Completed";
      case "wishlist":
        return "Wishlist";
      case "added":
        return "Added";
      default:
        return status;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "owner":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "mod":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "member":
        return "bg-white/10 text-white/60 border-white/10";
      default:
        return "bg-white/10 text-white/60 border-white/10";
    }
  };

  return (
    <div className="min-h-screen bg-[#0E0E0E]">
      {/* Hero Section */}
      <div className="relative w-full">
        {/* Banner Background */}
        {profile.bannerUrl && (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${profile.bannerUrl})`,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-[#0E0E0E]" />
          </div>
        )}
        {!profile.bannerUrl && (
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/30 via-purple-900/20 to-[#0E0E0E]" />
        )}

        {/* Hero Content */}
        <div className="relative w-full pt-8 pb-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-blue-500/50 ring-4 ring-blue-500/20">
                <Image
                  src={profile.avatarUrl}
                  alt={`Avatar for ${profile.displayName}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 96px, 128px"
                />
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1">
                {profile.displayName}
              </h1>
              <p className="text-white/60 text-sm sm:text-base mb-2">
                @{profile.username} • {profile.timezone}
              </p>
              {profile.bio && (
                <p className="text-white/80 text-sm sm:text-base max-w-2xl">
                  {profile.bio}
                </p>
              )}
            </div>

            {/* CTA Button */}
            <div className="flex-shrink-0">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#0E0E0E]">
                Follow
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
              <div className="text-2xl font-bold text-white">{profile.stats.gamesCount}</div>
              <div className="text-white/60 text-sm">Games</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
              <div className="text-2xl font-bold text-white">{profile.stats.communitiesCount}</div>
              <div className="text-white/60 text-sm">Communities</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
              <div className="text-2xl font-bold text-white">{profile.stats.guidesCount}</div>
              <div className="text-white/60 text-sm">Guides</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
              <div className="text-2xl font-bold text-white">{profile.stats.eventsCount}</div>
              <div className="text-white/60 text-sm">Events</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-white/10 bg-[#0E0E0E] sticky top-0 z-10 backdrop-blur-sm">
        <div className="w-full">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-4 py-4 text-sm font-medium transition-colors whitespace-nowrap border-b-2 ${
                    isActive
                      ? "text-white border-blue-500"
                      : "text-white/60 border-transparent hover:text-white/80 hover:border-white/20"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Pinned Event */}
            {pinnedEvent && (
              <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-2 border-blue-500/30 rounded-lg p-6">
                <div className="flex items-start gap-3 mb-4">
                  <Pin className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-white font-semibold text-lg mb-1">
                      {pinnedEvent.title}
                    </h3>
                    <p className="text-white/60 text-sm mb-3">
                      {pinnedEvent.gameTitle} • {pinnedEvent.timeLabel}
                    </p>
                    <p className="text-white/80 text-sm mb-4">{pinnedEvent.description}</p>
                    <div className="flex items-center gap-4 text-xs text-white/60">
                      <span>{pinnedEvent.voicePlatform}</span>
                      <span>
                        {pinnedEvent.slotsTaken}/{pinnedEvent.slotsTotal} slots
                      </span>
                    </div>
                    <div className="mt-3 w-full bg-white/10 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{
                          width: `${(pinnedEvent.slotsTaken / pinnedEvent.slotsTotal) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Now Playing */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">Now Playing</h2>
              {playingGames.length > 0 ? (
                <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
                  {playingGames.slice(0, 4).map((game) => (
                    <Link
                      key={game.id}
                      href={`/games/${game.slug}`}
                      className="flex-shrink-0 w-48 bg-[#0E0E0E] border border-white/10 rounded-lg overflow-hidden hover:border-white/20 transition-all hover:scale-105"
                    >
                      <div className="relative aspect-[3/4] w-full">
                        <Image
                          src={game.coverUrl}
                          alt={game.title}
                          fill
                          className="object-cover"
                          sizes="192px"
                        />
                      </div>
                      <div className="p-3">
                        <h3 className="text-white text-sm font-medium truncate mb-2">
                          {game.title}
                        </h3>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {game.platforms.slice(0, 2).map((platform) => (
                            <span
                              key={platform}
                              className="text-xs bg-white/10 text-white/80 px-2 py-0.5 rounded"
                            >
                              {platform.toUpperCase()}
                            </span>
                          ))}
                        </div>
                        {game.hoursPlayed && (
                          <p className="text-white/60 text-xs">
                            {game.hoursPlayed}h played
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="bg-[#0E0E0E] border border-white/10 rounded-lg p-6 text-center">
                  <p className="text-white/60 text-sm">No games currently being played</p>
                </div>
              )}
            </section>

            {/* Joined Communities */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">Joined Communities</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {profile.communities.slice(0, 3).map((community) => (
                  <div
                    key={community.id}
                    className="bg-[#0E0E0E] border border-white/10 rounded-lg p-4 hover:border-white/20 transition-colors"
                  >
                    <h3 className="text-white font-medium mb-1">{community.name}</h3>
                    <p className="text-white/60 text-sm mb-3">{community.gameTitle}</p>
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs px-2 py-1 rounded border ${getRoleColor(
                          community.role
                        )}`}
                      >
                        {community.role.charAt(0).toUpperCase() + community.role.slice(1)}
                      </span>
                      <span className="text-white/60 text-xs">
                        {community.membersCount.toLocaleString()} members
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Latest Guides */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">Latest Guides</h2>
              <div className="space-y-3">
                {profile.guides.map((guide) => (
                  <div
                    key={guide.id}
                    className="bg-[#0E0E0E] border border-white/10 rounded-lg p-4 hover:border-white/20 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium mb-1">{guide.title}</h3>
                        <p className="text-white/60 text-sm mb-2">{guide.gameTitle}</p>
                        <p className="text-white/40 text-xs">{formatDate(guide.createdAt)}</p>
                      </div>
                      <div className="flex items-center gap-1 text-blue-400 text-sm">
                        <span>↑</span>
                        <span>{guide.upvotes}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* Games Tab */}
        {activeTab === "games" && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              {["all", "playing", "completed", "wishlist"].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    statusFilter === status
                      ? "bg-blue-600 text-white"
                      : "bg-white/10 text-white/80 hover:bg-white/20"
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>

            {/* Games Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredGames.map((game) => (
                <Link
                  key={game.id}
                  href={`/games/${game.slug}`}
                  className="bg-[#0E0E0E] border border-white/10 rounded-lg overflow-hidden hover:border-white/20 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <div className="relative aspect-[3/4] w-full">
                    <Image
                      src={game.coverUrl}
                      alt={game.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="text-white text-sm font-medium truncate mb-2">
                      {game.title}
                    </h3>
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-xs px-2 py-1 rounded border ${getStatusColor(
                          game.status
                        )}`}
                      >
                        {getStatusLabel(game.status)}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {game.platforms.slice(0, 2).map((platform) => (
                        <span
                          key={platform}
                          className="text-xs bg-white/10 text-white/80 px-2 py-0.5 rounded"
                        >
                          {platform.toUpperCase()}
                        </span>
                      ))}
                    </div>
                    {game.hoursPlayed && (
                      <p className="text-white/60 text-xs">{game.hoursPlayed}h played</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Communities Tab */}
        {activeTab === "communities" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {profile.communities.map((community) => (
              <div
                key={community.id}
                className="bg-[#0E0E0E] border border-white/10 rounded-lg p-6 hover:border-white/20 transition-colors"
              >
                <h3 className="text-white font-semibold text-lg mb-2">{community.name}</h3>
                <p className="text-white/60 text-sm mb-4">{community.gameTitle}</p>
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`text-xs px-2 py-1 rounded border ${getRoleColor(community.role)}`}
                  >
                    {community.role.charAt(0).toUpperCase() + community.role.slice(1)}
                  </span>
                  <span className="text-white/60 text-sm">
                    {community.membersCount.toLocaleString()} members
                  </span>
                </div>
                <button
                  className="w-full bg-white/10 hover:bg-white/20 text-white text-sm px-4 py-2 rounded transition-colors"
                  disabled
                >
                  View Community
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Guides Tab */}
        {activeTab === "guides" && (
          <div className="space-y-4">
            {profile.guides.map((guide) => (
              <div
                key={guide.id}
                className="bg-[#0E0E0E] border border-white/10 rounded-lg p-6 hover:border-white/20 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold text-lg mb-2">{guide.title}</h3>
                    <p className="text-white/60 text-sm mb-2">{guide.gameTitle}</p>
                    <p className="text-white/40 text-xs">{formatDate(guide.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-blue-400">
                      <span>↑</span>
                      <span className="text-white font-medium">{guide.upvotes}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Events Tab */}
        {activeTab === "events" && (
          <div className="space-y-4">
            {/* Pinned Events First */}
            {profile.events
              .filter((e) => e.isPinned)
              .map((event) => (
                <div
                  key={event.id}
                  className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-2 border-blue-500/30 rounded-lg p-6"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <Pin className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="text-white font-semibold text-lg mb-1">{event.title}</h3>
                      <p className="text-white/60 text-sm mb-3">
                        {event.gameTitle} • {event.timeLabel}
                      </p>
                      <p className="text-white/80 text-sm mb-4">{event.description}</p>
                      <div className="flex items-center gap-4 text-xs text-white/60 mb-3">
                        <span>{event.voicePlatform}</span>
                        <span>
                          {event.slotsTaken}/{event.slotsTotal} slots
                        </span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all"
                          style={{
                            width: `${(event.slotsTaken / event.slotsTotal) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}

            {/* Other Events */}
            {profile.events
              .filter((e) => !e.isPinned)
              .map((event) => (
                <div
                  key={event.id}
                  className="bg-[#0E0E0E] border border-white/10 rounded-lg p-6 hover:border-white/20 transition-colors"
                >
                  <h3 className="text-white font-semibold text-lg mb-1">{event.title}</h3>
                  <p className="text-white/60 text-sm mb-3">
                    {event.gameTitle} • {event.timeLabel}
                  </p>
                  <p className="text-white/80 text-sm mb-4">{event.description}</p>
                  <div className="flex items-center gap-4 text-xs text-white/60 mb-3">
                    <span>{event.voicePlatform}</span>
                    <span>
                      {event.slotsTaken}/{event.slotsTotal} slots
                    </span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{
                        width: `${(event.slotsTaken / event.slotsTotal) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

