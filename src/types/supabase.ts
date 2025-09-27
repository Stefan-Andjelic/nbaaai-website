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
  mp: number;
  fg: number;
  fga: number;
  fg_pct: number;
  fg3: number;
  fg3a: number;
  fg3_pct: number;
  fg2: number;
  fg2a: number;
  fg2_pct: number;
  efg_pct: number;
  ft: number;
  fta: number;
  ft_pct: number;
  orb: number;
  drb: number;
  trb: number;
  ast: number;
  stl: number;
  blk: number;
  tov: number;
  pf: number;
  pts: number;
  tpl_dbl: number;
}

export interface PlayerAdvancedStats {
  player_id: string;
  year_id: string;
  games: number;
  games_started: number;
  mp: number;
  per: number;
  ts_pct: number;
  fg3a_per_fga_pct: number;
  fta_per_fga_pct: number;
  orb_pct: number;
  drb_pct: number;
  trb_pct: number;
  ast_pct: number;
  stl_pct: number;
  blk_pct: number;
  tov_pct: number;
  usg_pct: number;
  ows: number;
  dws: number;
  ws: number;
  ws_per_48: number;
  obpm: number;
  dbpm: number;
  bpm: number;
  vorp: number;
}

export interface PlayersDataResponse {
  players: Player[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface LeaderboardEntry {
  player_id: string;
  player_name: string;
  value: number; // The stat value (PPG, APG, etc.)
  rank: number;
}