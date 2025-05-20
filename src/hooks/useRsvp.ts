// src/hooks/useRsvp.ts
import { useState, useEffect } from 'react';
import api from '../api/axios';

export interface RsvpInfo {
  participants: number;
  going: boolean;
  averageRating: number;
  userRating: number | null;
}

export function useRsvp(eventId: number, onRated?: (avg: number) => void) {
  const [info, setInfo] = useState<RsvpInfo>({
    participants: 0,
    going: false,
    averageRating: 0,
    userRating: null,
  });

  const fetch = () =>
    api.get<RsvpInfo>(`/events/${eventId}/rsvp`).then((r) => {
      setInfo(r.data);
      onRated?.(r.data.averageRating); // Notify parent about the average rating
    });

  useEffect(() => {
    fetch();
  }, [eventId]);

  const toggle = () =>
    api
      .post<RsvpInfo>(`/events/${eventId}/rsvp/toggle`)
      .then((r) => {
        setInfo(r.data);
        onRated?.(r.data.averageRating); // Notify parent about the average rating
      });

  const rate = (rating: number) =>
    api
      .post<RsvpInfo>(`/events/${eventId}/rsvp/rate`, null, { params: { rating } })
      .then((r) => {
        setInfo(r.data);
        onRated?.(r.data.averageRating); // Notify parent about the average rating
      });

  return { info, toggle, rate };
}
