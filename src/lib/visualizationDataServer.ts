import sql from './db';
import { StatMetric, ContextType, AggregationType, GraphDataPoint, PlayerInfo } from '@/types/visualizations';

interface FetchGraphDataParams {
  playerIds: string[];
  metric: StatMetric;
  seasonStart: number;
  seasonEnd: number;
  context: ContextType;
  aggregation: AggregationType;
}

export async function fetchGraphData(params: FetchGraphDataParams) {
    const { playerIds, metric, seasonStart, seasonEnd, context, aggregation } = params;

    if (!playerIds || playerIds.length === 0) {
        throw new Error('At least one player ID is required');
    }

    if (playerIds.length > 8) {
        throw new Error('A maximum of 8 players can be compared at once');
    }

    try {
        // Column maps for different table types
        const perGameColumnMap: Record<StatMetric, string> = {
            pts: 'pts_per_g',
            trb: 'trb_per_g',
            ast: 'ast_per_g',
            stl: 'stl_per_g',
            blk: 'blk_per_g',
            fg_pct: 'fg_pct'
        };

        const totalsColumnMap: Record<StatMetric, string> = {
            pts: 'pts',
            trb: 'trb',
            ast: 'ast',
            stl: 'stl',
            blk: 'blk',
            fg_pct: 'fg_pct'
        };

        // Select appropriate column map based on aggregation type
        const columnMap = aggregation === 'per_game' ? perGameColumnMap : totalsColumnMap;
        
        const dbColumn = columnMap[metric];
        if (!dbColumn) {
            throw new Error(`Invalid metric: ${metric}`);
        }

        let result;

        // Determine which table(s) to query based on aggregation and context
        if (aggregation === 'per_game') {
            if (context === 'regular') {
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
            } else if (context === 'playoffs') {
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
            } else { // 'all'
                // For percentages in 'all' mode, we need to recalculate from totals
                if (metric === 'fg_pct') {
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
                            (SUM(${sql(dbColumn)} * g)::float / SUM(g)::float) as value
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
        } else { // totals
            if (context === 'regular') {
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
            } else if (context === 'playoffs') {
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
            } else { // 'all'
                // For percentages, recalculate from combined makes/attempts
                if (metric === 'fg_pct') {
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

        // Fetch player info
        const playersFromDb = await sql`
        SELECT player_id, name
        FROM players_info
        WHERE player_id = ANY(${playerIds})
        `;
        
        // Map to match the frontend interface (name instead of player_name)
        const players: PlayerInfo[] = playersFromDb.map(p => ({
            player_id: p.player_id,
            name: p.name // Handle both field names
        }));

        // Transform data into format suitable for Recharts
        // Group by season, with each player as a separate key
        const seasonMap = new Map<number, GraphDataPoint>();

        for (const row of result) {
            const season = parseInt(row.season_year);
            const playerId = row.player_id;
            const value = parseFloat(row.value);

            if (!seasonMap.has(season)) {
                seasonMap.set(season, { season_year: season });
            }

            const dataPoint = seasonMap.get(season)!;
            dataPoint[playerId] = Math.round(value * 100) / 100; // Round to 2 decimals
        }

        // Convert map to sorted array
        const data = Array.from(seasonMap.values()).sort((a, b) => a.season - b.season);

        return {
            data,
            players,
            metric,
        };
    } catch (error) {
        console.error('Error fetching graph data:', error);
        throw new Error('Failed to fetch graph data');
    }
}