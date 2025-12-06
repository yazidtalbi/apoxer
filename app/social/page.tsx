import { getSuggestedPlayers } from "@/lib/players";
import PlayerCard from "@/components/PlayerCard";

export default async function SocialPage() {
  const suggestedPlayers = await getSuggestedPlayers(20);

  return (
    <div className="py-8">
      <h1 className="text-3xl font-semibold text-white mb-8">Social</h1>

      {/* Suggested Players Section */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-white mb-4">Suggested players</h2>
        {suggestedPlayers.length === 0 ? (
          <div className="bg-[#0E0E0E] border border-white/10 rounded p-4">
            <p className="text-white/60 text-sm">No players found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suggestedPlayers.map((player) => (
              <PlayerCard key={player.id} player={player} />
            ))}
          </div>
        )}
      </section>

      {/* Recently Active Section */}
      <section>
        <h2 className="text-xl font-semibold text-white mb-4">Recently active in your games</h2>
        <div className="bg-[#0E0E0E] border border-white/10 rounded p-6">
          <p className="text-white/60 text-sm">
            This section will show players who have been recently active in games you play.
          </p>
        </div>
      </section>
    </div>
  );
}

