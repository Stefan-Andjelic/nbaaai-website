// src/app/players/[id]/page.tsx
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
import {
  PlayerSeasonStats,
  PlayerAdvancedStats,
  PlayerPerGameStats,
} from "@/types/supabase";

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

function getPlayerImageUrl(playerId: string): string {
  // Construct the URL to your Supabase storage
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${supabaseUrl}/storage/v1/object/public/player-headshot-images/${playerId}.jpg`;
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

  const { playerDetails, seasonStats, advancedStats, perGameStats } =
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
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Typography variant="h4" gutterBottom sx={{ mr: 2 }}>
              {playerDetails.name}
            </Typography>
            {playerDetails.hall_of_fame && (
              <Chip label="Hall of Fame" color="primary" size="small" />
            )}
          </Box>

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
                <strong>Birth Date:</strong> {playerDetails.birth_date_text}
              </Typography>
              <Typography variant="body1">
                <strong>Career:</strong> {playerDetails.year_min} -{" "}
                {playerDetails.year_max}
              </Typography>
              <Typography variant="body1">
                <strong>Colleges:</strong>{" "}
                {playerDetails.colleges?.join(", ") || "N/A"}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3, border: "1px solid #FF7D00" }} />

      {/* Season Stats Table */}
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
                    <TableCell>Team</TableCell>
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
                    <TableCell>Awards</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {seasonStats.map((stat: PlayerSeasonStats) => (
                    <TableRow 
                        key={`${stat.season_year}-${stat.team_id}`}
                        sx={{
                          '&:hover': {
                            backgroundColor: 'rgba(255, 125, 0, 0.3)', // 30% opacity
                            '& .MuiTableCell-root': {
                              color: 'inherit' // Keep original text color since background is now transparent
                            },
                            '&:active': {
                              backgroundColor: 'rgba(255, 125, 0, 0.5)', // Slightly more opaque for active state
                              '& .MuiTableCell-root': {
                                color: 'inherit'
                              }
                            }
                          }
                        }}
                    >
                      <TableCell>{stat.season_year}</TableCell>
                      <TableCell>{stat.team_id}</TableCell>
                      <TableCell>{stat.games}</TableCell>
                      <TableCell>{stat.games_started}</TableCell>
                      <TableCell>{stat.minutes_played}</TableCell>
                      <TableCell>{stat.field_goals}</TableCell>
                      <TableCell>{stat.field_goal_attempts}</TableCell>
                      <TableCell>{stat.field_goal_pct}</TableCell>
                      <TableCell>{stat.three_point_field_goals}</TableCell>
                      <TableCell>{stat.three_point_attempts}</TableCell>
                      <TableCell>{stat.three_point_pct}</TableCell>
                      <TableCell>{stat.two_point_field_goals}</TableCell>
                      <TableCell>{stat.two_point_attempts}</TableCell>
                      <TableCell>{stat.two_point_pct}</TableCell>
                      <TableCell>{stat.effective_fg_pct}</TableCell>
                      <TableCell>{stat.free_throws}</TableCell>
                      <TableCell>{stat.free_throw_attempts}</TableCell>
                      <TableCell>{stat.free_throw_pct}</TableCell>
                      <TableCell>{stat.offensive_rebounds}</TableCell>
                      <TableCell>{stat.defensive_rebounds}</TableCell>
                      <TableCell>{stat.total_rebounds}</TableCell>
                      <TableCell>{stat.assists}</TableCell>
                      <TableCell>{stat.blocks}</TableCell>
                      <TableCell>{stat.steals}</TableCell>
                      <TableCell>{stat.personal_fouls}</TableCell>
                      <TableCell>{stat.turnovers}</TableCell>
                      <TableCell>{stat.points}</TableCell>
                      <TableCell>{stat.triple_doubles}</TableCell>
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
                    <TableCell>Team</TableCell>
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
                    <TableCell>Awards</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {advancedStats.map((stat: PlayerAdvancedStats) => (
                    <TableRow 
                      key={`${stat.season_year}-${stat.team_id}`}
                      sx={{
                        '&:hover': {
                          backgroundColor: 'rgba(255, 125, 0, 0.3)', // 30% opacity
                          '& .MuiTableCell-root': {
                            color: 'inherit' // Keep original text color since background is now transparent
                          },
                          '&:active': {
                            backgroundColor: 'rgba(255, 125, 0, 0.5)', // Slightly more opaque for active state
                            '& .MuiTableCell-root': {
                              color: 'inherit'
                            }
                          }
                        }
                      }}
                    >
                      <TableCell>{stat.season_year}</TableCell>
                      <TableCell>{stat.team_id}</TableCell>
                      <TableCell>{stat.games}</TableCell>
                      <TableCell>{stat.games_started}</TableCell>
                      <TableCell>{stat.minutes_played}</TableCell>
                      <TableCell>{stat.per != null ? stat.per.toFixed(1) : "N/A"}</TableCell>
                      <TableCell>{stat.ts_pct != null ? stat.ts_pct.toFixed(1) : "N/A"}</TableCell>
                      <TableCell>{stat.three_point_attempt_rate != null ? stat.three_point_attempt_rate.toFixed(1) : "N/A"}</TableCell>
                      <TableCell>{stat.free_throw_rate != null ? stat.free_throw_rate.toFixed(1) : "N/A"}</TableCell>
                      <TableCell>{stat.offensive_rebound_pct != null ? stat.offensive_rebound_pct.toFixed(1) : "N/A"}</TableCell>
                      <TableCell>{stat.defensive_rebound_pct != null ? stat.defensive_rebound_pct.toFixed(1) : "N/A"}</TableCell>
                      <TableCell>{stat.total_rebound_pct != null ? stat.total_rebound_pct.toFixed(1) : "N/A"}</TableCell>
                      <TableCell>{stat.assist_pct != null ? stat.assist_pct.toFixed(1) : "N/A"}</TableCell>
                      <TableCell>{stat.steal_pct != null ? stat.steal_pct.toFixed(1) : "N/A"}</TableCell>
                      <TableCell>{stat.block_pct != null ? stat.block_pct.toFixed(1) : "N/A"}</TableCell>
                      <TableCell>{stat.turnover_pct != null ? stat.turnover_pct.toFixed(1) : "N/A"}</TableCell>
                      <TableCell>{stat.usage_pct != null ? stat.usage_pct.toFixed(1) : "N/A"}</TableCell>
                      <TableCell>{stat.offensive_win_shares != null ? stat.offensive_win_shares.toFixed(1) : "N/A"}</TableCell>
                      <TableCell>{stat.defensive_win_shares != null ? stat.defensive_win_shares.toFixed(1) : "N/A"}</TableCell>
                      <TableCell>{stat.win_shares != null ? stat.win_shares.toFixed(1) : "N/A"}</TableCell>
                      <TableCell>{stat.win_shares_per_48 != null ? stat.win_shares_per_48.toFixed(1) : "N/A"}</TableCell>
                      <TableCell>{stat.offensive_box_plus_minus != null ? stat.offensive_box_plus_minus.toFixed(1) : "N/A"}</TableCell>
                      <TableCell>{stat.defensive_box_plus_minus != null ? stat.defensive_box_plus_minus.toFixed(1) : "N/A"}</TableCell>
                      <TableCell>{stat.box_plus_minus != null ? stat.box_plus_minus.toFixed(1) : "N/A"}</TableCell>
                      <TableCell>{stat.value_over_replacement != null ? stat.value_over_replacement.toFixed(1) : "N/A"}</TableCell>
                      <TableCell>{stat.awards != null ? stat.awards : "N/A"}</TableCell>
                      
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Per Game Stats Table */}
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
              Per Game Stats
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Season</TableCell>
                    <TableCell>Team</TableCell>
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
                    <TableCell>Awards</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {perGameStats.map((stat: PlayerPerGameStats) => (
                    <TableRow 
                      key={`${stat.season_year}-${stat.team_id}`}
                      sx={{
                        '&:hover': {
                          backgroundColor: 'rgba(255, 125, 0, 0.3)', // 30% opacity
                          '& .MuiTableCell-root': {
                            color: 'inherit' // Keep original text color since background is now transparent
                          },
                          '&:active': {
                            backgroundColor: 'rgba(255, 125, 0, 0.5)', // Slightly more opaque for active state
                            '& .MuiTableCell-root': {
                              color: 'inherit'
                            }
                          }
                        }
                      }}
                    >
                      <TableCell>{stat.season_year}</TableCell>
                      <TableCell>{stat.team_id}</TableCell>
                      <TableCell>{stat.games}</TableCell>
                      <TableCell>{stat.games_started}</TableCell>
                      <TableCell>{stat.minutes_played_per_game}</TableCell>
                      <TableCell>{stat.field_goals_per_game}</TableCell>
                      <TableCell>{stat.field_goal_attempts_per_game}</TableCell>
                      <TableCell>{stat.field_goal_pct}</TableCell>
                      <TableCell>{stat.three_point_field_goals_per_game}</TableCell>
                      <TableCell>{stat.three_point_attempts_per_game}</TableCell>
                      <TableCell>{stat.three_point_pct}</TableCell>
                      <TableCell>{stat.two_point_field_goals_per_game}</TableCell>
                      <TableCell>{stat.two_point_attempts_per_game}</TableCell>
                      <TableCell>{stat.two_point_pct}</TableCell>
                      <TableCell>{stat.effective_fg_pct}</TableCell>
                      <TableCell>{stat.free_throws_per_game}</TableCell>
                      <TableCell>{stat.free_throw_attempts_per_game}</TableCell>
                      <TableCell>{stat.free_throws_pct}</TableCell>
                      <TableCell>{stat.offensive_rebounds_per_game}</TableCell>
                      <TableCell>{stat.defensive_rebounds_per_game}</TableCell>
                      <TableCell>{stat.total_rebounds_per_game}</TableCell>
                      <TableCell>{stat.assists_per_game}</TableCell>
                      <TableCell>{stat.steals_per_game}</TableCell>
                      <TableCell>{stat.blocks_per_game}</TableCell>
                      <TableCell>{stat.turnovers_per_game}</TableCell>
                      <TableCell>{stat.personal_fouls_per_game}</TableCell>
                      <TableCell>{stat.points_per_game}</TableCell>
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
