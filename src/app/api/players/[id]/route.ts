// src/app/api/players/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getPlayerDetails } from '@/lib/playerData';

export async function GET(
  request: NextRequest, 
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;

    // Fetch player details
    const playerData = await getPlayerDetails(id);

    return NextResponse.json(playerData, { status: 200 });
  } catch (err) {
    console.error('Error fetching player details:', err);
    return NextResponse.json({ 
      error: 'Failed to fetch player details', 
      details: err instanceof Error ? err.message : 'Unknown error' 
    }, { status: 500 });
  }
}