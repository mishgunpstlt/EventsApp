import React, { useEffect, useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Tooltip, CircularProgress, Typography, Box,
  Collapse
} from '@mui/material';
import CheckIcon from '@mui/icons-material/CheckCircleOutline';
import CloseIcon from '@mui/icons-material/HighlightOff';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useAuth } from '../contexts/AuthContext';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

interface Request {
  longitude: any;
  latitude: any;
  id: number;
  title: string;
  description: string;
  date: string;
  category: string;
  format: string;
  address: string;
  city: string;
  conferenceLink: string;
  capacity: number;
  level: string;
  status: string;
  authorUsername: string;
}

export const AdminRequests: React.FC = () => {
  const { token } = useAuth();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(false);

    const fetchReq = async () => {
    setLoading(true);
    try {
        const res  = await fetch('/api/admin/requests', {
        headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();

        // если backend вернул объект вида { "1": {...}, "2": {...} }
        const arr: Request[] = Array.isArray(data)
            ? data
            : Object.entries(data).map(([id, v]: any) => ({ id: +id, ...v }));

        setRequests(arr);
    } finally {
        setLoading(false);
    }
    };

  useEffect(() => { fetchReq(); }, []);

  const act = async (id: number, action: 'approve' | 'reject') => {
    await fetch(`/api/admin/requests/${id}/${action}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchReq();
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={2}>
        <Typography variant="h5" sx={{ flexGrow: 1 }}>Заявки на мероприятия</Typography>
        <Tooltip title="Обновить"><IconButton onClick={fetchReq}><RefreshIcon /></IconButton></Tooltip>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell />
                <TableCell>ID</TableCell>
                <TableCell>Название</TableCell>
                <TableCell>Дата</TableCell>
                <TableCell>Категория</TableCell>
                <TableCell>Формат</TableCell>
                <TableCell>Вместимость</TableCell>
                <TableCell>Автор</TableCell>
                <TableCell align="center">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {requests.map(r => (
                <Row key={r.id} req={r} onAct={act} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

interface RowProps { req: Request; onAct: (id:number,act:'approve'|'reject')=>void }

const Row: React.FC<RowProps> = ({ req, onAct }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <TableRow hover>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>{req.id}</TableCell>
        <TableCell>{req.title}</TableCell>
        <TableCell>{req.date ? req.date.replace('T',' ') : '-'}</TableCell>
        <TableCell>{req.category || '-'}</TableCell>
        <TableCell>{req.format}</TableCell>
        <TableCell>{req.capacity}</TableCell>
        <TableCell>{req.authorUsername || '-'}</TableCell>
        <TableCell align="center">
          <Tooltip title="Одобрить"><IconButton color="success" onClick={() => onAct(req.id, 'approve')}><CheckIcon /></IconButton></Tooltip>
          <Tooltip title="Отклонить"><IconButton color="error" onClick={() => onAct(req.id, 'reject')}><CloseIcon /></IconButton></Tooltip>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={9}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="subtitle2" gutterBottom>Описание:</Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>{req.description || '-'}</Typography>

              {req.format === 'offline' && (
                <>
                  <Typography variant="subtitle2">Адрес:</Typography>
                  <Typography variant="body2" sx={{ mb:2 }}>{req.address || '-'}</Typography>
                  <Typography variant="subtitle2">Город / Координаты:</Typography>
                  <Typography variant="body2" sx={{ mb:2 }}>{req.city || '-'} {req.latitude && req.longitude ? `(${req.latitude.toFixed(5)}, ${req.longitude.toFixed(5)})` : ''}</Typography>
                </>
              )}
              {req.format === 'online' && (
                <>
                  <Typography variant="subtitle2">Ссылка на конференцию:</Typography>
                  <Typography variant="body2" sx={{ mb:2 }}>{req.conferenceLink}</Typography>
                </>
              )}

              <Typography variant="subtitle2">Уровень:</Typography>
              <Typography variant="body2" sx={{ mb:2 }}>{req.level}</Typography>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};