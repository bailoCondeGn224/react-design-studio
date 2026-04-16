import { apiClient } from '@/lib/api-client';
import { Versement, CreateVersementDto, PaginatedResponse, PaginationParams } from '@/types';

export const versementsApi = {
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<Versement>> => {
    const response = await apiClient.get<PaginatedResponse<Versement>>('/versements', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Versement> => {
    const response = await apiClient.get<Versement>(`/versements/${id}`);
    return response.data;
  },

  create: async (data: CreateVersementDto): Promise<Versement> => {
    const response = await apiClient.post<Versement>('/versements', data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateVersementDto>): Promise<Versement> => {
    const response = await apiClient.patch<Versement>(`/versements/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/versements/${id}`);
  },

  getMontantsMois: async (): Promise<{ total: number; count: number }> => {
    const response = await apiClient.get<{ total: number; count: number }>('/versements/montants-mois');
    return response.data;
  },
};
