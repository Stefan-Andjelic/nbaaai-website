export interface FeaturedLeaderboard {
  id: string;
  title: string;
  description: string;
  viewName: string;
  icon?: string;
  filters: Array<{
    stat: string;
    operator: string;
    value: number;
  }>;
}

// Define your featured leaderboards
export const FEATURED_LEADERBOARDS: FeaturedLeaderboard[] = [
  {
    id: 'triple-double-30-less-than-8-ft',
    title: '30+ Point Triple-Double (less than 8 ft)',
    description: 'Most games with 30+ pts, 10+ trb, 10+ ast, and less than 8 FT attempts',
    viewName: 'leaderboard_30pt_triple_double_less_than_8_ft',
    filters: [
      { stat: 'pts', operator: '>=', value: 30 },
      { stat: 'trb', operator: '>=', value: 10 },
      { stat: 'ast', operator: '>=', value: 10 },
      { stat: 'fta', operator: '<', value: 8 },
    ],
  },
  {
    id: 'triple-double-30-with-2plus-stl',
    title: '30+ Point Triple-Double (with 2+ STL)',
    description: 'Most games with 30+ pts, 10+ trb, 10+ ast, and more than 1 stl',
    viewName: 'leaderboard_30pt_triple_double_with_2plus_stl',
    filters: [
      { stat: 'pts', operator: '>=', value: 30 },
      { stat: 'trb', operator: '>=', value: 10 },
      { stat: 'ast', operator: '>=', value: 10 },
      { stat: 'stl', operator: '>', value: 1 },
    ],
  },
  {
    id: 'triple-double-30-with-55plus-fg-pct',
    title: '30+ Point Triple-Double (with 55%+ FG%)',
    description: 'Most games with 30+ pts, 10+ trb, 10+ ast, and 0.55+ FG%',
    viewName: 'leaderboard_30pt_triple_double_with_55plus_fg_pct',
    filters: [
      { stat: 'pts', operator: '>=', value: 30 },
      { stat: 'trb', operator: '>=', value: 10 },
      { stat: 'ast', operator: '>=', value: 10 },
      { stat: 'fg_pct', operator: '>=', value: 0.55 },
    ],
  }
];