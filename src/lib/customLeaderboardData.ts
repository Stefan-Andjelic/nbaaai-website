import { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseClient } from "./supabaseClient";
import { LeaderboardEntry } from "@/types/supabase";

export interface StatFilter {
  stat: string;
  operator: '>=' | '>' | '=' | '<=' | '<';
  value: number;
}

export interface CustomLeaderboardRequest {
  topN: number;
  title: string;
  statFilters: StatFilter[];
}

export async function getCustomLeaderboardDirect(
  request: CustomLeaderboardRequest
): Promise<LeaderboardEntry[]> {
  const supabase = createSupabaseClient();

  // Build WHERE clause
  const conditions = request.statFilters
    .map((filter: any) => {
      // Escape values to prevent SQL injection
      const value = typeof filter.value === 'string' 
        ? `'${filter.value.replace(/'/g, "''")}'` 
        : filter.value;
      return `${filter.stat} ${filter.operator} ${value}`;
    })
    .join(' AND ');

  // Call database function to do counting server-side
  const { data, error } = await supabase.rpc('get_custom_leaderboard', {
    p_conditions: conditions,
    p_limit: request.topN
  });

  if (error) {
    console.error('Error fetching leaderboard:', error);
    throw error;
  }

  return data.map((row: any, index: number) => ({
    player_id: row.player_id,
    player_name: row.player_name,
    value: row.games_achieved,
    rank: index + 1,
  }));
}