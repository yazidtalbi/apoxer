"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { dummyProfile } from "@/lib/mockProfile";
import { UserProfile, ProfileGame, ProfileEvent } from "@/types/profile";
import { LayoutDashboard, Calendar, Users, BookOpen, Gamepad2, Pin, MapPin, Globe, Mail, MoreHorizontal, CheckCircle2 } from "lucide-react";
import GameTabs from "@/components/game/GameTabs";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // For now, use dummyProfile regardless of username param
  const profile: UserProfile = dummyProfile;

  const tabs = [
    { key: "overview", label: "Overview", icon: LayoutDashboard },
    { key: "games", label: "Games", icon: Gamepad2, count: profile.games.length },
    { key: "communities", label: "Communities", icon: Users, count: profile.communities.length },
    { key: "guides", label: "Guides", icon: BookOpen, count: profile.guides.length },
    { key: "events", label: "Events", icon: Calendar, count: profile.events.length },
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
    <>
      {/* Breadcrumbs */}
      <nav className="text-xs mb-6">
        <div className="flex items-center gap-2 text-white/40 uppercase tracking-wide">
          <Link href="/" className="hover:text-white/60 transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/profile" className="hover:text-white/60 transition-colors">
            Profile
          </Link>
          <span>/</span>
          <span className="text-white/40">@{profile.username}</span>
        </div>
      </nav>

      {/* Profile Header - Centered */}
      <div className="mb-8">
        <div className="flex flex-col items-center text-center mb-8">
          {/* Avatar with Checkmark */}
          <div className="relative mb-4">
            <div className="relative w-32 h-32 rounded-full overflow-hidden">
              <Image
                src={profile.avatarUrl}
                alt={`Avatar for ${profile.displayName}`}
                fill
                className="object-cover"
                sizes="128px"
              />
            </div>
            <div className="absolute bottom-0 right-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center border-2 border-[#1A1A1A]">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
          </div>

          {/* Name with Online Status */}
          <div className="flex items-center justify-center gap-2 mb-2">
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              {profile.displayName}
            </h1>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>

          {/* Title/Description */}
          {profile.bio && (
            <p className="text-white/80 text-base mb-4 max-w-2xl">
              {profile.bio}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <MoreHorizontal className="w-5 h-5 text-white/60" />
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
              Hire me
            </button>
            <button className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-lg font-medium transition-colors border border-white/20">
              + Follow
            </button>
          </div>
        </div>
      </div>

      {/* Main Content with Right Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
        {/* Left Column - Main Content */}
        <div>
          {/* Experience Section */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-3">Experience</h2>
            <p className="text-white/80 text-base">
              I specialise in gaming communities, matchmaking, and game discovery. I help players find teammates and organize gaming sessions.
            </p>
          </section>

          {/* About Me Section */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-3">About me</h2>
            <p className="text-white/80 text-base leading-relaxed mb-2">
              {profile.bio || "I'm a passionate gamer based in " + (profile.timezone || "the gaming world") + ". I specialise in finding the right gaming communities, connecting players for matchmaking, and discovering new games. I'm always looking to grow my gaming network and help others find their perfect gaming partners. My gaming journey has been featured across various gaming platforms and communities."}
            </p>
            <button className="text-blue-400 hover:text-blue-300 text-sm transition-colors">
              Read more ↓
            </button>
          </section>

          {/* Tabs Navigation */}
          <GameTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Tab Content */}
          <div className="min-h-[400px] mt-8">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-8">
                {/* Case Studies / Featured Games */}
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-white">Featured Games</h2>
                    <Link href="#" className="text-white/60 hover:text-white text-sm transition-colors flex items-center gap-1">
                      View more <span>↗</span>
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {playingGames.slice(0, 3).map((game) => (
                      <Link
                        key={game.id}
                        href={`/games/${game.slug}`}
                        className="bg-[#0E0E0E] border border-white/10 rounded-lg overflow-hidden hover:border-white/20 transition-all group"
                      >
                        <div className="relative aspect-video w-full">
                          <Image
                            src={game.coverUrl}
                            alt={game.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 33vw"
                          />
                        </div>
                        <div className="p-4">
                          <p className="text-white/60 text-sm mb-2">Video Game</p>
                          <h3 className="text-white font-medium mb-2 group-hover:text-blue-400 transition-colors">
                            {game.title}
                          </h3>
                          <div className="flex items-center justify-between">
                            <span className="text-white/40 text-xs">{game.platforms[0]?.toUpperCase() || "PC"}</span>
                            <span className="text-white/60">→</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>

                {/* Pinned Event */}
                {pinnedEvent && (
                  <section>
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
                  </section>
                )}
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

        {/* Right Sidebar */}
        <aside className="lg:sticky lg:top-8 self-start">
          <div className="space-y-6">
            {/* Skills */}
            <section>
              <h3 className="text-white font-semibold mb-3">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {["Gaming", "Matchmaking", "Community Building", "Game Discovery"].map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1.5 bg-white/10 text-white/80 rounded-full text-sm border border-white/20"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </section>

            {/* Location */}
            <section>
              <h3 className="text-white font-semibold mb-3">Location</h3>
              <div className="flex items-center gap-2 text-white/80">
                <MapPin className="w-4 h-4 text-white/60" />
                <span>{profile.timezone || "Global"}</span>
              </div>
            </section>

            {/* Website */}
            <section>
              <h3 className="text-white font-semibold mb-3">Website</h3>
              <a
                href="#"
                className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
              >
                <span>@{profile.username}.com</span>
                <Globe className="w-4 h-4 text-white/60" />
              </a>
            </section>

            {/* Email */}
            <section>
              <h3 className="text-white font-semibold mb-3">Email</h3>
              <a
                href={`mailto:${profile.username}@example.com`}
                className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
              >
                <span>{profile.username}@example.com</span>
                <Mail className="w-4 h-4 text-white/60" />
              </a>
            </section>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 pt-4">
              <button className="w-full bg-white/10 hover:bg-white/20 text-white px-4 py-3 rounded-lg font-medium transition-colors border border-white/20">
                Add to list
              </button>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-colors">
                Message
              </button>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
