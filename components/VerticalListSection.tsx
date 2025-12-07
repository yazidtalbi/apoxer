import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { Game } from "@/types";

interface VerticalListSectionProps {
  title: string;
  href?: string;
  items: Array<{
    id: string;
    title: string;
    thumbnail?: string | null;
    subtitle?: string;
    badge?: string;
    href: string;
  }>;
  className?: string;
}

export default function VerticalListSection({
  title,
  href,
  items,
  className = "",
}: VerticalListSectionProps) {
  const TitleComponent = href ? Link : "div";

  return (
    <div className={`flex flex-col ${className}`}>
      <TitleComponent
        href={href || "#"}
        className={href ? "group flex items-center justify-between mb-4 hover:opacity-80 transition-opacity" : "flex items-center justify-between mb-4"}
      >
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {href && (
          <ChevronRight className="w-5 h-5 text-white/60 group-hover:text-white transition-colors" />
        )}
      </TitleComponent>

      <div className="space-y-3">
        {items.length > 0 ? (
          items.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="group flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
            >
              {/* Thumbnail */}
              {item.thumbnail ? (
                <div className="relative w-16 h-20 flex-shrink-0 rounded overflow-hidden">
                  <Image
                    src={item.thumbnail}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                    sizes="64px"
                  />
                </div>
              ) : (
                <div className="w-16 h-20 flex-shrink-0 rounded bg-white/10 flex items-center justify-center">
                  <span className="text-white/40 text-xs">No Image</span>
                </div>
              )}

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h4 className="text-white text-sm font-medium mb-1 group-hover:text-blue-400 transition-colors line-clamp-2">
                  {item.title}
                </h4>
                {item.subtitle && (
                  <p className="text-white/60 text-xs line-clamp-1">
                    {item.subtitle}
                  </p>
                )}
              </div>

              {/* Badge */}
              {item.badge && (
                <div className="flex-shrink-0">
                  <span className="text-white/80 text-xs font-medium">
                    {item.badge}
                  </span>
                </div>
              )}
            </Link>
          ))
        ) : (
          <p className="text-white/60 text-sm py-4">No items available</p>
        )}
      </div>
    </div>
  );
}

