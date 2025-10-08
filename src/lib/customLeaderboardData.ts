import sql from "./db";
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
  if (request.statFilters.length === 0) {
    throw new Error('At least one stat filter is required.');
  }

  // Validate all stat names to prevent SQL injection
  const allowedStats = [
    'pts', 'ast', 'trb', 'stl', 'blk', 'fg_pct', 'fg3_pct', 'ft_pct', 'ft',
    'fga', 'fgm', 'fg3a', 'fg3', 'fg3m', 'fta', 'ftm', 'oreb', 'dreb', 'tov', 'pf',
    'orb', 'drb', 'mp', 'gs', 'plus_minus'
  ];

  console.log('Building conditions for filters:', request.statFilters);

  // Validate each filter's stat name
  for (const filter of request.statFilters) {
    if (!allowedStats.includes(filter.stat)) {
      throw new Error(`Invalid stat: ${filter.stat}`);
    }
  }

  // Validate operators
  const validOperators = ['>=', '>', '=', '<=', '<'];
  for (const filter of request.statFilters) {
    if (!validOperators.includes(filter.operator)) {
      throw new Error(`Invalid operator: ${filter.operator}`);
    }
  }

  // Build WHERE conditions (now safe since we validated stat names and operators)
  const conditions = request.statFilters
    .map((filter) => `b.${filter.stat} ${filter.operator} ${filter.value}`)
    .join(' AND ');
  console.log('Constructed conditions:', conditions);
  console.log('Fetching leaderboard with conditions:', conditions);

  try {
    // Execute query with JOIN to get player names in one go
    const data = await sql.unsafe(`
      SELECT 
        p.player_id,
        p.name as player_name,
        COUNT(*) as games_achieved
      FROM box_score_basic_player_stats b
      JOIN players_info p ON b.player_id = p.player_id
      WHERE ${conditions}
      GROUP BY p.player_id, p.name
      ORDER BY games_achieved DESC
      LIMIT ${request.topN}
    `);

    console.log('Raw leaderboard data:', data);

    return data.map((row: any, index: number) => ({
      player_id: row.player_id,
      player_name: row.player_name,
      value: parseInt(row.games_achieved),
      rank: index + 1,
    }));
  } catch (error) {
    console.error('Error fetching custom leaderboard:', error);
    throw error;
  }
}