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
  season: number;
  [playerId: string]: number; // Dynamic keys for each player
}