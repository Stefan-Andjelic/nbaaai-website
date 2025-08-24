import { NextRequest, NextResponse } from 'next/server';
import { getPlayersData } from '@/lib/playerData';

export async function GET(request: NextRequest) {
  try {
    // Extract query parameters
    const searchParams = request.nextUrl.searchParams;

    // Handle different parameter names from MUI Table Pagination
    const page = parseInt(searchParams.get('page') || searchParams.get('pageNo') || '0', 10) + 1;
    const pageSize = parseInt(searchParams.get('pageSize') || searchParams.get('rowsPerPage') || '10', 10);

    const sortBy = searchParams.get('sortBy') || 'name';
    const sortOrderParam = searchParams.get('sortOrder');
    const sortOrder: 'asc' | 'desc' = sortOrderParam === 'asc' || sortOrderParam === 'desc' ? sortOrderParam : 'asc';
    const search = searchParams.get('search') || '';

    // Fetch players data
    const playersData = await getPlayersData({
      page,
      pageSize,
      sortBy,
      sortOrder,
      search
    });

    return NextResponse.json(playersData, { status: 200 });
  } catch (err) {
    console.error('Error fetching players:', err);
    return NextResponse.json({ 
      error: 'Failed to fetch players', 
      details: err instanceof Error ? err.message : 'Unknown error' 
    }, { status: 500 });
  }
}