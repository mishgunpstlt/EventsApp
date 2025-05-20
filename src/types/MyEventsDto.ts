// src/types/MyEventsDto.ts
import { Event } from './Event';

export interface MyEventsDto {
  createdEvents: Event[];
  joinedEvents: Event[];
}
