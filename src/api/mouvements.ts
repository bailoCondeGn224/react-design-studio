import { apiClient } from '@/lib/api-client';
import { MouvementStock, StatsMouvements, PaginatedResponse, PaginationParams, MouvementFilterParams } from '@/types';

export const mouvementsApi = {
  getAll: async (params?: MouvementFilterParams): Promise<PaginatedResponse<MouvementStock>> => {
    const response = await apiClient.get<PaginatedResponse<MouvementStock>>('/mouvements', { params });
    return response.data;
  },

  getByArticle: async (articleId: string, params?: PaginationParams): Promise<PaginatedResponse<MouvementStock>> => {
    const response = await apiClient.get<PaginatedResponse<MouvementStock>>(`/mouvements/article/${articleId}`, { params });
    return response.data;
  },

  getById: async (id: string): Promise<MouvementStock> => {
    const response = await apiClient.get<MouvementStock>(`/mouvements/${id}`);
    return response.data;
  },

  getStats: async (): Promise<StatsMouvements> => {
    const response = await apiClient.get<StatsMouvements>('/mouvements/stats');
    return response.data;
  },
};
