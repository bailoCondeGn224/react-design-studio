import { apiClient } from '@/lib/api-client';
import {
  Depense,
  CreateDepenseDto,
  UpdateDepenseDto,
  DepenseFilterParams,
  DepenseStats,
  PaginatedResponse,
} from '../types';

export const depensesApi = {
  /**
   * Récupérer toutes les dépenses avec filtres et pagination
   */
  getAll: async (params?: DepenseFilterParams): Promise<PaginatedResponse<Depense>> => {
    const response = await apiClient.get('/depenses', { params });
    return response.data;
  },

  /**
   * Récupérer une dépense par ID
   */
  getById: async (id: string): Promise<Depense> => {
    const response = await apiClient.get(`/depenses/${id}`);
    return response.data;
  },

  /**
   * Créer une nouvelle dépense
   */
  create: async (data: CreateDepenseDto): Promise<Depense> => {
    const response = await apiClient.post('/depenses', data);
    return response.data;
  },

  /**
   * Mettre à jour une dépense
   */
  update: async (id: string, data: UpdateDepenseDto): Promise<Depense> => {
    const response = await apiClient.patch(`/depenses/${id}`, data);
    return response.data;
  },

  /**
   * Supprimer une dépense
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/depenses/${id}`);
  },

  /**
   * Obtenir les statistiques de dépenses
   */
  getStatistics: async (dateDebut?: string, dateFin?: string): Promise<DepenseStats> => {
    const params: any = {};
    if (dateDebut) params.dateDebut = dateDebut;
    if (dateFin) params.dateFin = dateFin;

    const response = await apiClient.get('/depenses/statistics', { params });
    return response.data;
  },
};
