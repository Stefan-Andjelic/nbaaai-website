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
            <Grid item xs={12} md={6}>
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
            <Grid item xs={12} md={6}>
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
        <Grid item xs={12} md={6}>
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
                    <TableCell>Games</TableCell>
                    <TableCell>Total Points</TableCell>
                    <TableCell>Total Rebounds</TableCell>
                    <TableCell>Total Assists</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {seasonStats.map((stat: PlayerSeasonStats) => (
                    <TableRow key={`${stat.season_year}-${stat.team_id}`}>
                      <TableCell>{stat.season_year}</TableCell>
                      <TableCell>{stat.team_id}</TableCell>
                      <TableCell>{stat.games}</TableCell>
                      <TableCell>
                        {stat.points != null ? stat.points : "N/A"}
                      </TableCell>
                      <TableCell>
                        {stat.total_rebounds != null
                          ? stat.total_rebounds
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        {stat.assists != null ? stat.assists : "N/A"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Advanced Stats Table */}
        <Grid item xs={12} md={6}>
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
                    <TableCell>PER</TableCell>
                    <TableCell>TS%</TableCell>
                    <TableCell>VORP</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {advancedStats.map((stat: PlayerAdvancedStats) => (
                    <TableRow key={`${stat.season_year}-${stat.team_id}`}>
                      <TableCell>{stat.season_year}</TableCell>
                      <TableCell>{stat.team_id}</TableCell>
                      <TableCell>
                        {stat.per != null ? stat.per.toFixed(1) : "N/A"}
                      </TableCell>
                      <TableCell>
                        {stat.ts_pct != null
                          ? (stat.ts_pct * 100).toFixed(1)
                          : "N/A"}
                        %
                      </TableCell>
                      <TableCell>
                        {stat.value_over_replacement != null
                          ? stat.value_over_replacement.toFixed(1)
                          : "N/A"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Per Game Stats Table */}
        <Grid item xs={12} md={6}>
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
                    <TableCell>PPG</TableCell>
                    <TableCell>RPG</TableCell>
                    <TableCell>APG</TableCell>
                    <TableCell>SPG</TableCell>
                    <TableCell>BPG</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {perGameStats.map((stat: PlayerPerGameStats) => (
                    <TableRow key={`${stat.season_year}-${stat.team_id}`}>
                      <TableCell>{stat.season_year}</TableCell>
                      <TableCell>{stat.team_id}</TableCell>
                      <TableCell>
                        {stat.points_per_game != null
                          ? stat.points_per_game.toFixed(1)
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        {stat.total_rebounds_per_game != null
                          ? stat.total_rebounds_per_game.toFixed(1)
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        {stat.assists_per_game != null
                          ? stat.assists_per_game.toFixed(1)
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        {stat.steals_per_game != null
                          ? stat.steals_per_game.toFixed(1)
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        {stat.blocks_per_game != null
                          ? stat.blocks_per_game.toFixed(1)
                          : "N/A"}
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
