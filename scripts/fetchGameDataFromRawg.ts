/**
 * RAWG.io Game Data Fetcher Script
 * 
 * This script fetches game descriptions and screenshots from RAWG.io pages
 * and updates the Supabase games table.
 * 
 * SETUP:
 * 1. Ensure .env.local has:
 *    - NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL)
 *    - NEXT_PUBLIC_SUPABASE_ANON_KEY (or SUPABASE_ANON_KEY)
 * 
 * 2. Run the SQL migration to add screenshots column (if not already done):
 *    Run database-schema-add-screenshots.sql in your Supabase SQL editor
 * 
 * 3. Install dependencies (if not already installed):
 *    npm install cheerio
 *    npm install -D tsx @types/node
 * 
 * 3. Run the script:
 *    npx tsx scripts/fetchGameDataFromRawg.ts
 * 
 * NOTE: This script is safe to run multiple times - it only processes games
 * that need description or screenshot updates.
 */

import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import * as cheerio from "cheerio";

// Load environment variables
dotenv.config({ path: ".env.local" });
dotenv.config();

// Configuration
const RAWG_BASE_URL = "https://rawg.io/games";
const RATE_LIMIT_DELAY_MS = 1000; // 1 second delay between requests to be respectful

// Environment variables with fallbacks
const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validate required environment variables
if (!SUPABASE_URL) {
  console.error("\n❌ Missing Supabase URL. Add SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL in .env.local\n");
  process.exit(1);
}

if (!SUPABASE_ANON_KEY) {
  console.error("\n❌ Missing Supabase anon key. Add SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local\n");
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Types
type GameRow = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  screenshots: string[] | null;
};

interface RawgGameData {
  description: string | null;
  screenshots: string[];
}

/**
 * Sleep helper for rate limiting
 */
async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch HTML from a URL
 */
async function fetchHtml(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.text();
  } catch (error) {
    throw new Error(`Failed to fetch ${url}: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Extract game description and screenshots from RAWG.io page
 */
async function fetchGameDataFromRawg(slug: string): Promise<RawgGameData | null> {
  const url = `${RAWG_BASE_URL}/${slug}`;
  
  try {
    console.log(`  Fetching: ${url}`);
    const html = await fetchHtml(url);
    const $ = cheerio.load(html);

    // Extract description
    // RAWG.io typically has the description in a specific section
    // Look for common description selectors
    let description: string | null = null;
    
    // First try meta description tag
    const metaDesc = $('meta[name="description"]').attr('content');
    if (metaDesc && metaDesc.length > 50) {
      description = metaDesc.trim();
    }

    // Try multiple selectors for description
    if (!description || description.length < 50) {
      const descriptionSelectors = [
        '.game-description',
        '[data-testid="game-description"]',
        'p.description',
        '.about p',
        'section.about p',
        '.game-info p',
        'div[class*="description"] p',
      ];

      for (const selector of descriptionSelectors) {
        const element = $(selector).first();
        if (element.length > 0) {
          const text = element.text().trim();
          if (text && text.length > 50) {
            description = text;
            break;
          }
        }
      }
    }

    // If no description found, try to get from the "About" section
    if (!description || description.length < 50) {
      const aboutSection = $('h2:contains("About"), h3:contains("About")').next('p, div');
      if (aboutSection.length > 0) {
        const text = aboutSection.first().text().trim();
        if (text && text.length > 50) {
          description = text;
        }
      }
    }

    // Try to get from any paragraph after the title
    if (!description || description.length < 50) {
      const firstParagraph = $('main p, article p, .content p').first();
      if (firstParagraph.length > 0) {
        const text = firstParagraph.text().trim();
        if (text && text.length > 50 && !text.includes('Rate') && !text.includes('Add to')) {
          description = text;
        }
      }
    }

    // Extract screenshots
    const screenshots: string[] = [];
    
    // Try multiple selectors for screenshots
    const screenshotSelectors = [
      'img[data-testid="screenshot"]',
      '.screenshot img',
      '.game-screenshots img',
      '[class*="screenshot"] img',
      'img[src*="screenshot"]',
      '.media-gallery img',
      '.screenshots img',
      'section[class*="screenshot"] img',
    ];

    for (const selector of screenshotSelectors) {
      $(selector).each((_, el) => {
        const src = $(el).attr('src') || $(el).attr('data-src') || $(el).attr('data-lazy-src');
        if (src) {
          // Convert relative URLs to absolute
          let absoluteUrl = src;
          if (src.startsWith('//')) {
            absoluteUrl = `https:${src}`;
          } else if (src.startsWith('/')) {
            absoluteUrl = `https://rawg.io${src}`;
          } else if (!src.startsWith('http')) {
            absoluteUrl = `https://rawg.io/${src}`;
          }
          
          // Filter out small icons and logos
          if (absoluteUrl && !absoluteUrl.includes('icon') && !absoluteUrl.includes('logo') && !screenshots.includes(absoluteUrl)) {
            screenshots.push(absoluteUrl);
          }
        }
      });
    }

    // Also check for screenshots in meta tags or JSON-LD
    const jsonLd = $('script[type="application/ld+json"]');
    if (jsonLd.length > 0) {
      try {
        const jsonData = JSON.parse(jsonLd.first().html() || '{}');
        if (jsonData.image) {
          const images = Array.isArray(jsonData.image) ? jsonData.image : [jsonData.image];
          images.forEach((img: string) => {
            if (img && !img.includes('icon') && !img.includes('logo') && !screenshots.includes(img)) {
              screenshots.push(img);
            }
          });
        }
      } catch (e) {
        // Ignore JSON parsing errors
      }
    }

    // Try to find screenshots in data attributes or gallery sections
    $('[data-screenshots], [data-images]').each((_, el) => {
      try {
        const data = $(el).attr('data-screenshots') || $(el).attr('data-images');
        if (data) {
          const images = JSON.parse(data);
          if (Array.isArray(images)) {
            images.forEach((img: string) => {
              if (img && !screenshots.includes(img)) {
                screenshots.push(img);
              }
            });
          }
        }
      } catch (e) {
        // Ignore parsing errors
      }
    });

    return {
      description: description || null,
      screenshots: screenshots.slice(0, 10), // Limit to 10 screenshots
    };
  } catch (error) {
    console.error(`  ❌ Error fetching data for ${slug}:`, error instanceof Error ? error.message : "Unknown error");
    return null;
  }
}

