import { NextRequest, NextResponse } from "next/server";
import { getAllFeaturedLeaderboards } from "@/lib/featuredLeaderboardsServer";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "5");

    try {
        const data = await getAllFeaturedLeaderboards(limit);
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching featured leaderboards:", error);
        return NextResponse.json({ error: "Failed to fetch featured leaderboards" }, { status: 500 });
    }
}