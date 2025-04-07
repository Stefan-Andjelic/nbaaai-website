'use client';

import { useThemeContext } from '@/context/ThemeContext';
import { Switch, FormControlLabel } from '@mui/material';

export default function ThemeToggle() {
  const { toggleTheme, mode } = useThemeContext();

  return (
    <FormControlLabel
      control={<Switch checked={mode === 'dark'} onChange={toggleTheme} />}
      label={mode === 'dark' ? 'Dark Mode' : 'Light Mode'}
    />
  );
}
