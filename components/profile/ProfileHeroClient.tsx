"use client";

import Image from "next/image";
import Link from "next/link";
import { PlayerProfile } from "@/lib/profile";
import { Link as LinkIcon } from "lucide-react";

interface ProfileHeroClientProps {
  profile: PlayerProfile;
  isOwnProfile: boolean;
}

export default function ProfileHeroClient({ profile, isOwnProfile }: ProfileHeroClientProps) {
  const getStatusColor = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case "online":
        return "bg-green-500";
      case "looking":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusLabel = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case "online":
        return "Online";
      case "looking":
        return "Looking";
      default:
        return "Offline";
    }
  };

  const bioPreview = profile.bio?.split("\n")[0] || "";

  return (
    <div className="mb-8">
      {/* Hero Section */}
      <div className="flex items-start gap-4 mb-6">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {profile.avatarUrl ? (
            <div className="relative w-20 h-20 rounded-full overflow-hidden">
              <Image
                src={profile.avatarUrl}
                alt={profile.displayName}
                fill
                className="object-cover"
                sizes="80px"
              />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center">
              <span className="text-white text-2xl font-semibold">
                {profile.displayName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          {/* Status dot */}
          <div
            className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-[#1A1A1A] ${getStatusColor(
              profile.status
            )}`}
          />
        </div>

        {/* Name and Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl md:text-3xl font-bold text-white truncate">
              {profile.displayName}
            </h1>
            {profile.status?.toLowerCase() === "online" && (
              <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-medium rounded-full border border-green-500/30">
                {getStatusLabel(profile.status)}
              </span>
            )}
          </div>
          <p className="text-white/60 text-sm mb-2">@{profile.username}</p>
          {bioPreview && (
            <p className="text-white/80 text-sm mb-4 line-clamp-2">{bioPreview}</p>
          )}

          {/* Stats Row */}
          <div className="flex items-center gap-6 mb-4">
            <div className="text-sm">
              <span className="text-white font-semibold">{profile.gamesCount.toLocaleString()}</span>
              <span className="text-white/60 ml-1">Games</span>
            </div>
            <Link
              href={`/profile/${profile.username}/followers`}
              className="text-sm hover:underline transition-colors"
            >
              <span className="text-white font-semibold">{profile.followersCount.toLocaleString()}</span>
              <span className="text-white/60 ml-1">Followers</span>
            </Link>
            <Link
              href={`/profile/${profile.username}/following`}
              className="text-sm hover:underline transition-colors"
            >
              <span className="text-white font-semibold">{profile.followingCount.toLocaleString()}</span>
              <span className="text-white/60 ml-1">Following</span>
            </Link>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition-colors">
              Invite
            </button>
            {!isOwnProfile && (
              <button className="bg-white/10 hover:bg-white/20 text-white px-5 py-2 rounded-lg font-medium transition-colors border border-white/20">
                + Follow
              </button>
            )}
            {isOwnProfile && (
              <button className="bg-white/10 hover:bg-white/20 text-white px-5 py-2 rounded-lg font-medium transition-colors border border-white/20">
                Edit profile
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Gaming Accounts Linking */}
      <section className="mt-6">
        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
          <LinkIcon className="w-4 h-4 text-white/60" />
          Gaming Accounts
        </h3>
        <div className="flex flex-wrap gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-[#171a21] hover:bg-[#1e2329] text-white rounded-lg border border-white/10 transition-colors text-sm font-medium">
            <span>Steam</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-[#313131] hover:bg-[#404040] text-white rounded-lg border border-white/10 transition-colors text-sm font-medium">
            <span>Epic Games</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-[#107c10] hover:bg-[#148014] text-white rounded-lg border border-white/10 transition-colors text-sm font-medium">
            <span>Xbox</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-[#003087] hover:bg-[#0040a3] text-white rounded-lg border border-white/10 transition-colors text-sm font-medium">
            <span>PlayStation</span>
          </button>
          {isOwnProfile && (
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-lg border border-dashed border-white/20 transition-colors text-sm font-medium">
              <span>+ Link Account</span>
            </button>
          )}
        </div>
      </section>
    </div>
  );
}

