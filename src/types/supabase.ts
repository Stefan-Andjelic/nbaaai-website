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
    total_rebounds: number;
    assists: number;
    stl: number;
    blk: number;
    tov: number;
    pf: number;
    points: number;
    tpl_dbl: number;
    awards: string;
  }
  
  export interface PlayerAdvancedStats {
    season_year: string;
    player_id: string;
    age: number;
    team_id: string;
    comp_name_abbr: string;
    pos: string;
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
    pos: string;
    games: number;
    games_started: number;
    minutes_played_per_game: number;
    field_goals_per_game: number;
    field_goal_attempts_per_game: number;
    fg3a_per_fga_pct: number;
    fta_per_fga_pct: number;
    field_goal_pct_per_game: number;
    three_point_field_goals_per_game: number;
    three_point_attempts_per_game: number;
    three_point_pct_per_game: number;
    two_point_field_goals_per_game: number;
    two_point_attempts_per_game: number;
    two_point_pct_per_game: number;
    effective_fg_pct_per_game: number;
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