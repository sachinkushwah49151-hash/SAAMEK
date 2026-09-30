/**
 * SAAMEK Backend API Configuration
 * Centralized base URL configuration for backend services.
 * In production builds (Vercel), defaults to https://saamek.onrender.com if VITE_API_BASE_URL is not set.
 * In development, defaults to http://localhost:8000.
 */
const rawUrl = import.meta.env.VITE_API_BASE_URL;

export const API_BASE_URL: string = (
  rawUrl && rawUrl.trim() !== ''
    ? rawUrl.trim()
    : (import.meta.env.PROD ? 'https://saamek.onrender.com' : 'http://localhost:8000')
).replace(/\/+$/, '');
