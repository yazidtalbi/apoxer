import { NextRequest, NextResponse } from "next/server";
import { getGames } from "@/lib/games";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const filters = {
      q: searchParams.get("q") || undefined,
      genre: searchParams.get("genre") || undefined,
      platform: searchParams.get("platform") || undefined,
      limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined,
      offset: searchParams.get("offset") ? parseInt(searchParams.get("offset")!) : undefined,
    };

    const games = await getGames(filters);

    return NextResponse.json(games);
  } catch (error: any) {
    console.error("Error fetching games:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch games" },
      { status: 500 }
    );
  }
}

