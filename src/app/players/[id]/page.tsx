// src/app/players/[id]/page.tsx
import React from "react";
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
import { PlayerSeasonStats, PlayerAdvancedStats } from "@/types/supabase";

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

type Params = Promise<{ id: string }>

export default async function PlayerDetailPage({
  params,
}: {
  params: Params;
}) {
  // Destructure id directly from params
  const { id } = await params;

  if (!id) {
    throw new Error("Player ID not provided");
  }

  const { playerDetails, seasonStats, advancedStats } =
    await fetchPlayerDetails(id);

  return (
    <Container maxWidth="xl">
      {/* Player Header */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ mr: 2 }}>
          {playerDetails.name}
        </Typography>
        {playerDetails.hall_of_fame && (
          <Chip label="Hall of Fame" color="primary" size="small" />
        )}
      </Box>

      {/* Player Basic Info */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
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
            <strong>Colleges:</strong> {playerDetails.colleges.join(", ")}
          </Typography>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3, border: "1px solid #FF7D00" }} />

      {/* Season Stats Table */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3}>
            <Typography variant="h6" sx={{ p: 2 }}>
              Season Stats
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
                    <TableCell>Games</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {seasonStats.map((stat: PlayerSeasonStats) => (
                    <TableRow key={`${stat.season_year}-${stat.team_id}`}>
                      <TableCell>{stat.season_year}</TableCell>
                      <TableCell>{stat.team_id}</TableCell>
                      <TableCell>
                        {stat.points != null ? (stat.points / stat.games).toFixed(1) : "N/A"}
                      </TableCell>
                      <TableCell>
                        {stat.total_rebounds != null ? (stat.total_rebounds / stat.games).toFixed(1) : "N/A"}
                      </TableCell>
                      <TableCell>
                        {stat.assists != null ? (stat.assists / stat.games).toFixed(1) : "N/A"}
                      </TableCell>
                      <TableCell>{stat.games}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Advanced Stats Table */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3}>
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