/**
 * Get games from database that need description or screenshots
 */
async function getGamesWithoutData(): Promise<GameRow[]> {
  const { data, error } = await supabase
    .from("games")
    .select("id, title, slug, description")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch games: ${error.message}`);
  }

  // Filter games that need description updates (empty or placeholder descriptions)
  const gamesNeedingUpdate = (data || []).filter((game: any) => {
    const desc = game.description;
    return !desc || 
           desc === "Game information coming soon." ||
           desc.startsWith("More info:") ||
           desc.length < 50;
  });

  return gamesNeedingUpdate as GameRow[];
}

/**
 * Update game in database with description and screenshots
 */
async function updateGameData(
  gameId: string,
  description: string | null,
  screenshots: string[]
): Promise<void> {
  const updateData: any = {};
  
  if (description) {
    updateData.description = description;
  }
  
  // Store screenshots as JSON array if we have a screenshots column
  // Check if column exists by trying to update it
  if (screenshots.length > 0) {
    updateData.screenshots = screenshots;
  }

  if (Object.keys(updateData).length === 0) {
    return;
  }

  const { error } = await supabase
    .from("games")
    .update(updateData)
    .eq("id", gameId);

  if (error) {
    // If screenshots column doesn't exist, try without it
    if (error.message.includes("screenshots") && screenshots.length > 0) {
      console.log(`  ⚠️  Screenshots column not found, updating description only...`);
      const { error: descError } = await supabase
        .from("games")
        .update({ description: description || undefined })
        .eq("id", gameId);
      
      if (descError) {
        throw new Error(`Failed to update game ${gameId}: ${descError.message}`);
      }
      return;
    }
    throw new Error(`Failed to update game ${gameId}: ${error.message}`);
  }
}

/**
 * Main function
 */
async function main() {
  console.log("🎮 RAWG.io Game Data Fetcher\n");
  console.log("Fetching games from database...");

  const games = await getGamesWithoutData();
  console.log(`Found ${games.length} games that need data updates.\n`);

  if (games.length === 0) {
    console.log("✅ All games already have descriptions. Exiting.");
    return;
  }

  let successCount = 0;
  let errorCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < games.length; i++) {
    const game = games[i];
    console.log(`[${i + 1}/${games.length}] Processing: ${game.title} (${game.slug})`);

    const gameData = await fetchGameDataFromRawg(game.slug);

    if (!gameData) {
      console.log(`  ⚠️  No data found, skipping...\n`);
      skippedCount++;
      await sleep(RATE_LIMIT_DELAY_MS);
      continue;
    }

    if (!gameData.description && gameData.screenshots.length === 0) {
      console.log(`  ⚠️  No description or screenshots found, skipping...\n`);
      skippedCount++;
      await sleep(RATE_LIMIT_DELAY_MS);
      continue;
    }

    try {
      await updateGameData(game.id, gameData.description, gameData.screenshots);
      
      const updates: string[] = [];
      if (gameData.description) updates.push("description");
      if (gameData.screenshots.length > 0) updates.push(`${gameData.screenshots.length} screenshots`);
      
      console.log(`  ✅ Updated: ${updates.join(", ")}\n`);
      successCount++;
    } catch (error) {
      console.error(`  ❌ Failed to update: ${error instanceof Error ? error.message : "Unknown error"}\n`);
      errorCount++;
    }

    // Rate limiting
    if (i < games.length - 1) {
      await sleep(RATE_LIMIT_DELAY_MS);
    }
  }

  console.log("\n📊 Summary:");
  console.log(`  ✅ Successfully updated: ${successCount}`);
  console.log(`  ⚠️  Skipped (no data): ${skippedCount}`);
  console.log(`  ❌ Errors: ${errorCount}`);
  console.log(`  📝 Total processed: ${games.length}`);
}

// Run the script
main().catch((error) => {
  console.error("\n❌ Fatal error:", error);
  process.exit(1);
});

