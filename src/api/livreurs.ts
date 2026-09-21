import { apiClient } from '@/lib/api-client';
import { Livreur, CreateLivreurDto, UpdateLivreurDto } from '@/types/livreur';

// Gestion des livreurs depuis le backoffice (session admin).
// L'espace du livreur lui-même est dans api/livreur.ts.
export const livreursApi = {
  getAll: async (): Promise<Livreur[]> => {
    const response = await apiClient.get<Livreur[]>('/livreurs');
    return response.data;
  },

  getById: async (id: string): Promise<Livreur> => {
    const response = await apiClient.get<Livreur>(`/livreurs/${id}`);
    return response.data;
  },

  create: async (data: CreateLivreurDto): Promise<Livreur> => {
    const response = await apiClient.post<Livreur>('/livreurs', data);
    return response.data;
  },

  update: async (id: string, data: UpdateLivreurDto): Promise<Livreur> => {
    const response = await apiClient.put<Livreur>(`/livreurs/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/livreurs/${id}`);
  },
};
