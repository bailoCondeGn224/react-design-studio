import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // withCredentials: true, // Désactivé temporairement pour tester CORS
});

// Intercepteur pour ajouter le token JWT
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * Construit l'URL complète pour une photo
 * @param relativePath Chemin relatif depuis le dossier uploads (ex: articles/org-id/photo.jpg)
 * @returns URL complète ou null si pas de chemin
 */
export function getPhotoUrl(relativePath?: string): string | null {
  if (!relativePath) return null;
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  return `${baseUrl}/uploads/${relativePath}`;
}
