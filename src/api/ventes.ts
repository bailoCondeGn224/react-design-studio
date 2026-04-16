import { apiClient } from '@/lib/api-client';
import { Vente, CreateVenteDto, StatsVentes, PaginatedResponse, VenteFilterParams } from '@/types';

export const ventesApi = {
  getAll: async (params?: VenteFilterParams): Promise<PaginatedResponse<Vente>> => {
    const response = await apiClient.get<PaginatedResponse<Vente>>('/ventes', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Vente> => {
    const response = await apiClient.get<Vente>(`/ventes/${id}`);
    return response.data;
  },

  create: async (data: CreateVenteDto): Promise<Vente> => {
    const response = await apiClient.post<Vente>('/ventes', data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateVenteDto>): Promise<Vente> => {
    const response = await apiClient.patch<Vente>(`/ventes/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/ventes/${id}`);
  },

  getStats: async (): Promise<StatsVentes> => {
    const response = await apiClient.get<StatsVentes>('/ventes/stats');
    return response.data;
  },

  getRecent: async (): Promise<Vente[]> => {
    const response = await apiClient.get<Vente[]>('/ventes/recent');
    return response.data;
  },
};
