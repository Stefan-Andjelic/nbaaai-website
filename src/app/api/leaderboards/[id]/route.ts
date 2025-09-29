import { NextRequest, NextResponse } from 'next/server';
import { getCustomLeaderboardDirect } from '@/lib/customLeaderboardData';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Decode the leaderboard config from the ID
    const config = getLeaderboardConfig(params.id);
    
    if (!config) {
      return NextResponse.json(
        { error: 'Leaderboard not found' },
        { status: 404 }
      );
    }

    // Always fetch top 50 for full list
    const results = await getCustomLeaderboardDirect({
      ...config,
      topN: 50,
    });

    return NextResponse.json({
      title: config.title,
      results,
      config: {
        topN: config.topN,
        statFilters: config.statFilters,
      },
    });
  } catch (error) {
    console.error('Error fetching full leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}

function getLeaderboardConfig(id: string) {
  try {
    // Decode the base64 ID back to config
    const decoded = atob(id);
    const config = JSON.parse(decoded);
    
    return {
      title: config.title,
      topN: config.topN || 5,
      statFilters: config.statFilters,
    };
  } catch (error) {
    console.error('Error decoding leaderboard config:', error);
    return null;
  }
}