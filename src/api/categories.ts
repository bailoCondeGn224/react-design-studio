import { apiClient } from '@/lib/api-client';
import { Categorie, CreateCategorieDto, PaginatedResponse, PaginationParams } from '@/types';

export const categoriesApi = {
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<Categorie>> => {
    const response = await apiClient.get<PaginatedResponse<Categorie>>('/categories', { params });
    return response.data;
  },

  getActive: async (): Promise<Categorie[]> => {
    const response = await apiClient.get<Categorie[]>('/categories/active');
    return response.data;
  },

  getById: async (id: string): Promise<Categorie> => {
    const response = await apiClient.get<Categorie>(`/categories/${id}`);
    return response.data;
  },

  create: async (data: CreateCategorieDto): Promise<Categorie> => {
    const response = await apiClient.post<Categorie>('/categories', data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateCategorieDto>): Promise<Categorie> => {
    const response = await apiClient.patch<Categorie>(`/categories/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/categories/${id}`);
  },
};
