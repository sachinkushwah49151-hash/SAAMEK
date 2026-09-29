/**
 * SAAMEK Backend API Configuration
 * Centralized base URL configuration for backend services.
 */
export const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
