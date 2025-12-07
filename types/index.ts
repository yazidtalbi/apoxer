/**
 * Game model representing a game in the directory
 */
export interface Game {
  id: string;
  slug: string;
  title: string;
  description: string;
  coverUrl: string;
  heroUrl?: string | null;
  platforms: string[];
  genres: string[];
  tags: string[];
  createdAt: string;
}

/**
 * Community model representing a gaming community
 */
export interface Community {
  id: string;
  gameId: string;
  name: string;
  inviteUrl: string;
  category: string;
  language: string;
  onlineCount: number;
  createdAt: string;
  // Enhanced fields (optional for backward compatibility)
  description?: string | null;
  tags?: string[];
  memberCount?: number;
  region?: string | null;
  voiceRequired?: boolean;
}

/**
 * Guide model representing a game guide
 */
export interface Guide {
  id: string;
  gameId: string;
  title: string;
  content: string;
  createdBy: string;
  createdAt: string;
}

/**
 * Player model representing a player's relationship with a game
 */
export interface Player {
  id: string;
  userId: string;
  gameId: string;
  platform: string;
  status: "online" | "looking" | "offline";
  updatedAt: string;
  createdAt: string;
  // Joined data from games table
  game?: {
    id: string;
    title: string;
  };
  // Joined data from auth.users
  user?: {
    id: string;
    email?: string;
    user_metadata?: {
      username?: string;
    };
  };
}

/**
 * PlayGuide model representing cross-platform play instructions
 */
export interface PlayGuide {
  id: string;
  gameId: string;
  title: string;
  summary: string;
  fromPlatform: string;
  toPlatform: string;
  steps: string;
  lastUpdated: string;
  gameVersionId?: string | null;
  platform?: string | null;
  // Joined data
  gameVersion?: GameVersion | null;
}

/**
 * GameVersion model representing a game version (e.g., "Season 3", "Update 2.0")
 */
export interface GameVersion {
  id: string;
  gameId: string;
  versionName: string;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Event model representing a "Looking for Group" style event
 */
export interface Event {
  id: string;
  gameId: string;
  gameVersionId: string | null;
  createdBy: string;
  description: string | null;
  tags: string[];
  playersNeeded: number;
  playersHave: number;
  startDate: string;
  startTime: string;
  startDatetime: string;
  language: string;
  platform: string | null;
  status: "active" | "full" | "cancelled" | "completed";
  createdAt: string;
  updatedAt: string;
  // Joined data
  gameVersion?: GameVersion | null;
  creator?: {
    id: string;
    email?: string;
    user_metadata?: {
      username?: string;
    };
  };
  participants?: Array<{
    id: string;
    userId: string;
    joinedAt: string;
  }>;
}

/**
 * GamePlayGuide model representing a mini "How to Play Together" guide per game
 */
export interface GamePlayGuide {
  id: string;
  gameId: string;
  content: string; // Markdown content
  createdAt: string;
  updatedAt: string;
}

/**
 * GameTrait model representing a trait that can be associated with games
 */
export interface GameTrait {
  slug: string;
  label: string;
  iconEmoji?: string | null;
}

/**
 * GameGameTrait model representing the relationship between a game and a trait
 */
export interface GameGameTrait {
  strength: number;
  gameTrait: GameTrait;
}

