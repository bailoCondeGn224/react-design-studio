import { apiClient } from '@/lib/api-client';
import { Fournisseur, CreateFournisseurDto, PaginatedResponse, PaginationParams, StatsFournisseurs } from '@/types';

export const fournisseursApi = {
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<Fournisseur>> => {
    const response = await apiClient.get<PaginatedResponse<Fournisseur>>('/fournisseurs', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Fournisseur> => {
    const response = await apiClient.get<Fournisseur>(`/fournisseurs/${id}`);
    return response.data;
  },

  getDetails: async (id: string): Promise<any> => {
    const response = await apiClient.get(`/fournisseurs/${id}/details`);
    return response.data;
  },

  create: async (data: CreateFournisseurDto): Promise<Fournisseur> => {
    const response = await apiClient.post<Fournisseur>('/fournisseurs', data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateFournisseurDto>): Promise<Fournisseur> => {
    const response = await apiClient.patch<Fournisseur>(`/fournisseurs/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/fournisseurs/${id}`);
  },

  getDette: async (id: string): Promise<{ dette: number }> => {
    const response = await apiClient.get<{ dette: number }>(`/fournisseurs/${id}/dettes`);
    return response.data;
  },

  getDettes: async (id: string): Promise<{ dette: number }> => {
    const response = await apiClient.get<{ dette: number }>(`/fournisseurs/${id}/dettes`);
    return response.data;
  },

  getStats: async (): Promise<StatsFournisseurs> => {
    const response = await apiClient.get<StatsFournisseurs>('/fournisseurs/stats');
    return response.data;
  },
};
