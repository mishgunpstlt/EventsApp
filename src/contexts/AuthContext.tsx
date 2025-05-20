// src/contexts/AuthContext.tsx
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../api/axios';

/* ---------- типы ---------- */
interface JwtPayload {
  /**  поле зависит от того, что вы кладёте в токен.
      В примере – username хранится в claim `sub` */
  sub: string;
}
  
export interface UserInfo {
  username: string;
  email: string;
  fullName: string;
  // флаг, говорящий о том, что профиль заполнен
  profileComplete: boolean;
}

interface AuthContextValue {
  /** данные */
  token: string | null;
  user: UserInfo | null;

  /** экшены */
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;

  /** флаги */
  isAuthenticated: boolean;
  initialized: boolean;
}

/* ---------- контекст ---------- */
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};

/* ---------- провайдер ---------- */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser]   = useState<UserInfo | null>(null);
  const [initialized, setInitialized] = useState(false);

  const loadProfile = async () => {
    try {
      const { data } = await api.get<UserInfo>('/users/me');
      // добавляем флаг profileComplete
      data.profileComplete = Boolean(data.fullName && data.fullName.trim());
      setUser(data);
    } catch {
      // нет доступа / не залогинен
      setUser(null);
    }
  };

  /* --- helper: обработать полученный JWT --- */
  const saveToken = (t: string) => {
    localStorage.setItem('token', t);
    api.defaults.headers.common['Authorization'] = `Bearer ${t}`;
    setToken(t);
  };

  /* --- инициализация при старте приложения --- */
  useEffect(() => {
    const saved = localStorage.getItem('token');
    if (saved) {
      try {
        // если токен протух – просто считаем, что не залогинены
        saveToken(saved);
        loadProfile();
      } catch {
        localStorage.removeItem('token');
      }
    }
    setInitialized(true);
  }, []);

  /* --- методы --- */
  const login = async (username: string, password: string) => {
    const { data } = await api.post('/auth/login', { username, password });
    saveToken(data.token);
    await loadProfile();
  };

  const register = async (username: string, password: string) => {
    const { data } = await api.post('/auth/register', { username, password });
    saveToken(data.token);
    await loadProfile();
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
  };

  /* --- value --- */
  const value: AuthContextValue = {
    token,
    user,
    login,
    register,
    logout,
    isAuthenticated: Boolean(token),
    initialized,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
