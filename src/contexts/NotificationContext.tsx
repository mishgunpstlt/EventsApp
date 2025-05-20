// src/contexts/NotificationContext.tsx
import { createContext, useContext, useState, ReactNode } from 'react';
import { Snackbar, Alert as MuiAlert } from '@mui/material';

interface NotificationContextValue {
  notify: (message: string, severity?: 'success'|'info'|'warning'|'error') => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export const useNotification = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotification must be inside NotificationProvider');
  return ctx.notify;   // <-- возвращаем сразу функцию
};

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [msg, setMsg]   = useState('');
  const [sev, setSev]   = useState<'success'|'info'|'warning'|'error'>('info');

  const notify = (message: string, severity: 'success'|'info'|'warning'|'error' = 'info') => {
    setMsg(message);
    setSev(severity);
    setOpen(true);
  };

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={3000}
        onClose={() => setOpen(false)}
      >
        <MuiAlert onClose={() => setOpen(false)} severity={sev} variant="filled">
          {msg}
        </MuiAlert>
      </Snackbar>
    </NotificationContext.Provider>
  );
}
