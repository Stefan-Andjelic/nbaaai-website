import React from "react";
import Image from "next/image";
import {
  Container,
  Typography,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Box,
  Divider,
} from "@mui/material";
import { PlayerSeasonTotals, PlayerAdvancedStats } from "@/types/supabase";
import { getPlayerImageUrl } from "@/lib/utils";

const formatStat = (value: any, decimals: number = 1): string => {
  if (value == null) return "N/A";
  const num = typeof value === 'number' ? value : parseFloat(value);
  return isNaN(num) ? "N/A" : num.toFixed(decimals);
};

async function fetchPlayerDetails(playerId: string) {
  try {
    // Use absolute URL with environment variable
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/players/${playerId}`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error("Failed to fetch player details");
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching player details:", error);
    throw error;
  }
}

export default async function PlayerDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  if (!id) {
    throw new Error("Player ID not provided");
  }

  const { playerDetails, seasonTotals, advancedStats } =
    await fetchPlayerDetails(id);

  const playerImageUrl = playerDetails.image_url || getPlayerImageUrl(id);

  return (
    <Container maxWidth="xl">
      {/* Player Info */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Player Header with Image */}
        <Grid item xs={12} md={3}>
          <Box
            sx={{
              width: "100%",
              height: 280,
              position: "relative",
              borderRadius: 2,
              overflow: "hidden",
              boxShadow: 3,
              bgcolor: "background.paper", // uses themed background
              border: "2px solid",
              borderColor: "primary.main", // themed border
            }}
          >
            <Image
              src={playerImageUrl}
              alt={`${playerDetails.name} headshot`}
              fill
              style={{ objectFit: "contain", objectPosition: "center" }}
              sizes="(max-width: 768px) 100vw, 280px"
              quality={100}
              priority
            />
          </Box>
        </Grid>

        {/* Player Name and Basic Info */}
        <Grid item xs={12} md={9}>
          {/* Player Basic Info */}
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="body1">
                <strong>Position:</strong> {playerDetails.position}
              </Typography>
              <Typography variant="body1">
                <strong>Height:</strong> {playerDetails.height_cm} cm
              </Typography>
              <Typography variant="body1">
                <strong>Weight:</strong> {playerDetails.weight_kg} kg
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body1">
                <strong>Birth Date:</strong> {playerDetails.birth_date}
              </Typography>
              <Typography variant="body1">
                <strong>Career:</strong> {playerDetails.career_first_year} -{" "}
                {playerDetails.career_end_year}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3, border: "1px solid #FF7D00" }} />

      {/* All Stats Table */}
      <Grid container spacing={3}>
        {/* Totals Stats Table */}
        <Grid item xs={12}>
          <Paper
            elevation={3}
            sx={{
              border: "2px solid",
              borderColor: "primary.main",
              borderRadius: 2,
              overflow: "hidden",
              bgcolor: "background.default", // background from theme
            }}
          >
            <Typography variant="h6" sx={{ p: 2 }}>
              Season Stats
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Season</TableCell>
                    <TableCell>G</TableCell>
                    <TableCell>GS</TableCell>
                    <TableCell>MP</TableCell>
                    <TableCell>FGM</TableCell>
                    <TableCell>FGA</TableCell>
                    <TableCell>FG%</TableCell>
                    <TableCell>3PM</TableCell>
                    <TableCell>3PA</TableCell>
                    <TableCell>3P%</TableCell>
                    <TableCell>2P</TableCell>
                    <TableCell>2PA</TableCell>
                    <TableCell>2P%</TableCell>
                    <TableCell>EFG%</TableCell>
                    <TableCell>FTM</TableCell>
                    <TableCell>FTA</TableCell>
                    <TableCell>FT%</TableCell>
                    <TableCell>ORB</TableCell>
                    <TableCell>DRB</TableCell>
                    <TableCell>TRB</TableCell>
                    <TableCell>AST</TableCell>
                    <TableCell>STL</TableCell>
                    <TableCell>BLK</TableCell>
                    <TableCell>TO</TableCell>
                    <TableCell>PF</TableCell>
                    <TableCell>PTS</TableCell>
                    <TableCell>TD</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {seasonTotals.map((stat: PlayerSeasonTotals) => (
                    <TableRow
                      key={`${stat.year_id}`}
                      sx={{
                        "&:hover": {
                          backgroundColor: "rgba(255, 125, 0, 0.3)", // 30% opacity
                          "& .MuiTableCell-root": {
                            color: "inherit", // Keep original text color since background is now transparent
                          },
                          "&:active": {
                            backgroundColor: "rgba(255, 125, 0, 0.5)", // Slightly more opaque for active state
                            "& .MuiTableCell-root": {
                              color: "inherit",
                            },
                          },
                        },
                      }}
                    >
                      <TableCell>{stat.year_id}</TableCell>
                      <TableCell>{stat.games}</TableCell>
                      <TableCell>{stat.games_started}</TableCell>
                      <TableCell>{stat.mp}</TableCell>
                      <TableCell>{stat.fg}</TableCell>
                      <TableCell>{stat.fga}</TableCell>
                      <TableCell>{stat.fg_pct}</TableCell>
                      <TableCell>{stat.fg3}</TableCell>
                      <TableCell>{stat.fg3a}</TableCell>
                      <TableCell>{stat.fg3_pct}</TableCell>
                      <TableCell>{stat.fg2}</TableCell>
                      <TableCell>{stat.fg2a}</TableCell>
                      <TableCell>{stat.fg2_pct}</TableCell>
                      <TableCell>{stat.efg_pct}</TableCell>
                      <TableCell>{stat.ft}</TableCell>
                      <TableCell>{stat.fta}</TableCell>
                      <TableCell>{stat.ft_pct}</TableCell>
                      <TableCell>{stat.orb}</TableCell>
                      <TableCell>{stat.drb}</TableCell>
                      <TableCell>{stat.trb}</TableCell>
                      <TableCell>{stat.ast}</TableCell>
                      <TableCell>{stat.stl}</TableCell>
                      <TableCell>{stat.blk}</TableCell>
                      <TableCell>{stat.tov}</TableCell>
                      <TableCell>{stat.pf}</TableCell>
                      <TableCell>{stat.pts}</TableCell>
                      <TableCell>{stat.tpl_dbl}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Advanced Stats Table */}
        <Grid item xs={12}>
          <Paper
            elevation={3}
            sx={{
              border: "2px solid",
              borderColor: "primary.main",
              borderRadius: 2,
              overflow: "hidden",
              bgcolor: "background.default", // background from theme
            }}
          >
            <Typography variant="h6" sx={{ p: 2 }}>
              Advanced Stats
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Season</TableCell>
                    <TableCell>G</TableCell>
                    <TableCell>GS</TableCell>
                    <TableCell>MP</TableCell>
                    <TableCell>PER</TableCell>
                    <TableCell>TS%</TableCell>
                    <TableCell>3PAr</TableCell>
                    <TableCell>FTr</TableCell>
                    <TableCell>ORB%</TableCell>
                    <TableCell>DRB%</TableCell>
                    <TableCell>TRB%</TableCell>
                    <TableCell>AST%</TableCell>
                    <TableCell>STL%</TableCell>
                    <TableCell>BLK%</TableCell>
                    <TableCell>TOV%</TableCell>
                    <TableCell>USG%</TableCell>
                    <TableCell>OWS</TableCell>
                    <TableCell>DWS</TableCell>
                    <TableCell>WS</TableCell>
                    <TableCell>WS/48</TableCell>
                    <TableCell>OBPM</TableCell>
                    <TableCell>DBPM</TableCell>
                    <TableCell>BPM</TableCell>
                    <TableCell>VORP</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {advancedStats.map((stat: PlayerAdvancedStats) => (
                    <TableRow
                      key={`${stat.year_id}`}
                      sx={{
                        "&:hover": {
                          backgroundColor: "rgba(255, 125, 0, 0.3)", // 30% opacity
                          "& .MuiTableCell-root": {
                            color: "inherit", // Keep original text color since background is now transparent
                          },
                          "&:active": {
                            backgroundColor: "rgba(255, 125, 0, 0.5)", // Slightly more opaque for active state
                            "& .MuiTableCell-root": {
                              color: "inherit",
                            },
                          },
                        },
                      }}
                    >
                      <TableCell>{stat.year_id}</TableCell>
                      <TableCell>{stat.games}</TableCell>
                      <TableCell>{stat.games_started}</TableCell>
                      <TableCell>{stat.mp}</TableCell>
                      <TableCell>
                        {formatStat(stat.per, 1)}
                      </TableCell>
                      <TableCell>
                        {formatStat(stat.ts_pct, 3)}
                      </TableCell>
                      <TableCell>
                        {formatStat(stat.fg3a_per_fga_pct, 3)}
                      </TableCell>
                      <TableCell>
                        {formatStat(stat.fta_per_fga_pct, 3)}
                      </TableCell>
                      <TableCell>
                        {formatStat(stat.orb_pct, 3)}
                      </TableCell>
                      <TableCell>
                        {formatStat(stat.drb_pct, 3)}
                      </TableCell>
                      <TableCell>
                        {formatStat(stat.trb_pct, 3)}
                      </TableCell>
                      <TableCell>
                        {formatStat(stat.ast_pct, 3)}
                      </TableCell>
                      <TableCell>
                        {formatStat(stat.stl_pct, 3)}
                      </TableCell>
                      <TableCell>
                        {formatStat(stat.blk_pct, 3)}
                      </TableCell>
                      <TableCell>
                        {formatStat(stat.tov_pct, 3)}
                      </TableCell>
                      <TableCell>
                        {formatStat(stat.usg_pct, 3)}
                      </TableCell>
                      <TableCell>
                        {formatStat(stat.ows, 3)}
                      </TableCell>
                      <TableCell>
                        {formatStat(stat.dws, 3)}
                      </TableCell>
                      <TableCell>
                        {formatStat(stat.ws, 3)}
                      </TableCell>
                      <TableCell>
                        {formatStat(stat.ws_per_48, 3)}
                      </TableCell>
                      <TableCell>
                        {formatStat(stat.obpm, 3)}
                      </TableCell>
                      <TableCell>
                        {formatStat(stat.dbpm, 3)}
                      </TableCell>
                      <TableCell>
                        {formatStat(stat.bpm, 3)}
                      </TableCell>
                      <TableCell>
                        {formatStat(stat.vorp, 3)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

// Generating dynamic metadata
export async function generateMetadata({ params }: { params: { id: string } }) {
  try {
    const { id } = await params;
    const { playerDetails } = await fetchPlayerDetails(id);
    return {
      title: `${playerDetails.name} - Player Details`,
      description: `Career details and statistics for ${playerDetails.name}`,
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Player Details",
      description: "NBA Player Statistics",
    };
  }
}
