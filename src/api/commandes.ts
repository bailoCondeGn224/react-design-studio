import { apiClient } from '@/lib/api-client';
import {
  Commande,
  CreateCommandeDto,
  LivrerCommandeDto,
  CommandeFilterParams,
  StatsCommandes,
  PaginatedResponse,
} from '@/types';

export const commandesApi = {
  // Liste paginée avec filtres
  getAll: async (params?: CommandeFilterParams): Promise<PaginatedResponse<Commande>> => {
    const response = await apiClient.get<PaginatedResponse<Commande>>('/commandes', { params });
    return response.data;
  },

  // Détails d'une commande
  getById: async (id: string): Promise<Commande> => {
    const response = await apiClient.get<Commande>(`/commandes/${id}`);
    return response.data;
  },

  // Créer une commande
  create: async (data: CreateCommandeDto): Promise<Commande> => {
    const response = await apiClient.post<Commande>('/commandes', data);
    return response.data;
  },

  // Modifier une commande (seulement si en_attente)
  update: async (id: string, data: Partial<CreateCommandeDto>): Promise<Commande> => {
    const response = await apiClient.patch<Commande>(`/commandes/${id}`, data);
    return response.data;
  },

  // Livrer une commande (transforme en vente)
  livrer: async (id: string, data: LivrerCommandeDto): Promise<{ commande: Commande; vente: any }> => {
    const response = await apiClient.post(`/commandes/${id}/livrer`, data);
    return response.data;
  },

  // Annuler une commande
  annuler: async (id: string): Promise<Commande> => {
    const response = await apiClient.post<Commande>(`/commandes/${id}/annuler`);
    return response.data;
  },

  // Supprimer une commande
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/commandes/${id}`);
  },

  // Statistiques
  getStats: async (): Promise<StatsCommandes> => {
    const response = await apiClient.get<StatsCommandes>('/commandes/stats');
    return response.data;
  },
};
