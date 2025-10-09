import { NextRequest, NextResponse } from 'next/server';
import { fetchGraphData } from '@/lib/visualizationDataServer';
import { StatMetric, ContextType, AggregationType } from '@/types/visualizations';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { playerIds, metric, seasonStart, seasonEnd, context, aggregation } = body;

    // Validation
    if (!playerIds || !Array.isArray(playerIds) || playerIds.length === 0) {
      return NextResponse.json(
        { error: 'playerIds array is required and must not be empty' },
        { status: 400 }
      );
    }

    if (!metric) {
      return NextResponse.json(
        { error: 'metric is required' },
        { status: 400 }
      );
    }

    if (!seasonStart || !seasonEnd) {
      return NextResponse.json(
        { error: 'seasonStart and seasonEnd are required' },
        { status: 400 }
      );
    }

    if (seasonStart > seasonEnd) {
      return NextResponse.json(
        { error: 'seasonStart must be less than or equal to seasonEnd' },
        { status: 400 }
      );
    }

    // Fetch data
    const data = await fetchGraphData({
      playerIds,
      metric: metric as StatMetric,
      seasonStart: parseInt(seasonStart),
      seasonEnd: parseInt(seasonEnd),
      context: (context || 'all') as ContextType,
      aggregation: (aggregation || 'per_game') as AggregationType
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in visualization API:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}