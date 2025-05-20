// src/api/axios.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',  // прокси Vite или абсолютный путь
  headers: { 'Content-Type': 'application/json' },
});

export default api;
