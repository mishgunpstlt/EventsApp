// src/pages/EventDetail.tsx
import { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Paper,
  Typography,
  Box,
  Button,
  IconButton,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Rating
} from '@mui/material';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import CloseIcon from '@mui/icons-material/Close';
import api from '../api/axios';
import { Event } from '../types/Event';
import { fetchRsvpStatus, toggleRsvp } from '../api/events';
import { RsvpDto } from '../types/Rvsp';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import RsvpAndRating from '../components/RsvpAndRating';
import { YMaps, Map, Placemark } from 'react-yandex-maps';

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const notify = useNotification();
  const { user, isAuthenticated, initialized } = useAuth();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [rsvp, setRsvp] = useState<RsvpDto | null>(null);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [coords, setCoords] = useState<[number, number] | null>(null);

  // Функция загрузки свежих данных события и RSVP
  const loadData = useCallback(() => {
    if (!id) return;
    setLoading(true);
    api.get<Event>(`/events/${id}`)
      .then(r => {
        setEvent(r.data);
        if (r.data.latitude != null && r.data.longitude != null) {
          setCoords([r.data.latitude, r.data.longitude]);
        }
      })
      .catch(() => setError('Не удалось загрузить данные события'))
      .finally(() => setLoading(false));

    fetchRsvpStatus(Number(id))
      .then(setRsvp)
      .catch(() => {/* игнорируем */});
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const isOwner = useMemo(
    () => !!event && !!user && event.owner === user.username,
    [event, user]
  );

  const spotsLeft = event
    ? event.capacity - (rsvp?.count ?? 0)
    : 0;
  const images = event?.imageUrls ?? [];

  const doToggle = async () => {
    setRsvpLoading(true);
    try {
      const updated = await toggleRsvp(Number(id));
      setRsvp(updated);
      if (updated.going) {
        notify(
          event?.format === 'online'
            ? 'Ссылка на конференцию отправлена на почту'
            : 'Номер билета отправлен на почту',
          'success'
        );
      } else {
        notify('Ваша запись успешно отменена', 'info');
      }
      // Обновляем счётчик и рейтинг
      loadData();
    } catch {
      notify('Не удалось обновить ваш статус участия', 'error');
    } finally {
      setRsvpLoading(false);
      setCancelConfirmOpen(false);
    }
  };

  const handleRsvpClick = () => {
    if (rsvp?.going) {
      setCancelConfirmOpen(true);
    } else {
      doToggle();
    }
  };

  const handleDelete = () => {
    api.delete(`/events/${id}`)
      .then(() => {
        notify('Событие удалено', 'info');
        navigate('/');
      })
      .catch(() => setError('Ошибка при удалении события'));
  };

  if (!initialized || loading) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  if (error) {
    return (
      <Box sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }
  if (!event) {
    return (
      <Box sx={{ mt: 4 }}>
        <Typography>Событие не найдено.</Typography>
      </Box>
    );
  }

  return (
    <>
      {/* Баннер о заполнении профиля */}
      {isAuthenticated && user && user.profileComplete === false && (
        <Alert
          severity="info"
          sx={{ mb: 2 }}
          action={
            <Button component={RouterLink} to="/profile" size="small">
              Заполнить профиль
            </Button>
          }
        >
          Чтобы регистрироваться на события, заполните ваш профиль.
        </Alert>
      )}

      <Paper
        sx={{
          p: 4,
          maxWidth: 600,
          mx: 'auto',
          mt: 4,
          border: '2px solid transparent',
          borderImage: 'linear-gradient(135deg, #2196F3, rgb(33,243,191)) 1',
          borderRadius: 2
        }}
      >
        {/* Заголовок + кнопка Назад */}
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <IconButton component={RouterLink} to="/" size="large">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4">{event.title}</Typography>
        </Stack>

        <Typography variant="subtitle1" gutterBottom>
          Дата: {new Date(event.date).toLocaleString()}
        </Typography>
        <Typography variant="body1" paragraph>
          Описание: {event.description}
        </Typography>
        <Typography variant="body2">Сфера: {event.category}</Typography>
        <Typography variant="body2">Уровень: {event.level}</Typography>
        <Typography variant="body2">
          Формат: {event.format === 'offline' ? 'Очно' : 'Онлайн'}
        </Typography>
        {event.format === 'offline' && (
          <Typography variant="body2">Адрес: {event.address}</Typography>
        )}
        <Typography variant="body2" paragraph>
          Мест всего: {event.capacity}, записалось: {rsvp?.count ?? '–'}, свободно: {spotsLeft}
        </Typography>
        <Typography variant="body2">
          Организатор: <b>{event.owner}</b>
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Rating
            value={event.ownerRating ?? 0}
            precision={0.1}
            readOnly
            size="small"
          />
          <Typography variant="caption" sx={{ ml: 0.5,  mt: 0.5 }}>
            {(event.ownerRating ?? 0).toFixed(1)}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5,  mt: 0.5 }}>
            ({event.ownerRatingCount ?? 0})
          </Typography>
        </Box>

        {/* RSVP и рейтинг */}
        {isAuthenticated && rsvp && (
          <Box mt={-1} mb={0}>
            <Button
              variant={rsvp.going ? 'outlined' : 'contained'}
              color={rsvp.going ? 'secondary' : 'primary'}
              onClick={handleRsvpClick}
              disabled={rsvpLoading || (!rsvp.going && spotsLeft <= 0)}
            >
              {rsvpLoading
                ? <CircularProgress size={20} />
                : rsvp.going
                  ? `Отменить (записано ${rsvp.count})`
                  : `Пойду (${rsvp.count}/${event.capacity})`}
            </Button>

            {/* Диалог подтверждения отмены */}
            <Dialog
              open={cancelConfirmOpen}
              onClose={() => setCancelConfirmOpen(false)}
            >
              <DialogTitle>Отменить участие?</DialogTitle>
              <DialogContent>
                <Typography>
                  Вы уверены, что хотите отменить вашу запись на это событие?
                </Typography>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setCancelConfirmOpen(false)}>Нет</Button>
                <Button
                  color="error"
                  onClick={doToggle}
                  disabled={rsvpLoading}
                >
                  Да, отменить
                </Button>
              </DialogActions>
            </Dialog>

            <RsvpAndRating
              eventId={event.id}
              disabled={!rsvp.going}
              onRated={loadData}
            />
          </Box>
        )}

        {/* Галерея */}
        {images.length > 0 && (
          <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', mb: 2 }}>
            {images.map((url, idx) => (
              <Box
                key={url}
                component="img"
                src={url}
                sx={{ height: 100, borderRadius: 1, cursor: 'pointer', boxShadow: 1 }}
                onClick={() => { setLightboxIndex(idx); setLightboxOpen(true); }}
              />
            ))}
          </Box>
        )}

        {/* Лайтбокс */}
        <Dialog
          open={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{ sx: { backgroundColor: 'transparent', boxShadow: 'none' } }}
        >
          <DialogContent sx={{ p: 0, position: 'relative', backgroundColor: 'rgba(0,0,0,0.7)' }}>
            <IconButton
              onClick={() => setLightboxOpen(false)}
              sx={{ position: 'absolute', top: 8, right: 8, color: 'white', zIndex: 10 }}
            >
              <CloseIcon />
            </IconButton>
            <IconButton
              onClick={() => setLightboxIndex(i => Math.max(i - 1, 0))}
              disabled={lightboxIndex === 0}
              sx={{ position: 'absolute', top: '50%', left: 8, transform: 'translateY(-50%)', color: 'white', zIndex: 10 }}
            >
              <ArrowBackIosNewIcon />
            </IconButton>
            <Box
              component="img"
              src={images[lightboxIndex]}
              sx={{ display: 'block', mx: 'auto', maxHeight: '80vh', maxWidth: '100%', objectFit: 'contain' }}
            />
            <IconButton
              onClick={() => setLightboxIndex(i => Math.min(i + 1, images.length - 1))}
              disabled={lightboxIndex === images.length - 1}
              sx={{ position: 'absolute', top: '50%', right: 8, transform: 'translateY(-50%)', color: 'white', zIndex: 10 }}
            >
              <ArrowForwardIosIcon />
            </IconButton>
          </DialogContent>
        </Dialog>

        {/* Карта */}
        {coords && (
          <YMaps query={{ apikey: import.meta.env.VITE_YANDEX_API_KEY }}>
            <Box sx={{ mt: 2, width: '100%', height: 300, borderRadius: 1, overflow: 'hidden' }}>
              <Map defaultState={{ center: coords, zoom: 17 }} width="100%" height="100%">
                <Placemark geometry={coords} />
              </Map>
            </Box>
          </YMaps>
        )}

        {/* Редактирование / Удаление */}
        {isOwner && (
          <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              component={RouterLink}
              to={`/create?id=${event.id}`}
            >
              Редактировать
            </Button>
            <Button
              variant="contained"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => setConfirmOpen(true)}
            >
              Удалить
            </Button>
          </Stack>
        )}

        {/* Диалог удаления */}
        <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
          <DialogTitle>Подтвердите удаление</DialogTitle>
          <DialogContent>
            <Typography>Вы уверены, что хотите удалить это событие?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmOpen(false)}>Отмена</Button>
            <Button color="error" onClick={handleDelete}>Удалить</Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </>
  );
}
