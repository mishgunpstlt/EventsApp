// src/types/EventRequest.ts
/** Статус заявки */
export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
/** Тип заявки: новое событие или правка существующего */
export type RequestType   = 'CREATE' | 'EDIT';

/** DTO, которое backend отдаёт на /event-requests/** */
export interface EventRequestDto {
  id:               number;
  title:            string;
  description:      string;
  date:             string | null;

  category:         string | null;
  format:           string | null;   // "online" | "offline"
  address:          string | null;
  city:             string | null;
  latitude:         number | null;
  longitude:        number | null;
  conferenceLink:   string | null;
  capacity:         number | null;
  level:            string | null;

  type:             RequestType;     // 'CREATE' | 'EDIT'
  status:           RequestStatus;   // 'PENDING' | 'APPROVED' | 'REJECTED'
  authorUsername:   string | null;
  originalEventId?: number | null;   // для EDIT
}
