import { useState, useEffect } from "react";

/**
 * Hook to extract dominant colors from an image URL via server-side API
 * 
 * This hook fetches colors from the /api/image-colors endpoint which handles
 * server-side color extraction to bypass browser CORS restrictions.
 * 
 * @param imageUrl - The URL of the image to extract colors from
 * @returns Array of hex color strings (e.g., ["#123456", "#abcdef"])
 */
export function useImageColors(imageUrl: string | null | undefined): string[] {
  const [colors, setColors] = useState<string[]>([]);

  useEffect(() => {
    // Reset colors if URL is empty
    if (!imageUrl) {
      setColors([]);
      return;
    }

    let cancelled = false;

    async function fetchColors() {
      try {
        const encodedUrl = encodeURIComponent(imageUrl);
        const res = await fetch(`/api/image-colors?url=${encodedUrl}`);

        if (!res.ok) {
          throw new Error(`Failed to fetch colors: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();

        if (!cancelled) {
          // Ensure we have an array of colors
          const extractedColors = Array.isArray(data.colors) ? data.colors : [];
          setColors(extractedColors);
          
          if (extractedColors.length > 0) {
            console.log("Extracted colors:", extractedColors);
          }
        }
      } catch (err) {
        console.error("Error fetching image colors:", err);
        if (!cancelled) {
          setColors([]);
        }
      }
    }

    fetchColors();

    // Cleanup: cancel if component unmounts or URL changes
    return () => {
      cancelled = true;
    };
  }, [imageUrl]);

  return colors;
}

/**
 * Convert hex color string to rgba
 */
function hexToRgba(hex: string, opacity: number = 1): string {
  // Remove # if present
  const cleanHex = hex.replace("#", "");
  
  // Parse RGB values
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * Generate gradient CSS from hex color strings
 * Similar to Spotify's gradient effect
 * 
 * @param colors - Array of hex color strings (e.g., ["#123456", "#abcdef"])
 * @returns CSS gradient string
 */
export function generateGradient(colors: string[]): string {
  // Default fallback gradient
  const defaultGradient = "linear-gradient(to bottom, rgba(20, 20, 30, 0.6), rgba(40, 30, 50, 0.8))";

  if (!colors || colors.length === 0) {
    return defaultGradient;
  }

  // Single color: create gradient with darker variant
  if (colors.length === 1) {
    const color = colors[0];
    const darkColor = darkenHex(color, 60);
    return `linear-gradient(to bottom, ${hexToRgba(color, 0.85)}, ${hexToRgba(darkColor, 0.9)})`;
  }

  // Two colors: simple linear gradient
  if (colors.length === 2) {
    return `linear-gradient(to bottom, ${hexToRgba(colors[0], 0.8)}, ${hexToRgba(colors[1], 0.85)})`;
  }

  // Three or more colors: multi-stop gradient
  const colorStops = colors.slice(0, 3).map((color, index) => {
    const position = (index / (Math.min(colors.length, 3) - 1)) * 100;
    const opacity = index === 0 ? 0.8 : index === colors.length - 1 ? 0.9 : 0.85;
    return `${hexToRgba(color, opacity)} ${position}%`;
  });

  return `linear-gradient(to bottom, ${colorStops.join(", ")})`;
}

/**
 * Darken a hex color by a given amount
 */
function darkenHex(hex: string, amount: number): string {
  const cleanHex = hex.replace("#", "");
  const r = Math.max(0, parseInt(cleanHex.substring(0, 2), 16) - amount);
  const g = Math.max(0, parseInt(cleanHex.substring(2, 4), 16) - amount);
  const b = Math.max(0, parseInt(cleanHex.substring(4, 6), 16) - amount);
  
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}
