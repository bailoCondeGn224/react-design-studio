import axios from 'axios';

export const LIVREUR_STORAGE_KEYS = {
  TOKEN: 'livreur_token',
  LIVREUR: 'livreur_data',
} as const;

/** Émis quand la session livreur expire ; LivreurAuthContext s'y abonne. */
export const LIVREUR_AUTH_REQUIRED_EVENT = 'livreur-auth-required';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const livreurApiClient = axios.create({
  baseURL: API_BASE_URL,
});

livreurApiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(LIVREUR_STORAGE_KEYS.TOKEN);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

livreurApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Un 401 sur la connexion = identifiants invalides, pas une session expirée
    const isLogin = error.config?.url?.startsWith('/public/livreur/login');
    if (error.response?.status === 401 && !isLogin) {
      localStorage.removeItem(LIVREUR_STORAGE_KEYS.TOKEN);
      localStorage.removeItem(LIVREUR_STORAGE_KEYS.LIVREUR);
      window.dispatchEvent(new CustomEvent(LIVREUR_AUTH_REQUIRED_EVENT));
    }
    return Promise.reject(error);
  },
);
