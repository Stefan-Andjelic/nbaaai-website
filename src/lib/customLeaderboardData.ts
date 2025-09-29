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

  // Step 1: Get all qualifying games
  let query = supabase
    .from('box_score_basic_player_stats')
    .select('player_id, game_id')
    .neq('mp', '00:00');

  // Apply each stat filter
  request.statFilters.forEach((filter) => {
    switch (filter.operator) {
      case '>=':
        query = query.gte(filter.stat, filter.value);
        break;
      case '>':
        query = query.gt(filter.stat, filter.value);
        break;
      case '=':
        query = query.eq(filter.stat, filter.value);
        break;
      case '<=':
        query = query.lte(filter.stat, filter.value);
        break;
      case '<':
        query = query.lt(filter.stat, filter.value);
        break;
    }
  });

  const { data: qualifyingGames, error: gamesError } = await query;

  if (gamesError) {
    console.error('Error fetching qualifying games:', gamesError);
    throw gamesError;
  }

  // Step 2: Count games per player
  const playerCounts = qualifyingGames.reduce((acc, game) => {
    acc[game.player_id] = (acc[game.player_id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Step 3: Sort and get top N players
  const topPlayers = Object.entries(playerCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, request.topN)
    .map(([player_id, count]) => ({ player_id, count }));

  // Step 4: Enrich with player names
  const playerIds = topPlayers.map(p => p.player_id);
  const { data: playersData, error: playersError } = await supabase
    .from('players_info')
    .select('player_id, name')
    .in('player_id', playerIds);

  if (playersError) {
    console.error('Error fetching player names:', playersError);
    throw playersError;
  }

  // Step 5: Combine and format
  return topPlayers.map((player, index) => {
    const playerInfo = playersData?.find(p => p.player_id === player.player_id);
    return {
      player_id: player.player_id,
      player_name: playerInfo?.name || 'Unknown Player',
      value: player.count,
      rank: index + 1,
    };
  });
}