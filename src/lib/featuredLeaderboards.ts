import { createSupabaseClient } from "./supabaseClient";
import { LeaderboardEntry } from "@/types/supabase";

export interface FeaturedLeaderboard {
  id: string;
  title: string;
  description: string;
  viewName: string;
  icon?: string;
  filters: Array<{
    stat: string;
    operator: string;
    value: number;
  }>;
}

// Define your featured leaderboards
export const FEATURED_LEADERBOARDS: FeaturedLeaderboard[] = [
  {
    id: 'triple-double-30-less-than-8-ft',
    title: '30+ Point Triple-Double (less than 8 ft)',
    description: 'Most games with 30+ pts, 10+ trb, 10+ ast, and less than 8 FT attempts',
    viewName: 'leaderboard_30pt_triple_double_less_than_8_ft',
    filters: [
      { stat: 'pts', operator: '>=', value: 30 },
      { stat: 'trb', operator: '>=', value: 10 },
      { stat: 'ast', operator: '>=', value: 10 },
      { stat: 'ft', operator: '<', value: 8 },
    ],
  },
  {
    id: 'triple-double-30-with-2plus-stl',
    title: '30+ Point Triple-Double (with 2+ STL)',
    description: 'Most games with 30+ pts, 10+ trb, 10+ ast, and more than 1 stl',
    viewName: 'leaderboard_30pt_triple_double_with_2plus_stl',
    filters: [
      { stat: 'pts', operator: '>=', value: 30 },
      { stat: 'trb', operator: '>=', value: 10 },
      { stat: 'ast', operator: '>=', value: 10 },
      { stat: 'stl', operator: '>', value: 1 },
    ],
  },
  {
    id: 'triple-double-30-with-55plus-fg-pct',
    title: '30+ Point Triple-Double (with 55%+ FG%)',
    description: 'Most games with 30+ pts, 10+ trb, 10+ ast, and 0.55+ FG%',
    viewName: 'leaderboard_30pt_triple_double_with_55plus_fg_pct',
    filters: [
      { stat: 'pts', operator: '>=', value: 30 },
      { stat: 'trb', operator: '>=', value: 10 },
      { stat: 'ast', operator: '>=', value: 10 },
      { stat: 'fg_pct', operator: '>=', value: 0.55 },
    ],
  }
];

export async function getFeaturedLeaderboard(
  viewName: string,
  limit: number = 5
): Promise<LeaderboardEntry[]> {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from(viewName)
    .select('player_id, player_name, games_achieved')
    .limit(limit);

  if (error) {
    console.error(`Error fetching ${viewName}:`, error);
    throw error;
  }

  return data.map((row, index) => ({
    player_id: row.player_id,
    player_name: row.player_name,
    value: row.games_achieved,
    rank: index + 1,
  }));
}

export async function getAllFeaturedLeaderboards(
  limit: number = 5
): Promise<Record<string, LeaderboardEntry[]>> {
  const results: Record<string, LeaderboardEntry[]> = {};

  await Promise.all(
    FEATURED_LEADERBOARDS.map(async (board) => {
      try {
        results[board.id] = await getFeaturedLeaderboard(board.viewName, limit);
      } catch (error) {
        console.error(`Error loading ${board.id}:`, error);
        results[board.id] = [];
      }
    })
  );

  return results;
}