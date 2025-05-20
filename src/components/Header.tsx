// src/components/Header.tsx
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  IconButton
} from '@mui/material';
import { NavLink, useNavigate } from 'react-router-dom';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { useThemeMode } from '../main';  // путь поправьте, если у вас другой
import { useAuth } from '../contexts/AuthContext';
import { Link as RouterLink } from 'react-router-dom';

export default function Header() {
  const { mode, toggleMode } = useThemeMode();
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppBar position="static">
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <Typography
          component={RouterLink}
          to="/"
          sx={{
            fontFamily: "'Pacifico', cursive",
            fontSize: '1.8rem',        // подберите по вкусу
            color: 'inherit',
            textDecoration: 'none',
            flexGrow: 1
          }}
        >
          ЯСобытия
        </Typography>

          {/* Переключатель темы */}
          <IconButton color="inherit" onClick={toggleMode}>
            {mode === 'light' ? <Brightness4 /> : <Brightness7 />}
          </IconButton>

          {isAuthenticated ? (
            <>
              <Button color="inherit" component={NavLink} to="/" exact="true">
                События
              </Button>
              <Button color="inherit" component={NavLink} to="/create">
                Создать
              </Button>
              <Button color="inherit" component={NavLink} to="/profile">
                Профиль
              </Button>
              <Button color="inherit" component={NavLink} to="/my-events">
                Мои события
              </Button>
              <Button color="inherit" onClick={handleLogout}>
                Выйти
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" component={NavLink} to="/login">
                Войти
              </Button>
              <Button color="inherit" component={NavLink} to="/register">
                Регистрация
              </Button>
            </>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
}
