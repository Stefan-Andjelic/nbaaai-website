export interface Player {
    player_id: string;
    name: string;
    year_min: number;
    year_max: number;
    position: string;
    height_cm: number;
    weight_kg: number;
    birth_date_text: string;
    birth_date: string;
    colleges: string[];
    hall_of_fame: boolean;
  }
  
  export interface PlayerSeasonStats {
    season_year: string;
    player_id: string;
    age: number;
    team_id: string;
    comp_name_abbr: string;
    pos: string;
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
    awards: string;
  }
  
  export interface PlayerAdvancedStats {
    season_year: string;
    player_id: string;
    age: number;
    team_id: string;
    comp_name_abbr: string;
    position: string;
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
    awards: string;
  }

  export interface PlayerPerGameStats {
    player_id: string;
    season_year: string;
    team_id: string;
    age: number;
    comp_name_abbr: string;
    position: string;
    games: number;
    games_started: number;
    minutes_played_per_game: number;
    field_goals_per_game: number;
    field_goal_attempts_per_game: number;
    field_goal_pct: number;
    free_throws_pct: number;
    field_goal_pct_per_game: number;
    three_point_field_goals_per_game: number;
    three_point_attempts_per_game: number;
    three_point_pct: number;
    two_point_field_goals_per_game: number;
    two_point_attempts_per_game: number;
    two_point_pct: number;
    effective_fg_pct: number;
    free_throws_per_game: number;
    free_throw_attempts_per_game: number;
    free_throw_pct_per_game: number;
    offensive_rebounds_per_game: number;
    defensive_rebounds_per_game: number;
    total_rebounds_per_game: number;
    assists_per_game: number;
    steals_per_game: number;
    blocks_per_game: number;
    turnovers_per_game: number;
    personal_fouls_per_game: number;
    points_per_game: number;
    awards: string;
  }
  
  export interface PlayersDataResponse {
    players: Player[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }