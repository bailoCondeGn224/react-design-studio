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
    // Déterminer quel token utiliser selon la route
    const isCustomerRoute = config.url?.startsWith('/public/auth') ||
                            config.url?.startsWith('/public/orders') ||
                            config.url?.startsWith('/public/stores') ||
                            config.url?.startsWith('/public/notifications');

    const token = isCustomerRoute
      ? localStorage.getItem('customer_token')
      : localStorage.getItem('access_token');

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
      const isCustomerRoute = error.config?.url?.startsWith('/public/auth') ||
                              error.config?.url?.startsWith('/public/orders') ||
                              error.config?.url?.startsWith('/public/stores') ||
                              error.config?.url?.startsWith('/public/notifications');

      if (isCustomerRoute) {
        // Client token expiré
        localStorage.removeItem('customer_token');
        localStorage.removeItem('customer_data');
        // Déclencher événement pour ouvrir CustomerAuthModal
        window.dispatchEvent(new CustomEvent('customer-auth-required'));
      } else {
        // Admin token expiré
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
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
