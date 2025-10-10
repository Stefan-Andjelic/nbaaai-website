import sql from "./db";
import {
  StatMetric,
  ContextType,
  AggregationType,
  XAxisType,
  GraphDataPoint,
  PlayerInfo,
} from "@/types/visualizations";

interface FetchGraphDataParams {
  playerIds: string[];
  metric: StatMetric;
  seasonStart: number;
  seasonEnd: number;
  context: ContextType;
  aggregation: AggregationType;
  xAxisType: XAxisType;
}

export async function fetchGraphData(params: FetchGraphDataParams) {
  const {
    playerIds,
    metric,
    seasonStart,
    seasonEnd,
    context,
    aggregation,
    xAxisType,
  } = params;

  if (!playerIds || playerIds.length === 0) {
    throw new Error("At least one player ID is required");
  }

  if (playerIds.length > 8) {
    throw new Error("A maximum of 8 players can be compared at once");
  }

  try {
    // Column maps for different table types
    const perGameColumnMap: Record<StatMetric, string> = {
      pts: "pts_per_g",
      trb: "trb_per_g",
      ast: "ast_per_g",
      stl: "stl_per_g",
      blk: "blk_per_g",
      fg_pct: "fg_pct",
    };

    const totalsColumnMap: Record<StatMetric, string> = {
      pts: "pts",
      trb: "trb",
      ast: "ast",
      stl: "stl",
      blk: "blk",
      fg_pct: "fg_pct",
    };

    // Select appropriate column map based on aggregation type
    const columnMap =
      aggregation === "per_game" ? perGameColumnMap : totalsColumnMap;
    const dbColumn = columnMap[metric];

    if (!dbColumn) {
      throw new Error(`Invalid metric: ${metric}`);
    }

    // NEW: Get rookie years for all players if using career_year mode
    let rookieYears: Map<string, number> = new Map();
    if (xAxisType === "career_year") {
      const tableName =
        aggregation === "per_game"
          ? "player_season_per_game"
          : "player_season_totals";
      const rookieYearQuery = await sql`
            SELECT player_id, MIN((LEFT(year_id, 4))::integer) as rookie_year
            FROM ${sql(tableName)}
            WHERE player_id = ANY(${playerIds})
            GROUP BY player_id
        `;

      rookieYearQuery.forEach((row) => {
        rookieYears.set(row.player_id, parseInt(row.rookie_year));
      });
    }

    let result;

    // Determine which table(s) to query based on aggregation and context
    if (xAxisType === "career_year") { // CAREER YEAR MODE
        if (aggregation === "per_game") {
            if (context === "regular") {
            result = await sql`
                WITH rookie_years AS (
                    SELECT player_id, MIN(LEFT(year_id, 4)::integer) as rookie_year
                    FROM player_season_per_game
                    WHERE player_id = ANY(${playerIds})
                    AND year_id IS NOT NULL 
                    AND year_id != ''
                    AND LENGTH(year_id) >= 4
                    GROUP BY player_id
                )
                SELECT 
                p.player_id,
                p.year_id as season_year,
                (LEFT(p.year_id, 4)::integer - r.rookie_year + 1) as career_year,
                p.${sql(dbColumn)} as value
                FROM player_season_per_game p
                JOIN rookie_years r ON p.player_id = r.player_id
                WHERE p.player_id = ANY(${playerIds})
                AND p.year_id IS NOT NULL
                AND p.year_id != ''
                AND LENGTH(p.year_id) >= 4
                AND (LEFT(p.year_id, 4)::integer - r.rookie_year + 1) >= ${seasonStart}
                AND (LEFT(p.year_id, 4)::integer - r.rookie_year + 1) <= ${seasonEnd}
                AND p.${sql(dbColumn)} IS NOT NULL
                ORDER BY career_year ASC, p.player_id ASC
            `;
            } else if (context === "playoffs") {
            result = await sql`
                WITH rookie_years AS (
                SELECT player_id, MIN(LEFT(year_id, 4)::integer) as rookie_year
                FROM player_season_playoff_per_game
                WHERE player_id = ANY(${playerIds})
                    AND year_id IS NOT NULL 
                    AND year_id != ''
                    AND LENGTH(year_id) >= 4
                    GROUP BY player_id
                )
                SELECT 
                p.player_id,
                p.year_id as season_year,
                (LEFT(p.year_id, 4)::integer - r.rookie_year + 1) as career_year,
                p.${sql(dbColumn)} as value
                FROM player_season_playoff_per_game p
                JOIN rookie_years r ON p.player_id = r.player_id
                WHERE p.player_id = ANY(${playerIds})
                AND p.year_id IS NOT NULL
                AND p.year_id != ''
                AND LENGTH(p.year_id) >= 4
                AND (LEFT(p.year_id, 4)::integer - r.rookie_year + 1) >= ${seasonStart}
                AND (LEFT(p.year_id, 4)::integer - r.rookie_year + 1) <= ${seasonEnd}
                AND p.${sql(dbColumn)} IS NOT NULL
                ORDER BY career_year ASC, p.player_id ASC
            `;
            } else {
            // 'all'
            if (metric === "fg_pct") {
                result = await sql`
                WITH rookie_years AS (
                    SELECT player_id, MIN(LEFT(year_id, 4)::integer) as rookie_year
                    FROM (
                        SELECT player_id, year_id FROM player_season_totals 
                        WHERE player_id = ANY(${playerIds})
                        AND year_id IS NOT NULL 
                        AND year_id != ''
                        AND LENGTH(year_id) >= 4
                        UNION
                        SELECT player_id, year_id FROM player_season_playoff_totals 
                        WHERE player_id = ANY(${playerIds})
                        AND year_id IS NOT NULL 
                        AND year_id != ''
                        AND LENGTH(year_id) >= 4
                    ) all_seasons
                    GROUP BY player_id
                )
                SELECT 
                    player_id,
                    year_id as season_year,
                    career_year,
                    CASE 
                        WHEN SUM(fga) > 0 THEN (SUM(fg)::float / SUM(fga)::float)
                        ELSE NULL 
                    END as value
                FROM (
                    SELECT 
                        t.player_id, 
                        t.year_id,
                        (LEFT(t.year_id, 4)::integer - r.rookie_year + 1) as career_year,
                        t.fg, 
                        t.fga
                    FROM player_season_totals t
                    JOIN rookie_years r ON t.player_id = r.player_id
                    WHERE t.player_id = ANY(${playerIds})
                        AND t.year_id IS NOT NULL
                        AND t.year_id != ''
                        AND LENGTH(t.year_id) >= 4
                        AND (LEFT(t.year_id, 4)::integer - r.rookie_year + 1) >= ${seasonStart}
                        AND (LEFT(t.year_id, 4)::integer - r.rookie_year + 1) <= ${seasonEnd}

                    UNION ALL
                    
                    SELECT 
                        t.player_id, 
                        t.year_id,
                        (LEFT(t.year_id, 4)::integer - r.rookie_year + 1) as career_year,
                        t.fg, 
                        t.fga
                    FROM player_season_playoff_totals t
                    JOIN rookie_years r ON t.player_id = r.player_id
                    WHERE t.player_id = ANY(${playerIds})
                        AND t.year_id IS NOT NULL
                        AND t.year_id != ''
                        AND LENGTH(t.year_id) >= 4
                        AND (LEFT(t.year_id, 4)::integer - r.rookie_year + 1) >= ${seasonStart}
                        AND (LEFT(t.year_id, 4)::integer - r.rookie_year + 1) <= ${seasonEnd}
                ) combined
                GROUP BY player_id, year_id, career_year
                HAVING SUM(fga) > 0
                ORDER BY career_year ASC, player_id ASC
                `;
            } else {
                result = await sql`
                WITH rookie_years AS (
                    SELECT player_id, MIN(LEFT(year_id, 4)::integer) as rookie_year
                    FROM (
                        SELECT player_id, year_id FROM player_season_per_game 
                        WHERE player_id = ANY(${playerIds})
                        AND year_id IS NOT NULL 
                        AND year_id != ''
                        AND LENGTH(year_id) >= 4
                        UNION
                        SELECT player_id, year_id FROM player_season_playoff_per_game 
                        WHERE player_id = ANY(${playerIds})
                        AND year_id IS NOT NULL 
                        AND year_id != ''
                        AND LENGTH(year_id) >= 4
                    ) all_seasons
                    GROUP BY player_id
                )
                SELECT 
                    player_id,
                    year_id as season_year,
                    career_year,
                    (SUM(stat_value * g)::float / SUM(g)::float) as value
                FROM (
                    SELECT 
                        p.player_id, 
                        p.year_id,
                        (LEFT(p.year_id, 4)::integer - r.rookie_year + 1) as career_year,
                        p.${sql(dbColumn)} as stat_value, 
                        t.g
                    FROM player_season_per_game p
                    JOIN player_season_totals t ON p.player_id = t.player_id AND p.year_id = t.year_id
                    JOIN rookie_years r ON p.player_id = r.player_id
                    WHERE p.player_id = ANY(${playerIds})
                        AND p.year_id IS NOT NULL
                        AND p.year_id != ''
                        AND LENGTH(p.year_id) >= 4
                        AND (LEFT(p.year_id, 4)::integer - r.rookie_year + 1) >= ${seasonStart}
                        AND (LEFT(p.year_id, 4)::integer - r.rookie_year + 1) <= ${seasonEnd}
                        AND p.${sql(dbColumn)} IS NOT NULL
                    
                    UNION ALL
                    
                    SELECT 
                        p.player_id, 
                        p.year_id,
                        (LEFT(p.year_id, 4)::integer - r.rookie_year + 1) as career_year,
                        p.${sql(dbColumn)} as stat_value, 
                        t.g
                    FROM player_season_playoff_per_game p
                    JOIN player_season_playoff_totals t ON p.player_id = t.player_id AND p.year_id = t.year_id
                    JOIN rookie_years r ON p.player_id = r.player_id
                    WHERE p.player_id = ANY(${playerIds})
                        AND p.year_id IS NOT NULL
                        AND p.year_id != ''
                        AND LENGTH(p.year_id) >= 4
                        AND (LEFT(p.year_id, 4)::integer - r.rookie_year + 1) >= ${seasonStart}
                        AND (LEFT(p.year_id, 4)::integer - r.rookie_year + 1) <= ${seasonEnd}
                        AND p.${sql(dbColumn)} IS NOT NULL
                ) combined
                GROUP BY player_id, year_id, career_year
                HAVING SUM(g) > 0
                ORDER BY career_year ASC, player_id ASC
                `;
            }
            }
        } else {
            // totals
            if (context === "regular") {
            result = await sql`
                WITH rookie_years AS (
                SELECT player_id, MIN(LEFT(year_id, 4)::integer) as rookie_year
                FROM player_season_totals
                WHERE player_id = ANY(${playerIds})
                    AND year_id IS NOT NULL 
                    AND year_id != ''
                    AND LENGTH(year_id) >= 4
                GROUP BY player_id
                )
                SELECT 
                t.player_id,
                t.year_id as season_year,
                (LEFT(t.year_id, 4)::integer - r.rookie_year + 1) as career_year,
                t.${sql(dbColumn)} as value
                FROM player_season_totals t
                JOIN rookie_years r ON t.player_id = r.player_id
                WHERE t.player_id = ANY(${playerIds})
                AND t.year_id IS NOT NULL
                AND t.year_id != ''
                AND LENGTH(t.year_id) >= 4
                AND (LEFT(t.year_id, 4)::integer - r.rookie_year + 1) >= ${seasonStart}
                AND (LEFT(t.year_id, 4)::integer - r.rookie_year + 1) <= ${seasonEnd}
                AND t.${sql(dbColumn)} IS NOT NULL
                ORDER BY career_year ASC, t.player_id ASC
            `;
            } else if (context === "playoffs") {
            result = await sql`
                WITH rookie_years AS (
                SELECT player_id, MIN(LEFT(year_id, 4)::integer) as rookie_year
                FROM player_season_playoff_totals
                WHERE player_id = ANY(${playerIds})
                    AND year_id IS NOT NULL 
                    AND year_id != ''
                    AND LENGTH(year_id) >= 4
                GROUP BY player_id
                )
                SELECT 
                t.player_id,
                t.year_id as season_year,
                (LEFT(t.year_id, 4)::integer - r.rookie_year + 1) as career_year,
                t.${sql(dbColumn)} as value
                FROM player_season_playoff_totals t
                JOIN rookie_years r ON t.player_id = r.player_id
                WHERE t.player_id = ANY(${playerIds})
                AND t.year_id IS NOT NULL
                AND t.year_id != ''
                AND LENGTH(t.year_id) >= 4
                AND (LEFT(t.year_id, 4)::integer - r.rookie_year + 1) >= ${seasonStart}
                AND (LEFT(t.year_id, 4)::integer - r.rookie_year + 1) <= ${seasonEnd}
                AND t.${sql(dbColumn)} IS NOT NULL
                ORDER BY career_year ASC, t.player_id ASC
            `;
            } else {
            // 'all'
            if (metric === "fg_pct") {
                result = await sql`
                WITH rookie_years AS (
                    SELECT player_id, MIN(LEFT(year_id, 4)::integer) as rookie_year
                    FROM (
                        SELECT player_id, year_id FROM player_season_totals 
                        WHERE player_id = ANY(${playerIds})
                        AND year_id IS NOT NULL 
                        AND year_id != ''
                        AND LENGTH(year_id) >= 4
                        UNION
                        SELECT player_id, year_id FROM player_season_playoff_totals 
                        WHERE player_id = ANY(${playerIds})
                        AND year_id IS NOT NULL 
                        AND year_id != ''
                        AND LENGTH(year_id) >= 4
                    ) all_seasons
                    GROUP BY player_id
                )
                SELECT 
                    player_id,
                    year_id as season_year,
                    career_year,
                    CASE 
                        WHEN SUM(fga) > 0 THEN (SUM(fg)::float / SUM(fga)::float)
                        ELSE NULL 
                    END as value
                FROM (
                    SELECT 
                        t.player_id, 
                        t.year_id,
                        (LEFT(t.year_id, 4)::integer - r.rookie_year + 1) as career_year,
                        t.fg, 
                        t.fga
                    FROM player_season_totals t
                    JOIN rookie_years r ON t.player_id = r.player_id
                    WHERE t.player_id = ANY(${playerIds})
                        AND t.year_id IS NOT NULL
                        AND t.year_id != ''
                        AND LENGTH(t.year_id) >= 4
                        AND (LEFT(t.year_id, 4)::integer - r.rookie_year + 1) >= ${seasonStart}
                        AND (LEFT(t.year_id, 4)::integer - r.rookie_year + 1) <= ${seasonEnd}

                    UNION ALL
                    
                    SELECT 
                        t.player_id, 
                        t.year_id,
                        (LEFT(t.year_id, 4)::integer - r.rookie_year + 1) as career_year,
                        t.fg, 
                        t.fga
                    FROM player_season_playoff_totals t
                    JOIN rookie_years r ON t.player_id = r.player_id
                    WHERE t.player_id = ANY(${playerIds})
                        AND t.year_id IS NOT NULL
                        AND t.year_id != ''
                        AND LENGTH(t.year_id) >= 4
                        AND (LEFT(t.year_id, 4)::integer - r.rookie_year + 1) >= ${seasonStart}
                        AND (LEFT(t.year_id, 4)::integer - r.rookie_year + 1) <= ${seasonEnd}
                ) combined
                GROUP BY player_id, year_id, career_year
                HAVING SUM(fga) > 0
                ORDER BY career_year ASC, player_id ASC
                `;
            } else {
                result = await sql`
                WITH rookie_years AS (
                    SELECT player_id, MIN(LEFT(year_id, 4)::integer) as rookie_year
                    FROM (
                        SELECT player_id, year_id FROM player_season_totals 
                        WHERE player_id = ANY(${playerIds})
                        AND year_id IS NOT NULL 
                        AND year_id != ''
                        AND LENGTH(year_id) >= 4
                        UNION
                        SELECT player_id, year_id FROM player_season_playoff_totals 
                        WHERE player_id = ANY(${playerIds})
                        AND year_id IS NOT NULL 
                        AND year_id != ''
                        AND LENGTH(year_id) >= 4
                    ) all_seasons
                    GROUP BY player_id
                )
                SELECT 
                    player_id,
                    year_id as season_year,
                    career_year,
                    SUM(stat_value) as value
                FROM (
                    SELECT 
                        t.player_id, 
                        t.year_id,
                        (LEFT(t.year_id, 4)::integer - r.rookie_year + 1) as career_year,
                        t.${sql(dbColumn)} as stat_value
                    FROM player_season_totals t
                    JOIN rookie_years r ON t.player_id = r.player_id
                    WHERE t.player_id = ANY(${playerIds})
                        AND t.year_id IS NOT NULL
                        AND t.year_id != ''
                        AND LENGTH(t.year_id) >= 4
                        AND (LEFT(t.year_id, 4)::integer - r.rookie_year + 1) >= ${seasonStart}
                        AND (LEFT(t.year_id, 4)::integer - r.rookie_year + 1) <= ${seasonEnd}
                        AND t.${sql(dbColumn)} IS NOT NULL
                    
                    UNION ALL
                    
                    SELECT 
                        t.player_id, 
                        t.year_id,
                        (LEFT(t.year_id, 4)::integer - r.rookie_year + 1) as career_year,
                        t.${sql(dbColumn)} as stat_value
                    FROM player_season_playoff_totals t
                    JOIN rookie_years r ON t.player_id = r.player_id
                    WHERE t.player_id = ANY(${playerIds})
                        AND t.year_id IS NOT NULL
                        AND t.year_id != ''
                        AND LENGTH(t.year_id) >= 4
                        AND (LEFT(t.year_id, 4)::integer - r.rookie_year + 1) >= ${seasonStart}
                        AND (LEFT(t.year_id, 4)::integer - r.rookie_year + 1) <= ${seasonEnd}
                        AND t.${sql(dbColumn)} IS NOT NULL
                ) combined
                GROUP BY player_id, year_id, career_year
                ORDER BY career_year ASC, player_id ASC
                `;
            }
            }
        }
    } else {
        // Determine which table(s) to query based on aggregation and context
        if (aggregation === "per_game") {
            if (context === "regular") {
            result = await sql`
                            SELECT 
                                player_id,
                                year_id as season_year,
                                ${sql(dbColumn)} as value
                            FROM player_season_per_game
                            WHERE player_id = ANY(${playerIds})
                                AND year_id >= ${seasonStart}
                                AND year_id <= ${seasonEnd}
                                AND ${sql(dbColumn)} IS NOT NULL
                            ORDER BY year_id ASC, player_id ASC
                        `;
            } else if (context === "playoffs") {
            result = await sql`
                            SELECT 
                                player_id,
                                year_id as season_year,
                                ${sql(dbColumn)} as value
                            FROM player_season_playoff_per_game
                            WHERE player_id = ANY(${playerIds})
                                AND year_id >= ${seasonStart}
                                AND year_id <= ${seasonEnd}
                                AND ${sql(dbColumn)} IS NOT NULL
                            ORDER BY year_id ASC, player_id ASC
                        `;
            } else {
            // 'all'
            // For percentages in 'all' mode, we need to recalculate from totals
            if (metric === "fg_pct") {
                result = await sql`
                                SELECT 
                                    player_id,
                                    year_id as season_year,
                                    CASE 
                                        WHEN SUM(fga) > 0 THEN (SUM(fg)::float / SUM(fga)::float)
                                        ELSE NULL 
                                    END as value
                                FROM (
                                    SELECT player_id, year_id, fg, fga
                                    FROM player_season_totals
                                    WHERE player_id = ANY(${playerIds})
                                        AND year_id >= ${seasonStart}
                                        AND year_id <= ${seasonEnd}
                                    
                                    UNION ALL
                                    
                                    SELECT player_id, year_id, fg, fga
                                    FROM player_season_playoff_totals
                                    WHERE player_id = ANY(${playerIds})
                                        AND year_id >= ${seasonStart}
                                        AND year_id <= ${seasonEnd}
                                ) combined
                                GROUP BY player_id, year_id
                                HAVING SUM(fga) > 0
                                ORDER BY year_id ASC, player_id ASC
                            `;
            } else {
                // For counting stats, calculate weighted average based on games played
                result = await sql`
                                SELECT 
                                    player_id,
                                    year_id as season_year,
                                    (SUM(${sql(
                                    dbColumn
                                    )} * g)::float / SUM(g)::float) as value
                                FROM (
                                    SELECT player_id, year_id, ${sql(dbColumn)}, g
                                    FROM player_season_per_game
                                    JOIN player_season_totals USING (player_id, year_id)
                                    WHERE player_id = ANY(${playerIds})
                                        AND year_id >= ${seasonStart}
                                        AND year_id <= ${seasonEnd}
                                        AND ${sql(dbColumn)} IS NOT NULL
                                    
                                    UNION ALL
                                    
                                    SELECT player_id, year_id, ${sql(dbColumn)}, g
                                    FROM player_season_playoff_per_game
                                    JOIN player_season_playoff_totals USING (player_id, year_id)
                                    WHERE player_id = ANY(${playerIds})
                                        AND year_id >= ${seasonStart}
                                        AND year_id <= ${seasonEnd}
                                        AND ${sql(dbColumn)} IS NOT NULL
                                ) combined
                                GROUP BY player_id, year_id
                                HAVING SUM(g) > 0
                                ORDER BY year_id ASC, player_id ASC
                            `;
            }
            }
        } else {
            // totals
            if (context === "regular") {
            result = await sql`
                            SELECT 
                                player_id,
                                year_id as season_year,
                                ${sql(dbColumn)} as value
                            FROM player_season_totals
                            WHERE player_id = ANY(${playerIds})
                                AND year_id >= ${seasonStart}
                                AND year_id <= ${seasonEnd}
                                AND ${sql(dbColumn)} IS NOT NULL
                            ORDER BY year_id ASC, player_id ASC
                        `;
            } else if (context === "playoffs") {
            result = await sql`
                            SELECT 
                                player_id,
                                year_id as season_year,
                                ${sql(dbColumn)} as value
                            FROM player_season_playoff_totals
                            WHERE player_id = ANY(${playerIds})
                                AND year_id >= ${seasonStart}
                                AND year_id <= ${seasonEnd}
                                AND ${sql(dbColumn)} IS NOT NULL
                            ORDER BY year_id ASC, player_id ASC
                        `;
            } else {
            // 'all'
            // For percentages, recalculate from combined makes/attempts
            if (metric === "fg_pct") {
                result = await sql`
                                SELECT 
                                    player_id,
                                    year_id as season_year,
                                    CASE 
                                        WHEN SUM(fga) > 0 THEN (SUM(fg)::float / SUM(fga)::float)
                                        ELSE NULL 
                                    END as value
                                FROM (
                                    SELECT player_id, year_id, fg, fga
                                    FROM player_season_totals
                                    WHERE player_id = ANY(${playerIds})
                                        AND year_id >= ${seasonStart}
                                        AND year_id <= ${seasonEnd}
                                    
                                    UNION ALL
                                    
                                    SELECT player_id, year_id, fg, fga
                                    FROM player_season_playoff_totals
                                    WHERE player_id = ANY(${playerIds})
                                        AND year_id >= ${seasonStart}
                                        AND year_id <= ${seasonEnd}
                                ) combined
                                GROUP BY player_id, year_id
                                HAVING SUM(fga) > 0
                                ORDER BY year_id ASC, player_id ASC
                            `;
            } else {
                // For counting stats, just sum them
                result = await sql`
                                SELECT 
                                    player_id,
                                    year_id as season_year,
                                    SUM(${sql(dbColumn)}) as value
                                FROM (
                                    SELECT player_id, year_id, ${sql(dbColumn)}
                                    FROM player_season_totals
                                    WHERE player_id = ANY(${playerIds})
                                        AND year_id >= ${seasonStart}
                                        AND year_id <= ${seasonEnd}
                                        AND ${sql(dbColumn)} IS NOT NULL
                                    
                                    UNION ALL
                                    
                                    SELECT player_id, year_id, ${sql(dbColumn)}
                                    FROM player_season_playoff_totals
                                    WHERE player_id = ANY(${playerIds})
                                        AND year_id >= ${seasonStart}
                                        AND year_id <= ${seasonEnd}
                                        AND ${sql(dbColumn)} IS NOT NULL
                                ) combined
                                GROUP BY player_id, year_id
                                ORDER BY year_id ASC, player_id ASC
                            `;
            }
            }
        }
    }

    // AFTER all queries, BEFORE data transformation
    // Calculate cumulative totals if needed
    if (aggregation === 'totals_cumulative') {
    // Group results by player_id
    const playerData = new Map<string, Array<typeof result[0]>>();
    
    for (const row of result) {
        if (!playerData.has(row.player_id)) {
        playerData.set(row.player_id, []);
        }
        playerData.get(row.player_id)!.push(row);
    }
    
    // Calculate cumulative totals for each player
    const cumulativeResult: Array<typeof result[0]> = [];
    
    for (const [playerId, rows] of playerData.entries()) {
        // Sort by year to ensure chronological order
        const sortedRows = rows.sort((a, b) => {
        const aKey = xAxisType === 'career_year' ? parseInt(a.career_year) : parseInt(a.season_year);
        const bKey = xAxisType === 'career_year' ? parseInt(b.career_year) : parseInt(b.season_year);
        return aKey - bKey;
        });
        
        // Simple running sum for counting stats
        let runningTotal = 0;
        
        for (const row of sortedRows) {
        runningTotal += parseFloat(row.value || 0);
        cumulativeResult.push({
            ...row,
            value: runningTotal.toString()
        });
        }
    }
    
    result = cumulativeResult;
    }

    // Fetch player info
    const playersFromDb = await sql`
        SELECT player_id, name
        FROM players_info
        WHERE player_id = ANY(${playerIds})
        `;

    // Get rookie years for display purposes
    const rookieYearsMap = new Map<string, number>();
    if (xAxisType === 'career_year') {
        const tableName = aggregation === 'per_game' 
            ? (context === 'playoffs' ? 'player_season_playoff_per_game' : 'player_season_per_game')
            : (context === 'playoffs' ? 'player_season_playoff_totals' : 'player_season_totals');
        
        // For 'all' context, we need to check both tables
        if (context === 'all') {
            const regularTable = aggregation === 'per_game' ? 'player_season_per_game' : 'player_season_totals';
            const playoffTable = aggregation === 'per_game' ? 'player_season_playoff_per_game' : 'player_season_playoff_totals';
            
            const rookieYearQuery = await sql`
                SELECT player_id, MIN(LEFT(year_id, 4)::integer) as rookie_year
                FROM (
                    SELECT player_id, year_id 
                    FROM ${sql(regularTable)} 
                    WHERE player_id = ANY(${playerIds})
                        AND year_id IS NOT NULL 
                        AND year_id != ''
                        AND LENGTH(year_id) >= 4
                    UNION
                    SELECT player_id, year_id 
                    FROM ${sql(playoffTable)} 
                    WHERE player_id = ANY(${playerIds})
                        AND year_id IS NOT NULL 
                        AND year_id != ''
                        AND LENGTH(year_id) >= 4
                ) all_seasons
                GROUP BY player_id
            `;
            rookieYearQuery.forEach(row => {
                rookieYearsMap.set(row.player_id, parseInt(row.rookie_year));
            });
        } else {
            const rookieYearQuery = await sql`
                SELECT player_id, MIN(LEFT(year_id, 4)::integer) as rookie_year
                FROM ${sql(tableName)}
                WHERE player_id = ANY(${playerIds})
                        AND year_id IS NOT NULL 
                        AND year_id != ''
                        AND LENGTH(year_id) >= 4
                GROUP BY player_id
            `;
            rookieYearQuery.forEach(row => {
                rookieYearsMap.set(row.player_id, parseInt(row.rookie_year));
            });
        }
    }

    const players: PlayerInfo[] = playersFromDb.map(p => ({
        player_id: p.player_id,
        name: p.name,
        rookie_year: rookieYearsMap.get(p.player_id)
    }));

    // Transform data into format suitable for Recharts
    const seasonMap = new Map<number, GraphDataPoint>();

    for (const row of result) {
        let key: number;
        let dataPoint: GraphDataPoint;
        
        if (xAxisType === 'career_year') {
            // Use career_year as the key
            key = parseInt(row.career_year);
            
            if (!seasonMap.has(key)) {
                seasonMap.set(key, { 
                    season_year: 0, // Not used for career year display
                    career_year: key 
                });
            }
        } else {
            // Use season_year as the key
            key = parseInt(row.season_year);
            
            if (!seasonMap.has(key)) {
                seasonMap.set(key, { season_year: key });
            }
        }
        
        dataPoint = seasonMap.get(key)!;
        const playerId = row.player_id;
        const value = parseFloat(row.value);
        
        dataPoint[playerId] = Math.round(value * 100) / 100;
    }

    // Convert map to sorted array
    const data = Array.from(seasonMap.values()).sort((a, b) => {
        if (xAxisType === 'career_year') {
            return (a.career_year || 0) - (b.career_year || 0);
        } else {
            return a.season_year - b.season_year;
        }
    });

    return {
      data,
      players,
      metric,
      xAxisType,
    };
  } catch (error) {
    console.error("Error fetching graph data:", error);
    throw new Error("Failed to fetch graph data");
  }
}
