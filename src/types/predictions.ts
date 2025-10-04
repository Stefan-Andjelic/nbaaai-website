export type PredictionType = 'season' | 'game';
export type ComparisonOperator = 'more_than' | 'less_than' | 'at_least' | 'at_most' | 'exactly';

export interface Prediction {
  id: string;
  username: string;
  prediction_type: PredictionType;
  prediction_text: string;
  player_id: string | null;
  player_name: string | null;
  stat_type: string;
  comparison_operator: ComparisonOperator;
  target_value: number;
  current_value: number;
  season: string | null;
  game_id: string | null;
  game_date: string | null;
  is_after_start: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePredictionInput {
  prediction_type: PredictionType;
  player_id?: string;
  player_name?: string;
  stat_type: string;
  comparison_operator: ComparisonOperator;
  target_value: number;
  season?: string;
  game_id?: string;
  game_date?: string;
}

export const STAT_TYPES = {
  season: [
    { value: 'total_points', label: 'Total Points' },
    { value: 'ppg', label: 'Points Per Game' },
    { value: 'total_assists', label: 'Total Assists' },
    { value: 'apg', label: 'Assists Per Game' },
    { value: 'total_rebounds', label: 'Total Rebounds' },
    { value: 'rpg', label: 'Rebounds Per Game' },
    { value: 'total_steals', label: 'Total Steals' },
    { value: 'spg', label: 'Steals Per Game' },
    { value: 'total_blocks', label: 'Total Blocks' },
    { value: 'bpg', label: 'Blocks Per Game' },
    { value: 'fg_percentage', label: 'FG%' },
    { value: 'three_point_percentage', label: '3P%' },
    { value: 'ft_percentage', label: 'FT%' },
  ],
  game: [
    { value: 'points', label: 'Points' },
    { value: 'assists', label: 'Assists' },
    { value: 'rebounds', label: 'Rebounds' },
    { value: 'steals', label: 'Steals' },
    { value: 'blocks', label: 'Blocks' },
    { value: 'turnovers', label: 'Turnovers' },
    { value: 'three_pointers_made', label: '3-Pointers Made' },
  ],
};

export const COMPARISON_OPERATORS = [
  { value: 'more_than', label: 'More than' },
  { value: 'less_than', label: 'Less than' },
  { value: 'at_least', label: 'At least' },
  { value: 'at_most', label: 'At most' },
  { value: 'exactly', label: 'Exactly' },
];