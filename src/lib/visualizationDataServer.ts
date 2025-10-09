import sql from './db';
import { StatMetric, ContextType, GraphDataPoint, PlayerInfo } from '@/types/visualizations';

interface FetchGraphDataParams {
  playerIds: string[];
  metric: StatMetric;
  seasonStart: number;
  seasonEnd: number;
  context: ContextType;
}

export async function fetchGraphData(params: FetchGraphDataParams) {
    const { playerIds, metric, seasonStart, seasonEnd, context } = params;

    if (!playerIds || playerIds.length === 0) {
        throw new Error('At least one player ID is required');
    }

    if (playerIds.length > 5) {
        throw new Error('A maximum of 5 players can be compared at once');
    }

    try {
        const columnMap: Record<StatMetric, string> = {
            pts: 'pts',
            reb: 'reb',
            ast: 'ast',
            stl: 'stl',
            blk: 'blk',
            fg_pct: 'fg_pct'
        };

        const dbColumn = columnMap[metric];
        if (!dbColumn) {
            throw new Error(`Invalid metric: ${metric}`);
        }

        let contextFilter = '';
        if (context === 'regular') {
            contextFilter = "AND playoff_flag = false";
        } else if (context === 'playoffs') {
            contextFilter = "AND playoff_flag = true";
        }
        // 'all' context requires no additional filter

        // Fetch aggregated data by season for each player
        const result = context === 'regular' 
        ? await sql`
            SELECT 
                player_id,
                season_year,
                AVG(${sql(dbColumn)}) as avg_value,
                COUNT(*) as games_played
            FROM box_score_basic_player_stats
            WHERE player_id = ANY(${playerIds})
                AND season_year >= ${seasonStart}
                AND season_year <= ${seasonEnd}
                AND ${sql(dbColumn)} IS NOT NULL
            GROUP BY player_id, season_year
            ORDER BY season_year ASC, player_id ASC
            `
        : context === 'playoffs'
        ? await sql`
            SELECT 
                player_id,
                season_year,
                AVG(${sql(dbColumn)}) as avg_value,
                COUNT(*) as games_played
            FROM box_score_basic_player_stats
            WHERE player_id = ANY(${playerIds})
                AND season_year >= ${seasonStart}
                AND season_year <= ${seasonEnd}
                AND ${sql(dbColumn)} IS NOT NULL
            GROUP BY player_id, season_year
            ORDER BY season_year ASC, player_id ASC
            `
        : await sql`
            SELECT 
                player_id,
                season_year,
                AVG(${sql(dbColumn)}) as avg_value,
                COUNT(*) as games_played
            FROM box_score_basic_player_stats
            WHERE player_id = ANY(${playerIds})
                AND season_year >= ${seasonStart}
                AND season_year <= ${seasonEnd}
                AND ${sql(dbColumn)} IS NOT NULL
            GROUP BY player_id, season_year
            ORDER BY season_year ASC, player_id ASC
            `;

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
            const value = parseFloat(row.avg_value);

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