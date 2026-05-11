import { apiClient } from '@/lib/api-client';
import {
  Inventaire,
  ComptageInventaire,
  CreateInventaireDto,
  AddComptageDto,
} from '@/types';

export const inventairesApi = {
  // Créer un nouvel inventaire
  create: async (data: CreateInventaireDto): Promise<Inventaire> => {
    const response = await apiClient.post('/inventaires', data);
    return response.data;
  },

  // Liste des inventaires
  getAll: async (): Promise<Inventaire[]> => {
    const response = await apiClient.get('/inventaires');
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
};
