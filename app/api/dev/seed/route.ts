import { NextResponse } from "next/server";
import { seedDatabase } from "@/lib/seed";

/**
 * API route to trigger database seeding
 * 
 * POST /api/dev/seed
 * 
 * This endpoint runs the seed function to populate the database.
 * Only use this in development!
 */
export async function POST() {
  try {
    const results = await seedDatabase();
    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json(
      {
        gamesInserted: 0,
        communitiesInserted: 0,
        errors: [error instanceof Error ? error.message : "Unknown error"],
      },
      { status: 500 }
    );
  }
}

