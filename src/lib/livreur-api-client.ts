import axios from 'axios';

const STORAGE_KEY = 'livreur_token';

export const livreurApiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
});

livreurApiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
