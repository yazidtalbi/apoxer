"use client";

import { useState, useEffect } from "react";
import { Game, Event, GameVersion } from "@/types";
import { Calendar, Clock, Users, Plus, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getEventsByGameClient, getGameVersionsClient, createGameVersionClient, createEventClient, joinEventClient, leaveEventClient } from "@/lib/events-client";
import { supabase } from "@/lib/supabaseClient";

interface EventsSectionProps {
  game: Game;
}

// Common tags for events (Xbox-style)
const COMMON_TAGS = [
  "Mic required",
  "Mic optional",
  "No swearing",
  "Swearing OK",
  "Kid-friendly content",
  "All content OK",
  "No trash-talking",
  "New players welcome",
  "Competitive",
  "Casual",
  "Ranked",
  "#Ranked",
  "#rankonly",
  "#Plat1andup",
  "#winstreak",
  "#EnglishSpeakers",
  "#TEAMWORK",
  "All ages",
];

export default function EventsSection({ game }: EventsSectionProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [gameVersions, setGameVersions] = useState<GameVersion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Form state
  const [selectedVersionId, setSelectedVersionId] = useState<string>("");
  const [newVersionName, setNewVersionName] = useState("");
  const [showNewVersionInput, setShowNewVersionInput] = useState(false);
  const [description, setDescription] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [playersNeeded, setPlayersNeeded] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [language, setLanguage] = useState("English");
  const [platform, setPlatform] = useState("");

  useEffect(() => {
    loadData();
  }, [game.id]);

  const loadData = async () => {
    try {
      console.log("Loading events for game:", game.id);
      const [eventsData, versionsData] = await Promise.all([
        getEventsByGameClient(game.id),
        getGameVersionsClient(game.id),
      ]);
      console.log("Events loaded:", eventsData.length, eventsData);
      console.log("Versions loaded:", versionsData.length, versionsData);
      setEvents(eventsData);
      setGameVersions(versionsData);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    } catch (error) {
      console.error("Error loading events:", error);
    }
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleCreateVersion = async () => {
    if (!newVersionName.trim() || !userId) return;
    
    try {
      const version = await createGameVersionClient(game.id, newVersionName.trim(), userId);
      if (version) {
        setGameVersions([version, ...gameVersions]);
        setSelectedVersionId(version.id);
        setNewVersionName("");
        setShowNewVersionInput(false);
      }
    } catch (error) {
      console.error("Error creating version:", error);
      alert("Failed to create version. Please try again.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      alert("Please log in to create an event");
      return;
    }

    if (!startDate || !startTime) {
      alert("Please select a date and time");
      return;
    }

    setLoading(true);
    try {
      await createEventClient({
        gameId: game.id,
        gameVersionId: selectedVersionId || null,
        createdBy: userId,
        description: description.trim() || null,
        tags: selectedTags,
        playersNeeded,
        startDate,
        startTime,
        language,
        platform: platform || null,
      });
      
      // Reset form
      setSelectedVersionId("");
      setDescription("");
      setSelectedTags([]);
      setPlayersNeeded(1);
      setStartDate("");
      setStartTime("");
      setLanguage("English");
      setPlatform("");
      setShowNewVersionInput(false);
      setNewVersionName("");
      setIsOpen(false);
      
      // Reload events
      await loadData();
    } catch (error: any) {
      console.error("Error creating event:", error);
      alert(`Failed to create event: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (eventId: string) => {
    if (!userId) {
      alert("Please log in to join an event");
      return;
    }

    try {
      await joinEventClient(eventId, userId);
      await loadData();
    } catch (error: any) {
      console.error("Error joining event:", error);
      alert(`Failed to join event: ${error.message}`);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "Posted just now";
    if (diffMins < 60) return `Posted ${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Posted ${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `Posted ${diffDays}d ago`;
  };

  const formatStartTime = (date: string, time: string) => {
    const dateTime = new Date(`${date}T${time}`);
    const now = new Date();
    
    if (dateTime.toDateString() === now.toDateString()) {
      return "Starts Now";
    }
    
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (dateTime.toDateString() === tomorrow.toDateString()) {
      return "Starts Tomorrow";
    }
    
    return dateTime.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Events</h2>
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-md transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Create Event
        </button>
      </div>

      {/* Create Event Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#0E0E0E] border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">Create Event</DialogTitle>
          </DialogHeader>
          
          {/* Game Info Banner */}
          <div className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-4">
              {game.coverUrl && (
                <img
                  src={game.coverUrl}
                  alt={game.title}
                  className="w-16 h-20 object-cover rounded"
                />
              )}
              <div className="flex-1">
                <h3 className="text-white font-semibold">{game.title}</h3>
                <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
                  <div>
                    <div className="text-white/60">Need</div>
                    <div className="text-white font-semibold">{playersNeeded}</div>
                  </div>
                  <div>
                    <div className="text-white/60">Have</div>
                    <div className="text-white font-semibold">0</div>
                  </div>
                  <div>
                    <div className="text-white/60">Starts</div>
                    <div className="text-white font-semibold">
                      {startDate && startTime ? formatStartTime(startDate, startTime) : "Now"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Game Version */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Game Version (Optional)
              </label>
              {!showNewVersionInput ? (
                <div className="flex gap-2">
                  <select
                    value={selectedVersionId}
                    onChange={(e) => {
                      if (e.target.value === "new") {
                        setShowNewVersionInput(true);
                      } else {
                        setSelectedVersionId(e.target.value);
                      }
                    }}
                    className="flex-1 bg-white/5 border border-white/10 rounded-md px-4 py-2 text-white focus:outline-none focus:border-white/20"
                  >
                    <option value="">No version</option>
                    {gameVersions.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.versionName}
                      </option>
                    ))}
                    <option value="new">+ Create new version</option>
                  </select>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newVersionName}
                    onChange={(e) => setNewVersionName(e.target.value)}
                    placeholder="Version name (e.g., Season 3)"
                    className="flex-1 bg-white/5 border border-white/10 rounded-md px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:border-white/20"
                  />
                  <button
                    type="button"
                    onClick={handleCreateVersion}
                    className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-md transition-colors text-sm"
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewVersionInput(false);
                      setNewVersionName("");
                    }}
                    className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-md transition-colors text-sm"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Select tags to describe how you would like to play
              </label>
              <div className="flex flex-wrap gap-2">
                {COMMON_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagToggle(tag)}
                    className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                      selectedTags.includes(tag)
                        ? "bg-blue-600 text-white"
                        : "bg-white/5 text-white/70 hover:bg-white/10"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Add a description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Describe your event..."
                className="w-full bg-white/5 border border-white/10 rounded-md px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:border-white/20 resize-none"
              />
            </div>

            {/* Settings */}
            <div className="space-y-3 bg-white/5 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Day</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full bg-white/5 border border-white/10 rounded-md px-4 py-2 text-white focus:outline-none focus:border-white/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Party start time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-md px-4 py-2 text-white focus:outline-none focus:border-white/20"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Platform</label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-md px-4 py-2 text-white focus:outline-none focus:border-white/20"
                >
                  <option value="">Any platform</option>
                  {game.platforms?.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Players needed</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={playersNeeded}
                  onChange={(e) => setPlayersNeeded(parseInt(e.target.value) || 1)}
                  className="w-full bg-white/5 border border-white/10 rounded-md px-4 py-2 text-white focus:outline-none focus:border-white/20"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-md px-4 py-2 text-white focus:outline-none focus:border-white/20"
                >
                  <option value="English">English</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                  <option value="German">German</option>
                  <option value="Japanese">Japanese</option>
                  <option value="Chinese">Chinese</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md transition-colors font-medium disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create post"}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex-1 bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-md transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Events List */}
      {events.length === 0 ? (
        <div className="bg-[#0E0E0E] border border-white/10 rounded-lg p-8 text-center">
          <Calendar className="w-12 h-12 text-white/40 mx-auto mb-4" />
          <p className="text-white/60 text-sm mb-2">No events scheduled yet</p>
          <p className="text-white/40 text-xs">
            Create an event to organize play sessions with other players
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event) => {
            // Use created_by ID as fallback since we can't join auth.users from client
            const username = event.creator?.user_metadata?.username || 
                           event.creator?.email?.split("@")[0] || 
                           `Player ${event.createdBy.slice(0, 8)}`;
            const isFull = event.playersHave >= event.playersNeeded;
            
            return (
              <div
                key={event.id}
                className={`bg-[#0E0E0E] border rounded-lg p-4 hover:border-white/20 transition-colors ${
                  isFull ? "border-green-500/30" : "border-white/10"
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-semibold">
                      {username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {event.tags.slice(0, 6).map((tag, idx) => (
                        <span
                          key={idx}
                          className="bg-white/10 text-white/70 text-xs px-2 py-0.5 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                      {event.tags.length > 6 && (
                        <span className="bg-white/10 text-white/70 text-xs px-2 py-0.5 rounded">
                          +{event.tags.length - 6}
                        </span>
                      )}
                    </div>
                    
                    {/* Description */}
                    {event.description && (
                      <p className="text-white text-sm mb-2">{event.description}</p>
                    )}
                    
                    {/* Version */}
                    {event.gameVersion && (
                      <p className="text-white/60 text-xs mb-2">
                        Version: {event.gameVersion.versionName}
                      </p>
                    )}
                    
                    {/* Details */}
                    <div className="flex items-center gap-4 text-sm text-white/60">
                      <span>Need {event.playersNeeded}</span>
                      <span>Have {event.playersHave}</span>
                      <span>{formatStartTime(event.startDate, event.startTime)}</span>
                    </div>
                    
                    {/* Timestamp */}
                    <p className="text-white/40 text-xs mt-2">
                      {formatTimeAgo(event.createdAt)}
                    </p>
                  </div>
                  
                  {/* Join Button */}
                  <button
                    onClick={() => handleJoin(event.id)}
                    disabled={isFull}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex-shrink-0 ${
                      isFull
                        ? "bg-white/5 text-white/40 cursor-not-allowed"
                        : "bg-white/10 hover:bg-white/20 text-white"
                    }`}
                  >
                    {isFull ? "Full" : "Join"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
