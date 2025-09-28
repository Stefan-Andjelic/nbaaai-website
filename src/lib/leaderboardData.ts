import { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseClient } from "./supabaseClient";
import { LeaderboardEntry } from "@/types/supabase";

export async function getLeaderboards() {
  const supabase = createSupabaseClient();

  // Parallel queries for better performance
  const [currentSeason, allTime] = await Promise.all([
    getCurrentSeasonLeaders(supabase),
    getAllTimeLeaders(supabase),
  ]);

  return { currentSeason, allTime };
}

async function getCurrentSeasonLeaders(supabase: SupabaseClient) {
  const currentSeason = "2024-25";

  const [ppg, apg, rpg, bpg, spg] = await Promise.all([
    getSeasonLeaders(supabase, "pts_per_g", currentSeason),
    getSeasonLeaders(supabase, "ast_per_g", currentSeason),
    getSeasonLeaders(supabase, "trb_per_g", currentSeason),
    getSeasonLeaders(supabase, "blk_per_g", currentSeason),
    getSeasonLeaders(supabase, "stl_per_g", currentSeason),
  ]);

  return { ppg, apg, rpg, bpg, spg };
}

async function getAllTimeLeaders(supabase: SupabaseClient) {
  const [ppg, apg, rpg, bpg, spg] = await Promise.all([
    getCareerLeaders(supabase, "pts_per_g"),
    getCareerLeaders(supabase, "ast_per_g"),
    getCareerLeaders(supabase, "trb_per_g"),
    getCareerLeaders(supabase, "blk_per_g"),
    getCareerLeaders(supabase, "stl_per_g"),
  ]);

  return { ppg, apg, rpg, bpg, spg };
}

async function getSeasonLeaders(
  supabase: SupabaseClient,
  statColumn: string,
  season: string | null
): Promise<LeaderboardEntry[]> {
  const { data: statsData, error: statsError } = await supabase
    .from("player_season_per_game")
    .select(`player_id, games, ${statColumn}`)
    .eq("year_id", season)
    .gt("games", 20) // Minimum games threshold
    .order(statColumn, { ascending: false })
    .limit(10);

  if (statsError) {
    console.error(`Error fetching ${statColumn} leaders:`, statsError);
    throw statsError;
  }

  if (!statsData) return [];

  return await enrichWithPlayerNames(supabase, statsData, statColumn, "season");
}

async function getCareerLeaders(
  supabase: SupabaseClient,
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
  
  const { data: statsData, error: statsError } = await supabase
    .from("player_career_averages")
    .select(`player_id, total_career_games, ${careerColumn}`)
    .order(careerColumn, { ascending: false })
    .limit(10);

  console.log(`Career leaders for ${statColumn}:`, statsData);

  if (statsError) {
    console.error(`Error fetching career ${statColumn} leaders:`, statsError);
    throw statsError;
  }

  if (!statsData) return [];

  return await enrichWithPlayerNames(supabase, statsData, careerColumn, "career");
}

async function enrichWithPlayerNames(
  supabase: SupabaseClient,
  statsData: any[],
  statColumn: string,
  type: "season" | "career"
): Promise<LeaderboardEntry[]> {
  const playerIds = (statsData as any[]).map((player) => player.player_id);

  const { data: playersData, error: playersError } = await supabase
    .from("players_info")
    .select("player_id, name")
    .in("player_id", playerIds);

  if (playersError) {
    console.error("Error fetching player names:", playersError);
  }

  return statsData?.map((player: any, index: number) => {
    const playerInfo = playersData?.find(
      (p) => p.player_id === player.player_id
    );
    const statValue = player[statColumn];
    return {
      player_id: player.player_id,
      player_name: playerInfo?.name || "Unknown Player",
      value: Number(statValue),
      rank: index + 1,
    };
  });
}
