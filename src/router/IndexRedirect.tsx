import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Открыли «/» →  
 *   • ROLE_ADMIN  →  /admin  
 *   • все остальные →  /events
 */
export default function IndexRedirect() {
  const { user } = useAuth();
  const isAdmin = user?.roles?.some(r => r.name === 'ROLE_ADMIN');
  return <Navigate to={isAdmin ? '/admin' : '/events'} replace />;
}
