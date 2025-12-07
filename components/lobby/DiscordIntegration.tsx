"use client";

import { useState } from "react";
import { MessageCircle, ExternalLink, Copy, Check, Users, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DiscordIntegrationProps {
  gameId: string;
  gameTitle: string;
}

export default function DiscordIntegration({ gameId, gameTitle }: DiscordIntegrationProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  
  // Dummy Discord server data - in production, this would come from your backend
  const discordServer = {
    name: `${gameTitle} Lobby`,
    inviteUrl: "https://discord.gg/apoxer-lobby",
    voiceChannel: "Voice Channel #1",
    memberCount: 12,
    onlineCount: 8,
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(discordServer.inviteUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleJoinDiscord = () => {
    window.open(discordServer.inviteUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="bg-[#5865F2]/10 border border-[#5865F2]/30 rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-[#5865F2] flex items-center justify-center flex-shrink-0">
          <MessageCircle className="w-5 h-5 text-white" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-white font-medium text-sm truncate">{discordServer.name}</h4>
          <div className="flex items-center gap-2 text-white/60 text-xs">
            <Users className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{discordServer.onlineCount} online</span>
            <span aria-hidden="true">•</span>
            <span>{discordServer.memberCount} members</span>
          </div>
        </div>
      </div>

      {/* Voice Channel Info */}
      <div className="flex items-center gap-2 mb-4 p-2 bg-white/5 rounded-lg">
        <Mic className="w-4 h-4 text-white/60" aria-hidden="true" />
        <span className="text-white/80 text-sm">{discordServer.voiceChannel}</span>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          onClick={handleJoinDiscord}
          className="flex-1 bg-[#5865F2] hover:bg-[#5865F2]/90 text-white text-sm h-9"
          aria-label={`Join ${discordServer.name} Discord server`}
        >
          <ExternalLink className="w-4 h-4 mr-2" aria-hidden="true" />
          Join Discord
        </Button>
        <Button
          onClick={handleCopyLink}
          variant="outline"
          size="icon"
          className="border-white/10 text-white/60 hover:text-white hover:bg-white/10 h-9 w-9"
          aria-label="Copy Discord invite link"
        >
          {copiedLink ? (
            <Check className="w-4 h-4 text-green-500" aria-hidden="true" />
          ) : (
            <Copy className="w-4 h-4" aria-hidden="true" />
          )}
        </Button>
      </div>

      {/* Info Text */}
      <p className="text-white/40 text-xs mt-3">
        Join the Discord server to chat with teammates and coordinate matches
      </p>
    </div>
  );
}

