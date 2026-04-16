import { apiClient } from '@/lib/api-client';
import { StatsRotation } from '@/types';

export const rotationApi = {
  getStats: async (): Promise<StatsRotation> => {
    const response = await apiClient.get<StatsRotation>('/stock/rotation/stats');
    return response.data;
  },

  getArticleRotation: async (articleId: string): Promise<{
    tauxRotation: number;
    quantiteVendue30j: number;
    vitesseRotation: string;
    derniereVente: string | null;
    joursSansVente: number;
  }> => {
    const response = await apiClient.get(`/stock/rotation/${articleId}`);
    return response.data;
  },
};
