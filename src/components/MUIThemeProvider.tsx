'use client';

import React, { useMemo } from 'react';
import { ThemeProvider as MUIThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useThemeContext } from '@/context/ThemeContext';
import { lightTheme, darkTheme } from '@/theme';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { mode } = useThemeContext();

  const theme = useMemo(() => {
    return mode === 'dark' ? darkTheme : lightTheme;
  }, [mode]);

  return (
    <MUIThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MUIThemeProvider>
  );
}