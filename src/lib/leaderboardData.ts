import { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseClient } from "./supabaseClient";
import { get } from "http";
import { LeaderboardEntry } from "@/types/supabase";

export async function getLeaderboards() {
    const supabase = createSupabaseClient();

  // Parallel queries for better performance
  const [currentSeason, allTime] = await Promise.all([
    getCurrentSeasonLeaders(supabase),
    getAllTimeLeaders(supabase)
  ]);
  console.log('Fetched leaderboard data:', { currentSeason, allTime });
  
  return { currentSeason, allTime };
}

async function getCurrentSeasonLeaders(supabase: SupabaseClient) {
  const currentSeason = "2024-25"; // Update this dynamically as needed
  
  const [ppg, apg, rpg, bpg, spg] = await Promise.all([
    getStatLeaders(supabase, 'pts_per_g', currentSeason, 'season'),
    getStatLeaders(supabase, 'ast_per_g', currentSeason, 'season'), 
    getStatLeaders(supabase, 'trb_per_g', currentSeason, 'season'),
    getStatLeaders(supabase, 'blk_per_g', currentSeason, 'season'),
    getStatLeaders(supabase, 'stl_per_g', currentSeason, 'season')
  ]);

  return { ppg, apg, rpg, bpg, spg };
}

async function getAllTimeLeaders(supabase: SupabaseClient) {
  const [ppg, apg, rpg, bpg, spg] = await Promise.all([
    getStatLeaders(supabase, 'pts_per_g', null, 'career'),
    getStatLeaders(supabase, 'ast_per_g', null, 'career'),
    getStatLeaders(supabase, 'trb_per_g', null, 'career'),
    getStatLeaders(supabase, 'blk_per_g', null, 'career'),
    getStatLeaders(supabase, 'stl_per_g', null, 'career')
  ]);

  return { ppg, apg, rpg, bpg, spg };
}

async function getStatLeaders(
  supabase: SupabaseClient, 
  statColumn: string, 
  season: string | null, 
  type: 'season' | 'career'
): Promise<LeaderboardEntry[]> {
  
  let query = supabase
    .from('player_season_per_game') // Adjust table name as needed
    .select(`
      player_id,
      ${statColumn},
      games
    `)
    .gt('games', 20) // Minimum games threshold
    .order(statColumn, { ascending: false })
    .limit(10);

    console.log(`Fetching ${type} leaders for ${statColumn}${season ? ` in season ${season}` : ''}`);
  // Add season filter for current season leaders
  if (season && type === 'season') {
    query = query.eq('year_id', season);
  }

  const { data, error } = await query;

  if (error) {
    console.error(`Error fetching ${statColumn} leaders:`, error);
    throw error;
  }

  // Transform data to LeaderboardEntry format
  return data?.map((player: any, index: number) => ({
    player_id: player.player_id,
    value: type === 'season' 
      ? Number((player[statColumn])) // Per game average
      : player[statColumn], // Total for career
    rank: index + 1
  })) || [];
}
