export type StatOperator = '>=' | '>' | '=' | '<=' | '<';

export interface StatFilter {
  stat: string;
  operator: StatOperator;
  value: number;
}

export interface LeaderboardFormData {
  topN: number;
  title: string;
  statFilters: StatFilter[];
}

export interface AvailableStat {
  key: string;
  label: string;
  description?: string;
}

// Available stats configuration
export const AVAILABLE_STATS: AvailableStat[] = [
  { key: 'pts', label: 'Points', description: 'Total points scored' },
  { key: 'trb', label: 'Total Rebounds', description: 'Offensive + Defensive rebounds' },
  { key: 'ast', label: 'Assists', description: 'Passes leading to made baskets' },
  { key: 'stl', label: 'Steals', description: 'Steals' },
  { key: 'blk', label: 'Blocks', description: 'Blocked shots' },
  { key: 'fg', label: 'Field Goals Made', description: '2PT + 3PT makes' },
  { key: 'fga', label: 'Field Goal Attempts', description: '2PT + 3PT attempts' },
  { key: 'fg3', label: '3-Pointers Made', description: '3-point field goals made' },
  { key: 'fg3a', label: '3-Point Attempts', description: '3-point field goal attempts' },
  { key: 'ft', label: 'Free Throws Made', description: 'Free throws made' },
  { key: 'fta', label: 'Free Throw Attempts', description: 'Free throw attempts' },
  { key: 'tov', label: 'Turnovers', description: 'Turnovers' },
  { key: 'pf', label: 'Personal Fouls', description: 'Personal fouls committed' },
];

export const STAT_OPERATORS: { value: StatOperator; label: string }[] = [
  { value: '>=', label: 'At least' },
  { value: '>', label: 'More than' },
  { value: '=', label: 'Exactly' },
  { value: '<=', label: 'At most' },
  { value: '<', label: 'Less than' },
];