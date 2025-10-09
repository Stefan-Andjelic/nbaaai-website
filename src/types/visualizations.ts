export type StatMetric = 'pts' | 'trb' | 'ast' | 'stl' | 'blk' | 'fg_pct';
export type ContextType = 'regular' | 'playoffs' | 'all';
export type AggregationType = 'per_game' | 'totals';

export interface GraphConfig {
  id: string;
  name: string;
  playerIds: string[];
  metric: StatMetric;
  seasonStart: number;
  seasonEnd: number;
  context: ContextType;
  aggregation: AggregationType;
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

// Separate stat lists for each mode
export const COUNTING_STATS: StatMetric[] = ['pts', 'trb', 'ast', 'stl', 'blk'];
export const PERCENTAGE_STATS: StatMetric[] = ['fg_pct'];

// For display purposes - labels change based on aggregation type
export const STAT_LABELS: Record<AggregationType, Record<StatMetric, string>> = {
  per_game: {
    pts: 'Points Per Game',
    trb: 'Rebounds Per Game',
    ast: 'Assists Per Game',
    stl: 'Steals Per Game',
    blk: 'Blocks Per Game',
    fg_pct: 'Field Goal %',
  },
  totals: {
    pts: 'Total Points',
    trb: 'Total Rebounds',
    ast: 'Total Assists',
    stl: 'Total Steals',
    blk: 'Total Blocks',
    fg_pct: 'Field Goal %',
  }
};

export const STAT_ABBREVIATIONS: Record<AggregationType, Record<StatMetric, string>> = {
  per_game: {
    pts: 'PPG',
    trb: 'RPG',
    ast: 'APG',
    stl: 'SPG',
    blk: 'BPG',
    fg_pct: 'FG%',
  },
  totals: {
    pts: 'PTS',
    trb: 'TRB',
    ast: 'AST',
    stl: 'STL',
    blk: 'BLK',
    fg_pct: 'FG%',
  }
};