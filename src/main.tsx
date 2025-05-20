// src/main.tsx
import React, { useState, createContext, useMemo, useContext } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import {
  ThemeProvider,
  createTheme,
  PaletteMode,
  CssBaseline
} from '@mui/material';
import App from './App';
import { NotificationProvider } from './contexts/NotificationContext';
import { AuthProvider } from './contexts/AuthContext';

interface ThemeContextValue {
  mode: PaletteMode;
  toggleMode: () => void;
}
const ThemeModeContext = createContext<ThemeContextValue>({
  mode: 'light',
  toggleMode: () => {}
});

export function useThemeMode() {
  return useContext(ThemeModeContext);
}

function Main() {
  const [mode, setMode] = useState<PaletteMode>('light');
  const toggleMode = () => setMode(prev => (prev === 'light' ? 'dark' : 'light'));

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: { main: '#1976d2' },
          secondary: { main: '#9c27b0' }
        }
      }),
    [mode]
  );

  return (
    <ThemeModeContext.Provider value={{ mode, toggleMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <NotificationProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>
);
