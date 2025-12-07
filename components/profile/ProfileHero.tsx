import Image from "next/image";
import Link from "next/link";
import { PlayerProfile } from "@/lib/profile";
import { getCurrentUser } from "@/lib/supabase-server";
import ProfileHeroClient from "./ProfileHeroClient";

interface ProfileHeroProps {
  profile: PlayerProfile;
}

export default async function ProfileHero({ profile }: ProfileHeroProps) {
  const currentUser = await getCurrentUser();
  const isOwnProfile = currentUser?.id === profile.userId;

  return <ProfileHeroClient profile={profile} isOwnProfile={isOwnProfile} />;
}

