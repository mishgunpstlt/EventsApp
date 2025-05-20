// src/pages/EventList.tsx
import { useEffect, useState, useMemo } from 'react';
import {
  Container,
  Grid,
  Typography,
  Button,
  CircularProgress,
  Alert,
  TextField,
  Box,
  Pagination,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Link,
} from '@mui/material';
import api from '../api/axios';
import { Event } from '../types/Event';
import { CITIES, CATEGORIES, FORMATS, LEVELS } from '../constants';
import EventCard from '../components/EventCard';

const ROWS_PER_PAGE = 10;

export default function EventList() {
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);

  // Фильтры
  const [search,   setSearch]   = useState('');
  const [level, setLevel] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo,   setDateTo]   = useState('');
  const [category, setCategory] = useState<string>('');
  const [format,   setFormat]   = useState<string>('');
  const [city,     setCity]     = useState<string>('');
  const [sort,  setSort]  = useState<'date'|'rating'|'popularity'>('date');

  // Пагинация
  const [page, setPage] = useState(1);

  // Загрузка с бэкенда (категория, формат, город)
  useEffect(() => {
    setLoading(true);
    api.get<Event[]>('/events', {
      params: {
        ...(category && { category }),
        ...(format   && { format   }),
        ...(city     && { city     }),
        ...(level     && { level     }),
        ...(sort     && { sort     })
      }
    })
      .then(({ data }) => setAllEvents(data))
      .catch(() => setError('Не удалось загрузить события'))
      .finally(() => setLoading(false));
  }, [category, format, city, level, sort]);

  // Локальная фильтрация по названию и дате
  const filtered = useMemo(() => {
    return allEvents.filter(evt => {
      const titleMatch = evt.title
        .toLowerCase()
        .includes(search.toLowerCase());
      const dt = new Date(evt.date);
      const afterFrom = dateFrom
        ? dt >= new Date(dateFrom)
        : true;
      const beforeTo = dateTo
        ? dt <= new Date(dateTo + 'T23:59:59')
        : true;
      return titleMatch && afterFrom && beforeTo;
    });
  }, [allEvents, search, dateFrom, dateTo]);

  // Сброс страницы при изменении фильтров
  useEffect(() => {
    setPage(1);
  }, [search, dateFrom, dateTo, category, format, city]);

  // Текущая страница
  const paged = useMemo(() => {
    const start = (page - 1) * ROWS_PER_PAGE;
    return filtered.slice(start, start + ROWS_PER_PAGE);
  }, [filtered, page]);

  const pageCount = Math.ceil(filtered.length / ROWS_PER_PAGE);

  if (loading) {
    return (
      <Container sx={{ textAlign: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }
  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Список мероприятий
      </Typography>

       {/* Блок с контактами */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          bgcolor: 'background.paper',
          p: 2,
          borderRadius: 2,
          boxShadow: 1,
          maxWidth: 300,
          zIndex: 1000,
        }}
      >
        <Typography variant="subtitle2" gutterBottom>
          Связаться с нами
        </Typography>
        <Typography variant="body2" gutterBottom>
          Почта:{' '}
          <Link
            href="https://e.mail.ru/compose?to=ya.sobytiye@mail.ru"
            target="_blank"
            rel="noopener noreferrer"
            underline="hover"
          >
            ya.sobytiye@mail.ru
          </Link>
        </Typography>
        <Typography variant="body2" gutterBottom>
          Telegram:{' '}
          <Link
            href="https://t.me/mishgunpstlt"
            target="_blank"
            rel="noopener noreferrer"
            underline="hover"
          >
            @mishgunpstlt
          </Link>
        </Typography>
        <Typography variant="body2">
          Телефон: <Link href="tel:+79205250404">+7 920 525-04-04</Link>
        </Typography>
      </Box>

      {/* Фильтры */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          flexWrap: 'wrap',
          mb: 3,
          alignItems: 'flex-end'
        }}
      >
        <TextField
          label="Поиск по названию"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <TextField
          label="С даты"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={dateFrom}
          onChange={e => setDateFrom(e.target.value)}
        />

        <TextField
          label="По дату"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={dateTo}
          onChange={e => setDateTo(e.target.value)}
        />

        <FormControl sx={{ minWidth: 160 }}>
          <InputLabel>Сфера</InputLabel>
          <Select
            label="Сфера"
            value={category}
            onChange={e => setCategory(e.target.value)}
          >
            <MenuItem value="">
              <em>Все сферы</em>
            </MenuItem>
            {CATEGORIES.map(cat => (
              <MenuItem key={cat.value} value={cat.value}>
                {cat.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 160 }}>
          <InputLabel>Формат</InputLabel>
          <Select
            label="Формат"
            value={format}
            onChange={e => setFormat(e.target.value)}
          >
            <MenuItem value="">
              <em>Все форматы</em>
            </MenuItem>
            {FORMATS.map(f => (
              <MenuItem key={f.value} value={f.value}>
                {f.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{minWidth:140}}>
        <InputLabel>Уровень</InputLabel>
        <Select value={level} label="Уровень" onChange={e=>setLevel(e.target.value)}>
          <MenuItem value=""><em>Все уровни</em></MenuItem>
          {LEVELS.map(l=>(
            <MenuItem key={l.value} value={l.value}>{l.label}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl sx={{minWidth:140}}>
        <InputLabel>Сортировать</InputLabel>
        <Select value={sort} label="Сортировать" onChange={e=>setSort(e.target.value as any)}>
          <MenuItem value="date">По дате</MenuItem>
          <MenuItem value="rating">По рейтингу</MenuItem>
          <MenuItem value="popularity">По популярности</MenuItem>
        </Select>
      </FormControl>

        <FormControl sx={{ minWidth: 160 }}>
          <InputLabel>Город</InputLabel>
          <Select
            label="Город"
            value={city}
            onChange={e => setCity(e.target.value)}
          >
            <MenuItem value="">
              <em>Все города</em>
            </MenuItem>
            {CITIES.map(c => (
              <MenuItem key={c} value={c}>
                {c}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          variant="outlined"
          onClick={() => {
            setSearch('');
            setDateFrom('');
            setDateTo('');
            setCategory('');
            setFormat('');
            setCity('');
          }}
        >
          Сбросить
        </Button>
      </Box>

      {/* Карточки */}
      {paged.length === 0 ? (
        <Typography>По этим параметрам ничего не найдено.</Typography>
      ) : (
        <Grid container spacing={3}>
          {paged.map(evt => (
            <Grid item xs={12} sm={6} md={4} key={evt.id}>
              <EventCard event={evt} />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Пагинация */}
      {pageCount > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={pageCount}
            page={page}
            onChange={(_, p) => setPage(p)}
            color="primary"
          />
        </Box>
      )}
    </Container>
  );
}
