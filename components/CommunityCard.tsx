import { Community } from "@/types";

interface CommunityCardProps {
  community: Community;
}

export default function CommunityCard({ community }: CommunityCardProps) {
  // Access database fields (snake_case) with fallback to camelCase
  const onlineCount = (community as Community & { online_count?: number }).online_count ?? community.onlineCount;
  const inviteUrl = (community as Community & { invite_url?: string }).invite_url ?? community.inviteUrl;

  // Format online count with commas
  const formattedOnlineCount = onlineCount.toLocaleString();

  return (
    <div className="bg-[#0E0E0E] border border-white/10 rounded p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-white text-sm font-medium mb-1">{community.name}</h3>
          <div className="flex items-center gap-3 text-xs text-white/60">
            <span>{community.category}</span>
            <span>•</span>
            <span>{community.language}</span>
          </div>
        </div>
        <div className="text-xs text-white/60 ml-4">
          {formattedOnlineCount} online
        </div>
      </div>
      <a
        href={inviteUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full text-center text-sm text-white bg-white/10 hover:bg-white/20 py-2 rounded transition-colors"
      >
        Join
      </a>
    </div>
  );
}

