import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
      return NextResponse.json([]);
    }
    
    // Search for players with case-insensitive match
    const data = await sql`
      SELECT player_id, name
      FROM players_info
      WHERE name ILIKE ${'%' + query + '%'}
      ORDER BY name
      LIMIT 6
    `;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}