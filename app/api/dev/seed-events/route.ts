import { NextResponse } from "next/server";
import { seedEvents } from "@/lib/seed-events";

/**
 * API route to trigger events seeding
 * 
 * POST /api/dev/seed-events
 * 
 * This endpoint runs the seed function to populate events and game versions.
 * Only use this in development!
 */
export async function POST() {
  try {
    const results = await seedEvents();
    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json(
      {
        versionsCreated: 0,
        eventsCreated: 0,
        errors: [error instanceof Error ? error.message : "Unknown error"],
      },
      { status: 500 }
    );
  }
}

