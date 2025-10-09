export type StatMetric = 'pts' | 'reb' | 'ast' | 'stl' | 'blk' | 'fg_pct';
export type ContextType = 'regular' | 'playoffs' | 'all';

export interface GraphConfig {
  id: string;
  name: string;
  playerIds: string[];
  metric: StatMetric;
  seasonStart: number;
  seasonEnd: number;
  context: ContextType;
  createdAt: number;
}

export interface GraphDataPoint {
  season_year: number;
  [playerId: string]: number; // Dynamic keys for each player
}

export interface PlayerInfo {
  player_id: string;
  name: string;
}

export interface GraphAPIResponse {
  data: GraphDataPoint[];
  players: PlayerInfo[];
  metric: StatMetric;
}

// For display purposes
export const STAT_LABELS: Record<StatMetric, string> = {
  pts: 'Points Per Game',
  reb: 'Rebounds Per Game',
  ast: 'Assists Per Game',
  stl: 'Steals Per Game',
  blk: 'Blocks Per Game',
  fg_pct: 'Field Goal %',
};

export const STAT_ABBREVIATIONS: Record<StatMetric, string> = {
  pts: 'PPG',
  reb: 'RPG',
  ast: 'APG',
  stl: 'SPG',
  blk: 'BPG',
  fg_pct: 'FG%',
};