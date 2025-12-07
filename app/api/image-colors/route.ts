/**
 * API Route: Extract dominant colors from an image URL
 * 
 * This route fetches an image from a remote URL and extracts its dominant colors
 * using server-side processing to bypass browser CORS restrictions.
 * 
 * Install dependencies:
 * npm install node-vibrant
 * 
 * Usage:
 * GET /api/image-colors?url=https://example.com/image.jpg
 * 
 * Returns:
 * {
 *   "colors": ["#123456", "#abcdef", "#112233"]
 * }
 */

import { NextRequest, NextResponse } from "next/server";

// node-vibrant uses CommonJS, use require which works in Next.js API routes
let Vibrant: any;
try {
  Vibrant = require("node-vibrant");
  // If it's wrapped in default, unwrap it
  if (Vibrant.default) {
    Vibrant = Vibrant.default;
  }
} catch (error) {
  console.error("Failed to load node-vibrant:", error);
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const imageUrl = searchParams.get("url");

  // Validate URL parameter
  if (!imageUrl) {
    return NextResponse.json(
      { error: "Missing 'url' query parameter", colors: [] },
      { status: 400 }
    );
  }

  // Validate URL format
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(imageUrl);
  } catch (error) {
    console.error("Invalid URL format:", imageUrl);
    return NextResponse.json(
      { error: "Invalid URL format", colors: [] },
      { status: 400 }
    );
  }

  // Only allow http/https protocols
  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    return NextResponse.json(
      { error: "Only http and https URLs are allowed", colors: [] },
      { status: 400 }
    );
  }

  try {
    // First, fetch the image to ensure it loads successfully
    console.log("Fetching image:", imageUrl);
    const imageResponse = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Apoxer/1.0)',
      },
    });

    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.status} ${imageResponse.statusText}`);
    }

    // Check if response is actually an image
    const contentType = imageResponse.headers.get('content-type');
    if (!contentType || !contentType.startsWith('image/')) {
      throw new Error(`Invalid content type: ${contentType}. Expected an image.`);
    }

    // Get the image buffer
    const imageBuffer = await imageResponse.arrayBuffer();

    // Now extract colors using node-vibrant with the loaded image
    if (!Vibrant) {
      throw new Error("node-vibrant module not available");
    }
    
    console.log("Extracting colors from image...");
    const palette = await Vibrant.from(Buffer.from(imageBuffer))
      .quality(1) // Highest quality
      .getPalette();

    // Extract swatches and convert to hex strings
    const colors: string[] = [];
    
    // Order of preference: Vibrant, Muted, DarkVibrant, DarkMuted, LightVibrant, LightMuted
    const swatchOrder = [
      palette.Vibrant,
      palette.Muted,
      palette.DarkVibrant,
      palette.DarkMuted,
      palette.LightVibrant,
      palette.LightMuted,
    ];

    for (const swatch of swatchOrder) {
      if (swatch && swatch.hex) {
        colors.push(swatch.hex);
        // Limit to 3 colors for gradient
        if (colors.length >= 3) break;
      }
    }

    // If we got colors, return them
    if (colors.length > 0) {
      console.log("Successfully extracted colors:", colors);
      return NextResponse.json({ colors });
    }

    // Fallback: return empty array if no colors extracted
    console.warn("No colors extracted from image:", imageUrl);
    return NextResponse.json({ colors: [] });
  } catch (error) {
    // Log error for debugging
    console.error("Error processing image:", imageUrl, error);
    
    // Return empty colors array on error (graceful degradation)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Unknown error",
        colors: [] 
      },
      { status: 500 }
    );
  }
}

