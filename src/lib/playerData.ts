import { createSupabaseClient } from "./supabaseClient";
import { Player, PlayersDataResponse } from "@/types/supabase";

export const getPlayersData = async ({
  page = 1,
  pageSize = 10,
  sortBy = "name",
  sortOrder = "asc",
  search = "",
}: {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
}): Promise<PlayersDataResponse> => {
  const supabase = createSupabaseClient();

  // Adjust page number (MUI uses 0-indexed, Supabase uses 1-indexed)
  const adjustedPage = page > 0 ? page : 1;
  const offset = (adjustedPage - 1) * pageSize;

  // Prepare base query
  let query = supabase.from("players_info").select("*", { count: "exact" });

  // Add search filter if provided
  if (search) {
    query = query.or(`name.ilike.%${search}%,player_id.ilike.%${search}%`);
  }

  // Get total count
  const { count, error: countError } = await query;

  if (countError) {
    console.error("Error getting players count:", countError);
    throw countError;
  }

  // Prepare players query
  let playersQuery = supabase
    .from("players_info")
    .select("*")
    .order(sortBy, { ascending: sortOrder === "asc" })
    .range(offset, offset + pageSize - 1);

  // Add search filter to players query if provided
  if (search) {
    playersQuery = playersQuery.or(
      `name.ilike.%${search}%,player_id.ilike.%${search}%`
    );
  }

  // Fetch players
  const { data, error } = await playersQuery;

  if (error) {
    console.error("Error fetching players:", error);
    throw error;
  }

  return {
    players: data as Player[],
    totalCount: count || 0,
    page: adjustedPage,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
};

export const getPlayerDetails = async (playerId: string) => {
  const supabase = createSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase client not initialized");
  }

  // Fetch player details
  const { data: playerDetails, error: playerError } = await supabase
    .from("players_info")
    .select("*")
    .eq("player_id", playerId)
    .single();

  if (playerError) {
    console.error("Error fetching player details:", playerError);
    throw playerError;
  }

  // Fetch season stats
  const { data: seasonTotals, error: seasonTotalsError } = await supabase
    .from("player_season_totals")
    .select("*")
    .eq("player_id", playerId)
    .order("year_id", { ascending: true });

  console.log('Raw seasonTotals from Supabase:', seasonTotals);
  console.log('First row keys:', seasonTotals?.[0] ? Object.keys(seasonTotals[0]) : 'No data');

  if (seasonTotalsError) {
    console.error("Error fetching season stats:", seasonTotalsError);
    throw seasonTotalsError;
  }

  // Fetch advanced stats
  const { data: advancedStats, error: advancedStatsError } = await supabase
    .from("player_advanced_stats")
    .select("*")
    .eq("player_id", playerId)
    .order("year_id", { ascending: true });

  if (advancedStatsError) {
    console.error("Error fetching advanced stats:", advancedStatsError);
    throw advancedStatsError;
  }

  return {
    playerDetails,
    seasonTotals,
    advancedStats
  };
};
