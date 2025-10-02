import { NextRequest, NextResponse } from 'next/server';
import { getCustomLeaderboardDirect, CustomLeaderboardRequest } from '@/lib/customLeaderboardData';

export async function POST(request: NextRequest) {
  try {
    const body: CustomLeaderboardRequest = await request.json();
    console.log('Received custom leaderboard request:', JSON.stringify(body, null, 2));

    // Validate request
    if (!body.title || !body.statFilters || body.statFilters.length === 0) {
      console.log('Invalid request body:', body);
      return NextResponse.json(
        { error: 'Invalid request: title and statFilters are required' },
        { status: 400 }
      );
    }

    console.log('✅ Validation passed, executing query...');

    // Execute custom leaderboard query
    const results = await getCustomLeaderboardDirect(body);
    
    console.log('✅ Query succeeded, returning results:', results.length);

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