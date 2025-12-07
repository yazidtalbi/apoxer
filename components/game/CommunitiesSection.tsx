import { Community, Player } from "@/types";
import CommunityCard from "@/components/CommunityCard";
import { Users2, Plus } from "lucide-react";

interface CommunitiesSectionProps {
  communities: Community[];
  players?: Player[]; // Optional: players data to calculate "playing now" count
}

export default function CommunitiesSection({ communities, players = [] }: CommunitiesSectionProps) {
  if (communities.length === 0) {
    return (
      <div className="bg-[#0E0E0E] border border-white/10 rounded-lg p-8 text-center">
        <Users2 className="w-12 h-12 text-white/20 mx-auto mb-3" />
        <h3 className="text-white font-medium mb-2">No communities yet for this game</h3>
        <p className="text-white/60 text-sm mb-4">
          Communities help players find teammates and organize sessions.
        </p>
        <button className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded transition-colors text-sm">
          <Plus className="w-4 h-4" />
          Create the first community
        </button>
      </div>
    );
  }

  // Calculate playing now count (players with status "online" or "looking")
  const playingNowCount = players.filter(
    p => p.status === 'online' || p.status === 'looking'
  ).length;

  return (
    <div className="flex flex-col gap-4">
      {communities.map((community) => (
        <CommunityCard 
          key={community.id} 
          community={community}
          playingNowCount={playingNowCount}
        />
      ))}
    </div>
  );
}

