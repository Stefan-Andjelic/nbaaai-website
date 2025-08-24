export interface Player {
  player_id: string;
  name: string;
  career_first_year: number;
  career_end_year: number;
  position: string;
  height_cm: number;
  weight_kg: number;
  birth_date: string;
}

export interface PlayerSeasonTotals {
  player_id: string;
  year_id: string;
  games: number;
  games_started: number;
  minutes_played: number;
  field_goals: number;
  field_goal_attempts: number;
  field_goal_pct: number;
  three_point_field_goals: number;
  three_point_attempts: number;
  three_point_pct: number;
  two_point_field_goals: number;
  two_point_attempts: number;
  two_point_pct: number;
  effective_fg_pct: number;
  free_throws: number;
  free_throw_attempts: number;
  free_throw_pct: number;
  offensive_rebounds: number;
  defensive_rebounds: number;
  total_rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  personal_fouls: number;
  points: number;
  triple_doubles: number;
}

export interface PlayerAdvancedStats {
  player_id: string;
  year_id: string;
  games: number;
  games_started: number;
  minutes_played: number;
  per: number;
  ts_pct: number;
  three_point_attempt_rate: number;
  free_throw_rate: number;
  offensive_rebound_pct: number;
  defensive_rebound_pct: number;
  total_rebound_pct: number;
  assist_pct: number;
  steal_pct: number;
  block_pct: number;
  turnover_pct: number;
  usage_pct: number;
  offensive_win_shares: number;
  defensive_win_shares: number;
  win_shares: number;
  win_shares_per_48: number;
  offensive_box_plus_minus: number;
  defensive_box_plus_minus: number;
  box_plus_minus: number;
  value_over_replacement: number;
}

export interface PlayersDataResponse {
  players: Player[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
