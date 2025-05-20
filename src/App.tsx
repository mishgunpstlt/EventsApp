// src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { Container, CircularProgress, Box } from '@mui/material';

import Header from './components/Header';
import EventList from './pages/EventList';
import EventDetail from './pages/EventDetail';
import CreateEvent from './pages/CreateEvent';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import MyEvents from './pages/MyEvents';

import { useAuth } from './contexts/AuthContext';

function PrivateRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated, initialized } = useAuth();

  // Пока контекст инициализируется — показываем спиннер
  if (!initialized) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // После инициализации — либо пускаем дальше, либо редиректим
  return isAuthenticated
    ? children
    : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <>
      <Header />

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Routes>
          {/* Открытые роуты */}
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Приватные роуты */}
          <Route path="/"        element={<PrivateRoute><EventList /></PrivateRoute>} />
          <Route path="/events/:id" element={<PrivateRoute><EventDetail /></PrivateRoute>} />
          <Route path="/create"  element={<PrivateRoute><CreateEvent /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />

          {/* Любой незнакомый URL → на главную */}
          <Route path="*" element={<Navigate to="/" replace />} />
          <Route path="/profile" element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }/>
          <Route path="/my-events" element={
            <PrivateRoute>
              <MyEvents />
            </PrivateRoute>
          }/>
        </Routes>
      </Container>
    </>
  );
}
