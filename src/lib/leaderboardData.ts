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
  const currentSeason = "2024-25"; // Update this dynamically as needed

  const [ppg, apg, rpg, bpg, spg] = await Promise.all([
    getStatLeaders(supabase, "pts_per_g", currentSeason, "season"),
    getStatLeaders(supabase, "ast_per_g", currentSeason, "season"),
    getStatLeaders(supabase, "trb_per_g", currentSeason, "season"),
    getStatLeaders(supabase, "blk_per_g", currentSeason, "season"),
    getStatLeaders(supabase, "stl_per_g", currentSeason, "season"),
  ]);

  return { ppg, apg, rpg, bpg, spg };
}

async function getAllTimeLeaders(supabase: SupabaseClient) {
  const [ppg, apg, rpg, bpg, spg] = await Promise.all([
    getStatLeaders(supabase, "pts_per_g", null, "career"),
    getStatLeaders(supabase, "ast_per_g", null, "career"),
    getStatLeaders(supabase, "trb_per_g", null, "career"),
    getStatLeaders(supabase, "blk_per_g", null, "career"),
    getStatLeaders(supabase, "stl_per_g", null, "career"),
  ]);

  return { ppg, apg, rpg, bpg, spg };
}

async function getStatLeaders(
  supabase: SupabaseClient,
  statColumn: string,
  season: string | null,
  type: "season" | "career"
): Promise<LeaderboardEntry[]> {
  let query = supabase
    .from("player_season_per_game")
    .select(`player_id, games, ${statColumn}`)
    .gt("games", 20) // Minimum games threshold
    .order(statColumn, { ascending: false })
    .limit(10);

  // Add season filter for current season leaders
  if (season && type === "season") {
    query = query.eq("year_id", season);
  }

  const { data: statsData, error: statsError } = await query;

  if (statsError) {
    console.error(`Error fetching ${statColumn} leaders:`, statsError);
    throw statsError;
  }

  if (!statsData) return [];

  const playerIds = (statsData as any[]).map((player) => player.player_id);
  const { data: playersData, error: playersError } = await supabase
    .from("players_info") // Changed from 'players_info' to 'player_info'
    .select("player_id, name") // Adjust 'name' to your actual column name
    .in("player_id", playerIds);

  // Transform data to LeaderboardEntry format
  return statsData?.map((player: any, index: number) => {
    const playerInfo = playersData?.find(
      (p) => p.player_id === player.player_id
    );
    return {
      player_id: player.player_id,
      player_name: playerInfo?.name,
      value:
        type === "season"
          ? Number(player[statColumn]) // Per game average
          : player[statColumn], // Total for career
      rank: index + 1,
    };
  });
}
