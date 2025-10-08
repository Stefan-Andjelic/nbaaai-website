import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { generateAnonymousUsername, formatPredictionText } from '@/lib/predictionUtils';
import { CreatePredictionInput } from '@/types/predictions';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const predictionType = searchParams.get('type');

    // Validate sortBy to prevent SQL injection
    const allowedSortColumns = ['created_at', 'username', 'player_name', 'target_value'];
    const validSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'created_at';
    const validSortOrder = sortOrder === 'asc' ? 'ASC' : 'DESC';

    // Build query dynamically
    let whereConditions = [];
    let params: any[] = [];

    // Apply search filter
    if (search) {
      whereConditions.push(`(
        username ILIKE $${params.length + 1} OR 
        player_name ILIKE $${params.length + 2} OR 
        prediction_text ILIKE $${params.length + 3}
      )`);
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    // Apply type filter
    if (predictionType && (predictionType === 'season' || predictionType === 'game')) {
      whereConditions.push(`prediction_type = $${params.length + 1}`);
      params.push(predictionType);
    }

    // Build WHERE clause
    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';

    // Execute query
    const query = `
      SELECT * FROM predictions
      ${whereClause}
      ORDER BY ${validSortBy} ${validSortOrder}
    `;

    const data = await sql.unsafe(query, params);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in GET /api/predictions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
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
    const [data] = await sql`
      INSERT INTO predictions (
        username,
        prediction_type,
        prediction_text,
        player_id,
        player_name,
        stat_type,
        comparison_operator,
        target_value,
        season,
        game_id,
        game_date,
        is_after_start,
        current_value,
        created_at
      )
      VALUES (
        ${username},
        ${body.prediction_type},
        ${predictionText},
        ${body.player_id || null},
        ${body.player_name || null},
        ${body.stat_type},
        ${body.comparison_operator},
        ${body.target_value},
        ${body.season || null},
        ${body.game_id || null},
        ${body.game_date || null},
        ${isAfterStart},
        0,
        NOW()
      )
      RETURNING *
    `;

    if (!data) {
      return NextResponse.json({ error: 'Failed to create prediction' }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/predictions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}