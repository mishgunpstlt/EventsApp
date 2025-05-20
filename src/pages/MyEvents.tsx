// src/pages/MyEvents.tsx
import React, { useEffect, useState, useMemo } from 'react';
import {
  Container,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Box,
  Pagination
} from '@mui/material';
import { fetchMyEventsAll } from '../api/events';
import { Event } from '../types/Event';
import EventCard from '../components/EventCard';

const ROWS_PER_PAGE = 10;

export default function MyEvents() {
  const [created, setCreated] = useState<Event[]>([]);
  const [joined,  setJoined]  = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string|null>(null);

  // сейчас три секции, у каждой своя страница
  const [pageCreated, setPageCreated] = useState(1);
  const [pageJoined,  setPageJoined ] = useState(1);
  const [pageHistory, setPageHistory] = useState(1);

  useEffect(() => {
    fetchMyEventsAll()
      .then(({ createdEvents, joinedEvents }) => {
        setCreated(createdEvents);
        setJoined (joinedEvents);
      })
      .catch(() => setError('Не удалось загрузить мои события'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <CircularProgress sx={{ display:'block', mx:'auto', mt:4 }} />;
  if (error)   return <Alert severity="error">{error}</Alert>;

  const now = new Date();
  const createdUpcoming = created.filter(e => new Date(e.date) >= now);
  const createdPast     = created.filter(e => new Date(e.date) <  now);
  const joinedUpcoming  = joined .filter(e => new Date(e.date) >= now);
  const joinedPast      = joined .filter(e => new Date(e.date) <  now);

  // пейджинг для каждой группы
  const makePager = (arr: Event[], page: number) => {
    const start = (page - 1) * ROWS_PER_PAGE;
    return arr.slice(start, start + ROWS_PER_PAGE);
  };
  const createdPageCount = Math.ceil(createdUpcoming.length / ROWS_PER_PAGE);
  const createdPaged     = makePager(createdUpcoming, pageCreated);

  const joinedPageCount  = Math.ceil(joinedUpcoming.length / ROWS_PER_PAGE);
  const joinedPaged      = makePager(joinedUpcoming, pageJoined);

  const history = [...createdPast, ...joinedPast];
  const historyPageCount = Math.ceil(history.length / ROWS_PER_PAGE);
  const historyPaged     = makePager(history, pageHistory);

  return (
    <Container sx={{ mt: 4 }}>
      {createdUpcoming.length > 0 && (
        <>
          <Typography variant="h5" gutterBottom>Мои созданные события</Typography>
          <Grid container spacing={3}>
            {createdPaged.map(evt => (
              <Grid item xs={12} sm={6} md={4} key={evt.id}>
                <EventCard event={evt}/>
              </Grid>
            ))}
          </Grid>
          {createdPageCount > 1 && (
            <Box display="flex" justifyContent="center" mt={2}>
              <Pagination
                count={createdPageCount}
                page={pageCreated}
                onChange={(_, p) => setPageCreated(p)}
              />
            </Box>
          )}
        </>
      )}

      {joinedUpcoming.length > 0 && (
        <>
          <Typography variant="h5" gutterBottom sx={{ mt:4 }}>Записан на события</Typography>
          <Grid container spacing={3}>
            {joinedPaged.map(evt => (
              <Grid item xs={12} sm={6} md={4} key={evt.id}>
                <EventCard event={evt}/>
              </Grid>
            ))}
          </Grid>
          {joinedPageCount > 1 && (
            <Box display="flex" justifyContent="center" mt={2}>
              <Pagination
                count={joinedPageCount}
                page={pageJoined}
                onChange={(_, p) => setPageJoined(p)}
              />
            </Box>
          )}
        </>
      )}

      {(createdPast.length > 0 || joinedPast.length > 0) && (
        <>
          <Typography variant="h5" gutterBottom sx={{ mt:4 }}>История</Typography>
          <Grid container spacing={3}>
            {historyPaged.map(evt => (
              <Grid item xs={12} sm={6} md={4} key={`${evt.id}-${evt.owner}`}>
                <EventCard event={evt}/>
              </Grid>
            ))}
          </Grid>
          {historyPageCount > 1 && (
            <Box display="flex" justifyContent="center" mt={2}>
              <Pagination
                count={historyPageCount}
                page={pageHistory}
                onChange={(_, p) => setPageHistory(p)}
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
}
