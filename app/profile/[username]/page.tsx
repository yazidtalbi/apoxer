import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getPlayerProfileByUsername,
  getFeaturedGames,
  getPinnedLfgPost,
  getPlayerGames,
} from "@/lib/profile";
import ProfileHero from "@/components/profile/ProfileHero";
import ProfilePageContent from "@/components/profile/ProfilePageContent";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;

  // Fetch all profile data in parallel
  const [profile, featuredGames, pinnedLfg, allGames] = await Promise.all([
    getPlayerProfileByUsername(username),
    // We'll fetch these after we have the profile
    Promise.resolve([]),
    Promise.resolve(null),
    Promise.resolve([]),
  ]);

  // If profile not found, show 404
  if (!profile) {
    notFound();
  }

  // Fetch remaining data now that we have the profile
  const [featuredGamesData, pinnedLfgData, allGamesData] = await Promise.all([
    getFeaturedGames(profile.id, 6),
    getPinnedLfgPost(profile.id),
    getPlayerGames(profile.id),
  ]);

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

      {/* Profile Hero Section */}
      <ProfileHero profile={profile} />

      {/* Main Content */}
      <div>
        <ProfilePageContent
          featuredGames={featuredGamesData}
          allGames={allGamesData}
          pinnedLfg={pinnedLfgData}
        />
      </div>
    </>
  );
}

// Generate metadata for the page
export async function generateMetadata({ params }: ProfilePageProps) {
  const { username } = await params;
  const profile = await getPlayerProfileByUsername(username);

  if (!profile) {
    return {
      title: "Player Not Found",
    };
  }

  return {
    title: `${profile.displayName} (@${profile.username}) - Profile`,
    description: profile.bio || `View ${profile.displayName}'s profile on Apoxer`,
  };
}
