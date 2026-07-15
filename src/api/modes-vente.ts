import { apiClient } from '@/lib/api-client';
import { ModeVente, CreateModeVenteDto } from '@/types';

export const modesVenteApi = {
  getByArticle: async (articleId: string): Promise<ModeVente[]> => {
    const response = await apiClient.get<ModeVente[]>(`/modes-vente/article/${articleId}`);
    return response.data;
  },

  create: async (data: CreateModeVenteDto): Promise<ModeVente> => {
    const response = await apiClient.post<ModeVente>('/modes-vente', data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateModeVenteDto>): Promise<ModeVente> => {
    const response = await apiClient.patch<ModeVente>(`/modes-vente/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/modes-vente/${id}`);
  },
};
