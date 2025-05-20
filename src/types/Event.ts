export interface Event {
    id: number;
    title: string;
    description: string;
    date: string;        // ISO‑строка
    capacity: number;      // максимальное число участников
    category: string;
    format:   string;  // "online" | "offline"
    city:     string;
    address?:     string;
    conferenceLink?: string;
    latitude?: number;     // опционально: широта, если задана
    longitude?: number;    // опционально: долгота, если задана
    owner:    string;
    ownerRating: number;
    ownerRatingCount: number;
    level: string;
    imageUrls?: string[];
  }