import { Guide } from "@/types";

interface GuideCardProps {
  guide: Guide;
}

export default function GuideCard({ guide }: GuideCardProps) {
  const excerpt = guide.content.length > 150 
    ? guide.content.substring(0, 150) + "..." 
    : guide.content;

  return (
    <div className="bg-[#0E0E0E] border border-white/10 rounded p-4">
      <h3 className="text-white text-sm font-medium mb-2">{guide.title}</h3>
      <p className="text-white/60 text-xs mb-3 line-clamp-3">{excerpt}</p>
      <button className="text-sm text-white bg-white/10 hover:bg-white/20 py-2 px-4 rounded transition-colors">
        Read
      </button>
    </div>
  );
}

