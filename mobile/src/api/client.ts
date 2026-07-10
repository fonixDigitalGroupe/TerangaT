import axios, { AxiosError } from 'axios';
import { API_BASE_URL } from './config';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

let authToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

/** Attach (or clear) the bearer token used on every request. */
export function setAuthToken(token: string | null) {
  authToken = token;
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

/** Register a callback fired when the API returns 401 (expired/invalid token). */
export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler;
}

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && authToken) {
      onUnauthorized?.();
    }
    return Promise.reject(error);
  }
);

/** Extract a human-friendly message from an axios error. */
export function apiErrorMessage(error: unknown, fallback = 'Une erreur est survenue.'): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string; errors?: Record<string, string[]> }
      | undefined;
    if (data?.errors) {
      const first = Object.values(data.errors)[0];
      if (first?.[0]) return first[0];
    }
    if (data?.message) return data.message;
    if (error.code === 'ECONNABORTED') return 'Délai dépassé. Vérifiez votre connexion.';
    if (!error.response) return 'Impossible de joindre le serveur. Vérifiez l\'adresse et le réseau.';
  }
  return fallback;
}
