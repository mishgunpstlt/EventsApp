// src/theme.ts
import { createTheme } from '@mui/material';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2196F3',
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          border: '2px solid transparent',
          borderImage: 'linear-gradient(135deg,rgb(0, 140, 255),rgb(0, 0, 0)) 1',
          borderRadius: '8px',
        },
      },
    },
  },
});

export default theme;
