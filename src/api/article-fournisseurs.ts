import { apiClient } from '@/lib/api-client';
import { ArticleFournisseur } from '@/types';

export const articleFournisseursApi = {
  // Obtenir tous les fournisseurs d'un article avec historique
  getByArticle: async (articleId: string): Promise<ArticleFournisseur[]> => {
    const response = await apiClient.get<ArticleFournisseur[]>(`/articles/${articleId}/fournisseurs`);
    return response.data;
  },

  // Définir le fournisseur préféré pour un article
  setPreference: async (articleId: string, fournisseurId: string): Promise<void> => {
    await apiClient.post(`/articles/${articleId}/fournisseur-prefere`, { fournisseurId });
  },

  // Obtenir l'historique des prix d'un article chez un fournisseur
  getHistoriquePrix: async (articleId: string, fournisseurId: string): Promise<{
    date: string;
    prix: number;
    quantite: number;
    approvisionnementId: string;
  }[]> => {
    const response = await apiClient.get(`/articles/${articleId}/fournisseurs/${fournisseurId}/historique-prix`);
    return response.data;
  },
};
