import { apiClient } from '@/lib/api-client';
import {
  Inventaire,
  ComptageInventaire,
  CreateInventaireDto,
  AddComptageDto,
  PaginationParams,
} from '@/types';

export const inventairesApi = {
  // Créer un nouvel inventaire
  create: async (data: CreateInventaireDto): Promise<Inventaire> => {
    const response = await apiClient.post('/inventaires', data);
    return response.data;
  },

  // Liste des inventaires
  getAll: async (params?: PaginationParams): Promise<{ data: Inventaire[]; meta: any }> => {
    const response = await apiClient.get('/inventaires', { params });
    return response.data;
  },

  // Date minimale autorisée
  getDateMin: async (): Promise<{ dateMin: string | null }> => {
    const response = await apiClient.get('/inventaires/date-min');
    return response.data;
  },

  // Détails d'un inventaire
  getById: async (id: string): Promise<Inventaire> => {
    const response = await apiClient.get(`/inventaires/${id}`);
    return response.data;
  },

  // Ajouter un comptage d'article
  addComptage: async (
    inventaireId: string,
    data: AddComptageDto,
  ): Promise<ComptageInventaire> => {
    const response = await apiClient.post(
      `/inventaires/${inventaireId}/comptages`,
      data,
    );
    return response.data;
  },

  // Liste des écarts
  getEcarts: async (inventaireId: string): Promise<ComptageInventaire[]> => {
    const response = await apiClient.get(`/inventaires/${inventaireId}/ecarts`);
    return response.data;
  },

  // Valider l'inventaire
  valider: async (inventaireId: string): Promise<Inventaire> => {
    const response = await apiClient.post(`/inventaires/${inventaireId}/valider`);
    return response.data;
  },

  // Calculer les finances
  calculerFinances: async (inventaireId: string): Promise<Inventaire> => {
    const response = await apiClient.post(`/inventaires/${inventaireId}/calculer-finances`);
    return response.data;
  },

  // Dashboard statistiques
  getDashboardStats: async (params?: {
    periode?: string;
    dateDebut?: string;
    dateFin?: string;
  }): Promise<any> => {
    const response = await apiClient.get('/inventaires/dashboard/stats', { params });
    return response.data;
  },

  // Export comptages Excel
  exportComptagesExcel: async (inventaireId: string): Promise<Blob> => {
    const response = await apiClient.get(
      `/inventaires/${inventaireId}/export-comptages-excel`,
      { responseType: 'blob' }
    );
    return response.data;
  },

  // Export liste inventaires Excel
  exportInventairesExcel: async (): Promise<Blob> => {
    const response = await apiClient.get('/inventaires/export-excel', {
      responseType: 'blob',
    });
    return response.data;
  },
};
