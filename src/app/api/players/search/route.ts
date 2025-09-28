import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
      return NextResponse.json([]);
    }

    const supabase = createSupabaseClient();
    
    const { data, error } = await supabase
      .from('players_info')
      .select('player_id, name')
      .ilike('name', `%${query}%`)
      .limit(6);

    if (error) {
      console.error('Search error:', error);
      return NextResponse.json({ error: 'Search failed' }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}