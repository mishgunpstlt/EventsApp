// src/components/Header.tsx
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  IconButton
} from '@mui/material';
import { NavLink, useNavigate, Link as RouterLink } from 'react-router-dom';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { useThemeMode } from '../main';
import { useAuth } from '../contexts/AuthContext';

export default function Header() {
  const { mode, toggleMode } = useThemeMode();
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = user?.roles?.some(r => r.name === 'ROLE_ADMIN');

  return (
    <AppBar position="static">
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <Typography
            component={RouterLink}
            to={isAdmin ? "/admin" : "/"}
            sx={{
              fontFamily: "'Pacifico', cursive",
              fontSize: '1.8rem',
              color: 'inherit',
              textDecoration: 'none',
              flexGrow: 1
            }}
          >
            {isAdmin ? 'Админка' : 'ЯСобытия'}
          </Typography>

          <IconButton color="inherit" onClick={toggleMode} sx={{ mr: 2 }}>
            {mode === 'light' ? <Brightness4 /> : <Brightness7 />}
          </IconButton>

          {isAuthenticated && (
            isAdmin ? (
              // Админ видит только свою панель
              <>
                <Button color="inherit" component={NavLink} to="/admin">
                  Заявки
                </Button>
                <Button color="inherit" onClick={handleLogout}>
                  Выйти
                </Button>
              </>
            ) : (
              // Обычный пользователь
              <>
                <Button color="inherit" component={NavLink} to="/">
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
            )
          )}

          {!isAuthenticated && (
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
