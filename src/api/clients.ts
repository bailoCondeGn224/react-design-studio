import { apiClient } from '@/lib/api-client';
import { Client, CreateClientDto, PaginatedResponse, ClientFilterParams, StatsClients, ClientHistorique, ClientHistoriqueParams } from '@/types';

export const clientsApi = {
  getAll: async (params?: ClientFilterParams): Promise<PaginatedResponse<Client>> => {
    const response = await apiClient.get<PaginatedResponse<Client>>('/clients', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Client> => {
    const response = await apiClient.get<Client>(`/clients/${id}`);
    return response.data;
  },

  create: async (data: CreateClientDto): Promise<Client> => {
    const response = await apiClient.post<Client>('/clients', data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateClientDto>): Promise<Client> => {
    const response = await apiClient.patch<Client>(`/clients/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/clients/${id}`);
  },

  getCredits: async (): Promise<Client[]> => {
    const response = await apiClient.get<Client[]>('/clients/credits');
    return response.data;
  },

  getTop: async (limit: number = 10): Promise<Client[]> => {
    const response = await apiClient.get<Client[]>(`/clients/top?limit=${limit}`);
    return response.data;
  },

  getStats: async (): Promise<StatsClients> => {
    const response = await apiClient.get<StatsClients>('/clients/stats');
    return response.data;
  },

  getHistorique: async (id: string, params?: ClientHistoriqueParams): Promise<ClientHistorique> => {
    const response = await apiClient.get<ClientHistorique>(`/clients/${id}/historique`, { params });
    return response.data;
  },
};
