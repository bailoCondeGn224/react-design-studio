import { apiClient } from '@/lib/api-client';
import {
  RetourClient,
  CreateRetourClientDto,
  RetourFournisseur,
  CreateRetourFournisseurDto,
  PaginatedResponse,
  PaginationParams,
} from '@/types';

export const retoursClientsApi = {
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<RetourClient>> => {
    const response = await apiClient.get('/retours/client', { params });
    return response.data;
  },

  getOne: async (id: string): Promise<RetourClient> => {
    const response = await apiClient.get(`/retours/client/${id}`);
    return response.data;
  },

  getByVente: async (venteId: string): Promise<RetourClient[]> => {
    const response = await apiClient.get(`/retours/client/by-vente/${venteId}`);
    return response.data;
  },

  getStats: async (): Promise<any> => {
    const response = await apiClient.get('/retours/client/stats');
    return response.data;
  },

  create: async (data: CreateRetourClientDto): Promise<any> => {
    const response = await apiClient.post('/retours/client', data);
    return response.data;
  },
};

export const retoursFournisseursApi = {
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<any>> => {
    const response = await apiClient.get('/retours/fournisseur', { params });
    return response.data;
  },

  getByApprovisionnement: async (approvisionnementId: string): Promise<RetourFournisseur[]> => {
    const response = await apiClient.get(`/retours/fournisseur/approvisionnement/${approvisionnementId}`);
    return response.data;
  },

  getStats: async (): Promise<any> => {
    const response = await apiClient.get('/retours/fournisseur/stats');
    return response.data;
  },

  create: async (data: CreateRetourFournisseurDto): Promise<any> => {
    const response = await apiClient.post('/retours/fournisseur', data);
    return response.data;
  },
};
