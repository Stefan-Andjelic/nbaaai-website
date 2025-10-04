import { NextRequest, NextResponse} from 'next/server';
import { createSupabaseClient } from '@/lib/supabaseClient';
import { generateAnonymousUsername, formatPredictionText } from '@/lib/predictionUtils';
import { CreatePredictionInput } from '@/types/predictions';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const predictionType = searchParams.get('type');

    const supabase = createSupabaseClient();

    let query = supabase
      .from('predictions')
      .select('*');

    // Apply search filter
    if (search) {
      query = query.or(`username.ilike.%${search}%,player_name.ilike.%${search}%,prediction_text.ilike.%${search}%`);
    }

    // Apply type filter
    if (predictionType && (predictionType === 'season' || predictionType === 'game')) {
      query = query.eq('prediction_type', predictionType);
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching predictions:', error);
      return NextResponse.json({ error: 'Failed to fetch predictions' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in GET /api/predictions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseClient();
    const body: CreatePredictionInput = await request.json();

    // Validate required fields
    if (!body.stat_type || !body.comparison_operator || body.target_value === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate anonymous username
    const username = generateAnonymousUsername();

    // Format prediction text
    const predictionText = formatPredictionText(
      body.player_name || null,
      body.stat_type,
      body.comparison_operator,
      body.target_value,
      body.prediction_type
    );

    // Determine if prediction is made after start
    let isAfterStart = false;
    if (body.prediction_type === 'season') {
      // Simple check: if we're past October 1st of the current season year
      const now = new Date();
      const seasonStartMonth = 9; // October (0-indexed)
      const currentMonth = now.getMonth();
      isAfterStart = currentMonth > seasonStartMonth;
    } else if (body.game_date) {
      // For game predictions, check if current date is after game date
      const gameDate = new Date(body.game_date);
      isAfterStart = new Date() > gameDate;
    }

    // Insert prediction
    const { data, error } = await supabase
      .from('predictions')
      .insert([
        {
          username,
          prediction_type: body.prediction_type,
          prediction_text: predictionText,
          player_id: body.player_id || null,
          player_name: body.player_name || null,
          stat_type: body.stat_type,
          comparison_operator: body.comparison_operator,
          target_value: body.target_value,
          season: body.season || null,
          game_id: body.game_id || null,
          game_date: body.game_date || null,
          is_after_start: isAfterStart,
          current_value: 0,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating prediction:', error);
      return NextResponse.json({ error: 'Failed to create prediction' }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/predictions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}