// src/api/online-orders.ts
import { apiClient } from '@/lib/api-client';
import { OnlineOrder, CreateOnlineOrderDto, OnlineOrderFilterParams, PaginatedResponse } from '@/types';

const getCustomerToken = () => localStorage.getItem('customer_token');

export const onlineOrdersApi = {
  // Public - création commande
  create: async (data: CreateOnlineOrderDto): Promise<OnlineOrder> => {
    const token = getCustomerToken();
    const response = await apiClient.post<OnlineOrder>('/public/orders', data, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  },

  // Client connecté - mes commandes
  getMyOrders: async (params?: { page?: number; limit?: number }): Promise<PaginatedResponse<OnlineOrder>> => {
    const token = getCustomerToken();
    const response = await apiClient.get<PaginatedResponse<OnlineOrder>>('/public/orders', {
      params,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  },

  getMyOrder: async (id: string): Promise<OnlineOrder> => {
    const token = getCustomerToken();
    const response = await apiClient.get<OnlineOrder>(`/public/orders/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  },

  // Back-office
  getAll: async (params?: OnlineOrderFilterParams): Promise<PaginatedResponse<OnlineOrder>> => {
    const response = await apiClient.get<PaginatedResponse<OnlineOrder>>('/online-orders', { params });
    return response.data;
  },

  getById: async (id: string): Promise<OnlineOrder> => {
    const response = await apiClient.get<OnlineOrder>(`/online-orders/${id}`);
    return response.data;
  },

  confirm: async (id: string): Promise<OnlineOrder> => {
    const response = await apiClient.patch<OnlineOrder>(`/online-orders/${id}/confirm`);
    return response.data;
  },

  markReady: async (id: string): Promise<OnlineOrder> => {
    const response = await apiClient.patch<OnlineOrder>(`/online-orders/${id}/ready`);
    return response.data;
  },

  markDelivered: async (id: string): Promise<OnlineOrder> => {
    const response = await apiClient.patch<OnlineOrder>(`/online-orders/${id}/deliver`);
    return response.data;
  },

  cancel: async (id: string, motif: string): Promise<OnlineOrder> => {
    const response = await apiClient.patch<OnlineOrder>(`/online-orders/${id}/cancel`, { motifAnnulation: motif });
    return response.data;
  },

  getStats: async (): Promise<{ enAttente: number; confirmees: number; pretes: number; livrees: number; total: number }> => {
    const response = await apiClient.get('/online-orders/stats');
    return response.data;
  },

  getPendingCount: async (): Promise<{ count: number }> => {
    const response = await apiClient.get('/online-orders/pending-count');
    return response.data;
  },
};
