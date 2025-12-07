import { getGames, getTrendingCommunities, getPopularPlayGuides, getRecentlyAddedGames, getCrossplayGames, getMostSearchedGames, getGamesWithLowUsersSearching } from "@/lib/games";
import { getUpcomingEvents } from "@/lib/events";
import { getCurrentUser } from "@/lib/supabase-server";
import { getUserGames } from "@/lib/user-games";
import { Game } from "@/types";
import GameCard from "@/components/GameCard";
import GameCardWithPlayers from "@/components/GameCardWithPlayers";
import CommunityCard from "@/components/CommunityCard";
import HorizontalScroller from "@/components/HorizontalScroller";
import HeroBanner from "@/components/HeroBanner";
import GuideCard from "@/components/GuideCard";
import EventCard from "@/components/EventCard";
import EventsCarousel from "@/components/EventsCarousel";
import VerticalListSection from "@/components/VerticalListSection";
import Footer from "@/components/Footer";

export default async function Home() {
  // Fetch all data in parallel
  const [
    allGames,
    upcomingEvents,
    trendingCommunities,
    popularGuides,
    recentlyAddedGames,
    crossplayGames,
    mostSearchedGames,
    lowUsersGames,
    user,
  ] = await Promise.all([
    getGames({ limit: 50 }),
    getUpcomingEvents(4),
    getTrendingCommunities(12).catch(() => []),
    getPopularPlayGuides(12).catch(() => []),
    getRecentlyAddedGames(12).catch(() => []),
    getCrossplayGames(12).catch(() => []),
    getMostSearchedGames(12).catch(() => []),
    getGamesWithLowUsersSearching(12).catch(() => []),
    getCurrentUser(),
  ]);

  // Get user's games if logged in
  let userGames: typeof allGames = [];
  if (user) {
    try {
      userGames = await getUserGames(user.id);
    } catch (error) {
      console.error("Error fetching user games:", error);
    }
  }

  // Featured event for hero banner
  const featuredEvent = upcomingEvents[0];
  const featuredGame = featuredEvent?.game;

  // Get unique genres for genre rows
  const allGenres = Array.from(
    new Set(allGames.flatMap((game) => game.genres || []))
  ).slice(0, 6);

  return (
    <div className="min-h-screen">
      {/* Events Carousel - Always show at top */}
      {upcomingEvents.length > 0 && (
        <div className="mb-12">
          <EventsCarousel events={upcomingEvents} />
        </div>
      )}

      <div className="w-full py-8">
        {/* Your Games Section */}
        <section className="mb-16">
          <HorizontalScroller title="Your Games" showArrows={userGames.length > 6}>
            {userGames.length > 0 ? (
              userGames.map((game) => (
                <div key={game.id} className="flex-shrink-0 w-[180px]">
                  <GameCard game={game} />
                </div>
              ))
            ) : (
              <div className="flex-shrink-0 w-full md:w-auto">
                <div className="bg-[#0E0E0E] border border-white/10 rounded-lg p-8 text-center min-w-[300px]">
                  <p className="text-white/60 text-sm mb-2">Log in to see your games</p>
                  <a
                    href="/login"
                    className="inline-block bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded transition-colors text-sm"
                  >
                    Sign In
                  </a>
                </div>
              </div>
            )}
          </HorizontalScroller>
        </section>


        {/* Most Searched Right Now - Horizontal Rail */}
        <section className="mb-16">
          <HorizontalScroller title="Most Searched Right Now" showArrows={mostSearchedGames.length > 6}>
            {mostSearchedGames.length > 0 ? (
              mostSearchedGames.map((game) => (
                <div key={game.id} className="flex-shrink-0">
                  <GameCardWithPlayers game={game} />
                </div>
              ))
            ) : (
              <p className="text-white/60 text-sm">No games with active searches.</p>
            )}
          </HorizontalScroller>
        </section>

        {/* Three Column Vertical Lists - Epic Games Style */}
        <section className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Newly Added Games */}
            <VerticalListSection
              title="Newly Added Games"
              href="/games"
              items={
                recentlyAddedGames.length > 0
                  ? recentlyAddedGames.slice(0, 5).map((game) => ({
                      id: game.id,
                      title: game.title,
                      thumbnail: (game as Game & { cover_url?: string }).cover_url || game.coverUrl,
                      subtitle: game.genres?.slice(0, 2).join(", ") || "",
                      href: `/games/${game.slug}`,
                    }))
                  : []
              }
            />

            {/* Trending Communities */}
            <VerticalListSection
              title="Trending Communities"
              href="/games"
              items={
                trendingCommunities.length > 0
                  ? trendingCommunities.slice(0, 5).map((community) => ({
                      id: community.id,
                      title: community.name,
                      thumbnail: community.game?.coverUrl || (community.game as any)?.cover_url,
                      subtitle: `${community.onlineCount.toLocaleString()} online • ${community.category}`,
                      badge: community.language,
                      href: (community as any).invite_url || community.inviteUrl,
                    }))
                  : []
              }
            />

            {/* Crossplay-Friendly Games */}
            <VerticalListSection
              title="Crossplay-Friendly Games"
              href="/games"
              items={
                crossplayGames.length > 0
                  ? crossplayGames.slice(0, 5).map((game) => ({
                      id: game.id,
                      title: game.title,
                      thumbnail: (game as Game & { cover_url?: string }).cover_url || game.coverUrl,
                      subtitle: game.platforms?.slice(0, 3).join(", ") || "",
                      badge: `${game.platforms?.length || 0} platforms`,
                      href: `/games/${game.slug}`,
                    }))
                  : []
              }
            />
          </div>
        </section>

        {/* Genres / Tags Section */}
        {allGenres.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">Browse by Genre</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {allGenres.map((genre) => {
                const genreGames = allGames.filter(
                  (game) => game.genres?.includes(genre)
                );
                return (
                  <a
                    key={genre}
                    href={`/games?genre=${encodeURIComponent(genre)}`}
                    className="group bg-[#0E0E0E] border border-white/10 rounded-lg p-6 hover:border-blue-600/50 transition-all text-center"
                  >
                    <h3 className="text-white text-lg font-semibold mb-2 group-hover:text-blue-400 transition-colors">
                      {genre}
                    </h3>
                    <p className="text-white/60 text-sm">
                      {genreGames.length} {genreGames.length === 1 ? "game" : "games"}
                    </p>
                  </a>
                );
              })}
            </div>
          </section>
        )}

        {/* Games with Very Low Users Searching */}
        <section className="mb-16">
          <HorizontalScroller title="Games with Very Low Users Searching" showArrows={lowUsersGames.length > 6}>
            {lowUsersGames.length > 0 ? (
              lowUsersGames.map((game) => (
                <div key={game.id} className="flex-shrink-0">
                  <GameCardWithPlayers game={game} />
                </div>
              ))
            ) : (
              <p className="text-white/60 text-sm">No games with low user searches.</p>
            )}
          </HorizontalScroller>
        </section>

        {/* Crossplay-Friendly Games Section */}
        {crossplayGames.length > 0 && (
          <section className="mb-16">
            <HorizontalScroller title="Crossplay-Friendly Games" showArrows={crossplayGames.length > 6}>
              {crossplayGames.map((game) => (
                <div key={game.id} className="flex-shrink-0">
                  <GameCard game={game} />
                </div>
              ))}
            </HorizontalScroller>
          </section>
        )}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
