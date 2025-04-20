// src/components/PlayersTable.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { Player } from "@/types/supabase";

interface ApiResponse {
  players: Player[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const PlayersTable: React.FC = () => {
  const router = useRouter();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalCount, setTotalCount] = useState(0);

  const fetchPlayers = useCallback(async () => {
    try {
      setLoading(true);

      const queryParams = new URLSearchParams({
        pageNo: page.toString(),
        rowsPerPage: rowsPerPage.toString(),
        sortBy: 'name',
        sortOrder: 'asc'
      });

      const response = await fetch(`/api/players?${queryParams}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to fetch players');
      }
      
      const data: ApiResponse = await response.json();

      setPlayers(data.players);
      setTotalCount(data.totalCount);
      setError(null);
    } catch (err) {
      console.error("Error fetching players:", err);
      setError(err instanceof Error ? err.message : "Failed to load players");
      setPlayers([]);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage]); // Dependencies: variables used inside fetchPlayers

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]); // Include fetchPlayers as a dependency

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handlePlayerClick = (playerId: string) => {
    router.push(`/players/${playerId}`);
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
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
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Position</TableCell>
              <TableCell>Years Active</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {players.map((player) => (
            <TableRow
                key={player.player_id}
                onClick={() => handlePlayerClick(player.player_id)}
                style={{ cursor: "pointer" }}
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(255, 125, 0, 0.3) !important', // Override default hover
                    '& .MuiTableCell-root': {
                      color: 'inherit'
                    }
                  },
                  '&:active': {
                    backgroundColor: 'rgba(255, 125, 0, 0.5)', // Slightly more opaque for active state
                    '& .MuiTableCell-root': {
                      color: 'inherit'
                    }
                  }
                }}
              >
                <TableCell>{player.name}</TableCell>
                <TableCell>{player.position}</TableCell>
                <TableCell>{`${player.year_min}-${player.year_max}`}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 50]}
        component="div"
        count={totalCount}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

export default PlayersTable;
