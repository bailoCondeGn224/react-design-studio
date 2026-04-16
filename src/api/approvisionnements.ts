import { apiClient } from '@/lib/api-client';
import { Approvisionnement, CreateApprovisionnementDto, StatsApprovisionnements, PaginatedResponse, PaginationParams } from '@/types';

export const approvisionnementsApi = {
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<Approvisionnement>> => {
    const response = await apiClient.get<PaginatedResponse<Approvisionnement>>('/approvisionnements', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Approvisionnement> => {
    const response = await apiClient.get<Approvisionnement>(`/approvisionnements/${id}`);
    return response.data;
  },

  create: async (data: CreateApprovisionnementDto): Promise<Approvisionnement> => {
    const response = await apiClient.post<Approvisionnement>('/approvisionnements', data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateApprovisionnementDto>): Promise<Approvisionnement> => {
    const response = await apiClient.patch<Approvisionnement>(`/approvisionnements/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/approvisionnements/${id}`);
  },

  getStats: async (): Promise<StatsApprovisionnements> => {
    const response = await apiClient.get<StatsApprovisionnements>('/approvisionnements/stats');
    return response.data;
  },

  getByFournisseur: async (fournisseurId: string): Promise<Approvisionnement[]> => {
    const response = await apiClient.get<Approvisionnement[]>(`/approvisionnements/fournisseur/${fournisseurId}`);
    return response.data;
  },

  getStatsByFournisseur: async (fournisseurId: string): Promise<any> => {
    const response = await apiClient.get(`/approvisionnements/fournisseur/${fournisseurId}/stats`);
    return response.data;
  },
};
