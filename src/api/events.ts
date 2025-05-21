// src/api/events.ts
import api from './axios';
import { RsvpDto } from '../types/Rvsp';
import { MyEventsDto } from '../types/MyEventsDto';

export function fetchRsvpStatus(eventId: number): Promise<RsvpDto> {
  return api.get(`/events/${eventId}/rsvp`).then(r => r.data);
}
export function toggleRsvp(eventId: number): Promise<RsvpDto> {
  return api.post(`/events/${eventId}/rsvp`).then(r => r.data);
}

export function fetchMyEventsAll(): Promise<MyEventsDto> {
  return api.get<MyEventsDto>('/events/my/all').then(r => r.data);
}

/** загрузка картинок для обычной заявки */
export function uploadRequestImages(id: number, files: FileList) {
  const fd = new FormData();
  Array.from(files).forEach(f => fd.append('files', f));

  return api.post<string[]>(
    `/event-requests/${id}/images`,  // ✅ новый путь
    fd,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  ).then(r => r.data);
}

/** загрузка картинок напрямую в событие (для админа) */
export async function uploadEventImages(eventId: number, files: FileList) {
  const fd = new FormData();
  Array.from(files).forEach(f => fd.append('files', f));

  return api.post<string[]>(`/events/${eventId}/images`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(r => r.data);
}

export async function deleteRequestImage(reqId: number, filename: string) {
  await api.delete(`/event-requests/${reqId}/images/${filename}`);
}