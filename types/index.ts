/**
 * Game model representing a game in the directory
 */
export interface Game {
  id: string;
  slug: string;
  title: string;
  description: string;
  coverUrl: string;
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
}

