export type ProfileGame = {
  id: string;
  title: string;
  slug: string;
  coverUrl: string;
  platforms: string[]; // e.g. ["pc", "ps5"]
  status: "playing" | "completed" | "wishlist" | "added";
  hoursPlayed?: number;
};

export type ProfileCommunity = {
  id: string;
  name: string;
  gameSlug: string;
  gameTitle: string;
  membersCount: number;
  role: "member" | "mod" | "owner";
  primaryPlatform: string; // e.g. "discord"
  link: string;
};

export type ProfileGuide = {
  id: string;
  title: string;
  gameSlug: string;
  gameTitle: string;
  createdAt: string;
  upvotes: number;
};

export type ProfileEvent = {
  id: string;
  title: string; // e.g. "Looking for 2 players for PS2 co-op"
  gameTitle: string;
  gameSlug: string;
  date: string; // ISO string for now
  timeLabel: string; // "Friday 20:00 CET"
  description: string;
  voicePlatform: string; // e.g. "Discord", "VC in-game"
  slotsTotal: number;
  slotsTaken: number;
  isPinned: boolean;
};

export type UserProfile = {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  bannerUrl?: string; // hero background image
  bio: string;
  timezone: string;
  createdAt: string;
  stats: {
    gamesCount: number;
    communitiesCount: number;
    guidesCount: number;
    eventsCount: number;
  };
  favoriteGames: ProfileGame[];
  games: ProfileGame[]; // all games added / played
  communities: ProfileCommunity[];
  guides: ProfileGuide[];
  events: ProfileEvent[];
};

