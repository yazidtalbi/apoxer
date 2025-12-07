import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getFollowingForUsername, getPlayerProfileByUsername } from "@/lib/profile";

interface FollowingPageProps {
  params: Promise<{ username: string }>;
}

export default async function FollowingPage({ params }: FollowingPageProps) {
  const { username } = await params;

  // Check if profile exists
  const profile = await getPlayerProfileByUsername(username);
  if (!profile) {
    notFound();
  }

  // Get following
  const following = await getFollowingForUsername(username);

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
          <Link
            href={`/profile/${username}`}
            className="hover:text-white/60 transition-colors"
          >
            @{username}
          </Link>
          <span>/</span>
          <span className="text-white/40">Following</span>
        </div>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
          Following
        </h1>
        <p className="text-white/60 text-sm">
          {following.length} {following.length === 1 ? "person" : "people"}
        </p>
      </div>

      {/* Following List */}
      {following.length === 0 ? (
        <div className="bg-[#0E0E0E] border border-white/10 rounded-xl p-8 text-center">
          <p className="text-white/60 text-sm">
            {profile.displayName} is not following anyone yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {following.map((player) => (
            <Link
              key={player.id}
              href={`/profile/${player.username}`}
              className="bg-[#0E0E0E] border border-white/10 rounded-xl p-4 hover:border-white/20 transition-all hover:scale-[1.02]"
            >
              <div className="flex items-center gap-4">
                {/* Avatar */}
                {player.avatarUrl ? (
                  <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                    <Image
                      src={player.avatarUrl}
                      alt={player.displayName}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-lg font-semibold">
                      {player.displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold truncate">
                    {player.displayName}
                  </h3>
                  <p className="text-white/60 text-sm truncate">@{player.username}</p>
                </div>

                {/* Arrow */}
                <span className="text-white/40">→</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}

export async function generateMetadata({ params }: FollowingPageProps) {
  const { username } = await params;
  const profile = await getPlayerProfileByUsername(username);

  if (!profile) {
    return {
      title: "Player Not Found",
    };
  }

  return {
    title: `Following - ${profile.displayName} (@${username})`,
    description: `View who ${profile.displayName} is following on Apoxer`,
  };
}

