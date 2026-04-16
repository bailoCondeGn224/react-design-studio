import { apiClient } from '@/lib/api-client';
import { Parametres, UpdateParametresDto } from '@/types';

export const parametresApi = {
  // Récupérer les paramètres de l'entreprise
  get: async (): Promise<Parametres> => {
    const { data } = await apiClient.get('/parametres');
    return data;
  },

  // Mettre à jour les paramètres
  update: async (updateDto: UpdateParametresDto): Promise<Parametres> => {
    const { data } = await apiClient.put('/parametres', updateDto);
    return data;
  },

  // Uploader le logo
  uploadLogo: async (file: File): Promise<Parametres> => {
    const formData = new FormData();
    formData.append('logo', file);
    const { data } = await apiClient.post('/parametres/logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  // Récupérer l'URL du logo
  getLogoUrl: (): string => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    return `${API_BASE_URL}/parametres/logo`;
  },
};
