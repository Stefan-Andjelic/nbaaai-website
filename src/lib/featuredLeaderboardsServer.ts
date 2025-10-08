import sql from './db';
import { LeaderboardEntry } from "@/types/supabase";
import { FEATURED_LEADERBOARDS } from './featuredLeaderboards';

export async function getFeaturedLeaderboard(
  leaderboardId: string,
  limit: number = 5
): Promise<LeaderboardEntry[]> {
  const board = FEATURED_LEADERBOARDS.find(b => b.id === leaderboardId);
  
  if (!board) {
    throw new Error(`Featured leaderboard not found: ${leaderboardId}`);
  }

  try {
    const data = await sql.unsafe(`
      SELECT player_id, player_name, games_achieved
      FROM ${board.viewName}
      LIMIT ${limit}
    `);

    return data.map((row: any, index: number) => ({
      player_id: row.player_id,
      player_name: row.player_name,
      value: parseInt(row.games_achieved),
      rank: index + 1,
    }));
  } catch (error) {
    console.error(`Error fetching featured leaderboard ${leaderboardId}:`, error);
    throw error;
  }
}


export async function getAllFeaturedLeaderboards(
  limit: number = 5
): Promise<Record<string, LeaderboardEntry[]>> {
  const results: Record<string, LeaderboardEntry[]> = {};

  await Promise.all(
    FEATURED_LEADERBOARDS.map(async (board) => {
      try {
        results[board.id] = await getFeaturedLeaderboard(board.id, limit);
      } catch (error) {
        console.error(`Error loading ${board.id}:`, error);
        results[board.id] = [];
      }
    })
  );

  return results;
}