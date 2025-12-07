import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";

interface HeroBannerProps {
  imageUrl?: string | null;
  title?: string;
  subtitle?: string;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
  overlay?: ReactNode;
  className?: string;
  priority?: boolean;
}

export default function HeroBanner({
  imageUrl,
  title,
  subtitle,
  description,
  ctaText,
  ctaLink,
  overlay,
  className = "",
  priority = false,
}: HeroBannerProps) {
  return (
    <div className={`relative w-full ${className}`}>
      <div className="relative h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden">
        {/* Background Image */}
        {imageUrl && (
          <div className="absolute inset-0">
            <Image
              src={imageUrl}
              alt={title || "Hero banner"}
              fill
              className="object-cover"
              sizes="100vw"
              priority={priority}
            />
            {/* Dynamic Spotlight Effect */}
            <div className="absolute inset-0 bg-gradient-radial from-transparent via-black/40 to-black/80" />
          </div>
        )}
        {!imageUrl && (
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 via-blue-900/50 to-black" />
        )}

        {/* Gradient Fade Overlay - Epic Games Style */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-[#0E0E0E]" />

        {/* Content */}
        <div className="relative h-full flex flex-col justify-end p-6 md:p-12 lg:p-16">
          <div className="max-w-4xl">
            {subtitle && (
              <p className="text-white/80 text-sm md:text-base font-medium mb-2 uppercase tracking-wider">
                {subtitle}
              </p>
            )}
            {title && (
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                {title}
              </h1>
            )}
            {description && (
              <p className="text-white/90 text-base md:text-lg mb-6 max-w-2xl">
                {description}
              </p>
            )}
            {ctaText && ctaLink && (
              <Link
                href={ctaLink}
                className="inline-block bg-white text-black px-8 py-3 rounded-lg font-semibold text-lg hover:bg-white/90 transition-colors"
              >
                {ctaText}
              </Link>
            )}
            {overlay}
          </div>
        </div>
      </div>
    </div>
  );
}

