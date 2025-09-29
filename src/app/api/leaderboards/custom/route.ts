import { NextRequest, NextResponse } from 'next/server';
import { getCustomLeaderboardDirect, CustomLeaderboardRequest } from '@/lib/customLeaderboardData';

export async function POST(request: NextRequest) {
  try {
    const body: CustomLeaderboardRequest = await request.json();

    // Validate request
    if (!body.title || !body.statFilters || body.statFilters.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request: title and statFilters are required' },
        { status: 400 }
      );
    }

    // Execute custom leaderboard query
    const results = await getCustomLeaderboardDirect(body);

    return NextResponse.json({
      success: true,
      title: body.title,
      results,
      filters: body.statFilters,
    });
  } catch (error) {
    console.error('Error creating custom leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to create leaderboard' },
      { status: 500 }
    );
  }
}