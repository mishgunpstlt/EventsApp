import { Routes, Route, Navigate } from 'react-router-dom';
import { Container, CircularProgress, Box } from '@mui/material';

import Header        from './components/Header';
import EventList     from './pages/EventList';
import EventDetail   from './pages/EventDetail';
import CreateEvent   from './pages/CreateEvent';
import Profile       from './pages/Profile';
import Login         from './pages/Login';
import Register      from './pages/Register';
import MyEvents      from './pages/MyEvents';
import { AdminRequests } from './components/AdminRequests';

import { useAuth } from './contexts/AuthContext';

/* ---------- вспомогательный редирект «/» → /admin | /events ---------- */
function IndexRedirect() {
  const { user } = useAuth();
  const isAdmin  = user?.roles?.some(r => r.name === 'ROLE_ADMIN');
  return <Navigate to={isAdmin ? '/admin' : '/events'} replace />;
}

/* ---------- HOC-защита приватных маршрутов ---------- */
function PrivateRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated, initialized } = useAuth();

  if (!initialized) {
    return (
      <Box sx={{ display:'flex', justifyContent:'center', mt:4 }}>
        <CircularProgress />
      </Box>
    );
  }
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

/* ---------- HOC-защита админских маршрутов ---------- */
function AdminRoute({ children }: { children: JSX.Element }) {
  const { user, initialized } = useAuth();

  if (!initialized) {
    return (
      <Box sx={{ display:'flex', justifyContent:'center', mt:4 }}>
        <CircularProgress />
      </Box>
    );
  }
  const isAdmin = user?.roles?.some(r => r.name === 'ROLE_ADMIN');
  return isAdmin ? children : <Navigate to="/" replace />;
}

/* ---------- основной компонент ---------- */
export default function App() {
  return (
    <>
      <Header />

      <Container maxWidth="lg" sx={{ mt:4, mb:4 }}>
        <Routes>
          {/* ---------- открытые ---------- */}
          <Route path="/login"    element={<Login    />} />
          <Route path="/register" element={<Register />} />

          {/* ---------- приватные ---------- */}
          {/* корневой («/») сразу решает, куда вести пользователя */}
          <Route path="/" element={
            <PrivateRoute><IndexRedirect /></PrivateRoute>
          } />

          {/* список и карточка событий (для всех авторизованных) */}
          <Route path="/events"      element={
            <PrivateRoute><EventList /></PrivateRoute>
          } />
          <Route path="/events/:id"  element={
            <PrivateRoute><EventDetail /></PrivateRoute>
          } />

          {/* создание / мои события / профиль */}
          <Route path="/create"   element={
            <PrivateRoute><CreateEvent /></PrivateRoute>
          } />
          <Route path="/my-events" element={
            <PrivateRoute><MyEvents /></PrivateRoute>
          } />
          <Route path="/profile"  element={
            <PrivateRoute><Profile /></PrivateRoute>
          } />

          {/* админ-панель (только для ROLE_ADMIN) */}
          <Route path="/admin" element={
            <AdminRoute><AdminRequests /></AdminRoute>
          } />

          {/* неизвестные URL → на корень (дальше IndexRedirect разрулит) */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Container>
    </>
  );
}
