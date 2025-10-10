export type StatMetric = 'pts' | 'trb' | 'ast' | 'stl' | 'blk' | 'fg_pct';
export type ContextType = 'regular' | 'playoffs' | 'all';
export type AggregationType = 'per_game' | 'totals' | 'totals_cumulative';
export type XAxisType = 'season' | 'career_year';

export interface GraphConfig {
  id: string;
  name: string;
  playerIds: string[];
  metric: StatMetric;
  seasonStart: number;
  seasonEnd: number;
  context: ContextType;
  aggregation: AggregationType;
  xAxisType: XAxisType;
  createdAt: number;
}

export interface GraphDataPoint {
  season_year: number;
  career_year?: number;
  [playerId: string]: number | undefined;
}

export interface PlayerInfo {
  player_id: string;
  name: string;
  rookie_year?: number;
}

export interface GraphAPIResponse {
  data: GraphDataPoint[];
  players: PlayerInfo[];
  metric: StatMetric;
  xAxisType: XAxisType;
}

// Separate stat lists for each mode
export const COUNTING_STATS: StatMetric[] = ['pts', 'trb', 'ast', 'stl', 'blk'];
export const PERCENTAGE_STATS: StatMetric[] = ['fg_pct'];

// NEW: Function to get available stats based on aggregation
export function getAvailableStats(aggregation: AggregationType): StatMetric[] {
  if (aggregation === 'totals_cumulative') {
    // Only counting stats for cumulative
    return COUNTING_STATS;
  }
  // All stats for per_game and totals
  return [...COUNTING_STATS, ...PERCENTAGE_STATS];
}

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
  },
  totals_cumulative: {
    pts: 'Cumulative Points',
    trb: 'Cumulative Rebounds',
    ast: 'Cumulative Assists',
    stl: 'Cumulative Steals',
    blk: 'Cumulative Blocks',
    fg_pct: 'Cumulative Field Goal %',
  },
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
  },
  totals_cumulative: {
    pts: 'C-PTS',
    trb: 'C-TRB',
    ast: 'C-AST',
    stl: 'C-STL',
    blk: 'C-BLK',
    fg_pct: 'C-FG%',
  },
};