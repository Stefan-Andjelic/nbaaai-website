import sql from "./db";
import { Player, PlayersDataResponse } from "@/types/supabase";

export const getPlayersData = async ({
  page = 1,
  pageSize = 10,
  sortBy = "name",
  sortOrder = "asc",
  search = "",
}: {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
}): Promise<PlayersDataResponse> => {
  // Validate sortBy to prevent SQL injection
  const allowedSortColumns = ["name", "player_id", "team", "position"];
  const validatedSortBy = allowedSortColumns.includes(sortBy) ? sortBy : "name";

  // Adjust page number (MUI uses 0-indexed, Supabase uses 1-indexed)
  const adjustedPage = page > 0 ? page : 1;
  const offset = (adjustedPage - 1) * pageSize;

  try {
    const searchCondition = search
      ? sql`AND (name ILIKE ${"%" + search + "%"} OR player_id ILIKE ${
          "%" + search + "%"
        })`
      : sql``;

    // Get total count
    const [{ count }] = await sql`
      SELECT COUNT(*) as count
      FROM players_info
      WHERE 1=1 ${searchCondition}
    `;

    const totalCount = parseInt(count as string);

    // Fetch players with pagination
    const players = await sql.unsafe(`
      SELECT *
      FROM players_info
      WHERE 1=1 ${search ? `AND (name ILIKE '%${search.replace(/'/g, "''")}%' OR player_id ILIKE '%${search.replace(/'/g, "''")}%')` : ''}
      ORDER BY ${validatedSortBy} ${sortOrder === 'asc' ? 'ASC' : 'DESC'}
      LIMIT ${pageSize}
      OFFSET ${offset}
    `);

    return {
      players: players as unknown as Player[],
      totalCount,
      page: adjustedPage,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
    };
  } catch (error) {
    console.error("Error fetching players:", error);
    throw error;
  }
};

export const getPlayerDetails = async (playerId: string) => {
  try {
    // Fetch player details
    const [playerDetails] = await sql`
      SELECT * FROM players_info
      WHERE player_id = ${playerId}
    `;

    if (!playerDetails) {
      throw new Error(`Player not found: ${playerId}`);
    }

    // Fetch season stats
    console.log("Fetching season stats...");
    const seasonTotals = await sql`
      SELECT * FROM player_season_totals
      WHERE player_id = ${playerId}
      ORDER BY year_id ASC
    `;

    console.log("Raw seasonTotals from database:", seasonTotals);
    console.log(
      "First row keys:",
      seasonTotals?.[0] ? Object.keys(seasonTotals[0]) : "No data"
    );

    // Fetch advanced stats
    const advancedStats = await sql`
      SELECT * FROM player_season_advanced
      WHERE player_id = ${playerId}
      ORDER BY year_id ASC
    `;

    return {
      playerDetails,
      seasonTotals,
      advancedStats,
    };
  } catch (error) {
    console.error("Error fetching player details:", error);
    throw error;
  }
};
