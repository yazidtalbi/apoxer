import Image from "next/image";
import { Community } from "@/types";
import { Mic, Users, Clock } from "lucide-react";

interface CommunityCardProps {
  community: Community;
  playingNowCount?: number; // Optional: number of players currently playing
}

export default function CommunityCard({ community, playingNowCount = 0 }: CommunityCardProps) {
  // Access database fields (snake_case) with fallback to camelCase
  const onlineCount = (community as Community & { online_count?: number }).online_count ?? community.onlineCount;
  const inviteUrl = (community as Community & { invite_url?: string }).invite_url ?? community.inviteUrl;
  const iconUrl = (community as Community & { icon_url?: string | null }).icon_url || null;
  
  // Enhanced fields
  const description = community.description;
  const tags = community.tags || [];
  const memberCount = community.memberCount || onlineCount || 0;
  const region = community.region;
  const voiceRequired = community.voiceRequired || false;

  // Format counts with commas
  const formattedOnlineCount = onlineCount.toLocaleString();
  const formattedMemberCount = memberCount.toLocaleString();
  const formattedPlayingNow = playingNowCount.toLocaleString();

  // Process tags to show key ones prominently
  const processTags = () => {
    const processedTags: { label: string; type: 'default' | 'mic' | 'region' | 'crossplay' | 'beginner' | 'active' }[] = [];
    
    tags.forEach((tag) => {
      const lowerTag = tag.toLowerCase();
      if (lowerTag.includes('beginner') || lowerTag.includes('newbie') || lowerTag.includes('casual')) {
        processedTags.push({ label: 'Beginner Friendly', type: 'beginner' });
      } else if (lowerTag.includes('mic') || lowerTag.includes('voice') || voiceRequired) {
        processedTags.push({ label: 'Mic Required', type: 'mic' });
      } else if (lowerTag.includes('crossplay') || lowerTag.includes('cross-platform') || lowerTag.includes('cross platform')) {
        processedTags.push({ label: 'Crossplay OK', type: 'crossplay' });
      } else if (lowerTag.includes('eu') || lowerTag.includes('na') || lowerTag.includes('mena') || lowerTag.includes('apac') || lowerTag.includes('global')) {
        processedTags.push({ label: region || tag, type: 'region' });
      } else if (lowerTag.includes('evening') || lowerTag.includes('night') || lowerTag.includes('active')) {
        processedTags.push({ label: 'Active Evenings', type: 'active' });
      } else {
        processedTags.push({ label: tag, type: 'default' });
      }
    });

    // Add voice required if not already in tags
    if (voiceRequired && !processedTags.some(t => t.type === 'mic')) {
      processedTags.push({ label: 'Mic Required', type: 'mic' });
    }

    // Add region if not already in tags
    if (region && !processedTags.some(t => t.type === 'region')) {
      processedTags.push({ label: region, type: 'region' });
    }

    // Remove duplicates
    const uniqueTags = processedTags.filter((tag, index, self) => 
      index === self.findIndex(t => t.label === tag.label)
    );

    return uniqueTags.slice(0, 5); // Limit to 5 tags
  };

  const processedTags = processTags();

  // Generate a placeholder Discord icon URL based on community name
  const getDiscordIconUrl = () => {
    if (iconUrl) return iconUrl;
    // Use a placeholder service or generate based on name
    const initials = community.name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=5865F2&color=fff&size=128`;
  };

  return (
    <div className="bg-[#1A1A1A] border border-white/10 rounded-lg overflow-hidden flex">
      {/* Discord Icon/Image on Left */}
      <div className="relative w-20 h-20 md:w-24 md:h-24 flex-shrink-0 bg-[#5865F2] flex items-center justify-center">
        {iconUrl ? (
          <Image
            src={iconUrl}
            alt={community.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 80px, 96px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg
              className="w-10 h-10 md:w-12 md:h-12 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
            </svg>
          </div>
        )}
      </div>

      {/* Content on Right */}
      <div className="flex-1 flex flex-col p-4 min-w-0">
        {/* Name */}
        <h3 className="text-white text-base font-semibold truncate mb-2">{community.name}</h3>
        
        {/* Player Activity Signals - Prominent */}
        <div className="flex flex-wrap items-center gap-3 mb-3">
          {onlineCount > 0 && (
            <span className="inline-flex items-center gap-1 text-white/90 text-xs font-medium">
              <Users className="w-3.5 h-3.5 text-green-400" />
              {formattedOnlineCount} active {onlineCount === 1 ? 'player' : 'players'}
            </span>
          )}
          {playingNowCount > 0 && (
            <span className="inline-flex items-center gap-1 text-white/90 text-xs font-medium">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              {formattedPlayingNow} playing now
            </span>
          )}
          <span className="text-white/70 text-xs">
            {formattedMemberCount} {memberCount === 1 ? 'member' : 'members'}
          </span>
        </div>
        
        {/* Description (line-clamped to 2 lines) */}
        {description && (
          <p className="text-white/70 text-xs mb-3 line-clamp-2">{description}</p>
        )}
        
        {/* Tags - Prominent */}
        {processedTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {processedTags.map((tag, index) => {
              let className = "text-xs px-2.5 py-1 rounded-md font-medium border";
              
              switch (tag.type) {
                case 'mic':
                  className += " bg-blue-500/20 text-blue-400 border-blue-500/30";
                  break;
                case 'beginner':
                  className += " bg-green-500/20 text-green-400 border-green-500/30";
                  break;
                case 'crossplay':
                  className += " bg-purple-500/20 text-purple-400 border-purple-500/30";
                  break;
                case 'region':
                  className += " bg-orange-500/20 text-orange-400 border-orange-500/30";
                  break;
                case 'active':
                  className += " bg-pink-500/20 text-pink-400 border-pink-500/30";
                  break;
                default:
                  className += " bg-white/10 text-white border-white/20";
              }
              
              return (
                <span key={index} className={className}>
                  {tag.type === 'mic' && <Mic className="w-3 h-3 inline-block mr-1 align-middle" />}
                  {tag.label}
                </span>
              );
            })}
          </div>
        )}
        
        {/* Join Button */}
        <a
          href={inviteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto block w-full text-center text-sm text-white bg-white/10 hover:bg-white/20 py-2.5 rounded transition-colors"
        >
          Join on Discord
        </a>
      </div>
    </div>
  );
}

