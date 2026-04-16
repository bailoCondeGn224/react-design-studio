import { apiClient } from '@/lib/api-client';
import { Article, CreateArticleDto, StatsStock, PaginatedResponse, StockFilterParams } from '@/types';

export const stockApi = {
  getAll: async (params?: StockFilterParams): Promise<PaginatedResponse<Article>> => {
    const response = await apiClient.get<PaginatedResponse<Article>>('/stock', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Article> => {
    const response = await apiClient.get<Article>(`/stock/${id}`);
    return response.data;
  },

  create: async (data: CreateArticleDto): Promise<Article> => {
    const response = await apiClient.post<Article>('/stock', data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateArticleDto>): Promise<Article> => {
    const response = await apiClient.patch<Article>(`/stock/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/stock/${id}`);
  },

  getAlerts: async (): Promise<Article[]> => {
    const response = await apiClient.get<Article[]>('/stock/alerts');
    return response.data;
  },

  getStats: async (): Promise<StatsStock> => {
    const response = await apiClient.get<StatsStock>('/stock/stats');
    return response.data;
  },

  getByZone: async (zone: string): Promise<Article[]> => {
    const response = await apiClient.get<Article[]>(`/stock/zones/${zone}`);
    return response.data;
  },
};
