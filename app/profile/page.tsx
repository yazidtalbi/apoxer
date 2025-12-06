import { getCurrentUser } from "@/lib/supabase-server";
import { getUserGames } from "@/lib/user-games";
import GameCard from "@/components/GameCard";
import LogoutButton from "@/components/LogoutButton";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch user's games
  let userGames = [];
  try {
    userGames = await getUserGames(user.id);
  } catch (error) {
    console.error("Error fetching user games:", error);
  }

  // Placeholder joined Discord communities
  const joinedDiscords = [
    {
      id: "1",
      name: "Gaming Hub",
      inviteUrl: "https://discord.gg/example",
    },
    {
      id: "2",
      name: "Pro Players",
      inviteUrl: "https://discord.gg/example2",
    },
  ];

  return (
    <div className="py-8">
      {/* Profile Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
            <span className="text-white text-2xl font-semibold">
              {user.email?.charAt(0).toUpperCase() || "U"}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-white">
              {user.user_metadata?.username || user.email?.split("@")[0] || "User"}
            </h1>
            <p className="text-white/60 text-sm">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Your Games Section */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-white mb-4">Your Games</h2>
        {userGames.length === 0 ? (
          <div className="bg-[#0E0E0E] border border-white/10 rounded p-6 text-center">
            <p className="text-white/60 text-sm">You haven't added any games yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {userGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        )}
      </section>

      {/* Joined Discords Section */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-white mb-4">Joined Discords</h2>
        {joinedDiscords.length === 0 ? (
          <div className="bg-[#0E0E0E] border border-white/10 rounded p-6 text-center">
            <p className="text-white/60 text-sm">You haven't joined any Discord communities yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {joinedDiscords.map((discord) => (
              <div
                key={discord.id}
                className="bg-[#0E0E0E] border border-white/10 rounded p-4 flex items-center justify-between"
              >
                <div>
                  <p className="text-white text-sm font-medium">{discord.name}</p>
                  <a
                    href={discord.inviteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-white/60 hover:text-white/80"
                  >
                    {discord.inviteUrl}
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Settings Section */}
      <section>
        <h2 className="text-xl font-semibold text-white mb-4">Settings</h2>
        <div className="space-y-3">
          <button className="w-full bg-[#0E0E0E] border border-white/10 rounded p-4 text-left hover:bg-white/5 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-white text-sm font-medium">Notifications</span>
              <svg
                className="w-5 h-5 text-white/60"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </button>
          <LogoutButton />
        </div>
      </section>
    </div>
  );
}

