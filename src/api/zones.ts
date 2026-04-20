import { apiClient } from '@/lib/api-client';

export interface Zone {
  id: string;
  code: string;
  nom: string;
  description?: string;
  actif: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateZoneDto {
  code: string;
  nom: string;
  description?: string;
  actif?: boolean;
}

export interface UpdateZoneDto {
  code?: string;
  nom?: string;
  description?: string;
  actif?: boolean;
}

export interface ZoneFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  actif?: boolean;
}

export const zonesApi = {
  // Récupérer toutes les zones avec pagination
  getAll: async (params?: ZoneFilterParams) => {
    const response = await apiClient.get('/zones', { params });
    return response.data;
  },

  // Récupérer uniquement les zones actives
  getActives: async () => {
    const response = await apiClient.get('/zones/actives');
    return response.data;
  },

  // Récupérer une zone par ID
  getById: async (id: string) => {
    const response = await apiClient.get(`/zones/${id}`);
    return response.data;
  },

  // Créer une zone
  create: async (data: CreateZoneDto) => {
    const response = await apiClient.post('/zones', data);
    return response.data;
  },

  // Modifier une zone
  update: async (id: string, data: UpdateZoneDto) => {
    const response = await apiClient.patch(`/zones/${id}`, data);
    return response.data;
  },

  // Supprimer une zone
  delete: async (id: string) => {
    const response = await apiClient.delete(`/zones/${id}`);
    return response.data;
  },
};
