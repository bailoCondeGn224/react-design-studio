import axios from 'axios';

const STORAGE_KEY = 'livreur_token';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const livreurApiClient = axios.create({
  baseURL: API_BASE_URL,
});

livreurApiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
