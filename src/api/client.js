import axios from 'axios';
import { clearAccessToken, getAccessToken } from '../lib/authStorage';

const baseURL = import.meta.env.VITE_API_BASE_URL ?? '';

export const http = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    ...(String(baseURL).includes('ngrok')
      ? { 'ngrok-skip-browser-warning': 'true' }
      : {}),
  },
  timeout: 30_000,
});

http.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (String(config.baseURL ?? baseURL).includes('ngrok')) {
    config.headers['ngrok-skip-browser-warning'] = 'true';
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (status === 401) {
      clearAccessToken();
    }
    return Promise.reject(error);
  }
);
