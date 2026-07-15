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

  create: async (data: CreateArticleDto, photo?: File): Promise<Article> => {
    if (photo) {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === 'modesVente' && Array.isArray(value)) {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, value.toString());
          }
        }
      });
      formData.append('photo', photo);

      const response = await apiClient.post<Article>('/stock', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    }

    const response = await apiClient.post<Article>('/stock', data);
    return response.data;
  },

  createBulk: async (articles: CreateArticleDto[], photos?: (File | null)[]): Promise<{ created: Article[]; errors: any[] }> => {
    const formData = new FormData();

    // Ajouter les données JSON des articles
    formData.append('articles', JSON.stringify(articles));

    // Ajouter les photos avec des noms indexés pour maintenir la correspondance
    if (photos && photos.length > 0) {
      photos.forEach((photo, index) => {
        if (photo) {
          formData.append(`photo_${index}`, photo);
        }
      });
    }

    const response = await apiClient.post<{ created: Article[]; errors: any[] }>('/stock/bulk', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  update: async (id: string, data: Partial<CreateArticleDto>, photo?: File): Promise<Article> => {
    if (photo) {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === 'modesVente' && Array.isArray(value)) {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, value.toString());
          }
        }
      });
      formData.append('photo', photo);

      const response = await apiClient.patch<Article>(`/stock/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    }

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

  getArticleStats: async (articleId: string) => {
    const response = await apiClient.get(`/stock/${articleId}/stats`);
    return response.data;
  },

  getByZone: async (zone: string): Promise<Article[]> => {
    const response = await apiClient.get<Article[]>(`/stock/zones/${zone}`);
    return response.data;
  },
};
