import { createTheme } from '@mui/material/styles';

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: '#ffffff',
    },
    primary: {
      main: '#590766',
    },
    secondary: {
      main: '#FF7D00',
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#211721',
    },
    primary: {
      main: '#590766',
    },
    secondary: {
      main: '#FF7D00',
    },
  },
});
