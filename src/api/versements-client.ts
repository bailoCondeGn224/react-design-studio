import { apiClient } from '@/lib/api-client';
import { VersementClient, CreateVersementClientDto, PaginatedResponse, VersementClientFilterParams } from '@/types';

export const versementsClientApi = {
  getAll: async (params?: VersementClientFilterParams): Promise<PaginatedResponse<VersementClient>> => {
    const response = await apiClient.get<PaginatedResponse<VersementClient>>('/versements-client', { params });
    return response.data;
  },

  getById: async (id: string): Promise<VersementClient> => {
    const response = await apiClient.get<VersementClient>(`/versements-client/${id}`);
    return response.data;
  },

  getByClient: async (clientId: string): Promise<VersementClient[]> => {
    const response = await apiClient.get<VersementClient[]>(`/versements-client/client/${clientId}`);
    return response.data;
  },

  create: async (data: CreateVersementClientDto): Promise<VersementClient> => {
    const response = await apiClient.post<VersementClient>('/versements-client', data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateVersementClientDto>): Promise<VersementClient> => {
    const response = await apiClient.patch<VersementClient>(`/versements-client/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/versements-client/${id}`);
  },
};
