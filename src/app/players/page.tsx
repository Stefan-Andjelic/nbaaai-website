'use client';
import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import PlayersTable from '@/components/PlayersTable';

const PlayersPage: React.FC = () => {
  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          NBA Players Database
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Browse through the history of NBA players, their stats, and career information.
        </Typography>
        
        <Box sx={{ mt: 4 }}>
          <PlayersTable />
        </Box>
      </Box>
    </Container>
  );
}

export default PlayersPage;