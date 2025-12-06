import { Community } from "@/types";
import CommunityCard from "@/components/CommunityCard";

interface CommunitiesSectionProps {
  communities: Community[];
}

export default function CommunitiesSection({ communities }: CommunitiesSectionProps) {
  if (communities.length === 0) {
    return (
      <div className="bg-[#0E0E0E] border border-white/10 rounded-lg p-6">
        <p className="text-white/60 text-sm">No communities yet – coming soon.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {communities.map((community) => (
        <CommunityCard key={community.id} community={community} />
      ))}
    </div>
  );
}

