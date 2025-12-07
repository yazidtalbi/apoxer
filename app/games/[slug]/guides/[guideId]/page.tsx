import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getGameBySlug, getPlayGuideById } from "@/lib/games";
import { ArrowRight, Clock } from "lucide-react";

interface GuidePageProps {
  params: Promise<{ slug: string; guideId: string }>;
}

export default async function GuidePage({ params }: GuidePageProps) {
  const { slug, guideId } = await params;
  const game = await getGameBySlug(slug);

  if (!game) {
    notFound();
  }

  const guide = await getPlayGuideById(guideId);

  if (!guide || guide.gameId !== game.id) {
    notFound();
  }

  const fromPlatform = (guide as any & { from_platform?: string }).from_platform ?? guide.fromPlatform;
  const toPlatform = (guide as any & { to_platform?: string }).to_platform ?? guide.toPlatform;
  const steps = (guide as any & { steps?: string }).steps ?? "";
  const summary = (guide as any & { summary?: string }).summary ?? "";
  const lastUpdated = (guide as any & { last_updated?: string }).last_updated ?? guide.lastUpdated;
  const platform = guide.platform || fromPlatform;
  // Handle both snake_case and camelCase for cover URL
  const coverUrl = (game as any & { cover_url?: string }).cover_url || game.coverUrl;

  // Split steps by newlines and filter out empty lines
  const stepLines = steps.split("\n").filter((line) => line.trim() !== "");

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", { 
        year: "numeric", 
        month: "long", 
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Breadcrumbs */}
      <nav className="text-sm mb-6">
        <div className="flex items-center gap-2 text-white/60">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/games" className="hover:text-white transition-colors">
            Games
          </Link>
          <span>/</span>
          <Link href={`/games/${game.slug}`} className="hover:text-white transition-colors">
            {game.title}
          </Link>
          <span>/</span>
          <span className="text-white">Guides</span>
          <span>/</span>
          <span className="text-white">{guide.title}</span>
        </div>
      </nav>

      {/* Main Content - Steam Style */}
      <div className="bg-[#0E0E0E] border border-white/10 rounded-lg overflow-hidden">
        {/* Header Section with Game Cover */}
        <div className="bg-gradient-to-b from-white/5 to-transparent p-6 border-b border-white/10">
          <div className="flex items-start gap-6">
            {coverUrl && (
              <div className="relative w-32 h-40 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={coverUrl}
                  alt={game.title}
                  fill
                  className="object-cover"
                  sizes="128px"
                />
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white mb-2">{guide.title}</h1>
              <p className="text-white/60 text-sm mb-4">{game.title}</p>
              
              {/* Metadata */}
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-white/60">Platform:</span>
                  <span className="text-white font-medium">{platform}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white/60">Route:</span>
                  <span className="text-white font-medium flex items-center gap-1">
                    {fromPlatform} <ArrowRight className="w-4 h-4" /> {toPlatform}
                  </span>
                </div>
                {guide.gameVersion && (
                  <div className="flex items-center gap-2">
                    <span className="text-white/60">Version:</span>
                    <span className="text-white font-medium">{guide.gameVersion.versionName}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-white/40" />
                  <span className="text-white/60">Updated:</span>
                  <span className="text-white/80">{formatDate(lastUpdated)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Guide Content */}
        <div className="p-6 space-y-6">
          {/* Summary */}
          {summary && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-3">About This Guide</h2>
              <p className="text-white/80 leading-relaxed">{summary}</p>
            </div>
          )}

          {/* Steps */}
          {stepLines.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-4">How to Play Together</h2>
              <div className="space-y-4">
                {stepLines.map((line, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-white/90 leading-relaxed">{line.trim()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Back Button */}
          <div className="pt-6 border-t border-white/10">
            <Link
              href={`/games/${game.slug}`}
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded transition-colors text-sm"
            >
              ← Back to {game.title}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

