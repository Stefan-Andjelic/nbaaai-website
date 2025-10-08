import sql from "./db";
import { LeaderboardEntry } from "@/types/supabase";

export async function getLeaderboards() {
  // Parallel queries for better performance
  const [currentSeason, allTime] = await Promise.all([
    getCurrentSeasonLeaders(),
    getAllTimeLeaders(),
  ]);

  return { currentSeason, allTime };
}

async function getCurrentSeasonLeaders() {
  const currentSeason = "2024-25";

  const [ppg, apg, rpg, bpg, spg] = await Promise.all([
    getSeasonLeaders("pts_per_g", currentSeason),
    getSeasonLeaders("ast_per_g", currentSeason),
    getSeasonLeaders("trb_per_g", currentSeason),
    getSeasonLeaders("blk_per_g", currentSeason),
    getSeasonLeaders("stl_per_g", currentSeason),
  ]);

  return { ppg, apg, rpg, bpg, spg };
}

async function getAllTimeLeaders() {
  const [ppg, apg, rpg, bpg, spg] = await Promise.all([
    getCareerLeaders("pts_per_g"),
    getCareerLeaders("ast_per_g"),
    getCareerLeaders("trb_per_g"),
    getCareerLeaders("blk_per_g"),
    getCareerLeaders("stl_per_g"),
  ]);

  return { ppg, apg, rpg, bpg, spg };
}

async function getSeasonLeaders(
  statColumn: string,
  season: string
): Promise<LeaderboardEntry[]> {
  // Validate stat column to prevent SQL injection
  const allowedStats = [
    'pts_per_g', 'ast_per_g', 'trb_per_g', 'blk_per_g', 'stl_per_g',
    'fg_pct', 'fg3_pct', 'ft_pct'
  ];

  if (!allowedStats.includes(statColumn)) {
    throw new Error(`Invalid stat column: ${statColumn}`);
  }

  try {
    const statsData = await sql.unsafe(`
      SELECT 
        s.player_id,
        s.games,
        s.${statColumn},
        p.name as player_name
      FROM player_season_per_game s
      JOIN players_info p ON s.player_id = p.player_id
      WHERE s.year_id = '${season.replace(/'/g, "''")}'
        AND s.games > 20
      ORDER BY s.${statColumn} DESC
      LIMIT 10
    `);

    return statsData.map((player: any, index: number) => ({
      player_id: player.player_id,
      player_name: player.player_name || "Unknown Player",
      value: parseFloat(player[statColumn]),
      rank: index + 1,
    }));
  } catch (error) {
    console.error(`Error fetching ${statColumn} leaders:`, error);
    throw error;
  }
}

async function getCareerLeaders(
  statColumn: string
): Promise<LeaderboardEntry[]> {
  const careerColumnMap: Record<string, string> = {
    pts_per_g: "career_pts_per_g",
    ast_per_g: "career_ast_per_g",
    trb_per_g: "career_trb_per_g",
    blk_per_g: "career_blk_per_g",
    stl_per_g: "career_stl_per_g",
  };

  const careerColumn = careerColumnMap[statColumn];
  console.log(`Fetching career leaders for stat: ${statColumn} using column: ${careerColumn}`);

  if (!careerColumn) {
    throw new Error(`No career mapping found for stat: ${statColumn}`);
  }

  // Validate career column
  const allowedCareerStats = Object.values(careerColumnMap);
  if (!allowedCareerStats.includes(careerColumn)) {
    throw new Error(`Invalid career column: ${careerColumn}`);
  }

  try {
    const statsData = await sql.unsafe(`
      SELECT 
        c.player_id,
        c.total_career_games,
        c.${careerColumn},
        p.name as player_name
      FROM player_career_averages c
      JOIN players_info p ON c.player_id = p.player_id
      ORDER BY c.${careerColumn} DESC
      LIMIT 10
    `);

    console.log(`Career leaders for ${statColumn}:`, statsData);

    return statsData.map((player: any, index: number) => ({
      player_id: player.player_id,
      player_name: player.player_name || "Unknown Player",
      value: parseFloat(player[careerColumn]),
      rank: index + 1,
    }));
  } catch (error) {
    console.error(`Error fetching career ${statColumn} leaders:`, error);
    throw error;
  }
}